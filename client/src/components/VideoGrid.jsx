import React from "react";
import { useAppContext } from "../context/AppContext.jsx";

const VideoGrid = () => {
  const { streams } = useAppContext();

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
