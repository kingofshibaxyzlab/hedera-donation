import { UrlMapping } from "@/commons/url-mapping.common";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavBar";
import { useCampaigns } from "@/services/apis/core";
import { getStatusBadgeClass } from "@/utils/colors";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { useNavigate } from "react-router-dom";

const AllCampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: campaigns, isLoading, error } = useCampaigns();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 min-h-screen">
      <NavigationBar />

      <main className="container mx-auto py-16 px-6 md:px-20 min-h-[80vh]">
        <h2 className="text-5xl font-bold text-blue-900 mb-12 text-center">
          All Campaigns
        </h2>

        {isLoading && (
          <p className="text-center text-gray-600 text-xl">
            Loading campaigns...
          </p>
        )}

        {error && (
          <p className="text-center text-red-600 text-xl">
            Failed to load campaigns.
          </p>
        )}

        {!isLoading && campaigns && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col min-h-[500px]"
              >
                <img
                  src={campaign.image || "https://via.placeholder.com/150"}
                  alt={campaign.title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-2xl font-bold text-blue-800">
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
                  <p className="text-sm text-gray-700 mb-6 flex-grow">
                    {campaign.description.length > 250
                      ? `${campaign.description.slice(0, 250)}...`
                      : campaign.description}
                  </p>
                  <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden mb-4">
                    <div
                      className="bg-red-500 h-full transition-all duration-700 ease-in-out"
                      style={{
                        width: `${campaign.progress || 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {campaign.progress || 0}% funded
                  </p>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center">
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
                      <span className="text-green-500 text-sm">
                        Created:{" "}
                        {campaign.created_at
                          ? `${formatDistanceToNow(
                              new Date(campaign.created_at),
                              {
                                addSuffix: true,
                              }
                            )}`
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AllCampaignsPage;
