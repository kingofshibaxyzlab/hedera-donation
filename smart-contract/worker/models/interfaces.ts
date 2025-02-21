import { CampaignStatus } from "./enums";

export interface LogEntry {
    topics: string[];
    data: string;
    transaction_hash: string;
    timestamp: string;
}

export interface DecodedLog {
    eventName: string;
    signature: string;
    args: Record<string, string>;
    transactionHash: string;
    timestamp: string;
}

export interface User {
    id: number;
    username: string | null;
    email: string | null;
    is_active: boolean;
    date_joined: string;
    wallet_address: string;
}

export interface Donation {
    campaignId: number;
    userId: number;
    amount: number;
    transactionHash: string | null;
    date?: string;
}

export interface Campaign {
    id: number;
    title: string;
    description: string;
    image: string | null;
    goal: number;
    current_amount: number;
    percentage_completed: number;
    organizer_id: number;
    campaign_type_id: number | null;
    token_id: number | null;
    video_link: string | null;
    project_url: string | null;
    created_at: string;
    updated_at: string;
    approved_by_admin: boolean;
    onchain_id: number | null;
    status: CampaignStatus;
    transaction_hash_create: string;
    transaction_hash_withdrawn: string;
}

export interface DonationUpsert {
    campaignId: number;
    userId: number;
    transactionHash: string;
    amount: number;
    time: number;
}

export interface ApprovedCampaignJoin {
    id: number;
    title: string;
    description: string;
    image: string | null;
    goal: number;
    current_amount: number;
    percentage_completed: number;
    status: CampaignStatus;
    created_at: string;
    updated_at: string;
    onchain_id: number | null;
    approved_by_admin: boolean;
    token_name: string;
    token_symbol: string;
    token_address: string;
    token_decimal: number;
    token_account_id: string;
    campaign_type_name: string;
    organizer_username: string;
    organizer_wallet_address: string;
    transaction_hash_create: string;
    transaction_hash_withdrawn: string;
}

export interface CampaignPublishResult {
    transactionHash: string;
}
