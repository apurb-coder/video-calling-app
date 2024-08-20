import { createContext, useContext } from "react";
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
    return(
        <ChatContext.Provider value={{/* chat state */}}>
            {children}
        </ChatContext.Provider>
    );
}