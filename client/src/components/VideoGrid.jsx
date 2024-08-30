import React, { useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

const VideoGrid = () => {
  const { streams, roomID, username, setMyPeerID } = useAppContext();
  const { localStream, isScreenShareOn } = useSocket();
  const videoRef = useRef(null);

  useEffect(() => {
    //Request Screen share video stream
    const startCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.log("Error Accessing media devices:", error);
      }
    };
    if (isScreenShareOn) {
      if (videoRef.current && localStream) {
        videoRef.current.srcObject = localStream;
      }
    } else {
      startCameraStream();
    }
  }, [localStream, isScreenShareOn]);

  return (
    <>
      {/* Local video */}
      <video
        id="myVideo"
        className="w-80 h-80"
        muted
        autoPlay
        playsInline
        ref={videoRef}
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
