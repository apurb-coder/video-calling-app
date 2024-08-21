import React, { useEffect, useState } from "react";
import Peer from "peerjs"; // Import PeerJS
import { useAppContext } from "../context/AppContext";


// for handling multiple participnats in a video call
const VideoGrid = () => {
  useEffect(() => {
    const myPeer = new Peer();

    // Get local video stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // set my local videostream globally, making it easier to access
        window.localStream = stream;
        document.getElementById("myVideo").srcObject = stream;

        // Handle incoming calls
        myPeer.on("call", (call) => {
          // if someone is calling answer their calls with my videoStream
          call.answer(stream);
          // the person who called if sends his/her videoStream strore it somewhere
          call.on("stream", (userStream) => {
            setStreams((prevStreams) => ({
              ...prevStreams,
              [call.peer]: userStream,
            }));
          });
        });

        // Handle user joining the meeting
        // socketID: of who joined the meeting
        socket.on("user-joined-meeting", (socketId) => {
          // send my videoStream to the socketID who joined the meeting
          const call = myPeer.call(socketId, stream);
          // receive the videoStream of the user who I called .
          call.on("stream", (userStream) => {
            setStreams((prevStreams) => ({
              ...prevStreams,
              [userId]: userStream,
            }));
          });
        });
      });

    // Emit event when peer connection is open
    myPeer.on("open", (id) => {
      socket.emit("meeting", 8777, id);
    });
  }, []);
  return (
    <div className="h-[85%] flex flex-col justify-center items-center videoCallContainer">
      {/* Local video */}
      {/* <video src="" autoPlay={true} muted={true} id="myVideo"></video> */}

      {/* Render videos for each remote stream */}
      {/* {Object.keys(streams).map((userId) => (
        <video
          key={userId}
          src=""
          autoPlay={true}
          ref={(videoElement) => {
            if (videoElement) videoElement.srcObject = streams[userId];
          }}
        ></video>
      ))} */}
      
    </div>
  );
};

export default VideoGrid;
