import React, { useEffect, useState } from "react";
import Logo from "../assets/Mask group.svg";
import LinkLogo from "../assets/link.svg";
import { useAppContext } from "../context/AppContext.jsx";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Top = ({roomExits, topicExits}) => {
  const { currentDateTime, topic, setTopic, roomID } = useAppContext();
  useEffect(() => {
    const fetchTopic = async () => {
      const room = sessionStorage.getItem("roomID")
      const response = await axios.get(`${BACKEND_URL}/topic?room=${room}`);
      if (response.status === 200) {
        sessionStorage.setItem("topic", response?.data?.topic);
        setTopic(response?.data?.topic);
      }
      if (response.status === 404) {
        console.log("Error fetch room topic");
      }
    };
    fetchTopic();
  }, []);

  return (
    <div className="flex justify-around">
      <div className="flex justify-center items-center">
        <img src={Logo} alt="logo" className="w-8" />
      </div>
      <div className="flex flex-col justify-center items-center">
        <h2 className=" text-lg font-semibold">{topicExits? topic: "Topic Invalid"}</h2>
        <p className="text-xs text-gray-400 font-semibold">{currentDateTime}</p>
      </div>
      <div
        className=" bg-[#DFEBFF] text-[#0060FF] m-4 px-8 py-1 rounded-full text-xs flex justify-center items-center space-x-1 hover:cursor-pointer"
        onClick={(e) => {
          navigator.clipboard.writeText(roomID);
        }}
      >
        <img src={LinkLogo} alt="Link logo" className="w-6 font-bold" />
        <p>| {roomExits ? roomID : "Room ID Invalid"}</p>
      </div>
    </div>
  );
};

export default Top;
