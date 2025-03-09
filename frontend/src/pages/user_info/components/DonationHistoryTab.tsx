import { UrlMapping } from "@/commons/url-mapping.common";
import DataLoader from "@/components/DataLoader";
import env from "@/env";
import { useDonationHistory } from "@/services/apis/core";
import { shortenTransactionHash } from "@/utils/transaction_string";
import { formatDistanceToNow } from "date-fns";
import { ethers } from "ethers";
import React from "react";
import { useNavigate } from "react-router-dom";

const DonationHistoryTab: React.FC = () => {
  const { data: donationHistory, isLoading: isHistoryLoading } =
    useDonationHistory();
  const navigate = useNavigate();

  const handleViewCampaign = (id: number) => {
    navigate(`${UrlMapping.campaign_detail}/${id}`);
  };

  return (
    <div className="bg-white mx-auto py-16 px-6 md:px-20 rounded-3xl shadow-lg">
      <h2 className="text-2xl font-extrabold text-blue-800 mb-6 text-center">
        Donation History
      </h2>
      <DataLoader
        isLoading={isHistoryLoading}
        loadingMessage="Loading donation history..."
      >
        {donationHistory && donationHistory.length > 0 ? (
          <div className="space-y-4">
            {donationHistory.map((donation: any, index: number) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center border rounded-lg shadow-lg p-4 bg-white transition transform hover:shadow-xl"
              >
                <img
                  src={
                    donation?.campaign_image || "https://placehold.co/300x300"
                  }
                  alt={donation.campaign_title}
                  className="w-full md:w-24 md:h-24 object-cover rounded-lg"
                />
                <div className="mt-4 sm:mt-0 sm:ml-6 w-full">
                  <p
                    className="text-xl font-bold text-blue-800 cursor-pointer"
                    onClick={() => handleViewCampaign(donation.campaign_id)}
                  >
                    {donation.campaign_title}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Amount:{" "}
                    {donation &&
                      ethers.formatUnits(
                        donation.amount.toString(),
                        Number(donation?.token?.decimal)
                      )}{" "}
                    {donation.token?.symbol || ""}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Donated:{" "}
                    {donation.date
                      ? formatDistanceToNow(new Date(donation.date), {
                          addSuffix: true,
                        })
                      : "Unknown time ago"}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Transaction Hash:{" "}
                    {donation.transaction_hash ? (
                      <a
                        className="text-green-600 hover:underline"
                        href={`${env.EXPLORER_SCAN}/transaction/${donation.transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {shortenTransactionHash(donation.transaction_hash)}
                      </a>
                    ) : (
                      "Unknown"
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">No history found.</div>
        )}
      </DataLoader>
    </div>
  );
};

export default DonationHistoryTab;
