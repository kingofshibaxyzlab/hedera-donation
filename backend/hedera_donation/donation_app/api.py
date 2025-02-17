import uuid
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from ninja import NinjaAPI
from ninja.errors import HttpError
from django.conf import settings
from datetime import datetime, timedelta
import jwt
from .models import (
    Campaign,
    CampaignType,
    Donation,
    Token,
    HederaUser,
)
from .schemas import (
    CampaignCreateSchema,
    CampaignDetailResponseSchema,
    CampaignDonationHistorySchema,
    CampaignSchema,
    CampaignTypeSchema,
    DonationHistorySchema,
    LoginResponseSchema,
    LoginSchema,
    TokenSchema,
    TopCampaignSchema,
    TopDonorSchema,
    UserInfoSchema,
    UserUpdateSchema,
)
from typing import List
from django.db.models import Sum
from django.core.paginator import Paginator

import os
from django.core.files.storage import default_storage
from ninja import File
from ninja.files import UploadedFile as NinjaUploadedFile

api = NinjaAPI()
SECRET_KEY = settings.SECRET_KEY


# Utility Functions
def generate_jwt_token(user):
    payload = {
        'user_id': user.id,
        'username': user.username,
        'wallet_address': user.wallet_address,
        'exp': datetime.utcnow() + timedelta(days=1),  # Token valid for 1 day
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token


def jwt_authentication(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HttpError(401, "Authorization header missing or invalid")

    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = HederaUser.objects.get(id=payload['user_id'])
        request.user = user
        return user
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, HederaUser.DoesNotExist):
        raise HttpError(401, "Invalid or expired token")


# Authentication Endpoints
@api.post("/login", tags=["Authentication"], response=LoginResponseSchema)
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
            token=token, username=user.username, wallet_address=user.wallet_address,image=user.image,name=user.name
        )
    except Exception as e:
        raise HttpError(400, str(e))


# User Management APIs
@api.get("/user/info", tags=["User Info"], response=UserInfoSchema)
def get_user_info(request):
    user = jwt_authentication(request)
    user_data = {
        "name": user.name,
        "wallet_address": user.wallet_address,
        "facebook": user.facebook,
        "twitter": user.twitter,
        "bio": user.bio,
        "user_image": user.image,
    }
    return UserInfoSchema(**user_data)


@api.put("/user/update", tags=["User Info"], response={200: str, 400: str})
def update_user(request, payload: UserUpdateSchema):
    user = jwt_authentication(request)
    try:
        # Update fields if they are provided in the payload
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
    user = jwt_authentication(request)
    donations = Donation.objects.filter(user=user).select_related("campaign")
    return [
        {
            "campaign_id": donation.campaign.id,
            "campaign_title": donation.campaign.title,
            "campaign_image": donation.campaign.image,
            "amount": float(donation.amount),
            "date": donation.date.isoformat(),
            "transaction_hash":donation.transaction_hash
        }
        for donation in donations
    ]


# Campaign Management APIs
@api.get("/campaigns", tags=["Campaigns"], response=List[CampaignSchema])
def list_campaigns(request):
    # jwt_authentication(request)

    # Fetch campaigns with related data for efficient querying
    campaigns = Campaign.objects.select_related(
        "organizer", "campaign_type", "token"
    ).filter(approved_by_admin=True).order_by("-created_at")

    # Serialize campaigns into the expected schema format
    serialized_campaigns = [
        {
            "id": campaign.id,
            "title": campaign.title,
            "description": campaign.description,
            "image": campaign.image,
            "goal": float(campaign.goal),
            "current_amount": float(campaign.current_amount),
            "progress": float(campaign.percentage_completed),
            "organizer": {
                "id": campaign.organizer.id,
                "username": campaign.organizer.username,
                "email": campaign.organizer.email,
            },
            "campaign_type": {
                "id": campaign.campaign_type.id,
                "name": campaign.campaign_type.name,
            } if campaign.campaign_type else None,
            "token": {
                "id": campaign.token.id,
                "name": campaign.token.name,
                "symbol": campaign.token.symbol,
                "address": campaign.token.address,
                "account_id": campaign.token.account_id,

            } if campaign.token else None,
            "video_link": campaign.video_link,
            "project_url": campaign.project_url,
            "created_at": campaign.created_at.isoformat(),
            "updated_at": campaign.updated_at.isoformat(),
            "approved_by_admin": campaign.approved_by_admin,
            "onchain_id":campaign.onchain_id,
            "status": campaign.status,
        }
        for campaign in campaigns
    ]

    return serialized_campaigns


@api.post("/campaigns", tags=["Campaigns"], response=CampaignSchema)
def create_campaign(request, payload: CampaignCreateSchema):
    user = jwt_authentication(request)
    campaign_type = get_object_or_404(
        CampaignType, id=payload.campaign_type_id) if payload.campaign_type_id else None
    token = get_object_or_404(
        Token, id=payload.token_id) if payload.token_id else None
    campaign = Campaign.objects.create(
        title=payload.title,
        description=payload.description,
        image=payload.image,
        goal=payload.goal,
        campaign_type=campaign_type,
        token=token,
        video_link=payload.video_link,
        project_url=payload.project_url,
        organizer=user,
    )
    # Serialize the response to ensure `datetime` fields are strings
    return {
        "id": campaign.id,
        "title": campaign.title,
        "description": campaign.description,
        "image": campaign.image,
        "goal": campaign.goal,
        "current_amount": campaign.current_amount,
        "progress": campaign.percentage_completed,
        "organizer": {
            "id": campaign.organizer.id,
            "username": campaign.organizer.username,
            "email": campaign.organizer.email,
        },
        "campaign_type": {
            "id": campaign.campaign_type.id,
            "name": campaign.campaign_type.name,
        } if campaign.campaign_type else None,
        "token": {
            "id": campaign.token.id,
            "name": campaign.token.name,
            "symbol": campaign.token.symbol,
            "address": campaign.token.address,
            "account_id": campaign.token.account_id,
        } if campaign.token else None,
        "video_link": campaign.video_link,
        "project_url": campaign.project_url,
        "created_at": campaign.created_at.isoformat(),
        "updated_at": campaign.updated_at.isoformat(),
        "approved_by_admin": campaign.approved_by_admin,
        "onchain_id":campaign.onchain_id,
        "status": campaign.status,
    }


@api.get("/campaigns/{campaign_id}", tags=["Campaigns"], response=CampaignDetailResponseSchema)
def get_campaign_details(request, campaign_id: str):
    # Fetch campaign or raise 404 if not found
    campaign = get_object_or_404(Campaign, id=campaign_id)

    # Fetch related campaigns
    related_campaigns = Campaign.objects.filter(
        campaign_type=campaign.campaign_type,approved_by_admin=True,status=Campaign.STATUS_PUBLISHED
    ).exclude(id=campaign_id).order_by("?")[:3]

    # Prepare response
    return {
        "campaign": {
            "id": campaign.id,
            "title": campaign.title,
            "description": campaign.description,
            "image": campaign.image,
            "goal": campaign.goal,
            "current_amount": campaign.current_amount,
            "progress": campaign.percentage_completed,
            "organizer": {
                "id": campaign.organizer.id,
                "username": campaign.organizer.username,
                "email": campaign.organizer.email,
            },
            "campaign_type": {
                "id": campaign.campaign_type.id,
                "name": campaign.campaign_type.name,
            } if campaign.campaign_type else None,
            "token": {
                "id": campaign.token.id,
                "name": campaign.token.name,
                "symbol": campaign.token.symbol,
                "address": campaign.token.address,
                "account_id": campaign.token.account_id,
            } if campaign.token else None,
            "video_link": campaign.video_link,
            "project_url": campaign.project_url,
            "created_at": campaign.created_at.isoformat(),
            "updated_at": campaign.updated_at.isoformat(),
            "approved_by_admin": campaign.approved_by_admin,
            "onchain_id":campaign.onchain_id,
            "status": campaign.status,
            "transaction_hash_create": campaign.transaction_hash_create,
            "transaction_hash_withdrawn": campaign.transaction_hash_withdrawn,
        },
        "related_campaigns": [
            {
                "id": related.id,
                "title": related.title,
                "description": related.description[:100],
                "image": related.image or "https://placehold.co/600x400",
                "progress": int(related.percentage_completed),
            }
            for related in related_campaigns
        ],
    }

@api.get("/campaigns/{campaign_id}/donations", tags=["Donations"], response=List[CampaignDonationHistorySchema])
def get_donation_history_by_campaign(request, campaign_id: int):
    campaign = get_object_or_404(Campaign, id=campaign_id)

    # TODO : Do it in worker, it make slow app
    total = Donation.objects.filter(campaign = campaign).aggregate(total_amount=Sum('amount'))['total_amount'] or 0
    campaign.current_amount = total
    campaign.save()

    donations = Donation.objects.filter(campaign=campaign).select_related("user")
    return [
        {
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
        }
        for donation in donations
    ]


@api.get("/user/campaigns", tags=["Campaigns"], response=List[CampaignSchema])
def get_campaigns_by_user(request):
    user = jwt_authentication(request)
    campaigns = Campaign.objects.filter(
        organizer=user).select_related("campaign_type", "token").order_by("-updated_at")

    return [
        {
            "id": campaign.id,
            "title": campaign.title,
            "description": campaign.description,
            "image": campaign.image or "https://placehold.co/600x400",
            "goal": float(campaign.goal),
            "current_amount": float(campaign.current_amount),
            "progress": float(campaign.percentage_completed),
            "organizer": {
                "id": campaign.organizer.id,
                "username": campaign.organizer.username,
                "email": campaign.organizer.email,
            },
            "campaign_type": {
                "id": campaign.campaign_type.id,
                "name": campaign.campaign_type.name,
            } if campaign.campaign_type else None,
            "token": {
                "id": campaign.token.id,
                "name": campaign.token.name,
                "symbol": campaign.token.symbol,
                "address": campaign.token.address,       
                "account_id": campaign.token.account_id,

            } if campaign.token else None,
            "video_link": campaign.video_link,
            "project_url": campaign.project_url,
            "created_at": campaign.created_at.isoformat(),
            "updated_at": campaign.updated_at.isoformat(),
            "approved_by_admin": campaign.approved_by_admin,
            "onchain_id":campaign.onchain_id,
            "status": campaign.status,
        }
        for campaign in campaigns
    ]


# Supporting APIs
@api.get("/campaign-types", tags=["Campaign Types"], response=List[CampaignTypeSchema])
def list_campaign_types(request):
    return CampaignType.objects.all()


@api.get("/tokens", tags=["Tokens"], response=List[TokenSchema])
def list_tokens(request):
    return Token.objects.all()


# Leaderboard APIs
@api.get("/top-campaigns", tags=["Leaderboards"], response=List[TopCampaignSchema])
def get_top_campaigns(request):
    campaigns = Campaign.objects.filter(goal__gt=0, approved_by_admin=True).order_by("-percentage_completed")[:6]
    return [
        {
            "id": campaign.id,
            "title": campaign.title,
            "description": campaign.description,
            "image": campaign.image or "https://placehold.co/600x400",
            "progress": float(campaign.percentage_completed),
            "status": campaign.status,
            "date": campaign.created_at.isoformat(),
        }
        for campaign in campaigns
    ]


@api.get("/top-donors", tags=["Leaderboards"], response=List[TopDonorSchema])
def get_top_donors(request):
    # Query top donors
    top_donors = Donation.objects.values("user_id").annotate(
        total_donations=Sum("amount")
    ).order_by("-total_donations")[:12]

    # Fetch user information in bulk to avoid multiple queries
    user_ids = [donor["user_id"] for donor in top_donors]
    users = HederaUser.objects.filter(id__in=user_ids).only("id", "name", "username")
    user_map = {user.id: user for user in users}

    # Build response
    response = []
    for donor in top_donors:
        user = user_map.get(donor["user_id"])
        name = user.name if user and user.name else "Unknown"
        initials = "".join([n[0].upper() for n in name.split()]) if name != None else "Unknown"

        response.append({
            "id": donor["user_id"],
            "name": name,
            "username": user.username if user and user.username else "Unknown",
            "totalDonations": f"{donor['total_donations']} Tokens",
            "initials": initials,
        })

    return response

# Upload file
@api.post("/upload-file", tags=["File Management"])
def upload_file(request, file: NinjaUploadedFile = File(...)):
    DOMAIN_ROOT = settings.DOMAIN_ROOT
    try:
        # Generate a unique file name
        file_extension = os.path.splitext(file.name)[1]
        unique_file_name = f"{uuid.uuid4().hex}{file_extension}"

        file_name = default_storage.save(unique_file_name, file)
        file_url = f"{DOMAIN_ROOT}/{file_name}"

        return {"message": "File uploaded successfully", "file_name": file_name, "file_url": file_url}
    except Exception as e:
        raise HttpError(400, f"Error uploading file: {str(e)}")

@api.get("/read-file/{file_name}", tags=["File Management"])
def read_file(request, file_name: str):
    """
    Returns the actual file content by its name.
    """
    file_path = os.path.join(settings.MEDIA_ROOT, file_name)
    if not default_storage.exists(file_path):
        raise HttpError(404, "File not found")

    # Open the file and return as FileResponse
    try:
        file = default_storage.open(file_name, "rb")
        return FileResponse(file, as_attachment=True, filename=file_name)
    except Exception as e:
        raise HttpError(500, f"Error reading file: {str(e)}")