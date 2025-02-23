from pydantic import field_validator
from typing import Generic, TypeVar, List, Optional
from ninja import Schema

T = TypeVar("T")


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
    decimal: int


class CampaignSchema(Schema):
    id: int
    title: Optional[str] = None
    summary: Optional[str] = None
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


class CampaignCardSchema(Schema):
    id: int
    title: Optional[str] = None
    summary: Optional[str] = None
    image: Optional[str] = None
    goal: float
    current_amount: float
    progress: float
    organizer: UserSchema
    campaign_type: Optional[CampaignTypeSchema] = None
    token: Optional[TokenSchema] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    status: Optional[str] = None


class ResponsePaginationSchema(Schema, Generic[T]):
    data: List[T]
    page: int
    page_size: int
    total_pages: int
    total_items: int
    has_next: bool
    has_previous: bool

class CampaignCreateSchema(Schema):
    title: str
    summary: str
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



class UserUpdateSchema(Schema):
    name: str
    facebook: str
    twitter: str
    bio: str
    user_image: str = None


class UserInfoSchema(Schema):
    username: str
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
    token: Optional[TokenSchema] = None
    amount: float
    date: str
    transaction_hash: Optional[str] = None


class CampaignDonationHistorySchema(Schema):
    id: int
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
    token: Optional[TokenSchema] = None

class CampaignDetailResponseSchema(Schema):
    campaign: CampaignSchema
    related_campaigns: List[CampaignCardSchema]

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
    
class PresignRequestSchema(Schema):
    key: str

class PresignedPostSchema(Schema):
    url: str
    fields: dict

class PresignedGetURLSchema(Schema):
    url: str