import React, { useState } from "react";
import Logo from "../assets/Mask group.svg";
import { useAppContext } from "../context/AppContext.jsx";
import { v6 as uuidv6 } from "uuid"; // to generate a unique roomID

const JoinRoom = () => {
  const {roomID, setRoomID} = useAppContext();
  const {topic, setTopic} = useAppContext();
  const [joinOption, setJoinOption] = useState("");
  const [username, setUsername] = useState("");

  const generateRandomRoomID = () =>{
    const randomRoomID = uuidv6();
    setRoomID(randomRoomID);
    console.log(username);
  }
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex-col space-y-8">
        {/* logo and App name display */}
        <div className="flex items-center justify-center space-x-6">
          <img src={Logo} alt="logo" />
          <h3 className=" font-semibold text-2xl">ConnectDots</h3>
        </div>
        {/* TODO: implement conditional rendering */}
        <div>
          {joinOption === "" && (
            <div className="space-x-6">
              <button
                className=" py-2 px-5 bg-[#0060FF] rounded-md text-white"
                onClick={() => setJoinOption("Create New Room")}
              >
                Create New Room
              </button>
              <button
                className=" py-2 px-5 bg-[#0060FF] rounded-md text-white"
                onClick={() => setJoinOption("Join Existing room")}
              >
                Join Existing room
              </button>
            </div>
          )}
          {joinOption === "Create New Room" && (
            <div className="flex flex-col space-y-5">
              <input
                type="text"
                name="username"
                placeholder="Enter User Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="text"
                name="roomID"
                id="roomID"
                placeholder="Enter Room ID"
                value={roomID}
                onChange={(e) => setRoomID(e.target.value)}
              />
              <input
                type="text"
                name="topic"
                placeholder="Enter Meeting Topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <button
                className=" py-2 px-5 bg-[#0060FF] rounded-md text-white"
                onClick={() => generateRandomRoomID()}
              >
                Generate Random Room ID
              </button>
              <button className=" py-2 px-5 bg-[#0060FF] rounded-md text-white">
                Join Room
              </button>
            </div>
          )}
          {joinOption === "Join Existing room" && (
            <div className="flex flex-col space-y-5">
              <input
                type="text"
                name="username"
                placeholder="Enter User Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="text"
                name="roomID"
                id="roomID"
                placeholder="Enter Room ID"
                value={roomID}
                onChange={(e) => setRoomID(e.target.value)}
              />
              <button className=" py-2 px-5 bg-[#0060FF] rounded-md text-white">
                Join Room
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
