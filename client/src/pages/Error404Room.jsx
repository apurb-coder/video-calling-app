import React from 'react'
import Top from '../components/Top';

const Error404Room = () => {
  return (
    <>
      <Top roomExits={false} topicExits={false} />
      <div className="h-screen w-full flex justify-center items-center font-bold">
        Such Room Doesn't Exists
      </div>
    </>
  );
}

export default Error404Room;