import React from 'react'
import Top from '../components/Top';

const Error404Room = () => {
  return (
    <>
      <Top roomExits={false} topicExits={false} />
      <div className="h-screen w-full flex flex-col justify-center items-center">
        <div className=" font-extrabold text-[#0060FF] text-2xl">404</div>
        <div className="font-semibold text-gray-400">
          Such Room Doesn't Exists
        </div>
      </div>
    </>
  );
}

export default Error404Room;