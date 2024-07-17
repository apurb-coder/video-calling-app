import React from 'react'
import Top from "../components/Top";
import VideoStream from "../components/VideoStream";
import Chat from "../components/Chat";

const VideoCallingUi = () => {
  return (
    <div>
      <Top />
      {/* <VideoStream/> */}
      <Chat />
    </div>
  );
}

export default VideoCallingUi