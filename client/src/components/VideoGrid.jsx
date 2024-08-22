import React, { useEffect, useState } from "react";
import Peer from "peerjs"; // Import PeerJS
import { useAppContext } from "../context/AppContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

// for handling multiple participnats in a video call
const VideoGrid = () => {
  // streams = { socket_ID1: { videoStream} , socket_ID2: { videoStream} , socket_ID3: { videoStream}}
  const { streams, setStreams, roomID, username, setMyPeerID } =
    useAppContext();
  const { socket } = useSocket();
  const myPeer = new Peer({
    config: {
      iceServers: [
        { url: "stun:stun.l.google.com:19302" }, // Google's STUN server
      ],
    },
  });
  useEffect(() => {
    // 'open' event: It will get triggered when the peer connection is successfully established and the peer's ID is assigned.
    myPeer.on("open", (peerID) => {
      console.log(`Your peerID is ${peerID}`);
      setMyPeerID(peerID);
      socket.emit("setPeerId", { peerId: peerID });
      socket.emit("joinRoom", { username, room_id: roomID });
    });
    // Get local video stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // set my local videostream globally, making it easier to access
        // console.log("Stream obtained:", stream); // Add this line
        window.localStream = stream;
        document.getElementById("myVideo").srcObject = stream;

        // Handle incoming calls
        myPeer.on("call", (call) => {
          // if someone is calling answer their calls with my videoStream
          call.answer(stream);
          console.log(`Incoming call: ${call.peer}`);
          // the person who called if sends his/her videoStream strore it somewhere
          call.on("stream", (remoteStream) => {
            setStreams((prevStreams) => ({
              ...prevStreams,
              [call.peer]: remoteStream,
            }));
          });
        });

        // Handle user joining the meeting
        // socketID: of who joined the meeting
        socket.on("user-joined-meeting", ({ socketId, peerId, username }) => {
          console.log(
            `User joined meeting with username: ${username} with peerId: ${peerId}`
          );
          // send my videoStream to the socketID who joined the meeting
          const call = myPeer.call(peerId, stream);
          // receive the videoStream of the user who I called .
          call.on("stream", (remoteStream) => {
            setStreams((prevStreams) => ({
              ...prevStreams,
              [peerId]: remoteStream,
            }));
          });
        });
      });
  }, []);
  return (
    <div className="h-[85%] flex flex-col justify-center items-center videoCallContainer">
      {/* Local video */}
      <video id="myVideo" autoPlay={true} muted={true}></video>

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
