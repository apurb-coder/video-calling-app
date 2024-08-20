import React from 'react'
import Controls from "./Controls";
import VideoGrid from './VideoGrid';


const VideoSection = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <VideoGrid className="w-[80%]" />
      <Controls />
    </div>
  );
};

export default VideoSection