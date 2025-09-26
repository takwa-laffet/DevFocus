import React from "react";
import  LightRays  from "./LightRays";

const Background: React.FC = () => {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1 }}>
      <LightRays
        count={30}             // Number of rays
        intensity={0.5}        // Light intensity
        speed={0.2}            // Animation speed
        colors={["#ff6ec7", "#6ec1ff", "#ffffff"]} // Gradient colors
      />
    </div>
  );
};

export default Background;
