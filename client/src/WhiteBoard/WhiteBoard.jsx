import { Tldraw } from "tldraw";

const WhiteBoard = () => {
  return (
    <div style={{ position: "fixed", inset: 0 }} className="whiteboard">
      <Tldraw />
    </div>
  );
};

export default WhiteBoard;
