import React from "react";
import Top from "../components/Top";
import VideoStream from "../components/VideoStream";
import Chat from "../components/Chat";

const VideoCallingUi = () => {
  return (
    <div className="flex flex-col h-screen">
      <Top />
      <div className="flex-grow flex items-center justify-between">
        <VideoStream className="flex-shrink-0" />
        <Chat className="flex-shrink-0" />
      </div>
    </div>
  );
};

export default VideoCallingUi;
