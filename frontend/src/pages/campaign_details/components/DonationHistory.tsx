import DataLoader from "@/components/DataLoader";
import Spinner from "@/components/spinner/Spinner";
import env from "@/env";
import { useDonationHistoryByCampaign } from "@/services/apis/core";
import { shortenTransactionHash } from "@/utils/transaction_string";
import { formatDistanceToNow } from "date-fns";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";

interface DonationHistoryProps {
  campaignId: number;
  tokenSymbol: string;
}

const DonationHistory: React.FC<DonationHistoryProps> = ({
  campaignId,
  tokenSymbol,
}) => {
  const navigate = useNavigate();
  const [historyPage, setHistoryPage] = useState<number>(1);
  const historyPerPage = 6;
  const [allDonations, setAllDonations] = useState<any[]>([]);

  const {
    data: donationHistoryData,
    isLoading: isHistoryLoading,
    error: donationHistoryError,
  } = useDonationHistoryByCampaign({
    variables: { campaignId, page: historyPage, per_page: historyPerPage },
  });

  const { data: donationHistoryDataRealtime } = useDonationHistoryByCampaign({
    variables: { campaignId, page: 1, per_page: 10 },
  });

  const hasNextHistory: boolean =
    donationHistoryData?.has_next !== undefined
      ? donationHistoryData.has_next
      : true;

  useEffect(() => {
    if (donationHistoryData?.data) {
      if (historyPage === 1) {
        setAllDonations(donationHistoryData.data);
      } else {
        setAllDonations((prev) => [...prev, ...donationHistoryData.data]);
      }
    }
  }, [donationHistoryData, historyPage]);

  useEffect(() => {
    if (donationHistoryDataRealtime?.data) {
      if (
        allDonations.length === 0 ||
        donationHistoryDataRealtime.data[0]?.id !== allDonations[0]?.id
      ) {
        setAllDonations((prev) => [
          ...donationHistoryDataRealtime.data,
          ...prev,
        ]);
      }
    }
  }, [donationHistoryDataRealtime]);

  const fetchMoreHistory = () => {
    if (hasNextHistory) {
      setHistoryPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <>
      {donationHistoryError ? (
        <p className="text-center text-red-600">
          Failed to load donation history.
        </p>
      ) : (
        <DataLoader
          isLoading={isHistoryLoading && historyPage === 1}
          loadingMessage="Loading donation history..."
        >
          <div
            id="donation-container"
            className="max-h-[30rem] overflow-y-auto pb-10"
          >
            {allDonations.length > 0 ? (
              <InfiniteScroll
                dataLength={allDonations.length}
                next={fetchMoreHistory}
                hasMore={hasNextHistory}
                scrollableTarget="donation-container"
                loader={
                  <div className="mt-3">
                    <Spinner message=" Loading more donations..." />
                  </div>
                }
                endMessage={
                  <p className="text-center text-gray-600 text-xl mt-3">
                    No more donations available.
                  </p>
                }
              >
                {allDonations.map((donation, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-xl flex items-center space-x-6 bg-white hover:bg-gray-50 transition-all duration-300 mt-4"
                  >
                    <img
                      src={
                        donation.user_image || "https://placehold.co/100x100"
                      }
                      alt={donation.campaign_title}
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                    <div className="flex-1">
                      <p
                        className="text-xl font-semibold text-blue-800 cursor-pointer"
                        onClick={() =>
                          navigate(
                            `${env.EXPLORER_SCAN}/campaign/${donation.campaign_id}`
                          )
                        }
                      >
                        {donation.campaign_title}
                      </p>
                      <p className="text-gray-700">
                        Amount:{" "}
                        {donation &&
                          ethers.formatUnits(
                            donation.amount.toString(),
                            Number(donation?.token?.decimal || 0)
                          )}{" "}
                        {tokenSymbol}
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
                ))}
              </InfiniteScroll>
            ) : (
              !isHistoryLoading && (
                <p className="text-center text-gray-600">No donations yet.</p>
              )
            )}
          </div>
        </DataLoader>
      )}
    </>
  );
};

export default DonationHistory;
