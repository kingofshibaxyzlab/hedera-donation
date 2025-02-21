import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-900 text-white py-10">
      <div className="container mx-auto text-center">
        <p className="text-lg font-bold text-yellow-300">
          © 2025 ShibaAngels . All rights reserved.
        </p>
        <p className="text-sm mt-2 text-yellow-100">
          Join us in making a difference through decentralized donations.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
