from typing import List, Optional
from ninja import Schema
from pydantic import field_validator


class UserSchema(Schema):
    id: int
    username: Optional[str] = None
    email: Optional[str] = None


class CampaignTypeSchema(Schema):
    id: int
    name: str


class TokenSchema(Schema):
    id: int
    name: str
    symbol: str
    address: str
    account_id: Optional[str] = None


class CampaignSchema(Schema):
    id: int
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    goal: float
    current_amount: float
    progress: float
    organizer: UserSchema
    campaign_type: Optional[CampaignTypeSchema] = None
    token: Optional[TokenSchema] = None
    video_link: Optional[str] = None
    project_url: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    status: Optional[str] = None
    onchain_id: Optional[int] = None
    approved_by_admin: Optional[bool] = None
    transaction_hash_create: Optional[str] = None
    transaction_hash_withdrawn: Optional[str] = None


class CampaignCreateSchema(Schema):
    title: str
    description: str
    image: str = None
    goal: float
    campaign_type_id: int = None
    token_id: int = None
    video_link: str = None
    project_url: str = None


class CampaignTypeSchema(Schema):
    id: int
    name: str


class TopDonorSchema(Schema):
    id: int
    name: Optional[str]
    username: str
    totalDonations: str
    initials: str


class TopCampaignSchema(Schema):
    id: int
    title: str
    description: str
    image: str
    progress: float
    status: str
    date: str


class CampaignListSchema(Schema):
    id: int
    title: str
    description: str
    image: str
    progress: float


class PaginatedCampaignsSchema(Schema):
    current_page: int
    total_pages: int
    campaigns: List[CampaignListSchema]


class UserUpdateSchema(Schema):
    name: str
    facebook: str
    twitter: str
    bio: str
    user_image: str = None


class UserInfoSchema(Schema):
    name: Optional[str] = None
    wallet_address: Optional[str] = None
    facebook: Optional[str] = None
    twitter: Optional[str] = None
    bio: Optional[str] = None
    user_image: Optional[str] = None


class DonationHistorySchema(Schema):
    campaign_id: int
    campaign_title: str
    campaign_image: Optional[str] = None
    amount: float
    date: str
    transaction_hash:Optional[str] = None


class CampaignDonationHistorySchema(Schema):
    campaign_id: int
    campaign_title: str
    campaign_image: Optional[str]
    user_id: int
    user_name: Optional[str]
    user_username: Optional[str]
    user_image: Optional[str]
    amount: float
    date: str
    transaction_hash: Optional[str]



class RelatedCampaignSchema(Schema):
    id: int
    title: str
    description: str
    image: str
    progress: float


class CampaignDetailResponseSchema(Schema):
    campaign: CampaignSchema
    related_campaigns: List[RelatedCampaignSchema]



class LoginSchema(Schema):
    wallet_address: str
    signature: str

    @field_validator("wallet_address")
    @classmethod
    def validate_wallet_address(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("wallet_address must not be empty")
        return value

    @field_validator("signature")
    @classmethod
    def validate_signature(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("signature must not be empty")
        return value


class LoginResponseSchema(Schema):
    token: str
    username: str
    wallet_address: str
    image: Optional[str]
    name: Optional[str]

class AuthNonce(Schema):
    wallet_address: str
    nonce: str

    @field_validator("wallet_address")
    @classmethod
    def wallet_address_must_not_be_empty(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("wallet_address must not be empty")
        return value