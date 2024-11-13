import "../fix-simple-peer.js";
import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext.jsx";
import Peer from "simple-peer";
import { useSocket } from "../context/SocketContext.jsx";
import ReactPlayer from "react-player"; // video player for Reactjs

// Move endCall outside the App component and export it
export const endCall = (
  peerRef,
  setIsInCall,
  setCallerID,
  callerID,
  remoteVideo,
  socket
) => {
  if (peerRef.current) {
    peerRef.current.destroy();
  }
  setIsInCall(false);
  setCallerID("");
  if (remoteVideo.current) {
    remoteVideo.current.srcObject = null;
  }

  // Notify the other participant that the call has ended
  socket.emit("callEnded", { to: callerID });
};

const VideoGrid = () => {
  const {
    roomID,
    username,
    setMyPeerID,
    isInCall,
    setIsInCall,
    callerID,
    setCallerID,
    peerRef,
    remoteVideo,
  } = useAppContext();
  const { socket, setIsScreenShareOn, isScreenShareOn } =
    useSocket();

  //----------------simple-peer implementation----------------
  const [mySocketID, setMySocketID] = useState("");
  // const [callerID, setCallerID] = useState("");
  const [myVideoStream, setMyVideoStream] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  // const [isInCall, setIsInCall] = useState(false);
  const localVideo = useRef(null);
  // const remoteVideo = useRef(null);
  // const peerRef = useRef(null);
  const [username_var, setUsername_var] = useState("Remote Video");

  useEffect(() => {
    if (!socket) {
      console.error("Socket not connected");
      return;
    }
    const handleYourSocketId = ({ socketID }) => setMySocketID(socketID);
    const handleAllConnectedUsers = ({ users, yourSocketID }) => {
      // Convert the users object to an array of [socketID, username] pairs
      const filteredUsers = Object.fromEntries(
        Object.entries(users).filter(([id]) => id !== yourSocketID)
      );

      console.log("Your SocketID:" + yourSocketID);
      setConnectedUsers(filteredUsers);
    };

    socket.on("YourSocketId", handleYourSocketId);
    socket.on("AllConnectedUsers", handleAllConnectedUsers);
    socket.on("incommingCall", handleIncomingCall);

    return () => {
      socket.off("YourSocketId", handleYourSocketId);
      socket.off("AllConnectedUsers", handleAllConnectedUsers);
      socket.off("incommingCall", handleIncomingCall);
    };
  }, [socket]);

  // End call when get the signal
  useEffect(() => {
    if (!socket) {
      return;
    }

    // Listen for the call-ended event from the other participant
    socket.on("callEnded", () => {
      console.log("The other participant has ended the call.");
      endCall(peerRef, setIsInCall, setCallerID, callerID, remoteVideo, socket);
    });

    return () => {
      socket.off("callEnded");
    };
  }, [socket, peerRef, setIsInCall, setCallerID, remoteVideo]);
  const getLocalVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMyVideoStream(stream);
      window.localStream = stream;
      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error getting user media", error);
    }
  };
  const getScreenStream = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      setMyVideoStream(screenStream);
      window.localStream = screenStream;
      if (localVideo.current) {
        localVideo.current.srcObject = screenStream;
      }
    } catch (error) {
      console.error("Error getting screen share", error);
    }
  };
  useEffect(() => {
    if (isScreenShareOn) {
      getScreenStream();
    } else {
      getLocalVideoStream();
    }
  }, [setIsScreenShareOn, isScreenShareOn]);
  useEffect(() => {
    if (peerRef.current && myVideoStream) {
      const [videoTrack] = myVideoStream.getVideoTracks();
      const sender = peerRef.current._pc
        .getSenders()
        .find((s) => s.track.kind === videoTrack.kind);
      if (sender) {
        sender.replaceTrack(videoTrack);
      }
    }
  }, [myVideoStream, isScreenShareOn]);

  const startCalling = async (socketID) => {
    console.log("Starting call to:", socketID);
    // Fetch media stream using getUserMedia
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const peer = new Peer({
        initiator: true,
        trickle: true,
        stream: window.localStream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun.l.google.com:5349" },
            { urls: "stun:stun1.l.google.com:3478" },
            {
              urls: "turn:global.relay.metered.ca:80",
              username: "93588a7d1e50ee58e2a751a7",
              credential: "+wxGMnvwQNLoyJoR",
            },
            {
              urls: "turn:global.relay.metered.ca:80?transport=tcp",
              username: "93588a7d1e50ee58e2a751a7",
              credential: "+wxGMnvwQNLoyJoR",
            },
            {
              urls: "turn:global.relay.metered.ca:443",
              username: "93588a7d1e50ee58e2a751a7",
              credential: "+wxGMnvwQNLoyJoR",
            },
            {
              urls: "turns:global.relay.metered.ca:443?transport=tcp",
              username: "93588a7d1e50ee58e2a751a7",
              credential: "+wxGMnvwQNLoyJoR",
            },
          ],
        },
      });
      peerRef.current = peer;

      // Generate my signal data
      peer.on("signal", (data) => {
        // data: contains the signal data to send
        console.log(data);
        console.log("Signaling to peer:", socketID);
        setCallerID(socketID);
        socket.emit("callUser", {
          userToCall: socketID,
          signalData: data,
          from: mySocketID,
        });
      });

      peer.on("stream", handleRemoteStream);

      // jisko maine call kia usne call accept kar lia
      socket.on("callAccepted", ({ signalData }) => {
        console.log("Call accepted, storing the Remote signal Data");
        // store the signaling data received from the remote peer
        peer.signal(signalData);
        console.log(signalData);
        setIsInCall(true);
      });

      peer.on("error", handlePeerError);
    } catch (error) {
      console.error("Error getting user media", error);
    }
  };

  const handleIncomingCall = async ({ signalData, from }) => {
    console.log("Incoming call from:", from);
    // Fetch media stream using getUserMedia
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const peer = new Peer({
      initiator: false,
      trickle: true,
      stream: window.localStream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun.l.google.com:5349" },
          { urls: "stun:stun1.l.google.com:3478" },
          {
            urls: "turn:global.relay.metered.ca:80",
            username: "93588a7d1e50ee58e2a751a7",
            credential: "+wxGMnvwQNLoyJoR",
          },
          {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: "93588a7d1e50ee58e2a751a7",
            credential: "+wxGMnvwQNLoyJoR",
          },
          {
            urls: "turn:global.relay.metered.ca:443",
            username: "93588a7d1e50ee58e2a751a7",
            credential: "+wxGMnvwQNLoyJoR",
          },
          {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: "93588a7d1e50ee58e2a751a7",
            credential: "+wxGMnvwQNLoyJoR",
          },
        ],
      },
    });
    peerRef.current = peer;

    // Generate my signal data
    peer.on("signal", (data) => {
      console.log("Signaling back to caller");
      socket.emit("acceptingCall", {
        acceptingCallFrom: from,
        signalData: data,
      });
    });

    peer.on("stream", handleRemoteStream);

    peer.on("error", handlePeerError);
    console.log("Incomming call: " + signalData);
    // store the signaling data received from the remote peer
    peer.signal(signalData);
    // who called me
    setCallerID(from);
    // Im in call right now
    setIsInCall(true);
  };

  const handleRemoteStream = (stream) => {
    console.log("Received remote stream");
    if (remoteVideo.current) {
      remoteVideo.current.srcObject = stream;
    }
  };

  const handlePeerError = (err) => {
    console.error("Peer connection error:", err);
    endCall(peerRef, setIsInCall, setCallerID, callerID, remoteVideo, socket);
  };

  // const handleEndCall = () => {
  //   location.reload();
  //   endCall(peerRef, setIsInCall, setCallerID, callerID, remoteVideo, socket);
  // };

  const handleCall = () => {
    if (callerID && !isInCall) {
      startCalling(callerID);
    }
  };

  const handleRequestUsers = () => {
    socket.emit("getAllConnectedUsers", { room_id: roomID });
  };

  useEffect(() => {
    handleRequestUsers();
    const interval = setInterval(handleRequestUsers, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClick=(socketID, username)=>{
    setCallerID(socketID);
    setUsername_var(username);
  }

  return (
    <div className="flex flex-col justify-center items-center h-[90%] w-[70%] text-blue-500">
      {/* <h2 className="mb-6">Video Call demo using simple-peer</h2> */}
      <div className="flex space-x-7 justify-center items-center">
        <div className="flex flex-col justify-center items-center">
          <p className="font-bold mb-5">You</p>
          <div className="aspect-video w-[25rem] h-auto">
            <video
              id="localVideo"
              autoPlay
              playsInline
              muted
              ref={localVideo}
              className="w-full h-full object-cover bg-gray-200 rounded-2xl"
            />
          </div>
        </div>
        {isInCall && (
          <div className="flex flex-col justify-center items-center">
            <p className="font-bold mb-5">{username_var}</p>
            <div className="aspect-video w-[25rem] h-auto">
              <video
                id="localVideo"
                autoPlay
                playsInline
                muted
                ref={remoteVideo}
                className="w-full h-full object-cover bg-gray-200 rounded-2xl"
              />
            </div>
          </div>
        )}
      </div>
      {isInCall || (
        <div className="mt-4">
          <h3>Connected Users:</h3>
          <ul>
            {Object.entries(connectedUsers).map(([socketID, username]) => (
              <li
                key={socketID}
                className="flex items-center justify-between mb-2"
              >
                <span>{username}</span>
                <button
                  onClick={() => handleClick(socketID, username)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  disabled={isInCall}
                >
                  Select
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {isInCall || (
        <div className="mt-4">
          <input
            type="text"
            value={callerID}
            onChange={(e) => setCallerID(e.target.value)}
            placeholder="Enter caller ID"
            className="px-2 py-1 border rounded"
          />
          <button
            onClick={handleCall}
            className="ml-2 bg-green-500 text-white px-4 py-2 rounded"
            disabled={isInCall || !callerID}
          >
            Call User
          </button>
        </div>
      )}
      {/* {isInCall && (
        <button
          onClick={handleEndCall}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          End Call
        </button>
      )} */}
    </div>
  );
};

export default VideoGrid;
