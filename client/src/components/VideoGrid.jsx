import React, { useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

const VideoGrid = () => {
  const { streams, roomID, username, setMyPeerID } = useAppContext();
  const { socket } = useSocket();
  const videoRef = useRef(null);

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Additional setup if necessary
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  useEffect(() => {
    startVideoStream();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Reinitialize stream if needed when the tab is active again
        if (!videoRef.current.srcObject) {
          startVideoStream();
        }
      } else {
        // Optional: pause video or any other handling when tab is inactive
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Cleanup media tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

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
