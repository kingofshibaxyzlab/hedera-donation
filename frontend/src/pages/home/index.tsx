import { UrlMapping } from "@/commons/url-mapping.common";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavBar";
import { useTopCampaigns, useTopDonors } from "@/services/apis/core";
import { useAuthStore } from "@/services/stores/useAuthStore";
import { getStatusBadgeClass } from "@/utils/colors";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  // Fetch campaigns
  const { data: campaigns, isLoading: isCampaignsLoading } = useTopCampaigns();

  // Fetch top donors
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
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Support Campaigns with Tokens
            </h2>
            <p className="mt-4 text-base sm:text-lg md:text-xl">
              Explore top campaigns and make an impact with your donations.
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

      {/* Top Campaigns */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto">
          <h3 className="text-4xl font-bold text-blue-800 mb-12 text-center">
            Top Campaigns
          </h3>
          {isCampaignsLoading ? (
            <p className="text-center text-gray-500">Loading campaigns...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {(!campaigns || campaigns.length < 1) && (
                <div className="col-span-full text-center text-gray-600">
                  No campaigns available. Please check back later!
                </div>
              )}

              {campaigns?.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition duration-300 flex flex-col"
                >
                  <img
                    src={campaign.image || "https://via.placeholder.com/150"}
                    alt={campaign.title}
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-center grow">
                      <h4 className="text-2xl font-bold text-blue-700">
                        {campaign.title}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                          campaign.status || ""
                        )}`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                    <div className="mt-6">
                      <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-red-600 h-full"
                          style={{ width: `${campaign.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 transition-all duration-500 ease-in-out">
                        {campaign.progress}% funded
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-5">
                      <button
                        onClick={() =>
                          navigate(
                            `${UrlMapping.campaign_detail}/${campaign.id}`
                          )
                        }
                        className="bg-blue-600 text-white py-2 px-6 rounded-md font-medium hover:bg-blue-700 transition duration-300"
                      >
                        View Campaign
                      </button>
                      <nav className="text-green-500">
                        Created:{" "}
                        {campaign.date
                          ? `${formatDistanceToNow(new Date(campaign.date), {
                              addSuffix: true,
                            })}`
                          : "Unknown time ago"}
                      </nav>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-full text-center mt-5">
          <Link
            to={UrlMapping.all_campaign}
            className="text-2xl text-blue-500 hover:underline hover:text-blue-700 transition-colors duration-300"
          >
            View All Campaigns
          </Link>
        </div>
      </section>

      {/* Top Donors */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto">
          <h3 className="text-4xl font-bold text-blue-800 mb-12 text-center">
            Top Donors
          </h3>
          {isDonorsLoading ? (
            <p className="text-center text-gray-500">Loading donors...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {(!topDonors || topDonors.length < 1) && (
                <div className="col-span-full text-center text-gray-600">
                  No donors yet. Be the first to donate!
                </div>
              )}

              {topDonors?.map((donor) => (
                <div
                  key={donor.id}
                  className="bg-white shadow-lg rounded-lg p-8 flex items-center space-x-6 hover:shadow-xl transition duration-300"
                >
                  <div className="min-w-16 min-h-16 rounded-full bg-yellow-400 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                    {donor.initials}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-blue-700">
                      {donor.name} | {donor.username}
                    </h4>
                    <p className="text-gray-600">
                      Total Donations: {donor.totalDonations}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
