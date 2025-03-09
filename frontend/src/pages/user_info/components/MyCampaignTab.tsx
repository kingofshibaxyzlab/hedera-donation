import env from "@/env";
import { useWithdrawFunds } from "@/hooks/useWithdrawFunds";
import { CampaignStatus, useUserCampaigns } from "@/services/apis/core";
import { getStatusBadgeClass } from "@/utils/colors";
import { shortenTransactionHash } from "@/utils/transaction_string";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UrlMapping } from "@/commons/url-mapping.common";
import DataLoader from "@/components/DataLoader";
import { ethers } from "ethers";

const MyCampaignTab: React.FC = () => {
  const {
    data: userCampaigns,
    isLoading: isCampaignsLoading,
    error: errorCampaignsLoading,
  } = useUserCampaigns();

  const navigate = useNavigate();
  const [currentCampaignId, setCurrentCampaignId] = useState<number>(0);
  const { withdrawFunds, error, loading, success, transactionHash } =
    useWithdrawFunds();

  const handleWithdrawFunds = (
    e: React.MouseEvent<HTMLButtonElement>,
    campaignId: number
  ) => {
    // Prevent triggering the parent onClick event (navigate)
    e.stopPropagation();
    setCurrentCampaignId(campaignId);
    withdrawFunds(env.CONTRACT_ID, campaignId);
  };

  const handleNavigate = (campaignId: number) => {
    navigate(`${UrlMapping.campaign_detail}/${campaignId}`);
  };

  return (
    <div className="bg-white mx-auto py-16 px-6 md:px-20 rounded-3xl shadow-lg">
      <h2 className="text-2xl font-extrabold text-blue-800 mb-6 text-center">
        My Campaigns
      </h2>
      <DataLoader
        isLoading={isCampaignsLoading}
        loadingMessage="Loading campaigns..."
      >
        {errorCampaignsLoading ? (
          <div className="text-center py-8 text-red-500">
            Error loading campaigns.
          </div>
        ) : null}
        {userCampaigns && userCampaigns.length > 0 ? (
          <div className="space-y-4">
            {userCampaigns.map((campaign) => (
              <div
                key={Number(campaign.id)}
                onClick={() => handleNavigate(Number(campaign.id))}
                className="p-4 border rounded-lg shadow-lg bg-gray-50 cursor-pointer transition transform hover:shadow-xl"
              >
                <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
                  <img
                    src={campaign.image || "https://placehold.co/150x150"}
                    alt={campaign.title}
                    className="w-full md:w-24 md:h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1 w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-blue-700">
                        {campaign.title}
                      </h3>
                      <span
                        className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                          campaign.status || ""
                        )}`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-gray-600 font-semibold mt-2">
                      Goal:{" "}
                      {campaign?.current_amount &&
                        ethers.formatUnits(
                          campaign.current_amount.toString(),
                          Number(campaign?.token?.decimal)
                        )}{" "}
                      /{" "}
                      {campaign?.goal &&
                        ethers.formatUnits(
                          campaign.goal.toString(),
                          Number(campaign?.token?.decimal)
                        )}{" "}
                      {campaign.token?.symbol || "Unknown"}
                    </p>
                    <div className="w-full bg-gray-200 h-3 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-red-600 h-3 rounded-full"
                        style={{ width: `${campaign.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {campaign.progress}% funded
                    </p>
                    <div className="flex flex-col sm:flex-row sm:justify-between mt-3">
                      <nav className="text-yellow-600 text-sm">
                        Created at:{" "}
                        {campaign.created_at
                          ? `${formatDistanceToNow(
                              new Date(campaign.created_at),
                              {
                                addSuffix: true,
                              }
                            )}`
                          : "Unknown time ago"}
                      </nav>
                      <nav className="text-yellow-600 text-sm mt-2 sm:mt-0">
                        Updated at:{" "}
                        {campaign.updated_at
                          ? `${formatDistanceToNow(
                              new Date(campaign.updated_at),
                              {
                                addSuffix: true,
                              }
                            )}`
                          : "Unknown time ago"}
                      </nav>
                    </div>
                  </div>
                  <button
                    onClick={(e) =>
                      handleWithdrawFunds(e, Number(campaign.onchain_id))
                    }
                    className={`mt-4 sm:mt-0 py-2 px-4 rounded-full text-white transition-all duration-300 ${
                      loading || campaign.status === CampaignStatus.CLOSED
                        ? "bg-yellow-400 cursor-not-allowed"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                    disabled={
                      loading || campaign.status === CampaignStatus.CLOSED
                    }
                  >
                    {loading &&
                    Number(campaign.onchain_id) === currentCampaignId
                      ? "Processing..."
                      : "Withdraw Funds"}
                  </button>
                </div>
                {success &&
                  transactionHash &&
                  Number(campaign.onchain_id) === currentCampaignId && (
                    <nav className="mt-4">
                      <a
                        className="text-green-600 hover:underline"
                        href={`${env.EXPLORER_SCAN}/transaction/${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Withdrawal successful! Transaction Hash:{" "}
                        {shortenTransactionHash(transactionHash)}
                      </a>
                    </nav>
                  )}
                {error && (
                  <p className="text-red-500 mt-2 text-sm">Error: {error}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">No campaigns found.</div>
        )}
      </DataLoader>
    </div>
  );
};

export default MyCampaignTab;
