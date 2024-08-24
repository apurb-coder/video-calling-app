import React, { useEffect, useState } from "react";
import Logo from "../assets/Mask group.svg";
import LinkLogo from "../assets/link.svg";
import { useAppContext } from "../context/AppContext.jsx";
import profile_img from "../assets/profile_img.png";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Top = () => {
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
      <div className="p-4">
        <img src={Logo} alt="logo" className="w-8" />
      </div>
      <div className="p-4">
        <h2 className=" text-xl font-semibold">{topic}</h2>
        <p className="text-sm text-gray-400 font-semibold">{currentDateTime}</p>
      </div>
      <div className="p-4 bg-[#DFEBFF] text-[#0060FF] m-4 px-8 rounded-full text-sm flex space-x-1 hover:cursor-pointer" onClick={(e)=>{navigator.clipboard.writeText(roomID)}}>
        <img src={LinkLogo} alt="Link logo" className="w-6 font-bold" />
        <p>| {roomID}</p>
      </div>
    </div>
  );
};

export default Top;
