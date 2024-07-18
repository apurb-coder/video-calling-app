import React from 'react'
import Logo from "../assets/Mask group.svg";
import { Routes, Route } from "react-router-dom";

const JoinRoom = () => {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex-col space-y-8">
        {/* logo and App name display */}
        <div className="flex items-center justify-center space-x-6">
          <img src={Logo} alt="logo" />
          <h3 className=" font-semibold text-2xl">ConnectDots</h3>
        </div>
        {/* TODO: implement conditional rendering */}
        {/* Two Buttons */}
        <div className='space-x-6'>
          <button className=" py-2 px-5 bg-[#0060FF] rounded-md text-white">
            Create New Room
          </button>
          <button className=" py-2 px-5 bg-[#0060FF] rounded-md text-white">
            Join Existing room
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinRoom