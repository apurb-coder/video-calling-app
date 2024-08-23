import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

const VideoGrid = () => {
  const { streams, roomID, username, setMyPeerID } = useAppContext();
  const {socket} = useSocket()
  useEffect(()=>{
    const storedPeerId = sessionStorage.getItem("myPeerID");
    if (storedPeerId) {
      setMyPeerID(storedPeerId);
      console.log(`Your peerID is ${storedPeerId}`);
      socket.emit("joinRoom", {
        username,
        room_id: roomID,
        peerID: storedPeerId,
      });
    }
  },[])
  return (
    <>
      {/* Local video */}
      <video id="myVideo" muted autoPlay playsInline></video>

      {/* Render videos for each remote stream */}
      {/* {Object.entries(streams).map(([userId, stream]) => (
        <video
          key={userId}
          autoPlay
          playsInline
          ref={(videoElement) => {
            if (videoElement) videoElement.srcObject = stream;
          }}
        />
      ))} */}
    </>
  );
};

export default VideoGrid;
