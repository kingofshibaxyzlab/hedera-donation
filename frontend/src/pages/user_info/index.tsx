import NavigationBar from "@/components/NavBar";
import React, { useState } from "react";
import DonationHistoryTab from "./components/DonationHistoryTab";
import UserInfoTab from "./components/UserInfoTab";
import MyCampaignTab from "./components/MyCampaignTab";

const UserInfoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("userInfo");

  return (
    <div className="bg-gradient-to-b from-blue-50 to-gray-50 min-h-screen">
      <NavigationBar />
      <div className="container max-w-6xl mx-auto py-16 px-1 md:px-20">
        <div className="flex justify-center mb-8">
          <button
            className={`px-6 py-3 rounded-t-lg font-semibold focus:outline-none mx-1 ${
              activeTab === "userInfo"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("userInfo")}
          >
            User Info
          </button>

          <button
            className={`px-6 py-3 rounded-t-lg font-semibold focus:outline-none mx-1 ${
              activeTab === "campaigns"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("campaigns")}
          >
            My Campaigns
          </button>

          <button
            className={`px-6 py-3 rounded-t-lg font-semibold focus:outline-none mx-1 ${
              activeTab === "donationHistory"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("donationHistory")}
          >
            Donation History
          </button>
        </div>

        {activeTab === "userInfo" && <UserInfoTab />}
        {activeTab === "donationHistory" && <DonationHistoryTab />}
        {activeTab === "campaigns" && <MyCampaignTab />}
      </div>
    </div>
  );
};

export default UserInfoPage;
