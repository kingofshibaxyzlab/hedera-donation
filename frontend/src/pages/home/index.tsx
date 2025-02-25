import { UrlMapping } from "@/commons/url-mapping.common";
import CampaignCard from "@/components/card/CampaignCard";
import DataLoader from "@/components/DataLoader";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavBar";
import {
  ICampaignCard,
  useTopCampaigns,
  useTopDonors,
} from "@/services/apis/core";
import { useAuthStore } from "@/services/stores/useAuthStore";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Fetch campaigns and donors
  const { data: campaigns, isLoading: isCampaignsLoading } = useTopCampaigns();
  const { data: topDonors, isLoading: isDonorsLoading } = useTopDonors();

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationBar />

      {/* Hero Section */}
      <section
        className="relative text-white py-20 sm:py-40 md:py-60"
        style={{
          backgroundImage: 'url("/banner.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto text-center relative z-10 px-4">
          <div className="bg-green-600 bg-opacity-60 rounded-xl inline-block px-6 sm:px-10 py-6 sm:py-8 shadow-lg mt-10 md:mt-20">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight">
              Power Change with Crypto Giving
            </h2>
            <p className="mt-4 text-sm sm:text-lg md:text-xl">
              Donate securely, support causes, and make a lasting impact with
              blockchain.
            </p>
            {!isAuthenticated && (
              <button
                className="mt-8 bg-yellow-400 text-blue-800 py-3 px-6 sm:px-8 rounded-full font-semibold shadow-lg hover:bg-yellow-500 hover:shadow-xl transition-all duration-300"
                onClick={() => navigate(UrlMapping.login)}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
        {/* Optional overlay */}
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </section>

      <main className="container mx-auto py-16 px-6 md:px-20 flex-1">
        {/* Top Campaigns Section */}
        <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto">
            <h3 className="text-3xl font-bold text-blue-800 mb-12 text-center">
              Top Campaigns
            </h3>
            <DataLoader
              isLoading={isCampaignsLoading}
              loadingMessage="Loading campaigns..."
            >
              {campaigns && campaigns.length > 0 ? (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {campaigns.map((campaign: ICampaignCard) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </section>
              ) : (
                !isCampaignsLoading && (
                  <p className="text-center text-gray-600 text-base mt-3">
                    No campaigns available. Please check back later!
                  </p>
                )
              )}
            </DataLoader>
          </div>
          <div className="w-full text-center mt-5">
            <Link
              to={UrlMapping.all_campaign}
              className="text-lg text-blue-500 hover:underline hover:text-blue-600 transition-colors duration-300 underline"
            >
              View All
            </Link>
          </div>
        </section>

        {/* Top Donors Section */}
        <section className="py-16 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto">
            <h3 className="text-3xl font-bold text-blue-800 mb-12 text-center">
              Top Donors
            </h3>
            <DataLoader
              isLoading={isDonorsLoading}
              loadingMessage="Loading donors..."
            >
              {topDonors && topDonors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
                  {topDonors.map((donor) => (
                    <div
                      key={donor.id}
                      className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-6 hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out min-w-fit"
                    >
                      <div className="w-16 h-16 flex-shrink-0 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-xl shadow">
                        {donor.initials}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-blue-800">
                          {donor.name} <span className="text-gray-500">|</span>{" "}
                          {donor.username}
                        </h4>
                        <p className="text-gray-600 mt-1">
                          Total Donations:{" "}
                          <span className="font-medium">
                            {donor.totalDonations}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !isDonorsLoading && (
                  <div className="text-center text-gray-600 text-base mt-3">
                    No donors yet. Be the first to donate!
                  </div>
                )
              )}
            </DataLoader>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
