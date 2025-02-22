import DataLoader from "@/components/DataLoader";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavBar";
import CampaignCard from "@/components/card/CampaignCard";
import { useHashConnectContext } from "@/contexts/hashconnect";
import env from "@/env";
import { useHederaDonate } from "@/hooks/useHederaDonate";
import { useHederaTokenApproval } from "@/hooks/useHederaTokenApproval";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { CampaignStatus, useCampaignDetails } from "@/services/apis/core";
import { getStatusBadgeClass } from "@/utils/colors";
import { shortenTransactionHash } from "@/utils/transaction_string";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DonationHistory from "./components/DonationHistory";

const CampaignDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [donationAmount, setDonationAmount] = useState<number>(0);
  const { walletAddress } = useHashConnectContext();

  const { donate, error, loading, success, transactionHash } =
    useHederaDonate();
  const {
    checkAndApproveToken,
    error: errorCheckAndApproveToken,
    loading: loadingCheckAndApproveToken,
  } = useHederaTokenApproval();
  const {
    data: campaignDetails,
    isLoading: isCampaignLoading,
    refetch: refreshCampaign,
  } = useCampaignDetails({ variables: { id: id! } });
  const { getTokenBalance, balance } = useTokenBalance();

  // Fetch token balance if campaign details and wallet address exist.
  useEffect(() => {
    if (
      campaignDetails?.campaign?.token?.address &&
      campaignDetails?.campaign?.token?.account_id &&
      walletAddress
    ) {
      getTokenBalance(walletAddress, campaignDetails.campaign.token.account_id);
    }
  }, [campaignDetails, walletAddress]);

  const handleDonate = async () => {
    if (campaignDetails?.campaign?.onchain_id && donationAmount > 0) {
      const donationAmountDecimal = ethers.parseUnits(
        donationAmount.toString(),
        campaignDetails.campaign.token?.decimal
      );
      const isApproved = await checkAndApproveToken(
        campaignDetails.campaign.token?.address || "",
        env.CONTRACT_ID,
        donationAmountDecimal.toString()
      );
      if (isApproved) {
        console.log("Token allowance approved successfully.");
      } else {
        console.log("Token allowance approval failed.");
      }
      donate(
        env.CONTRACT_ID,
        Number(campaignDetails.campaign.onchain_id),
        donationAmountDecimal.toString()
      );
      // Refresh campaign and donation history after 10 seconds.
      setTimeout(() => {
        refreshCampaign();
      }, 10000);
    } else {
      console.error("Invalid donation amount or onchain ID.");
    }
  };

  const renderRelatedCampaigns = () => {
    if (!campaignDetails?.related_campaigns) return null;
    return campaignDetails.related_campaigns.map((related) => (
      <CampaignCard
        key={related.id}
        campaign={related}
        showSummary={false}
        summaryLimit={250}
      />
    ));
  };

  if (!campaignDetails && !isCampaignLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen flex flex-col">
        <NavigationBar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-2xl text-gray-600">Campaign not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const { campaign } = campaignDetails || {};

  return (
    <div className="bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen flex flex-col">
      <NavigationBar />
      <DataLoader
        isLoading={isCampaignLoading}
        loadingMessage="Loading campaign..."
        minHeight={800}
      >
        <main className="container mx-auto py-16 px-6 md:px-20 flex-1">
          {/* Campaign Title Section */}
          <section className="text-center mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex-1 mb-4 md:mb-0">
                <h1 className="text-xl font-bold text-blue-800 mb-2">
                  {campaign?.title}
                </h1>
                <nav className="text-lg text-gray-700">
                  Organized by: {campaign?.organizer?.username || "Unknown"}
                </nav>
              </div>
              <span
                className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                  campaign?.status || ""
                )}`}
              >
                {campaign?.status || "Unknown"}
              </span>
            </div>
          </section>

          {/* Campaign Image */}
          <div className="relative mb-12">
            <img
              src={campaign?.image || "https://placehold.co/150x150"}
              alt="Campaign"
              className="w-full max-h-[80vh] rounded-2xl object-cover shadow-xl border p-4 bg-white"
            />
          </div>

          {/* Campaign Details */}
          <section className="bg-white rounded-2xl p-10 shadow-xl mb-16">
            <h3 className="text-xl font-bold text-blue-800 mb-2">Summary</h3>
            <p className="text-xl text-gray-800 leading-relaxed mb-8">
              {campaign?.summary}
            </p>

            <h3 className="text-xl font-bold text-blue-800 mb-2">
              Description
            </h3>
            <div
              className="prose max-w-none mt-3 text-xl text-gray-800 leading-relaxed mb-8"
              dangerouslySetInnerHTML={{ __html: campaign?.description || "" }}
            />

            <div className="mb-6">
              <h4 className="text-xl font-bold text-blue-800 mb-2">
                Created Transaction
              </h4>
              <p className="text-sm text-gray-700 mt-2">
                {campaign?.transaction_hash_create ? (
                  <a
                    href={`${env.EXPLORER_SCAN}/transaction/${campaign.transaction_hash_create}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 text-sm hover:underline"
                  >
                    {shortenTransactionHash(campaign.transaction_hash_create)}
                  </a>
                ) : (
                  <span className="text-red-600 text-sm">Not available.</span>
                )}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-xl font-bold text-blue-800 mb-2">
                Withdrawn Transaction
              </h4>
              <p className="text-sm text-gray-700 mt-2">
                {campaign?.transaction_hash_withdrawn ? (
                  <a
                    href={`${env.EXPLORER_SCAN}/transaction/${campaign.transaction_hash_withdrawn}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 text-sm hover:underline"
                  >
                    {shortenTransactionHash(
                      campaign.transaction_hash_withdrawn
                    )}
                  </a>
                ) : (
                  <span className="text-red-600 text-sm">Not available.</span>
                )}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-xl font-bold text-blue-800 mb-2">
                Campaign Type
              </h4>
              <p className="text-sm text-gray-700 mt-2">
                {campaign?.campaign_type?.name}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-xl font-bold text-blue-800 mb-2">
                Donation Goal
              </h4>
              <p className="text-sm text-gray-700 mt-2">
                Goal:{" "}
                <strong>
                  {campaign?.current_amount && campaign?.token?.decimal
                    ? ethers.formatUnits(
                        campaign.current_amount.toString(),
                        Number(campaign.token.decimal)
                      )
                    : campaign?.current_amount}{" "}
                  /{" "}
                  {campaign?.goal && campaign?.token?.decimal
                    ? ethers.formatUnits(
                        campaign.goal.toString(),
                        Number(campaign.token.decimal)
                      )
                    : campaign?.goal}{" "}
                  {campaign?.token?.symbol}
                </strong>
              </p>
            </div>

            <div className="mb-8">
              <h4 className="text-xl font-bold text-blue-800 mb-2 mb-3">
                Donation Progress
              </h4>
              <div className="flex items-center justify-center">
                <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden mr-4">
                  <div
                    className="bg-red-500 h-full transition-all duration-500"
                    style={{ width: `${campaign?.progress || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm text-yellow-500 min-w-fit text-center">
                  {campaign?.progress}% funded
                </span>
              </div>
            </div>

            {campaign?.video_link && (
              <div className="mb-6">
                <h4 className="text-xl font-bold text-blue-800 mb-2">Video</h4>
                <p className="text-md text-blue-600 mt-2 underline">
                  <a
                    href={campaign.video_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch the Campaign Video
                  </a>
                </p>
              </div>
            )}

            {campaign?.project_url && (
              <div className="mb-6">
                <h4 className="text-xl font-bold text-blue-800 mb-2">
                  Project URL
                </h4>
                <p className="text-md text-blue-600 mt-2 underline">
                  <a
                    href={campaign.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit the Project Website
                  </a>
                </p>
              </div>
            )}

            <div className="mb-6">
              <h4 className="text-xl font-bold text-blue-800 mb-2">
                Your Balance
              </h4>
              <p className="text-sm text-gray-700 mt-2">
                <strong>
                  {campaign?.token?.decimal && balance
                    ? ethers.formatUnits(
                        String(balance),
                        Number(campaign.token.decimal)
                      )
                    : balance}
                </strong>{" "}
                <span className="text-gray-500 mx-2">|</span>
                {campaign?.token?.name}{" "}
                <span className="text-gray-500 mx-2">|</span>
                {campaign?.token?.account_id}
              </p>
            </div>

            {/* Donate Now Section */}
            <div className="mb-2">
              <h4 className="text-xl font-bold text-blue-800 mb-2">
                Donate Now
              </h4>
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4">
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Number(e.target.value))}
                  className="w-60 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter amount"
                />
                <button
                  onClick={handleDonate}
                  disabled={
                    loading ||
                    donationAmount <= 0 ||
                    campaign?.status === CampaignStatus.CLOSED
                  }
                  className={`py-3 px-8 rounded-full font-semibold text-lg shadow-md transition-colors duration-300 ${
                    loading ||
                    donationAmount <= 0 ||
                    campaign?.status === CampaignStatus.CLOSED
                      ? "bg-yellow-400 cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {loading ? "Processing..." : "Donate"}
                </button>
              </div>
              {donationAmount <= 0 && (
                <p className="text-red-500 mt-2">
                  Please set a valid donation amount.
                </p>
              )}
              {(error || errorCheckAndApproveToken) && (
                <p className="text-red-500 mt-2">
                  {error || errorCheckAndApproveToken}
                </p>
              )}
              {loadingCheckAndApproveToken && (
                <p className="text-yellow-500 mt-2">
                  Checking token approval...
                </p>
              )}
              {success && (
                <p className="mt-2 text-lg">
                  View on explorer:{" "}
                  <a
                    href={`${env.EXPLORER_SCAN}/transaction/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 text-sm hover:underline"
                  >
                    {transactionHash}
                  </a>
                </p>
              )}
            </div>
          </section>

          {/* Donation History Section */}
          <section className="bg-white rounded-2xl p-8 shadow-xl mb-16">
            <h3 className="text-xl font-bold text-blue-800 mb-2">
              Donation History
            </h3>
            {campaign?.token ? (
              <DonationHistory
                campaignId={Number(id)}
                tokenSymbol={campaign.token.symbol}
              />
            ) : (
              <p className="text-center text-gray-600">
                Donation history not available.
              </p>
            )}
          </section>

          {/* Related Campaigns Section */}
          <section className="mt-16">
            <h3 className="text-3xl font-bold text-blue-800 mb-12 text-center">
              Related Campaigns
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {renderRelatedCampaigns()}
            </div>
          </section>
        </main>
      </DataLoader>
      <Footer />
    </div>
  );
};

export default CampaignDetailsPage;
