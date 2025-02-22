import { createMutation, createQuery } from "react-query-kit";
import {
  createCampaign,
  getCampaignDetails,
  getCampaigns,
  getDonationHistory,
  getDonationHistoryByCampaign,
  getTopCampaigns,
  getTopDonors,
  getUserCampaigns,
  getUserInfo,
  listCampaignTypes,
  listTokens,
  updateUser,
} from "./request";
import {
  ICampaign,
  ICampaignCard,
  ICampaignDetailResponse,
  ICampaignType,
  ICreateCampaignPayload,
  IDonationHistory,
  IToken,
  ITopDonor,
  IUserInfo,
  IUserUpdatePayload,
  PaginatedCampaignDonationHistoryResponse,
  PaginatedCampaignsResponse,
} from "./types";

export const useUserInfo = createQuery<IUserInfo>({
  queryKey: ["useUserInfo"],
  fetcher: () => getUserInfo(),
});

export const useCampaigns = createQuery<
  PaginatedCampaignsResponse,
  { page: number; per_page: number }
>({
  queryKey: ["useCampaigns"],
  fetcher: ({ page, per_page }) => getCampaigns(page, per_page),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useCampaignDetails = createQuery<
  ICampaignDetailResponse,
  { id: string }
>({
  queryKey: ["useCampaignDetails"],
  fetcher: ({ id }) => getCampaignDetails(id),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useDonationHistory = createQuery<IDonationHistory[]>({
  queryKey: ["useDonationHistory"],
  fetcher: () => getDonationHistory(),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useTopDonors = createQuery<ITopDonor[]>({
  queryKey: ["useTopDonors"],
  fetcher: () => getTopDonors(),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useTopCampaigns = createQuery<ICampaignCard[]>({
  queryKey: ["useTopCampaigns"],
  fetcher: () => getTopCampaigns(),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useCampaignTypes = createQuery<ICampaignType[]>({
  queryKey: ["useCampaignTypes"],
  fetcher: () => listCampaignTypes(),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useTokens = createQuery<IToken[]>({
  queryKey: ["useTokens"],
  fetcher: () => listTokens(),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useUserCampaigns = createQuery<ICampaign[]>({
  queryKey: ["useUserCampaigns"],
  fetcher: () => getUserCampaigns(),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useDonationHistoryByCampaign = createQuery<
  PaginatedCampaignDonationHistoryResponse,
  { campaignId: number; page: number; per_page: number }
>({
  queryKey: ["useDonationHistoryByCampaign"],
  fetcher: ({ campaignId, page, per_page }) =>
    getDonationHistoryByCampaign(campaignId, page, per_page),
  refetchInterval: 1000 * 3, // 3 seconds
});

export const useUpdateUser = createMutation<void, IUserUpdatePayload>({
  mutationFn: updateUser,
});

export const useCreateCampaign = createMutation<void, ICreateCampaignPayload>({
  mutationFn: createCampaign,
});
