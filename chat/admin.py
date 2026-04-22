from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Profile, Message, ContactRequest, GlobalBillboard, 
    Status, StatusView, FavoriteSticker, QuizQuestion
)

# ==========================================
# 1. QUIZ QUESTIONS (INLINE)
# ==========================================
class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion
    extra = 1

# ==========================================
# 2. GLOBAL BILLBOARD
# ==========================================
@admin.register(GlobalBillboard)
class GlobalBillboardAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'is_active', 'created_at')
    list_filter = ('content_type', 'is_active')
    search_fields = ('title', 'text_content')
    list_editable = ('is_active',)
    inlines = [QuizQuestionInline]

# ==========================================
# 3. PROFILE ADMIN
# ==========================================
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'system_id', 'badge_type', 'colored_badge', 'is_account_active')
    list_editable = ('badge_type', 'is_account_active', 'system_id') 
    search_fields = ('full_name', 'system_id', 'user__username')
    list_filter = ('badge_type', 'is_account_active')

    def colored_badge(self, obj):
        val = obj.badge_type if obj.badge_type is not None else 3
        
        # Django 6.x waxay u baahan tahay {} placeholders marka la isticmaalayo format_html
        if val == 0:
            return format_html('<b style="color: gold; background-color: black; padding: 2px 5px; border-radius: 3px;">{}</b>', "A0 (Owner)")
        elif val == 1:
            return format_html('<b style="color: blue;">{}</b>', "B1 (VIP)")
        elif val == 2:
            return format_html('<b style="color: green;">{}</b>', "B2 (Verified)")
        
        return "User Caadi ah"
    
    colored_badge.short_description = "Aragtida Darajada"

# ==========================================
# 4. MESSAGE ADMIN
# ==========================================
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'short_message', 'message_type', 'timestamp')
    search_fields = ('sender__username', 'receiver__username', 'message')
    list_filter = ('timestamp', 'is_deleted_everyone')

    def short_message(self, obj):
        if obj.message:
            return obj.message[:30] + "..." if len(obj.message) > 30 else obj.message
        return "[Fariin Qoraal ah ma ahan]"

    def message_type(self, obj):
        if obj.image: return "🖼️ Sawir"
        if obj.video: return "🎥 Muuqaal"
        if obj.voice_note: return "🎤 Cod"
        if obj.document: return "📄 Document"
        return "💬 Qoraal"

# ==========================================
# 5. STATUS ADMIN
# ==========================================
@admin.register(Status)
class StatusAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'is_active_status')
    list_filter = ('created_at', 'user')

    def is_active_status(self, obj):
        return obj.is_active
    is_active_status.boolean = True

# ==========================================
# 6. CONTACT REQUESTS
# ==========================================
@admin.register(ContactRequest)
class ContactRequestAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_system_id', 'status')
    list_editable = ('status',)
    search_fields = ('from_user__username', 'to_system_id')

# ==========================================
# 7. VIEWS & STICKERS
# ==========================================
@admin.register(StatusView)
class StatusViewAdmin(admin.ModelAdmin):
    list_display = ('status', 'viewer', 'viewed_at')

@admin.register(FavoriteSticker)
class FavoriteStickerAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')