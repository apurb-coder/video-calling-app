import React from "react";

const NotFound = () => {
  return (
    <>
      <div className="h-screen w-full flex flex-col justify-center items-center">
        <div className=" font-extrabold text-[#0060FF] text-2xl">404</div>
        <div className="font-semibold text-gray-400">
          Page Doesn't Exists
        </div>
      </div>
    </>
  );
};

export default NotFound;
