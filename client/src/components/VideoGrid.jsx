import React, { useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import ReactPlayer from "react-player"; // video player for Reactjs

const VideoGrid = () => {
  const { roomID, username, setMyPeerID } = useAppContext();
  const { isScreenShareOn, screenShareStream, streams } = useSocket();
  const videoRef = useRef(null);
  const remoteVideoRefs = useRef([]); // Store references to remote video elements

  useEffect(() => {
    // Request Camera stream
    const startCameraVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Handle other setup, like sending stream over socket, etc.
      } catch (error) {
        console.error("Error accessing media devices:", error);
        // Handle error, e.g., notify the user or fallback
      }
    };

    if (isScreenShareOn && videoRef.current && screenShareStream) {
      videoRef.current.srcObject = screenShareStream;
    } else {
      startCameraVideoStream();
    }
  }, [isScreenShareOn, screenShareStream]);

  useEffect(() => {
    const userIds = Object.keys(streams).slice(0, 4); // Limit to first 4 participants

    userIds.forEach((userId, index) => {
      const stream = streams[userId];
      if (stream) {
        const videoElement = remoteVideoRefs.current[index];
        if (videoElement) {
          videoElement.srcObject = stream;
        } else {
          console.error(`No video element found at index: ${index}`);
        }
      }
    });
  }, [streams]);


  return (
    <>
      {/* Local video */}
      <video
        id="myVideo"
        className="w-80 h-80"
        muted
        autoPlay
        playsInline
        ref={videoRef}
      />
      {/* BUG: Other Participants video not showing*/}
      {/* Render videos for each remote stream */}
      {[0, 1, 2, 3].map((index) => (
        <video
          key={index}
          className="w-80 h-80"
          autoPlay
          playsInline
          ref={(videoElement) => {
            remoteVideoRefs.current[index] = videoElement;
          }}
        />
      ))}
    </>
  );
};

export default VideoGrid;
