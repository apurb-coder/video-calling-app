// Function: This file handles all states for the app. This file provides access of all states globally.
import { createContext, useContext, useState,useEffect } from "react";

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
  const [currentTime, setCurrentTime] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");
  useEffect(() => {
    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"],
        v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    const updateDateTime = () => {
      const date = new Date();
      const options = { year: "numeric", month: "long" };
      const formattedDate = `${date.toLocaleDateString(
        "en-US",
        options
      )} ${getOrdinal(date.getDate())}`;
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      setCurrentDateTime(`${formattedDate} | ${formattedTime}`);
      setCurrentTime(`${formattedTime}`);
    };

    const timer = setInterval(updateDateTime, 2000); // Update every 1 minute

    updateDateTime(); // Initial update

    return () => {
      clearInterval(timer); // Clean up when component unmounts
    };
  }, []);
  return (
    <AppContext.Provider
      value={{
        streams,
        setStreams,
        roomID,
        setRoomID,
        topic,
        setTopic,
        currentTime,
        setCurrentTime,
        currentDateTime,
        setCurrentDateTime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
