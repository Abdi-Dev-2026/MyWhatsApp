from django import forms
from .models import Status

class StatusForm(forms.ModelForm):
    class Meta:
        model = Status
        # Waxaan isticmaalay magacyada field-yada ee aad hadda haysato
        fields = ['text_content', 'image', 'video', 'bg_color']
        
        # Halkan waxaan ku Somaliyeeyay Labels-ka (Magacyada u muuqanaya qofka)
        labels = {
            'text_content': 'Maxaad ku fekeraysaa? (Qoraal)',
            'image': 'Dooro Sawir (Ikhtiyaari)',
            'video': 'Dooro Muuqaal (Ikhtiyaari)',
            'bg_color': 'Midabka Qoraalka (Wuxuu u shaqeeyaa qoraalka kaliya)',
        }
        
        widgets = {
            'text_content': forms.Textarea(attrs={
                'class': 'status-input',
                'placeholder': 'Qor waxa aad dareemayso...',
                'rows': 3,
                'style': 'width: 100%; border-radius: 10px; padding: 10px; border: 1px solid #00a884; background: #202c33; color: white;'
            }),
            'bg_color': forms.TextInput(attrs={
                'type': 'color', 
                'class': 'color-picker',
                'style': 'width: 50px; height: 50px; border: none; background: transparent; cursor: pointer;'
            }),
        }

    # Hubinta xajmiga video-ga (Validation)
    def clean_video(self):
        video = self.cleaned_data.get('video')
        if video:
            if video.size > 20 * 1024 * 1024:  # 20MB
                raise forms.ValidationError("Faylka video-ga aad ayuu u weyn yahay. Fadlan soo rida mid ka yar 20MB.")
        return video