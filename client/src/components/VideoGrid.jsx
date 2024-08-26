import React, { useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

const VideoGrid = () => {
  const { streams, roomID, username, setMyPeerID } = useAppContext();
  const { socket} = useSocket();
  
  useEffect(()=>{
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream)=>{
      document.getElementById("myVideo").srcObject = stream;
    })
  },[])
  return (
    <>
      {/* Local video */}
      <video
        id="myVideo"
        className="w-80 h-80"
        muted
        autoPlay
        playsInline
      />

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
