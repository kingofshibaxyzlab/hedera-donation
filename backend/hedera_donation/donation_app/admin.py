from django.contrib import admin
from .models import Campaign, CampaignType, LastIndexCrawl, Token, Donation, HederaUser


@admin.register(HederaUser)
class HederaUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'wallet_address',
                    'is_active', 'date_joined',)
    search_fields = ('username', 'email', 'wallet_address',)
    list_filter = ('is_active', 'date_joined',)


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'organizer', 'goal','current_amount', 'created_at', 'approved_by_admin', 'status',)
    search_fields = ('title', 'description', 'summary', 'organizer__username',)
    list_filter = ('campaign_type', 'created_at', 'approved_by_admin', 'status',)
    readonly_fields = ('onchain_id', 'percentage_completed', 'transaction_hash_create','transaction_hash_withdrawn',)


@admin.register(CampaignType)
class CampaignTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name',)
    search_fields = ('name',)


@admin.register(Token)
class TokenAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'symbol', 'account_id', 'address',)
    search_fields = ('name', 'symbol',)


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('id', 'campaign', 'user', 'amount', 'date', 'transaction_hash',)
    search_fields = ('campaign__title', 'user__username', 'transaction_hash',)
    list_filter = ('date', 'campaign',)
    readonly_fields = ('transaction_hash',)



@admin.register(LastIndexCrawl)
class LastIndexCrawlAdmin(admin.ModelAdmin):
    list_display = ('key', 'start_at', 'value', 'updated_at',)
    search_fields = ('key', 'start_at', 'value',)