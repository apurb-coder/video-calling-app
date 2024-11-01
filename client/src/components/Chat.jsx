import React, { useState, lazy, Suspense, useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext.jsx";
import { useNavigate, useParams } from "react-router-dom";
import user_add from "../assets/user-add.svg";
import send_logo from "../assets/Group 237540.svg";
import { FaRegSmileWink } from "react-icons/fa";
import { RxImage } from "react-icons/rx";
import { Toaster } from "react-hot-toast";
const LazyEmojiPicker = lazy(() => import("emoji-picker-react"));
const Chat = () => {
  const navigate = useNavigate();
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const emojiRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const {
    yourChat,
    setYourChat,
    chats,
    setChats,
    exeCommand,
    sendMessage,
    sendFile,
    mention,
  } = useChat();
  const toggleEmojiPicker = () => {
    setIsEmojiOpen((prev) => !prev);
  };
  const handleEmojiClick = (emojiObject) => {
    setYourChat((prev) => prev + emojiObject.emoji);
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
  const { roomId } = useParams();
  const handleWhiteBoardClick = (event) => {
    navigate(`/video-call/${roomId}/whiteboard`);
  };
  return (
    <div className="flex flex-col h-[91.1%] justify-center fixed bottom-0 right-0">
      <Toaster position="top-right" reverseOrder={true} />
      <div className="p-2 flex space-x-5 items-center bg-white">
        {/* <p className="font-medium">Participants</p> */}
        <div
          className="flex font-medium text-[#0060FF] bg-[#DFEBFF] text-xs py-2 px-4 rounded-full space-x-1 hover:cursor-pointer"
          onClick={handleWhiteBoardClick}
        >
          <p>White Board</p>
          <img src={user_add} alt="user_add" className="w-3" />
        </div>
      </div>
      <div className="flex-grow">
        <h2 className="p-2 font-medium items-center bg-white text-[#0060FF]">
          Chats
        </h2>
        <div className="p-4 font-medium items-center w-[26.3125rem] bg-white max-h-[469.9px]  overflow-y-scroll overflow-x-hidden">
          {/* Render the chats here */}
          {chats.map((chat, index) => {
            if (chat && chat.type === "info") {
              return (
                <div key={index} className="text-center text-gray-500">
                  {chat.message}
                </div>
              );
            } else if (chat && chat.type === "text") {
              return (
                <div
                  key={index}
                  className={`flex flex-col items-start gap-2 rounded-lg bg-[${chat.bgColor}] px-4 py-2 text-sm my-2`}
                >
                  <div className="flex justify-between w-full">
                    <p
                      className={`font-medium ${
                        chat.textColor === "white"
                          ? "text-white"
                          : "text-[#0060FF]"
                      }`}
                    >
                      {chat.username}
                    </p>
                    <p
                      className={`${
                        chat.textColor === "white"
                          ? "text-white"
                          : "text-[#0060FF]"
                      }`}
                    >
                      {chat.timeStamp}
                    </p>
                  </div>
                  <p
                    className={`${
                      chat.textColor === "white"
                        ? "text-white"
                        : "text-[#0060FF]"
                    } break-words w-full`}
                  >
                    {chat.message}
                  </p>
                </div>
              );
            } else if (chat && chat.type === "file") {
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 w-[20rem] rounded-lg bg-[${chat.bgColor}] px-4 py-2 text-sm mb-3`}
                >
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <p className={`font-medium ${
                        chat.textColor === "white"
                          ? "text-white"
                          : "text-[#0060FF]"
                      }`}>
                        {chat.username}
                      </p>
                      <p
                        className={`${
                          chat.textColor === "white"
                            ? "text-white"
                            : "text-[#0060FF]"
                        }`}
                      >
                        {chat.timeStamp}
                      </p>
                    </div>
                    <img src={chat.file} className="rounded-lg" />
                  </div>
                </div>
              );
            }
          })}
        </div>
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
        <div className="relative flex w-[24rem] bg-[#DFEBFF] px-5 rounded-full py-3 items-center space-x-2">
          <textarea
            id="chatBox"
            onChange={(e) => setYourChat(e.target.value)}
            value={yourChat}
            className="text-[#8D8F98] font-normal bg-[#DFEBFF] h-5 text-sm flex-grow outline-none resize-none emojiRender"
          />
          <img
            src={send_logo}
            alt="send_logo"
            className="w-6 cursor-pointer"
            onClick={(e) => sendMessage(yourChat)}
          />
          <div className=" relative w-6 cursor-pointer">
            {/* inset-0 : top-0 , right-0, bottom-0, right-0 */}
            <input
              type="file"
              accept="image/*"
              id="submit file"
              className=" absolute inset-0 opacity-0 cursor-pointer "
              onChange={(e) => {
                sendFile(e);
              }}
            />
            <RxImage className="text-xl cursor-pointer text-gray-500/80" />
          </div>
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
