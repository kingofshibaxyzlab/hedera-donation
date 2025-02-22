export enum CampaignStatus {
  NEW = "NEW",
  PENDING = "PENDING",
  PUBLISHED = "PUBLISHED",
  CLOSED = "CLOSED",
}

export interface IUserInfo {
  username: string;
  name: string;
  wallet_address: string;
  facebook?: string;
  twitter?: string;
  bio?: string;
  user_image?: string;
}

export interface IUserUpdatePayload {
  name: string;
  facebook?: string;
  twitter?: string;
  bio?: string;
  user_image?: string;
}
export interface ICampaignType {
  id: string;
  name: string;
}

export interface IToken {
  id: string;
  name: string;
  symbol: string;
  address: string;
  account_id: string | null;
  decimal: number;
}
export interface Organizer {
  id: number;
  username: string;
  email: string | null;
}

// Core campaign type used for listings
export interface ICampaign {
  id: number;
  title: string;
  summary: string;
  description: string;
  image: string | null;
  goal: number;
  current_amount: number;
  progress: number;
  organizer: Organizer;
  campaign_type: ICampaignType | null;
  token: IToken | null;
  video_link: string | null;
  project_url: string | null;
  created_at: string;
  updated_at: string;
  status: CampaignStatus | null;
  onchain_id: string | null;
  approved_by_admin: boolean | null;
  transaction_hash_create: string | null;
  transaction_hash_withdrawn: string | null;
}

// Core campaign type used for listings
export interface ICampaignCard {
  id: number;
  title: string;
  summary: string;
  image: string | null;
  goal: number;
  current_amount: number;
  progress: number;
  organizer: Organizer;
  campaign_type: ICampaignType | null;
  token: IToken | null;
  created_at: string;
  updated_at: string;
  status: CampaignStatus | null;
}

// Full campaign details response schema from the backend
export interface ICampaignDetailResponse {
  campaign: ICampaign;
  related_campaigns: ICampaignCard[];
}

export interface IDonationHistory {
  campaign_id: number;
  campaign_title: string;
  campaign_image?: string;
  token?: IToken;
  amount: number;
  date: string;
  transaction_hash?: string;
}

export interface ICampaignDonationHistory {
  id: number;
  campaign_id: number;
  campaign_title: string;
  campaign_image: string;
  user_id: number;
  user_name: string;
  user_username: string;
  user_image: string;
  amount: number;
  date: string;
  token?: IToken;
  transaction_hash: string;
}

export interface ITopDonor {
  id: string;
  name: string;
  username: string;
  totalDonations: string;
  initials: string;
}

export interface ICreateCampaignPayload {
  title: string;
  summary: string;
  description: string;
  goal: number;
  campaign_type_id?: string;
  token_id?: string;
  image?: string;
  video_link?: string;
  project_url?: string;
}

export interface PaginatedCampaignsResponse {
  data: ICampaignCard[];
  page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginatedCampaignDonationHistoryResponse {
  data: ICampaignDonationHistory[];
  page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
  has_next: boolean;
  has_previous: boolean;
}
