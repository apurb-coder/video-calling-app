import { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "./SocketContext.jsx";
import { useAppContext } from "./AppContext.jsx";
import Compressor from "compressorjs"; // for image compression

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
  useEffect(() => {
    if (!socket) return;
    const handleUserJoinedMeeting = ({ username }) => {
      setChats((prevChats) => [
        ...prevChats,
        {
          type: "info",
          message: `${username} joined the meeting`,
          pos: "center",
        },
      ]);
    };
    const handleMessageLeftMeeting = ({ username }) => {
      setChats((prevChats) => [
        ...prevChats,
        {
          type: "info",
          message: `${username} left the meeting`,
          pos: "center",
        },
      ]);
    };
    socket.on("user-joined-meeting", handleUserJoinedMeeting);
    // user left the meeting chat
    socket.on("user-left-meeting", handleMessageLeftMeeting);
    return;
  }, [socket]);
  useEffect(() => {
    if (!socket) return;
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

  // Send Image file
  // TODO: For now it can only handle image size of 2mb only , increase this limit to 5MB or 10MB
  const sendFile = (e) => {
    const myUsername = sessionStorage.getItem("username");
    if (!myUsername) window.location.reload();
    const fileToLoad = e.target.files[0]; // select only one file

    if (myUsername && fileToLoad) {
      console.log(`Original file size: ${fileToLoad.size / 1024 / 1024} MB`);

      // Set maximum file size to 10MB
      const maxFileSize = 2 * 1024 * 1024; // 2MB in bytes
      if (fileToLoad.size > maxFileSize) {
        alert(
          `File is too large. Please select a file smaller than 2MB. Your file is ${(
            fileToLoad.size /
            1024 /
            1024
          ).toFixed(2)}MB.`
        );
        return;
      }

      new Compressor(fileToLoad, {
        quality: 0.2, // Increased quality for better image fidelity
        maxWidth: 2400, // Increased max dimensions for larger images
        maxHeight: 2400,
        success(compressedImageFile) {
          console.log(
            `Compressed file size: ${compressedImageFile.size / 1024 / 1024} MB`
          );

          const fileReader = new FileReader();
          fileReader.onloadend = () => {
            const dataUrl = fileReader.result;
            console.log(`Data URL length: ${dataUrl.length} bytes`);

            // Check if the compressed file is still larger than the maximum allowed size
            if (dataUrl.length > 1 * 1024 * 1024) {
              alert(`Compressed file is ${(
                dataUrl.length /
                1024 /
                1024
              ).toFixed(2)}MB. 
                     This exceeds our 2MB limit. Please try a smaller image.`);
              return;
            }

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

            // Send the entire file data directly
            socket.emit("send", {
              type: "file",
              message: dataUrl,
              username: myUsername,
              timeStamp: currentTime,
            });
          };
          fileReader.readAsDataURL(compressedImageFile);
        },
        error(err) {
          console.error("Error compressing the image:", err.message);
          alert("Error compressing the image. Please try again.");
        },
      });
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
