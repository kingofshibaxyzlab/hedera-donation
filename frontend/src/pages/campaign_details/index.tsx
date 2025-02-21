import { UrlMapping } from "@/commons/url-mapping.common";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavBar";
import { useHashConnectContext } from "@/contexts/hashconnect";
import env from "@/env";
import { useHederaDonate } from "@/hooks/useHederaDonate";
import { useHederaTokenApproval } from "@/hooks/useHederaTokenApproval";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import {
  CampaignStatus,
  useCampaignDetails,
  useDonationHistoryByCampaign,
} from "@/services/apis/core";
import { getStatusBadgeClass } from "@/utils/colors";
import { shortenTransactionHash } from "@/utils/transaction_string";
import { formatDistanceToNow } from "date-fns";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const CampaignDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [donationAmount, setDonationAmount] = useState<number>(0);
  const { walletAddress } = useHashConnectContext();
  const navigate = useNavigate();

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

  const {
    data: donationHistory,
    isLoading: isHistoryLoading,
    refetch: refreshHistory,
  } = useDonationHistoryByCampaign({ variables: { campaignId: Number(id) } });

  const { getTokenBalance, balance } = useTokenBalance();

  useEffect(() => {
    if (
      campaignDetails?.campaign?.token?.address &&
      campaignDetails?.campaign?.token?.account_id
    ) {
      if (walletAddress) {
        getTokenBalance(
          walletAddress,
          campaignDetails.campaign.token.account_id
        );
      }
    }
  }, [campaignDetails, walletAddress, getTokenBalance]);

  const handleDonate = async () => {
    if (campaignDetails?.campaign?.onchain_id && donationAmount > 0) {
      const isApproved = await checkAndApproveToken(
        campaignDetails.campaign.token?.address || "",
        env.CONTRACT_ID,
        donationAmount
      );

      if (isApproved) {
        console.log("Token allowance approved successfully.");
      } else {
        console.log("Token allowance approval failed.");
      }

      donate(
        env.CONTRACT_ID,
        Number(campaignDetails.campaign.onchain_id),
        donationAmount
      );

      setTimeout(() => {
        refreshCampaign();
        refreshHistory();
      }, 10000);
    } else {
      console.error("Invalid donation amount or onchain ID.");
    }
  };

  const renderDonationHistory = () => {
    if (isHistoryLoading) {
      return (
        <p className="text-center text-gray-600">Loading donation history...</p>
      );
    }

    if (!donationHistory || donationHistory.length === 0) {
      return <p className="text-center text-gray-600">No donations yet.</p>;
    }

    return donationHistory.map((donation, index) => (
      <div
        key={index}
        className="p-4 border rounded-xl shadow-md flex items-center space-x-6 bg-white hover:bg-gray-50 transition-all duration-300 mt-4"
      >
        <img
          src={donation.user_image || "https://placehold.co/100x100"}
          alt={donation.campaign_title}
          className="w-20 h-20 object-cover rounded-full border"
        />
        <div className="flex-1">
          <p className="text-xl font-semibold text-blue-800">
            {donation.user_name} | {donation.user_username}
          </p>
          <p className="text-gray-700">
            Amount: {donation.amount} {campaignDetails?.campaign.token?.symbol}
          </p>
          <p className="text-gray-500 text-sm">
            Donated:{" "}
            {donation.date
              ? formatDistanceToNow(new Date(donation.date), {
                  addSuffix: true,
                })
              : "Unknown time ago"}
          </p>
          <p className="text-gray-500 text-sm">
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
    ));
  };

  const renderRelatedCampaigns = () => {
    if (!campaignDetails?.related_campaigns) return null;

    return campaignDetails.related_campaigns.map((related) => (
      <div
        key={related.id}
        className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
      >
        <img
          src={related.image}
          alt={related.title}
          className="w-full h-56 object-cover"
        />
        <div className="p-6">
          <h4 className="text-2xl font-bold text-blue-700 mb-2">
            {related.title}
          </h4>
          <p className="text-sm text-gray-600 mb-4">{related.description}</p>
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden mb-3">
            <div
              className="bg-blue-600 h-full"
              style={{ width: `${related.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {related.progress}% funded
          </p>
          <div className="text-center">
            <button
              onClick={() =>
                navigate(`${UrlMapping.campaign_detail}/${related.id}`)
              }
              className="bg-blue-600 text-white py-2 px-4 rounded-full font-medium hover:bg-blue-700 transition-colors duration-300"
            >
              View Campaign
            </button>
          </div>
        </div>
      </div>
    ));
  };

  if (isCampaignLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen flex flex-col">
        <NavigationBar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-2xl text-gray-600">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!campaignDetails) {
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

  const { campaign } = campaignDetails;

  return (
    <div className="bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen flex flex-col">
      <NavigationBar />
      <main className="container mx-auto py-16 px-6 md:px-20 flex-1">
        {/* Campaign Title Section */}
        <section className="text-center mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 mb-4 md:mb-0">
              <h2 className="text-5xl font-bold text-blue-900 mb-2">
                {campaign.title}
              </h2>
              <p className="text-lg text-gray-700">
                Organized by: {campaign?.organizer?.username || "Unknown"}
              </p>
            </div>
            <span
              className={`px-4 py-1 rounded-full text-lg font-medium ${getStatusBadgeClass(
                campaign.status || ""
              )}`}
            >
              {campaign.status || "Unknown"}
            </span>
          </div>
        </section>

        {/* Campaign Image */}
        <div className="relative mb-12">
          <img
            src={campaign?.image || "https://via.placeholder.com/150"}
            alt="Campaign"
            className="w-full max-h-[80vh] rounded-2xl object-cover shadow-xl border p-4 bg-white"
          />
        </div>

        {/* Campaign Details */}
        <section className="bg-white rounded-2xl p-10 shadow-xl mb-16">
          <h3 className="text-3xl font-bold text-blue-900 mb-6">
            Campaign Details
          </h3>
          <p className="text-xl text-gray-800 leading-relaxed mb-8">
            {campaign.description}
          </p>

          <div className="mb-6">
            <h4 className="text-2xl font-bold text-blue-700">
              Created Transaction
            </h4>
            <p className="text-lg text-gray-700 mt-2">
              {campaign.transaction_hash_create ? (
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
            <h4 className="text-2xl font-bold text-blue-700">
              Withdrawn Transaction
            </h4>
            <p className="text-lg text-gray-700 mt-2">
              {campaign.transaction_hash_withdrawn ? (
                <a
                  href={`${env.EXPLORER_SCAN}/transaction/${campaign.transaction_hash_withdrawn}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 text-sm hover:underline"
                >
                  {shortenTransactionHash(campaign.transaction_hash_withdrawn)}
                </a>
              ) : (
                <span className="text-red-600 text-sm">Not available.</span>
              )}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-2xl font-bold text-blue-700">Campaign Type</h4>
            <p className="text-lg text-gray-700 mt-2">
              {campaign?.campaign_type?.name}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-2xl font-bold text-blue-700">Donation Goal</h4>
            <p className="text-lg text-gray-700 mt-2">
              Goal:{" "}
              <strong>
                {campaign?.current_amount} / {campaign.goal}{" "}
                {campaign.token?.symbol}
              </strong>
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-2xl font-bold text-blue-700 mb-3">
              Donation Progress
            </h4>
            <div className="flex items-center justify-center">
              <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden mr-4">
                <div
                  className="bg-red-500 h-full transition-all duration-500"
                  style={{ width: `${campaign.progress}%` }}
                ></div>
              </div>
              <span className="text-lg text-yellow-500 font-semibold min-w-[4rem]">
                {campaign.progress}% funded
              </span>
            </div>
          </div>

          {campaign.video_link && (
            <div className="mb-6">
              <h4 className="text-2xl font-bold text-blue-700">
                Campaign Video
              </h4>
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

          {campaign.project_url && (
            <div className="mb-6">
              <h4 className="text-2xl font-bold text-blue-700">Project URL</h4>
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
            <h4 className="text-2xl font-bold text-blue-700">Your Balance</h4>
            <p className="text-lg text-gray-700 mt-2">
              <strong>{balance}</strong> {campaign.token?.symbol}{" "}
              <span className="text-gray-500 mx-2">|</span>
              {campaign.token?.name}{" "}
              <span className="text-gray-500 mx-2">|</span>
              {campaign.token?.account_id}
            </p>
          </div>

          <div className="mb-2">
            <h4 className="text-2xl font-bold text-blue-700">Donate Now</h4>
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
                  campaign.status === CampaignStatus.CLOSED
                }
                className={`py-3 px-8 rounded-full font-semibold text-lg shadow-md transition-colors duration-300 ${
                  loading ||
                  donationAmount <= 0 ||
                  campaign.status === CampaignStatus.CLOSED
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
              <p className="text-yellow-500 mt-2">Checking token approval...</p>
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
          <h3 className="text-3xl font-bold text-blue-900 mb-6">
            Donation History
          </h3>
          <div className="max-h-96 overflow-y-auto">
            {renderDonationHistory()}
          </div>
        </section>

        {/* Related Campaigns Section */}
        <section className="mt-16">
          <h3 className="text-4xl font-bold text-blue-900 mb-12 text-center">
            Related Campaigns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {renderRelatedCampaigns()}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CampaignDetailsPage;
