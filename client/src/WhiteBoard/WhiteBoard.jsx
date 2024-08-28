import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Tldraw } from "tldraw";
import "./WhiteBoard.css";
import Error404Room from "../pages/Error404Room.jsx";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const WhiteBoard = () => {
  const [roomExists, setRoomExists] = useState(false);
  const { roomId } = useParams();

  useEffect(() => {
    const validateRoomID = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/topic?room=${roomId}`);
        if (response.status === 200) {
          setRoomExists(true);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setRoomExists(false);
        }
      }
    };
    validateRoomID();
  }, [roomId]);
  return (
    <>
      {roomExists ? (
        <div style={{ position: "fixed", inset: 0 }} className="whiteboard">
          <Tldraw />
        </div>
      ) : (
        <Error404Room />
      )}
    </>
  );
};

export default WhiteBoard;
