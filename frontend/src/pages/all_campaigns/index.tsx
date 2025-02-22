import CampaignCard from "@/components/card/CampaignCard";
import DataLoader from "@/components/DataLoader";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavBar";
import Spinner from "@/components/spinner/Spinner";
import { ICampaignCard, useCampaigns } from "@/services/apis/core";
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const AllCampaignsPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const per_page = 9;
  const [allCampaigns, setAllCampaigns] = useState<ICampaignCard[]>([]);

  const {
    data: paginatedCampaigns,
    isLoading,
    error,
  } = useCampaigns({
    variables: { page, per_page },
  });

  const hasNext: boolean =
    paginatedCampaigns?.has_next !== undefined
      ? paginatedCampaigns?.has_next
      : true;

  useEffect(() => {
    if (paginatedCampaigns?.data) {
      if (page === 1) {
        setAllCampaigns(paginatedCampaigns.data);
      } else {
        setAllCampaigns((prev) => [...prev, ...paginatedCampaigns.data]);
      }
    }
  }, [paginatedCampaigns, page]);

  const fetchMoreData = () => {
    if (hasNext) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 min-h-screen">
      <NavigationBar />
      <div className="min-h-[80vh]">
        <main className="container mx-auto py-16 px-6 md:px-20">
          <h2 className="text-5xl font-bold text-blue-900 mb-12 text-center">
            All Campaigns
          </h2>
          {error ? (
            <p className="text-center text-red-600 text-xl mb-4">
              Failed to load campaigns.
            </p>
          ) : (
            <DataLoader
              isLoading={isLoading && page === 1}
              loadingMessage="Loading campaigns..."
            >
              {allCampaigns.length > 0 ? (
                <InfiniteScroll
                  dataLength={allCampaigns.length}
                  next={fetchMoreData}
                  hasMore={hasNext}
                  loader={
                    <div className="mt-3">
                      <Spinner message=" Loading more campaigns..."></Spinner>
                    </div>
                  }
                  endMessage={
                    <p className="text-center text-gray-600 text-xl mt-3">
                      {hasNext
                        ? "Scroll down to load more."
                        : "No more campaigns available."}
                    </p>
                  }
                >
                  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allCampaigns.map((campaign: ICampaignCard) => (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        showSummary={true}
                        summaryLimit={250}
                      />
                    ))}
                  </section>
                </InfiniteScroll>
              ) : (
                !isLoading && (
                  <p className="text-center text-gray-600 text-xl">
                    No campaigns available.
                  </p>
                )
              )}
            </DataLoader>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AllCampaignsPage;
