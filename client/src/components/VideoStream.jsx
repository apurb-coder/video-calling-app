import React from 'react'
import Controls from "../components/Controls";
import VideoGrid from './VideoGrid';


const VideoStream = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <VideoGrid className="w-[80%]" />
      <Controls />
    </div>
  );
}

export default VideoStream