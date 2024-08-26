import React from "react";
import microPhoneIcon from "../assets/microphone-2.svg";
import videoIcon from "../assets/video.svg";
import screenShareIcon from "../assets/send-square.svg";
import recordMeetIcon from "../assets/Group 33.svg";

const Controls = () => {
  return (
    <div className="flex flex-col h-[15%] items-center justify-center fixed bottom-0 left-0 right-[26.3125rem]">
      <div className="flex relative w-full items-center justify-center">
        <div className="flex space-x-5">
          {/* Toggle on/off microPhone */}
          <div className="bg-[#0060FF] p-2 rounded-full cursor-pointer">
            <img
              src={microPhoneIcon}
              alt="microPhoneIcon"
              className="w-5 h-5"
            />
          </div>
          {/* Toggle on/off video */}
          <div className="bg-[#0060FF] p-2 rounded-full cursor-pointer">
            <img src={videoIcon} alt="videoIcon" className="w-5 h-5" />
          </div>
          {/* Share Screen */}
          <div className="bg-[#DFEBFF] p-2 rounded-full cursor-pointer">
            <img src={screenShareIcon} alt="videoIcon" className="w-5 h-5" />
          </div>
          {/* Record Meet */}
          <div className="bg-[#f1f1f1] p-2 rounded-full cursor-pointer">
            <img src={recordMeetIcon} alt="videoIcon" className="w-5 h-5" />
          </div>
        </div>
        {/* End Call */}
        <div className=" absolute right-7 cursor-pointer">
          <div className="bg-red-500 text-white py-2 px-5 rounded-full">
            End Call
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
