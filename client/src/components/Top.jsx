import React, { useEffect, useState } from "react";
import Logo from "../assets/Mask group.svg";
import LinkLogo from "../assets/link.svg";
import profile_img from "../assets/profile_img.png";

const Top = () => {
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const date = new Date();
      const options = { year: "numeric", month: "long" };
      const formattedDate = `${date.toLocaleDateString(
        "en-US",
        options
      )} ${getOrdinal(date.getDate())}`;
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      setCurrentDateTime(`${formattedDate} | ${formattedTime}`);
    };

    const timer = setInterval(updateDateTime, 2000); // Update every 1 minute

    updateDateTime(); // Initial update

    return () => {
      clearInterval(timer); // Clean up when component unmounts
    };
  }, []);

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="flex justify-around">
      <div className="p-4">
        <img src={Logo} alt="logo" className="w-8" />
      </div>
      <div className="p-4">
        <h2 className=" text-xl font-semibold">Meet-Name</h2>
        <p className="text-sm text-gray-400 font-semibold">{currentDateTime}</p>
      </div>
      <div className="p-4 bg-[#DFEBFF] text-[#0060FF] m-4 px-8 rounded-full text-sm flex space-x-1">
        <img src={LinkLogo} alt="Link logo" className="w-6 font-bold" />
        <p>| Room-Id</p>
      </div>
    </div>
  );
};

export default Top;