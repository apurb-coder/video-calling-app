import React, { useState, lazy, Suspense, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import user_add from "../assets/user-add.svg";
import send_logo from "../assets/Group 237540.svg";
import fileSendLogo from "../assets/Group 237548.svg";
import { FaRegSmileWink } from "react-icons/fa";
const LazyEmojiPicker = lazy(() => import("emoji-picker-react"));
const Chat = () => {
  const navigate  = useNavigate();
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const emojiRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const toggleEmojiPicker = () => {
    setIsEmojiOpen((prev) => !prev);
  };
  const handleEmojiClick = (emojiObject) => {
    setInputText((prev) => prev + emojiObject.emoji);
    // setInputText((prev)=> prev + {<Emoji />})
  };
  const handleEmojiOutsideClick = (event) => {
    if (
      emojiRef.current &&
      emojiButtonRef.current &&
      !emojiRef.current.contains(event.target) &&
      !emojiButtonRef.current.contains(event.target)
    ) {
      setIsEmojiOpen(false);
    }
  };
  useEffect(() => {
    if (isEmojiOpen) {
      document.addEventListener("mousedown", handleEmojiOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleEmojiOutsideClick);
    };
  }, [isEmojiOpen]);
  const {roomId} = useParams();
  const handleWhiteBoardClick=(event)=>{
    navigate(`/video-call/${roomId}/whiteboard`);
  }
  return (
    <div className="max-w-[26.3125rem] bg-[#F6F6F6] min-h-[99.99%] flex flex-col">
      <div className="p-2 flex space-x-5 items-center bg-white">
        {/* <p className="font-medium">Participants</p> */}
        <div className="flex font-medium text-[#0060FF] bg-[#DFEBFF] text-xs py-2 px-4 rounded-full space-x-1 hover:cursor-pointer" onClick={handleWhiteBoardClick}>
          <p>White Board</p>
          <img src={user_add} alt="user_add" className="w-3" />
        </div>
      </div>
      <div className="flex-grow">
        <h2 className="p-2 font-medium items-center bg-white">Chats</h2>
        {/* <div className="p-4 font-medium items-center w-[26.3125rem] bg-[#F6F6F6] rounded-md"></div> */}
      </div>
      <div className="fixed bottom-20 z-10 w-0" ref={emojiRef}>
        {isEmojiOpen && (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyEmojiPicker
              className="ml-16"
              onEmojiClick={handleEmojiClick}
              emojiStyle="google"
              lazyLoadEmojis="true"
            />
          </Suspense>
        )}
      </div>
      <div className="p-4 items-center bg-[#F6F6F6] flex justify-center">
        <div className="relative flex w-[24rem] bg-white px-5 rounded-full py-3 items-center space-x-2">
          <textarea
            onChange={(e) => setInputText(e.target.value)}
            value={inputText}
            className="text-[#8D8F98] font-semibold h-5 text-sm flex-grow outline-none resize-none emojiRender"
          />
          <img src={send_logo} alt="send_logo" className="w-6 cursor-pointer" />
          <img
            src={fileSendLogo}
            alt="send_logo"
            className="w-6 cursor-pointer"
          />
          {/* <img
            src={SmilyIcon}
            alt="send_logo"
            className="w-6 cursor-pointer"
            onClick={toggleEmojiPicker}
            ref={emojiButtonRef}
          /> */}
          <div ref={emojiButtonRef}>
            <FaRegSmileWink
              className=" text-xl cursor-pointer text-gray-500/80"
              onClick={toggleEmojiPicker}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
