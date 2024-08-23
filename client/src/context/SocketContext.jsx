import { createContext, useContext, useMemo, useState, useEffect } from "react";
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
  const {streams, setStreams} = useAppContext();
  const { roomID, username, setMyPeerID } = useAppContext();

  const socket = useMemo(
    () =>
      io(BACKEND_URL, {
        reconnectionAttempts: 2,
      }),
    []
  );
  

  useEffect(() => {
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

    const storedPeerId = sessionStorage.getItem("myPeerID");
    if (storedPeerId) {
      setMyPeerID(storedPeerId);
      console.log(`Your peerID is ${storedPeerId}`);
      socket.emit("joinRoom", {
        username,
        room_id: roomID,
        peerID: storedPeerId,
      });
    } else {
      if (!myPeer) return;
      myPeer.on("open", (peerID) => {
        console.log(`Your peerID is ${peerID}`);
        setMyPeerID(peerID);
        sessionStorage.setItem("myPeerID", peerID);
        socket.emit("joinRoom", { username, room_id: roomID, peerID: peerID });
      });
    }

    myPeer.on("error", (error) => {
      console.error("PeerJS error:", error);
    });

    setPeer(myPeer);
  }, [socket, username, roomID]);

  useEffect(() => {
    if (!peer) return;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        window.localStream = stream;

        //handle incomming calls
        peer.on("call", (call) => {
          console.log(`Incomming Stream from ${call.peer}`);

          // Check if the peerID is already present in the streams
          if (!streams[call.peer]) {
            call.answer(window.localStream);
            call.on("stream", (remoteStream) => {
              console.log(`Received stream from: ${call.peer}`);
              setStreams((prevStreams) => ({
                ...prevStreams,
                [call.peer]: remoteStream,
              }));
            });
          }
        });

        socket.on("user-joined-meeting", ({ peerID }) => {
          console.log(`User joined meeting: ${peerID}`);
          // call users iwth peerID
          // peerID: is the ID revived from client side from peerjs
          const call = peer.call(peerID, stream);
          call.on("stream", (remoteStream) => {
            console.log(`Received stream from: ${peerID}`);
            setStreams((prevStreams) => ({
              ...prevStreams,
              [peerID]: remoteStream,
            }));
          });
        });
      })
      .catch((error) => console.error("Error accessing media devices:", error));

    return () => {
      socket.off("user-joined-meeting");
    };
  }, [peer]);

  const joinRoom = (isNewRoom = false) => {
    if (!peer) {
      console.error("Peer not initialized");
      return;
    }
    const peerID = peer.id;
    if (isNewRoom) {
      socket.emit("createRoom", {
        username,
        room_id: roomID,
        peerID,
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
    <SocketContext.Provider value={{ socket, peer, streams, joinRoom }}>
      {children}
    </SocketContext.Provider>
  );
};
