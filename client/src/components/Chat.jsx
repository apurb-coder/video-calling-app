import React,{useState} from "react";
import EmojiPicker from "emoji-picker-react";
import user_add from "../assets/user-add.svg";
import send_logo from "../assets/Group 237540.svg";
import fileSendLogo from "../assets/Group 237548.svg"
import SmilyIcon from "../assets/smiley.svg"

const Chat = () => {
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [inputText, setInputText] = useState("")
   const toggleEmojiPicker = () => {
     setIsEmojiOpen((prev) => !prev);
   };
   const handleEmojiClick=(emojiObject)=>{
      setInputText((prev)=> prev + emojiObject.emoji)
   }
  return (
    <div className="max-w-[26.3125rem] bg-[#F6F6F6] min-h-[99.99%] flex flex-col">
      <div className="p-4 flex space-x-5 items-center bg-white">
        <p className="font-medium">Participants</p>
        <div className="flex font-medium text-[#0060FF] bg-[#DFEBFF] text-xs py-3 px-4 rounded-full space-x-1">
          <p>Add Participants</p>
          <img src={user_add} alt="user_add" className="w-3" />
        </div>
      </div>
      <div className="flex-grow">
        <h2 className="p-4 font-medium items-center bg-white">Chats</h2>
        <div className="p-4 font-medium items-center w-[26.3125rem] bg-[#F6F6F6] rounded-md">
          dfd
        </div>
      </div>
      { isEmojiOpen ? <EmojiPicker className="ml-16" onEmojiClick={handleEmojiClick}/> : <></>}
      <div className="p-4 items-center bg-[#F6F6F6] flex justify-center">
        <div className="relative flex w-[24rem] bg-white px-5 rounded-full py-3 items-center space-x-2">
          <textarea onChange={(e)=> setInputText(e.target.value)} value={inputText} className="text-[#8D8F98] font-semibold h-5 text-sm flex-grow outline-none resize-none" />
          <img src={send_logo} alt="send_logo" className="w-6 cursor-pointer" />
          <img src={fileSendLogo} alt="send_logo" className="w-6 cursor-pointer" />
          <img src={SmilyIcon} alt="send_logo" className="w-6 cursor-pointer" onClick={toggleEmojiPicker} />
        </div>
      </div>
    </div>
  );
};

export default Chat;