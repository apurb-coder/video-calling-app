import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

// for handling multiple participnats in a video call
export default function VideoFrame({ socket }) {
  const {streams,setStreams} = useAppContext();

  useEffect(() => {
    const myPeer = new Peer();

    // Get local video stream
    navigator.mediaDevices
      .getUserMedia({ video: { height: 300, width: 300 } })
      .then((stream) => {
        // set my local videostream globally, making it easier to access
        window.localStream = stream;
        document.getElementById("myVideo").srcObject = stream;

        // Handle incoming calls
        myPeer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (userStream) => {
            setStreams((prevStreams) => ({
              ...prevStreams,
              [call.peer]: userStream,
            }));
          });
        });

        // Handle user joining the meeting
        // userID: of who joined the meeting
        socket.on("user-joined-meeting", (userId) => {
          // send my stream to the userID who called me
          const call = myPeer.call(userId, stream);
          // receive the video of the user who called me.
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
    <div className="videoCallContainer">
      {/* Local video */}
      <video src="" autoPlay={true} muted={true} id="myVideo"></video>

      {/* Render videos for each remote stream */}
      {Object.keys(streams).map((userId) => (
        <video
          key={userId}
          src=""
          autoPlay={true}
          ref={(videoElement) => {
            if (videoElement) videoElement.srcObject = streams[userId];
          }}
        ></video>
      ))}
    </div>
  );
}
