import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const useSocket = ()=>{
    const context = useContext(SocketContext);
    if (!context) {
      throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
}

export const SocketProvider = ({ children }) => {
    const socket = useMemo(
      () =>
        io(BACKEND_URL, {
          reconnectionAttempts: 2,
        }),
      []
    );

    // TODO: Define logics like username already exists and user leave teh chat etc
    return(
        <SocketContext.Provider value={{socket}}>{children}</SocketContext.Provider>
    )
}