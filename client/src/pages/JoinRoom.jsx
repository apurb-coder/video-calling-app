import React,{useState} from 'react'
import Logo from "../assets/Mask group.svg";


const JoinRoom = () => {
  const [joinOption, setJoinOption] = useState("");
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
          {joinOption === "Create New Room" && <div>Create New Room</div>}
          {joinOption === "Join Existing room" && <div>Join Existing Room</div>}
        </div>
      </div>
    </div>
  );
}

export default JoinRoom