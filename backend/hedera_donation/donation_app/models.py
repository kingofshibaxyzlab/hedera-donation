from django.db import models

class HederaUser(models.Model):
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    wallet_address = models.CharField(max_length=255)
    name = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    facebook = models.CharField(blank=True, null=True)
    twitter = models.CharField(blank=True, null=True)
    image = models.CharField(blank=True, null=True, default="https://placehold.co/150x150")
    nonce = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.username or "Anonymous"

    
class CampaignType(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Token(models.Model):
    name = models.CharField(max_length=255)
    symbol = models.CharField(max_length=50)
    address = models.CharField(max_length=255)    
    account_id = models.CharField(max_length=255, null=True)
    decimal = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.symbol})"


class Campaign(models.Model):
    STATUS_NEW = 'NEW'
    STATUS_PENDING = 'PENDING'
    STATUS_PUBLISHED = 'PUBLISHED'
    STATUS_CLOSED = 'CLOSED'

    STATUS_CHOICES = [
        (STATUS_NEW, 'New'),
        (STATUS_PENDING, 'Pending'),
        (STATUS_PUBLISHED, 'Published'),
        (STATUS_CLOSED, 'Closed'),
    ]

    title = models.CharField(max_length=255)
    summary =  models.CharField(max_length=500, null=True)
    description = models.TextField()
    image = models.CharField(blank=True, null=True, default="https://placehold.co/150x150")
    goal = models.DecimalField(max_digits=40, decimal_places=2)
    current_amount = models.DecimalField(max_digits=40, decimal_places=2, default=0.0)
    percentage_completed = models.DecimalField(max_digits=20, decimal_places=2, default=0.0)
    organizer = models.ForeignKey(HederaUser, on_delete=models.CASCADE, related_name='campaigns')
    campaign_type = models.ForeignKey(CampaignType, on_delete=models.CASCADE)
    token = models.ForeignKey(Token, on_delete=models.CASCADE)
    video_link = models.CharField(blank=True, null=True)
    project_url = models.CharField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_by_admin = models.BooleanField(default=False)
    onchain_id = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)
    transaction_hash_create = models.CharField(max_length=255, blank=True, null=True)
    transaction_hash_withdrawn = models.CharField(max_length=255, blank=True, null=True)


    def save(self, *args, **kwargs):
        if self.goal > 0:
            self.percentage_completed = (self.current_amount / self.goal) * 100
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Donation(models.Model):
    campaign = models.ForeignKey(
        'Campaign', on_delete=models.CASCADE, related_name='donations'
    )
    user = models.ForeignKey(
        'HederaUser', on_delete=models.CASCADE, related_name='donations'
    )
    amount = models.DecimalField(max_digits=40, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    transaction_hash = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} donated {self.amount} to {self.campaign.title}"

    class Meta:
        ordering = ['-date']
        constraints = [
            models.UniqueConstraint(
                fields=['campaign', 'user', 'transaction_hash'],
                name='unique_campaign_user_transaction'
            )
        ]



class LastIndexCrawl(models.Model):
    key = models.CharField(max_length=255,default="crawl_onchain")
    start_at = models.CharField(max_length=255)
    value = models.CharField(max_length=255, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}: {self.value}"