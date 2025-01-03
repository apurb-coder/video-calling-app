import React, { useState, useRef } from "react";
import { useAppContext } from "../context/AppContext.jsx";
import { endCall } from "./VideoGrid.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import { FaDownload } from "react-icons/fa6";
import microPhoneIcon from "../assets/microphone-2.svg";
import videoIcon from "../assets/video.svg";
import screenShareIcon from "../assets/send-square.svg";
import recordMeetIcon from "../assets/Group 33.svg";

const Controls = () => {
  const { socket, setIsScreenShareOn } = useSocket();

  // For Screen Recording
  const [doneRecording, setDoneRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const { peerRef, setIsInCall, setCallerID, callerID, remoteVideo } =
    useAppContext();
  // Start Screen Recording
  const startRecording = async () => {
    // clean any previously recorded chunks
    setRecordedChunks([]);
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };
    mediaRecorderRef.current.onstop = () => {
      setDoneRecording(true);
    };
    mediaRecorderRef.current.start();
  };
  // Stop Screen Recording
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

    // create a download-able link to download
    const a = document.createElement("a");
    a.href = url;
    a.download = "meeting-recording.webm";
    a.click();
  };
  const handleRecording = () => {
    if (doneRecording) {
      stopRecording();
      setDoneRecording(false);
    } else {
      startRecording();
    }
  };
  const handleEndCall = () => {
    location.reload();
    endCall(peerRef, setIsInCall, setCallerID, callerID, remoteVideo, socket);
  };
  return (
    <div className="flex flex-col h-[15%] items-center justify-center fixed bottom-0 left-0 right-[26.3125rem]">
      <div className="flex relative w-full items-center justify-center">
        <div className="flex space-x-5">
          {/* Toggle on/off microPhone */}
          {/* <div className="bg-[#0060FF] p-2 rounded-full cursor-pointer">
            <img
              src={microPhoneIcon}
              alt="microPhoneIcon"
              className="w-5 h-5"
            />
          </div> */}
          {/* Toggle on/off video */}
          {/* <div className="bg-[#0060FF] p-2 rounded-full cursor-pointer">
            <img src={videoIcon} alt="videoIcon" className="w-5 h-5" />
          </div> */}
          {/* Share Screen */}
          <div
            className="bg-[#DFEBFF] p-2 rounded-full cursor-pointer"
            onClick={(e) => setIsScreenShareOn((prev) => !prev)}
          >
            <img src={screenShareIcon} alt="videoIcon" className="w-5 h-5" />
          </div>
          {/* Record Meet */}
          <div
            className="bg-[#f1f1f1] p-2 rounded-full cursor-pointer"
            onClick={handleRecording}
            ref={mediaRecorderRef}
          >
            {doneRecording ? (
              <FaDownload className="w-5 h-5 text-[#EB5757]" />
            ) : (
              <img src={recordMeetIcon} alt="videoIcon" className="w-5 h-5" />
            )}
          </div>
        </div>
        {/* End Call */}
        <div
          className=" absolute right-7 cursor-pointer"
          onClick={handleEndCall}
        >
          <div className="bg-red-500 text-white py-2 px-5 rounded-full">
            End Call
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
