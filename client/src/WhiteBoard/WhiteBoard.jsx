import { Tldraw } from "tldraw";
import "./WhiteBoard.css"

const WhiteBoard = () => {
  return (
    <div style={{ position: "fixed", inset: 0 }} className="whiteboard">
      <Tldraw />
    </div>
  );
};

export default WhiteBoard;
