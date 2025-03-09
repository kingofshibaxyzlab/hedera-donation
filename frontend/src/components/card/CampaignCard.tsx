import { UrlMapping } from "@/commons/url-mapping.common";
import { ICampaignCard } from "@/services/apis/core";
import { getStatusBadgeClass } from "@/utils/colors";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { Link } from "react-router-dom";

interface CampaignCardProps {
  campaign: ICampaignCard;
  showSummary?: boolean;
  summaryLimit?: number;
  onViewCampaign?: (id: number) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  showSummary = false,
  summaryLimit = 250,
  onViewCampaign,
}) => {
  const truncatedSummary =
    campaign.summary.length > summaryLimit
      ? campaign.summary.slice(0, summaryLimit) + "..."
      : campaign.summary;

  const handleViewCampaign = () => {
    if (onViewCampaign) {
      onViewCampaign(campaign.id);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition duration-300 flex flex-col">
      <img
        src={campaign.image || "https://placehold.co/150x150"}
        alt={campaign.title}
        className="w-full h-56 object-cover"
      />
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-bold text-blue-800">{campaign.title}</h4>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
              campaign.status || ""
            )}`}
          >
            {campaign.status}
          </span>
        </div>
        {showSummary && (
          <p className="text-sm text-gray-700 mb-6 flex-grow">
            {truncatedSummary}
          </p>
        )}
        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden mb-4">
          <div
            className="bg-red-500 h-full transition-all duration-700 ease-in-out"
            style={{ width: `${campaign.progress || 0}%` }}
          ></div>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-gray-600 mb-4">
            {campaign.progress}% funded
          </p>
          {campaign.created_at && (
            <p className="text-sm text-green-500 mb-4">
              Created:{" "}
              {formatDistanceToNow(new Date(campaign.created_at), {
                addSuffix: true,
              })}
            </p>
          )}
        </div>

        <div className="mt-auto">
          {onViewCampaign ? (
            <button
              onClick={handleViewCampaign}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              View Campaign
            </button>
          ) : (
            <Link
              to={`${UrlMapping.campaign_detail}/${campaign.id}`}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              View Campaign
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
