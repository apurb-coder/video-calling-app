import { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "./SocketContext.jsx";
import { useAppContext } from "./AppContext.jsx";
// import openGraph from "open-graph-scraper"; // for extracting metadata from URL

const ChatContext = createContext(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatRoom must be used within a ChatContextProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { socket } = useSocket();
  const { currentTime } = useAppContext();
  // define all chat logic like send , joined user, linkyfy and other chat logics
  const [yourChat, setYourChat] = useState("");
  const [chats, setChats] = useState([]);

  // new user joined the meeting chat
  socket.on("user-joined-meeting", ({ username }) => {
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
  socket.on("user-left-meeting", ({ username }) => {
    setChats((prevChats) => [
      ...prevChats,
      {
        type: "info",
        message: `${username} left the meeting`,
        pos: "center",
      },
    ]);
  });
   
  useEffect(() => {
    if (!socket) return;
    // BUG: 
    const handleMessage = async ({ username, message, type, timeStamp }) => {
      if (type === "text") {
        // const linkedMessage = await linkify(message);
        setChats((prevChats) => [
          ...prevChats,
          {
            type: "text",
            message: message,
            pos: "left",
            username: username,
            timeStamp: timeStamp,
          },
        ]);
      }
      if (type === "file") {
        setChats((prevChats) => [
          ...prevChats,
          {
            type: "file",
            message: "",
            pos: "left",
            file: message,
            username: username,
            timeStamp: timeStamp,
          },
        ]);
      }
      console.log("Message: " + message);
    };

    socket.on("new-incomming-message", handleMessage);

    // If you don't clean up you will receive same msg multiple times.
    return () => {
      socket.off("new-incomming-message", handleMessage);
    };
  }, [socket]);

  // can retrive a nth word from a sentence
  const word = (sentence, index) => {
    const words = sentence.trim().split(" ");
    return words[index] || "";
  };
  //cmd for meet chat : on "yourChat" value change execute this
  // TODO: add more commands later
  const exeCommand = () => {
    if (word(yourChat, 0) === "/clear") {
      setChats([]);
    }
  };

  // send a message: on send button click execute below function
  const sendMessage = async (message) => {
    const myUsername = sessionStorage.getItem("username");
    if (!myUsername) window.location.reload();
    if (myUsername && yourChat !== "") {
      setChats((prevChats) => [
        ...prevChats,
        {
          type: "text",
          message: message,
          pos: "right",
          username: "You",
          timeStamp: currentTime,
        },
      ]);
      socket.emit("send", {
        type: "text",
        message: yourChat,
        username: myUsername,
        timeStamp: currentTime,
      });
      setYourChat("");
    }
  };

  //handle file(ImageFile) to send
  const sendFile = (e) => {
    const myUsername = sessionStorage.getItem("username");
    if (!myUsername) window.location.reload();
    const fileToLoad = e.target.files[0]; // select only one file
    if (myUsername && fileToLoad) {
      const fileReader = new FileReader();
      // adding event listeners before file is loaded
      fileReader.onload = (file) => {
        const dataUrl = file.target.result;
        setChats((prevChats) => [
          ...prevChats,
          {
            type: "file",
            message: "",
            pos: "right",
            file: dataUrl,
            username: "You",
            timeStamp: currentTime,
          },
        ]);
        socket.emit("send", {
          type: "file",
          message: dataUrl,
          username: myUsername,
          timeStamp: currentTime,
        });
      };
      fileReader.readAsDataURL(fileToLoad); // read file as data url
    }
  };
  // handle username Mentions
  const mention = (e) => {
    setYourChat("@" + e.target.textContent + " " + yourChat);
    document.getElementById("chatBox").focus();
  };
  return (
    <ChatContext.Provider
      value={{
        yourChat,
        setYourChat,
        chats,
        setChats,
        exeCommand,
        sendMessage,
        sendFile,
        // linkify,
        mention,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
