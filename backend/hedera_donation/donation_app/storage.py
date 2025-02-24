import boto3
from django.conf import settings

ACCESS_KEY = settings.S3_ACCESS_KEY
SECRET_KEY = settings.S3_SECRET_KEY
ENDPOINT_URL = settings.S3_ENDPOINT_URL
BUCKET_NAME = settings.S3_BUCKET_NAME
REGION_NAME = settings.S3_REGION_NAME


s3 = boto3.client(
    "s3",
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    endpoint_url=ENDPOINT_URL,
    region_name=REGION_NAME
)

def generate_presigned_post(key: str, acl: str = "private", expiration: int = 600) -> dict:
    response = s3.generate_presigned_post(
        Bucket=BUCKET_NAME,
        Key=key,
        ExpiresIn=expiration,
        Fields={"acl": acl},
        Conditions=[{"acl": acl}]
    )
    return response

def generate_presigned_get_url(key: str, expiration: int = 600) -> str:
    """
    Generate a pre-signed GET URL to access a file.
    Using a huge expiration value if your service supports unlimited expiration.
    """
    url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET_NAME, "Key": key},
        ExpiresIn=expiration
    )
    return url