import React from 'react'
import Controls from "./Controls";
import VideoGrid from './VideoGrid';
import { useAppContext } from "../context/AppContext.jsx";


const VideoSection = () => {
    const { isInCall } = useAppContext();
  return (
    <div className="flex flex-col w-full h-full">
      <VideoGrid className="w-[80%]" />
      {isInCall && <Controls />}
    </div>
  );
};

export default VideoSection