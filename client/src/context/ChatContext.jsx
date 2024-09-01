import { createContext, useContext, useState } from "react";
import { useSocket } from "./SocketContext.jsx";
import openGraph from "open-graph-scraper";


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
  // TODO: define all chat logic like send , joined user, linkyfy and other chat logics
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
    if (type === "file") {
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
  const word = (sentence, index) => {
    const words = sentence.trim().split(" ");
    return words[index] || "";
  };
  //TODO: cmd for meet chat
  const exeCommand = () => {};

  // send a message
  const sendMessage = (e) => {
    const myUsername = sessionStorage.getItem("username");
    if (!myUsername) window.location.reload();
    if (myUsername && yourChat !== "") {
      setChats((prevChats) => [
        ...prevChats,
        {
          type: "text",
          text: yourChat,
          pos: "right",
          username: "You",
        },
      ]);
      socket.emit("send", {
        type: "text",
        message: yourChat,
        username: myUsername,
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
          },
        ]);
        socket.emit("send", {
          type: "file",
          message: dataUrl,
          username: myUsername,
        });
      };
      fileReader.readAsDataURL(fileToLoad); // read file as data url
    }
  };

  // handle links in the chats: Render tehir metaData properly
  const linkify = async (chat) => {
    // Split the chat text by spaces to process each word separately
    const arrayOfChat = chat.split(" ");

    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Process each word
    const processedChat = await Promise.all(
      arrayOfChat.map(async (word) => {
        if (word.match(urlRegex)) {
          // If the word is a URL, fetch metadata
          const metadata = await fetchLinkMetadata(word);

          // Construct the HTML for the link and its metadata
          return `
        <div class="link-preview">
          <a href="${word}" target="_blank">${word}</a>
          ${metadata ? renderMetadata(metadata) : ""}
        </div>`;
        } else {
          // If the word is not a URL, return it as is
          return word;
        }
      })
    );

    // Join the processed words back into a string with spaces
    return processedChat.join(" ");
  };

  // Fetch metadata for a URL
  const fetchLinkMetadata=async(url)=>{
    try{
      const options = { url: url };
      const data = await og(options);
      const {result}=data;
      const metadata= {
        title: result?.ogTitle,
        description: result?.ogDescription,
        image: result?.ogImage?.url,
        videoUrl: result?.ogVideo?.url,
      }
      return metadata;
    }catch(error){
      console.log("Error fetching metadata from URL");
      return undefined;
    }
  }
  // Render metadata properly
  const renderMetadata = (metadata)=>{
    if (!metadata) return "";

    const { title, description } = metadata;

    // return `
    // <div class="metadata">
    //   ${image ? `<img src="${image}" alt="Preview Image">` : ""}
    //   ${title ? `<h4>${title}</h4>` : ""}
    //   ${description ? `<p>${description}</p>` : ""}
    //   ${videoUrl ? `<a href="${videoUrl}" target="_blank">Play Video</a>` : ""}
    // </div>`;

    return `
    <div class="metadata">
      ${title ? `<h4>${title}</h4>` : ""}
      ${description ? `<p>${description}</p>` : ""}
    </div>`;
  }
  // handle username Mentions
  const mention = (e) => {
    setYourChat("@" + e.target.textContent + " " + yourChat);
    document.getElementById("chatBox").focus();
  };
  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        chats,
        setChats,
        exeCommand,
        sendMessage,
        sendFile,
        linkify,
        mention,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
