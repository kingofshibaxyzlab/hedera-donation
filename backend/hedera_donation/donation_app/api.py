from math import ceil
import uuid
import os
from typing import List
from django.db import connection

from donation_app.helper import (
    generate_jwt_token,
    jwt_authentication,
    serialize_campaign,
    serialize_campaign_card,
    serialize_donation,
)
from django.core.cache import cache
from django.db.models import Sum
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from ninja import NinjaAPI, File
from ninja.errors import HttpError
from ninja.files import UploadedFile as NinjaUploadedFile

from donation_app.storage import generate_presigned_get_url, generate_presigned_post

from .models import Campaign, CampaignType, Donation, Token, HederaUser
from .schemas import (
    CampaignCreateSchema,
    CampaignDetailResponseSchema,
    CampaignDonationHistorySchema,
    CampaignSchema,
    CampaignTypeSchema,
    DonationHistorySchema,
    LoginResponseSchema,
    LoginSchema,
    ResponsePaginationSchema,
    TokenSchema,
    TopDonorSchema,
    UserInfoSchema,
    UserUpdateSchema,
    AuthNonce,
    CampaignCardSchema,
    PresignedPostSchema,
    PresignRequestSchema,
    PresignedGetURLSchema
)

api = NinjaAPI()

CACHE_TIMEOUT = 5

import os
from django.db import connection
from ninja import NinjaAPI
from ninja.errors import HttpError

api = NinjaAPI()

# Check health API
@api.get("/health", tags=["Health Check"])
def health_check(request):
    checks = {}
    overall_status = "ok"
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            if result is None or result[0] != 1:
                raise Exception("Database check failed")
        checks["database"] = {"status": "ok"}
    except Exception as e:
        checks["database"] = {"status": "fail", "message": str(e)}
        overall_status = "fail"
    response = {
        "status": overall_status,
        "checks": checks
    }

    if overall_status != "ok":
        raise HttpError(503, response)

    return response

    
# Authentication APIs
@api.post("/auth/login", tags=["Authentication"], response=LoginResponseSchema)
def login(request, payload: LoginSchema):
    try:
        user, created = HederaUser.objects.get_or_create(
            wallet_address=payload.wallet_address
        )
        if created:
            user.username = f"User_{payload.wallet_address}"
            user.is_active = True
            user.save()
        if not user.is_active:
            raise HttpError(403, "User account is disabled")
        token = generate_jwt_token(user)
        return LoginResponseSchema(
            token=token,
            username=user.username,
            wallet_address=user.wallet_address,
            image=user.image,
            name=user.name,
        )
    except Exception as e:
        raise HttpError(400, str(e))


@api.get("/auth/nonce", tags=["Authentication"], response=AuthNonce)
def get_nonce(request, wallet_address: str):
    user, created = HederaUser.objects.get_or_create(wallet_address=wallet_address)
    if created:
        user.username = f"User_{wallet_address}"
        user.is_active = True
    user.nonce = uuid.uuid4().hex
    user.save()
    return AuthNonce(wallet_address=wallet_address, nonce=user.nonce)


# User Management APIs
@api.get("/user/info", tags=["User Info"], response=UserInfoSchema)
def get_user_info(request):
    user = jwt_authentication(request)
    data = {
        "username": user.username,
        "name": user.name,
        "wallet_address": user.wallet_address,
        "facebook": user.facebook,
        "twitter": user.twitter,
        "bio": user.bio,
        "user_image": user.image,
    }
    return UserInfoSchema(**data)


@api.put("/user/update", tags=["User Info"], response={200: str, 400: str})
def update_user(request, payload: UserUpdateSchema):
    user = jwt_authentication(request)
    try:
        if payload.name is not None:
            user.name = payload.name
        if payload.facebook is not None:
            user.facebook = payload.facebook
        if payload.twitter is not None:
            user.twitter = payload.twitter
        if payload.bio is not None:
            user.bio = payload.bio
        if payload.user_image is not None:
            user.image = payload.user_image
        user.save()
        return 200, "User information updated successfully."
    except Exception as e:
        return 400, f"Error updating user information: {str(e)}"


@api.get("/user/donation-history", tags=["User Info"], response=List[DonationHistorySchema])
def get_donation_history(request):
    cache_key = f"donation_history:{request.headers.get('Authorization')}"
    data = cache.get(cache_key)
    if data is None:
        user = jwt_authentication(request)
        # Note: Make sure to select_related both campaign and campaign.token
        donations = Donation.objects.filter(user=user).select_related("campaign", "campaign__token")
        data = [serialize_donation(donation) for donation in donations]
        cache.set(cache_key, data, CACHE_TIMEOUT)
    return data


@api.post("/campaigns", tags=["Campaigns"], response=CampaignSchema)
def create_campaign(request, payload: CampaignCreateSchema):
    user = jwt_authentication(request)
    campaign_type = (
        get_object_or_404(CampaignType, id=payload.campaign_type_id)
        if payload.campaign_type_id
        else None
    )
    token = (
        get_object_or_404(Token, id=payload.token_id)
        if payload.token_id
        else None
    )
    campaign = Campaign.objects.create(
        title=payload.title,
        summary=payload.summary,
        description=payload.description,
        image=payload.image,
        goal=payload.goal,
        campaign_type=campaign_type,
        token=token,
        video_link=payload.video_link,
        project_url=payload.project_url,
        organizer=user,
    )
    return serialize_campaign(campaign)


@api.get(
    "/campaigns", 
    tags=["Campaigns"], 
    response={200: ResponsePaginationSchema[CampaignCardSchema]}
)
def list_campaigns(request, page: int = 1, per_page: int = 10):
    offset = (page - 1) * per_page
    
    campaigns_qs = (
        Campaign.objects.select_related("organizer", "campaign_type", "token")
        .filter(approved_by_admin=True)
        .order_by("-created_at")
    )
    
    paginated_campaigns = campaigns_qs[offset:offset + per_page]
    
    campaigns_list = [serialize_campaign_card(c) for c in paginated_campaigns]
    total_items = campaigns_qs.count()
    total_pages = (total_items + per_page - 1) // per_page
    
    response = ResponsePaginationSchema[CampaignCardSchema](
        data=campaigns_list,
        page=page,
        page_size=per_page,
        total_pages=total_pages,
        total_items=total_items,
        has_next=page < total_pages,
        has_previous=page > 1,
    )
    return response


@api.get("/campaigns/{campaign_id}", tags=["Campaigns"], response=CampaignDetailResponseSchema)
def get_campaign_details(request, campaign_id: str):
    cache_key = f"campaigns:detail:{campaign_id}"
    data = cache.get(cache_key)
    if data is None:
        campaign = get_object_or_404(Campaign, id=campaign_id)
        related_campaigns = (
            Campaign.objects.select_related("organizer", "campaign_type", "token")
            .filter(
                campaign_type=campaign.campaign_type,
                approved_by_admin=True,
                status=Campaign.STATUS_PUBLISHED,
            )
            .exclude(id=campaign_id)
            .order_by("?")[:3]
        )
        data = {
            "campaign": serialize_campaign(campaign),
            "related_campaigns": [serialize_campaign_card(c) for c in related_campaigns],
        }
        cache.set(cache_key, data, CACHE_TIMEOUT)
    return data


@api.get(
    "/campaigns/{campaign_id}/donations", 
    tags=["Donations"], 
    response={200: ResponsePaginationSchema[CampaignDonationHistorySchema]}
)
def get_donation_history_by_campaign(request, campaign_id: int, page: int = 1, per_page: int = 10):
    cache_key = f"campaigns:{campaign_id}:donations:page={page}:per_page={per_page}"
    data = cache.get(cache_key)
    if data is None:
        campaign = get_object_or_404(Campaign, id=campaign_id)
        total = Donation.objects.filter(campaign=campaign).aggregate(total_amount=Sum("amount"))["total_amount"] or 0
        campaign.current_amount = total
        campaign.save()

        donations_qs = Donation.objects.filter(campaign=campaign).select_related("user", "campaign__token").order_by("-date")
        total_items = donations_qs.count()
        total_pages = ceil(total_items / per_page)
        offset = (page - 1) * per_page
        paginated_donations = donations_qs[offset:offset + per_page]
        donation_list = [
            {
                "id": donation.id,
                "campaign_id": donation.campaign.id,
                "campaign_title": donation.campaign.title,
                "campaign_image": donation.campaign.image,
                "user_id": donation.user.id,
                "user_name": donation.user.name,
                "user_username": donation.user.username,
                "user_image": donation.user.image,
                "amount": float(donation.amount),
                "date": donation.date.isoformat(),
                "transaction_hash": donation.transaction_hash or "N/A",
                "token": {
                    "id": donation.campaign.token.id,
                    "name": donation.campaign.token.name,
                    "symbol": donation.campaign.token.symbol,
                    "address": donation.campaign.token.address,
                    "account_id": donation.campaign.token.account_id,
                    "decimal": donation.campaign.token.decimal,
                } if donation.campaign.token else None,
            }
            for donation in paginated_donations
        ]
        data = {
            "data": donation_list,
            "page": page,
            "page_size": per_page,
            "total_pages": total_pages,
            "total_items": total_items,
            "has_next": page < total_pages,
            "has_previous": page > 1,
        }
        cache.set(cache_key, data, CACHE_TIMEOUT)
    return data

@api.get("/user/campaigns", tags=["Campaigns"], response=List[CampaignSchema])
def get_campaigns_by_user(request):
    cache_key = f"user_campaigns:{request.headers.get('Authorization')}"
    data = cache.get(cache_key)
    if data is None:
        user = jwt_authentication(request)
        campaigns = (
            Campaign.objects.filter(organizer=user)
            .select_related("campaign_type", "token")
            .order_by("-updated_at")
        )
        data = [serialize_campaign(campaign) for campaign in campaigns]
        cache.set(cache_key, data, CACHE_TIMEOUT)
    return data



# Leaderboard APIs
@api.get("/top-campaigns", tags=["Leaderboards"], response=List[CampaignCardSchema])
def get_top_campaigns(request):
    cache_key = "top_campaigns:list"
    data = cache.get(cache_key)
    if data is None:
        campaigns = (
            Campaign.objects.select_related("organizer", "campaign_type", "token")
            .filter(goal__gt=0, approved_by_admin=True, onchain_id__isnull=False)
            .order_by("-percentage_completed")[:6]
        )
        data = [serialize_campaign_card(campaign) for campaign in campaigns]
        cache.set(cache_key, data, CACHE_TIMEOUT)
    return data


@api.get("/top-donors", tags=["Leaderboards"], response=List[TopDonorSchema])
def get_top_donors(request):
    cache_key = "top_donors:list"
    data = cache.get(cache_key)
    if data is None:
        top_donors = (
            Donation.objects.values("user_id")
            .annotate(total_donations=Sum("amount"))
            .order_by("-total_donations")[:12]
        )
        user_ids = [donor["user_id"] for donor in top_donors]
        users = HederaUser.objects.filter(id__in=user_ids).only("id", "name", "username")
        user_map = {user.id: user for user in users}
        data = []
        for donor in top_donors:
            user = user_map.get(donor["user_id"])
            name = user.name if user and user.name else "Unknown"
            initials = "".join([n[0].upper() for n in name.split()]) if name else "Unknown"
            data.append(
                {
                    "id": donor["user_id"],
                    "name": name,
                    "username": user.username if user and user.username else "Unknown",
                    "totalDonations": f"{donor['total_donations']} Tokens",
                    "initials": initials,
                }
            )
        cache.set(cache_key, data, CACHE_TIMEOUT)
    return data

# Supporting APIs
@api.get("/campaign-types", tags=["Campaign Types"], response=List[CampaignTypeSchema])
def list_campaign_types(request):
    cache_key = "campaign_types:list"
    data = cache.get(cache_key)
    if data is None:
        data = list(CampaignType.objects.all().values())
        cache.set(cache_key, data, CACHE_TIMEOUT)
    return data


@api.get("/tokens", tags=["Tokens"], response=List[TokenSchema])
def list_tokens(request):
    cache_key = "tokens:list"
    data = cache.get(cache_key)
    if data is None:
        data = list(Token.objects.all().values())
        cache.set(cache_key, data, CACHE_TIMEOUT)
    return data

@api.post("/generate-presigned-post", tags=["File Management"], response=PresignedPostSchema)
def api_generate_presigned_post(request, payload: PresignRequestSchema):
    EXPIRATION = 600
    key = payload.key
    file_name = os.path.splitext(key)[0]
    file_extension = os.path.splitext(key)[1]
    unique_file_name = f"{uuid.uuid4().hex}_{file_name}{file_extension}"
    
    try:
        post_data = generate_presigned_post(unique_file_name, "private", EXPIRATION)
        return post_data
    except Exception as e:
        raise HttpError(400, str(e))
    
@api.post("/generate-presigned-get-url", tags=["File Management"], response=PresignedGetURLSchema)
def api_generate_presigned_get_url(request, payload: PresignRequestSchema):
    EXPIRATION = 60*60*24*365*100 # 100 year
    key = payload.key
    try:
        url = generate_presigned_get_url(key, EXPIRATION)
        return {"url": url}
    except Exception as e:
        raise HttpError(400, str(e))