import React from "react";
import { Camera, Home } from "lucide-react";

const page = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <p>olá</p>
      <Camera size={48} fill="red" />
      <Home size={28} fill="gray" className="border-spacing-40"/>
    </div>
  );
};

export default page;
