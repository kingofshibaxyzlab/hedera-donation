import DonationLogo from "@/assets/logos/donation_logo.jpg";
import { UrlMapping } from "@/commons/url-mapping.common";
import { useHashConnectContext } from "@/contexts/hashconnect";
import { useAuthStore } from "@/services/stores/useAuthStore";
import { useEffect, useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";

const NavigationBar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getWalletAddress, isAuthenticated, logout, user } = useAuthStore();
  const { disconnectWallet } = useHashConnectContext();

  const userImage = user?.image || "https://placehold.co/50x50";
  const walletAddress = getWalletAddress();

  const handleUserIconClick = () => navigate(UrlMapping.user_info);
  const handleLoginClick = () => navigate(UrlMapping.login);
  const handleDisconnect = () => {
    disconnectWallet();
    logout();
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <header
      className={`bg-gradient-to-r from-indigo-600 to-blue-500 shadow-md fixed w-full top-0 z-50 overflow-hidden${
        isScrolled ? "scrolled" : ""
      }`}
      style={{ position: "sticky", top: 0 }}
    >
      <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center py-4 px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={DonationLogo}
            alt="Logo"
            className="w-12 h-12 rounded-full shadow-md"
          />
          <h1 className="text-2xl font-bold text-white tracking-wide">
            ShibaAngels
          </h1>
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden ml-auto" onClick={toggleMenu}>
            {isMenuOpen ? (
              <AiOutlineClose className="text-white w-8 h-8 cursor-pointer transition-transform duration-300 transform hover:scale-110" />
            ) : (
              <AiOutlineMenu className="text-white w-8 h-8 cursor-pointer transition-transform duration-300 transform hover:scale-110" />
            )}
          </div>
        </Link>

        {/* Navigation Links */}
        <nav
          className={`${
            isMenuOpen ? "flex flex-col" : "hidden lg:flex"
          } lg:flex-row lg:space-x-6 items-center w-full lg:w-auto`}
        >
          {[
            { label: "Home", path: UrlMapping.home },
            { label: "Info", path: UrlMapping.info },
            { label: "All Campaigns", path: UrlMapping.all_campaign },
            { label: "How to Use", path: UrlMapping.how_to_use },
            { label: "Faucet", path: UrlMapping.faucet },
          ].map(({ label, path }) => (
            <Link
              key={label}
              to={path || "#"}
              className="text-white font-medium hover:underline transition duration-300 mt-2 lg:mt-0"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Authenticated User or Connect Wallet */}
        <div
          className={`${
            isMenuOpen
              ? "flex flex-col mt-4 space-y-4 lg:mt-0"
              : "hidden lg:flex lg:space-x-6"
          } items-center`}
        >
          {isAuthenticated ? (
            <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4 w-full">
              {/* Create Campaign Button */}
              <Link
                to={UrlMapping.create_campaign || "#"}
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-5 rounded-full font-medium shadow-lg transition duration-300 w-full lg:w-auto text-center"
              >
                Create Campaign
              </Link>

              {/* User Profile Section */}
              <div
                className="flex items-center justify-center space-x-2 w-full lg:w-auto cursor-pointer"
                onClick={handleUserIconClick}
              >
                <img
                  src={userImage}
                  alt="User Icon"
                  className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                />
                <span className="text-white font-medium hidden sm:inline-block">
                  {walletAddress}
                </span>
              </div>

              {/* Disconnect Button */}
              <button
                onClick={handleDisconnect}
                className="bg-red-600 text-white py-2 px-5 rounded-full font-medium shadow-md hover:bg-red-700 transition duration-300 w-full lg:w-auto"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleLoginClick}
              className="bg-yellow-400 text-blue-800 py-2 px-5 rounded-full font-medium shadow-md hover:bg-yellow-500 transition duration-300 w-full lg:w-auto text-center"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavigationBar;
