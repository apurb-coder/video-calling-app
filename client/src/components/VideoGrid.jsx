import React, { useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import ReactPlayer from "react-player"; // video player for Reactjs

const VideoGrid = () => {
  const { streams, roomID, username, setMyPeerID } = useAppContext();
  const { isScreenShareOn, screenShareStream } = useSocket();
  const videoRef = useRef(null);

  useEffect(() => {
    // Request Camera stream
    const startCameraVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Handle other setup, like sending stream over socket, etc.
      } catch (error) {
        console.error("Error accessing media devices:", error);
        // Handle error, e.g., notify the user or fallback
      }
    };

    if (isScreenShareOn && videoRef.current && screenShareStream) {
      videoRef.current.srcObject = screenShareStream;
    } else {
      startCameraVideoStream();
    }
  }, [isScreenShareOn, screenShareStream]);

  return (
    <>
      {/* Local video */}
      <video
        id="myVideo"
        className="w-80 h-80"
        muted
        autoPlay
        controls
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
