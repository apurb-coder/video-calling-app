import React from 'react'
import user_add from "../assets/user-add.svg" 
import send_logo from "../assets/Group 237540.svg"

const Chat = () => {
  return (
    <div className="max-w-[26.3125rem] bg-[#F6F6F6]">
      <div className="p-4 flex space-x-5 items-center bg-white">
        <p className="font-medium">Participants</p>
        <div className="flex font-medium text-[#0060FF] bg-[#DFEBFF] text-xs py-3 px-4 rounded-full space-x-1">
          <p>Add Participants</p>
          <img src={user_add} alt="user_add" className="w-3" />
        </div>
      </div>
      <div>
        <h2 className="p-4 font-medium items-center bg-white">Chats</h2>
        {/* <div className="bg-[#F6F6F6] max-w-[26.3125rem] max-h-[52rem]"></div> */}
        <div className="flex space-x-3 bg-[#F6F6F6] px-5 rounded-full py-3 items-center">
          <p className="text-[#8D8F98] font-semibold text-sm">
            Type something...
          </p>
          <img src={send_logo} alt="send_logo" className="w-8" />
        </div>
      </div>
    </div>
  );
}

export default Chat