import React, { useEffect, useState } from "react";
import Logo from "../assets/Mask group.svg";
import LinkLogo from "../assets/link.svg";
import { useAppContext } from "../context/AppContext.jsx";
import profile_img from "../assets/profile_img.png";

const Top = () => {
  const {currentDateTime} = useAppContext();


  return (
    <div className="flex justify-around">
      <div className="p-4">
        <img src={Logo} alt="logo" className="w-8" />
      </div>
      <div className="p-4">
        <h2 className=" text-xl font-semibold">Meet-Name</h2>
        <p className="text-sm text-gray-400 font-semibold">{currentDateTime}</p>
      </div>
      <div className="p-4 bg-[#DFEBFF] text-[#0060FF] m-4 px-8 rounded-full text-sm flex space-x-1">
        <img src={LinkLogo} alt="Link logo" className="w-6 font-bold" />
        <p>| Room-Id</p>
      </div>
    </div>
  );
};

export default Top;
