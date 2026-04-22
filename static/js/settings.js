/* static/js/settings.js */

/**
 * SETTINGS.JS - Maamulka Profile-ka iyo Macluumaadka Isticmaalaha
 */

document.addEventListener("DOMContentLoaded", function() {
    const settingsForm = document.querySelector('form');
    const imageInput = document.querySelector('input[name="profile_image"]');
    const profileImgTag = document.querySelector('.profile-img');
    const nameInput = document.querySelector('input[name="full_name"]');
    const submitBtn = document.querySelector('button[type="submit"]');

    /**
     * 1. IMAGE PREVIEW - Tus sawirka cusub ka hor intaan la upload-gareyn
     */
    if (imageInput && profileImgTag) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                // Hubi inuu yahay sawir
                if (!file.type.startsWith('image/')) {
                    alert("Fadlan dooro fayl sawir ah (JPG, PNG, GIF)!");
                    this.value = "";
                    return;
                }

                // Hubi cabbirka sawirka (Tusaale: ha dhaafin 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert("Sawirku aad buu u weyn yahay. Fadlan dooro sawir ka yar 5MB.");
                    this.value = "";
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    profileImgTag.src = e.target.result;
                    // Animation yar oo muujinaya in sawirku isbeddelay
                    profileImgTag.style.transition = "transform 0.3s ease";
                    profileImgTag.style.transform = "scale(1.1)";
                    setTimeout(() => { profileImgTag.style.transform = "scale(1)"; }, 300);
                }
                reader.readAsDataURL(file);
            }
        });
    }

    /**
     * 2. FORM VALIDATION & SUBMISSION
     */
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            // Hubi in magacu uusan marnayn
            if (nameInput && nameInput.value.trim() === "") {
                e.preventDefault();
                alert("Magaca ma jiri karo isagoo madan.");
                nameInput.focus();
                return;
            }

            // Visual Feedback marka la riixo Save
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Waa la kaydinayaa...";
                submitBtn.style.opacity = "0.7";
                submitBtn.style.cursor = "wait";
            }
        });
    }

    /**
     * 3. INTERACTIVE UI - Focus effects
     */
    if (settingsForm) {
        const inputs = settingsForm.querySelectorAll('input[type="text"], textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.backgroundColor = "#32444f";
                input.style.transition = "background-color 0.3s ease";
            });
            input.addEventListener('blur', () => {
                input.style.backgroundColor = "#2a3942";
            });
        });
    }
});