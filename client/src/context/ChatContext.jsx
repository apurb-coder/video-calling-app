import { createContext, useContext, useState } from "react";
import { useSocket } from "./SocketContext.jsx";

const ChatContext = createContext(null);

export const useChat = ()=>{
    const context = useContext(ChatContext);
    if (!context) {
      throw new Error("useChatRoom must be used within a ChatContextProvider");
    }
    return context;
}

export const ChatProvider = ({children})=>{
    const {socket} = useSocket();
    // TODO: define all chat logic like send , joined user, linkyfy and other chat logics
    const [yourChat,setYourChat]= useState("");
    const [chats, setChats] = useState([]);


    // new user joined the meeting chat
    socket.on("user-joined-meeting", ({username})=>{
        setChats((prevChats) => [
          ...prevChats,
          {
            type: "info",
            message: `${username} joined the meeting`,
            pos: "center",
          },
        ]);
    });
    // user left the meeting chat
    socket.on("user-left-meeting",({username})=>{
        setChats((prevChats) => [
          ...prevChats,
          {
            type: "info",
            message: `${username} left the meeting`,
            pos: "center",
          },
        ]);
    });
    // on receiving new message
    socket.on("new-incomming-message", ({ username, message, type }) => {
      if (type === "text") {
        setChats((prevChats) => [
          ...prevChats,
          {
            type: "text",
            message: message,
            pos: "left",
            username: username,
          },
        ]);
      }
      if(type === "file"){
        setChats((prevChats) => [
          ...prevChats,
          {
            type: "file",
            message: "",
            pos: "left",
            file: message,
            username: username,
          },
        ]);
      }
    });
    
    // can retrive a nth word from a sentence
    const word = (sentence,index)=>{
        const words = sentence.trim().split(" ");
        return words[index] || "";
    }
    //TODO: cmd for meet chat
    const exeCommand = ()=>{

    }

    // send a message
    const sendMessage=(e)=>{
        const myUsername = sessionStorage.getItem("username");
        if(!myUsername) window.location.reload();
        if(myUsername && yourChat!==""){
            setChats((prevChats)=>[...prevChats,{
                type: "text",
                text: yourChat,
                pos: "right",
                username: myUsername
            }]);
            socket.emit("send", { type: "text", message: yourChat });
            setYourChat("");
        }
    }
    return (
      <ChatContext.Provider value={{ chats, setChats, chats, setChats }}>
        {children}
      </ChatContext.Provider>
    );
}