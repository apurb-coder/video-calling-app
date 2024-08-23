import React,{useEffect} from "react";
import Top from "../components/Top";
import VideoSection from "../components/VideoSection.jsx";
import Chat from "../components/Chat";
import {useParams} from "react-router-dom"


const VideoCallingUi = () => {
    
  const {roomId} = useParams();
  useEffect(() =>{
    sessionStorage.setItem("roomID", roomId);
  },[roomId])
  return (
    <div className="flex flex-col h-screen">
      <Top />
      <div className="flex-grow flex items-center justify-between">
        <VideoSection className="flex-shrink-0" />
        <Chat className="flex-shrink-0" />
      </div>
    </div>
  );
};

export default VideoCallingUi;
