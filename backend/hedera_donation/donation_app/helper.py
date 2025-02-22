import jwt
from datetime import datetime, timedelta
from ninja.errors import HttpError
from django.conf import settings
from .models import Donation, HederaUser,Campaign

SECRET_KEY = settings.SECRET_KEY
JWT_TOKEN_EXP_DAY = settings.JWT_TOKEN_EXP_DAY

def generate_jwt_token(user: HederaUser) -> str:
    payload = {
        "user_id": user.id,
        "username": user.username,
        "wallet_address": user.wallet_address,
        "exp": datetime.utcnow() + timedelta(days=JWT_TOKEN_EXP_DAY),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token


def jwt_authentication(request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HttpError(401, "Authorization header missing or invalid")

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = HederaUser.objects.get(id=payload["user_id"])
        request.user = user
        return user
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, HederaUser.DoesNotExist):
        raise HttpError(401, "Invalid or expired token")


def serialize_campaign(campaign: Campaign) -> dict:
    return {
        "id": campaign.id,
        "title": campaign.title,
        "summary": campaign.summary,
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
        }
        if campaign.campaign_type
        else None,
        "token": {
            "id": campaign.token.id,
            "name": campaign.token.name,
            "symbol": campaign.token.symbol,
            "address": campaign.token.address,
            "account_id": campaign.token.account_id,
            "decimal": campaign.token.decimal,
        }
        if campaign.token
        else None,
        "video_link": campaign.video_link,
        "project_url": campaign.project_url,
        "created_at": campaign.created_at.isoformat(),
        "updated_at": campaign.updated_at.isoformat(),
        "approved_by_admin": campaign.approved_by_admin,
        "onchain_id": campaign.onchain_id,
        "status": campaign.status,
        "approved_by_admin": campaign.approved_by_admin,
        "transaction_hash_create":campaign.transaction_hash_create,
        "transaction_hash_withdrawn":campaign.transaction_hash_withdrawn,
    }


def serialize_campaign_card(campaign: Campaign) -> dict:
    """Helper function to serialize a campaign for card schemas."""
    return {
        "id": campaign.id,
        "title": campaign.title,
        "summary": campaign.summary,
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
        }
        if campaign.campaign_type
        else None,
        "token": {
            "id": campaign.token.id,
            "name": campaign.token.name,
            "symbol": campaign.token.symbol,
            "address": campaign.token.address,
            "account_id": campaign.token.account_id,
            "decimal": campaign.token.decimal,
        }
        if campaign.token
        else None,
        "created_at": campaign.created_at.isoformat(),
        "updated_at": campaign.updated_at.isoformat(),
        "status": campaign.status,
    }


def serialize_donation(donation: Donation) -> dict:
    return {
        "campaign_id": donation.campaign.id,
        "campaign_title": donation.campaign.title,
        "campaign_image": donation.campaign.image,
        "token": {
            "id": donation.campaign.token.id,
            "name": donation.campaign.token.name,
            "symbol": donation.campaign.token.symbol,
            "address": donation.campaign.token.address,
            "account_id": donation.campaign.token.account_id,
            "decimal": donation.campaign.token.decimal,
        },
        "amount": float(donation.amount),
        "date": donation.date.isoformat(),
        "transaction_hash": donation.transaction_hash,
    }
