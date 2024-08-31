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
        setChats((prevChats) => [...prevChats, {
            type: "info",
            text: `${username} joined the meeting`,
            pos: "center"

        }]);
    });
    // user left the meeting chat
    socket.on("user-left-meeting",({username})=>{
        setChats((prevChats) => [...prevChats, {
            type: "info",
            text: `${username} left the meeting`,
            pos: "center"
        }])
    });
    // on receiving new message
    socket.on("new-incomming-message");
    return(
        <ChatContext.Provider value={{/* chat state */}}>
            {children}
        </ChatContext.Provider>
    );
}