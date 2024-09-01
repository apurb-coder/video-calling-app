import React, { useState, useEffect } from "react";
import axios from "axios";
import Top from "../components/Top";
import { useAppContext } from "../context/AppContext.jsx";
import VideoSection from "../components/VideoSection.jsx";
import Chat from "../components/Chat";
import Error404Room from "./Error404Room.jsx";
import { useParams } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const VideoCallingUi = () => {
  const { setRoomID } = useAppContext();
  const { roomId } = useParams();
  const [roomExists, setRoomExists] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("roomID", roomId);
    setRoomID(roomId);
    const validateRoomID = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/topic?room=${roomId}`);
        if (response.status === 200) {
          setRoomExists(true);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setRoomExists(false);
        }
      }
    };
    validateRoomID();
  }, [roomId]);
  return (
    <div className="flex flex-col h-screen">
      {roomExist ? (
        <>
          <Top roomExits={true} topicExits={true} />
          <div className="flex-grow flex items-center justify-between">
            <VideoSection className="flex-shrink-0" />
            <Chat className="flex-shrink-0" />
          </div>
        </>
      ) : (
        <>
          <Error404Room />
        </>
      )}
    </div>
  );
};

export default VideoCallingUi;
