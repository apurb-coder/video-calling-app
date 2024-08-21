// Function: This file handles all states for the app. This file provides access of all states globally.
import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useAppContext must be used within a AppContextProvider");
  }
  return context;
};

export const AppContextProvider = ({ children }) => {
  // TODO: Define All the states used in the App like room_id , user ID, participants list
  const [streams, setStreams] = useState({});
  const [roomID, setRoomID] = useState("");
  const [topic, setTopic] = useState("");
  return <AppContext.Provider value={{streams,setStreams,roomID,setRoomID,topic,setTopic}}>{children}</AppContext.Provider>;
};
