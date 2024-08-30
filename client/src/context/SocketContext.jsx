import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
import { useAppContext } from "./AppContext.jsx";

const SocketContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [peer, setPeer] = useState(null);
  const { streams, setStreams } = useAppContext();
  const { roomID, username, setMyPeerID } = useAppContext();
  const [isScreenShareOn, setIsScreenShareOn] = useState(false);

  const socket = useMemo(
    () =>
      io(BACKEND_URL, {
        reconnectionAttempts: 2,
      }),
    []
  );

  // useRef is generally used as a flag in react js, it doesnt cause re-rendering.
  // Even if any componenets re-renders "useRef" value stays
  const isPeerSet = useRef(false);
  useEffect(() => {
    // below is the important if statement
    if (isPeerSet.current || !roomID || !socket) return;
    isPeerSet.current = true;
    const myPeer = new Peer({
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:0.peerjs.com:3478",
            username: "peerjs",
            credential: "peerjsp",
          },
        ],
        sdpSemantics: "unified-plan",
        iceTransportPolicy: "relay", // <- it means using only relay server (our free turn server in this case)
      },
    });
    console.log("user: " + username);

    myPeer.on("open", (peerID) => {
      console.log(`Your peerID is ${peerID}`);
      socket.emit("joinRoom", { username, room_id: roomID, peerID: peerID });
    });

    myPeer.on("error", (error) => {
      console.error("PeerJS error:", error);
    });
    // important
    setPeer(myPeer);
  }, [socket, roomID]);

  useEffect(() => {
    if (!peer) return;

    const handleIncomingCall = (call) => {
      console.log(`Incoming Stream from ${call.peer}`);

      // Check if the peerID is already present in the streams
      if (!streams[call.peer]) {
        call.answer(window.localStream); // Answer the call with the current stream
        call.on("stream", (remoteStream) => {
          console.log(`Received stream from: ${call.peer}`);
          setStreams((prevStreams) => ({
            ...prevStreams,
            [call.peer]: remoteStream,
          }));
        });
      }
    };

    const handleUserJoinedMeeting = ({ peerID, room_topic }) => {
      console.log(`User joined meeting: ${peerID}`);
      console.log(`Room Topic: ${room_topic}`);
      sessionStorage.setItem("topic", room_topic);

      // Call the user who just joined with the current stream
      const call = peer.call(peerID, window.localStream);
      console.log("Sending stream to peerID: " + peerID);
      call.on("stream", (remoteStream) => {
        console.log(`Received stream from: ${peerID}`);
        setStreams((prevStreams) => ({
          ...prevStreams,
          [peerID]: remoteStream,
        }));
      });
    };

    // Function to switch back to camera stream when screen sharing stops
    const switchToCameraStream = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (window.localStream) {
            window.localStream.getTracks().forEach((track) => track.stop()); // Stop previous tracks
          }
          window.localStream = stream;
          peer.on("call", handleIncomingCall); // 1st add "CALL" event listener then invoke CALL event
          socket.on("user-joined-meeting", handleUserJoinedMeeting);
          setIsScreenShareOn(false); // Update state to indicate screen sharing is off
        })
        .catch((error) =>
          console.error("Error accessing media devices:", error)
        );
    };

    // Switch between screen sharing and camera video/audio streaming
    if (isScreenShareOn) {
      // when screen sharing is on, share the screen
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then((stream) => {
          if (window.localStream) {
            window.localStream.getTracks().forEach((track) => track.stop()); // stop previous tracks
          }
          window.localStream = stream;

          // // event Listener for when the screen sharing stream ends
          stream
            .getVideoTracks()[0]
            .addEventListener("ended", switchToCameraStream);
          peer.on("call", handleIncomingCall); // 1st add "CALL" event listener then invoke CALL event
          socket.on("user-joined-meeting", handleUserJoinedMeeting);
        })
        .catch((error) =>
          console.error("Error accessing display media:", error)
        );
    } else {
      // when screen sharing is off share the camera
      switchToCameraStream();
    }

    // Cleanup function to remove event listeners
    return () => {
      peer.off("call", handleIncomingCall);
      socket.off("user-joined-meeting", handleUserJoinedMeeting);
    };
  }, [peer, isScreenShareOn, streams, setStreams]);

  const joinRoomHandle = (isNewRoom = false) => {
    if (!peer) {
      console.error("Peer not initialized");
      return;
    }
    const peerID = peer.id;
    if (isNewRoom) {
      const topic = sessionStorage.getItem("topic");
      socket.emit("createRoom", {
        username: username,
        room_id: roomID,
        room_topic: topic,
      });
    } else {
      socket.emit("joinRoom", {
        username,
        room_id: roomID,
        peerID,
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        peer,
        streams,
        joinRoomHandle,
        isScreenShareOn,
        setIsScreenShareOn,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
