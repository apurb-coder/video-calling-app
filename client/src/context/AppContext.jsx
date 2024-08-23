// Function: This file handles all states for the app. This file provides access of all states globally.
import { createContext, useContext, useState, useEffect } from "react";

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
  const [username, setUsername] = useState("");
  const [topic, setTopic] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [myPeerID, setMyPeerID] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [activeParticipants, setActiveParticipants] = useState([]);
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
  // whenever there is change in session storage , getItem from session storage
  useEffect(()=>{
    const storedRoomID=sessionStorage.getItem("roomID");
    const storedUsername=sessionStorage.getItem("username");
    const storedTopic= sessionStorage.getItem("topic");
    if(storedRoomID) setRoomID(storedRoomID);
    if(storedUsername) setUsername(storedUsername);
    if(storedTopic) setTopic(storedTopic);
  },[sessionStorage])
  // Function : fetch Active Participants list
  const fetchActivePaticipants = () => {
    // TODO: Implement the logic to fetch active participants based on roomID
  };
  return (
    <AppContext.Provider
      value={{
        streams,
        setStreams,
        roomID,
        setRoomID,
        username,
        setUsername,
        topic,
        setTopic,
        currentTime,
        setCurrentTime,
        myPeerID, setMyPeerID,
        currentDateTime,
        setCurrentDateTime,
        activeParticipants,
        setActiveParticipants,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
