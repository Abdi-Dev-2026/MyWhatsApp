/* static/js/upload_status.js */

/**
 * UPLOAD_STATUS.JS - Maamulka abuurista status-ka cusub
 */

document.addEventListener("DOMContentLoaded", function() {
    const statusForm = document.querySelector('form');
    const textInput = document.querySelector('textarea');
    const imageInput = document.querySelector('input[type="file"][name="image"]');
    const videoInput = document.querySelector('input[type="file"][name="video"]');
    const colorInput = document.querySelector('input[type="color"]');
    const submitBtn = document.querySelector('.btn-submit');

    /**
     * 1. Hubinta Cabbirka Faylka (File Size Validation)
     * Waxaan xaddidnay muuqaalka inuu ka yaraado 20MB
     */
    if (videoInput) {
        videoInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file && file.size > 20 * 1024 * 1024) { // 20MB
                alert("Muuqaalku aad buu u weyn yahay! Fadlan dooro mid ka yar 20MB.");
                this.value = ""; // Ka saar faylka la doortay
            }
        });
    }

    /**
     * 2. Isku-xirnaanta Qoraalka iyo Midabka
     * Haddii qofku sawir doorto, midabka background-ka muhiim ma ahan
     */
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            if (this.files[0]) {
                videoInput.value = ""; // Ka saar muuqaalkii hore haddii sawir la doorto
                console.log("Sawir ayaa la doortay, muuqaalkii waa laga saaray.");
            }
        });
    }

    if (videoInput) {
        videoInput.addEventListener('change', function() {
            if (this.files[0]) {
                imageInput.value = ""; // Ka saar sawirkii hore haddii muuqaal la doorto
                console.log("Muuqaal ayaa la doortay, sawirkii waa laga saaray.");
            }
        });
    }

    /**
     * 3. Form Submission Handling
     */
    if (statusForm) {
        statusForm.addEventListener('submit', function(e) {
            const hasText = textInput.value.trim().length > 0;
            const hasImage = imageInput && imageInput.files.length > 0;
            const hasVideo = videoInput && videoInput.files.length > 0;

            // Hubi in ugu yaraan hal wax la dirayo
            if (!hasText && !hasImage && !hasVideo) {
                e.preventDefault();
                alert("Fadlan wax ku qor ama soo geli sawir/muuqaal si aad u dhajiso status.");
                return;
            }

            // Visual Feedback
            submitBtn.disabled = true;
            submitBtn.innerText = "WAA LA DHAJIYAA...";
            submitBtn.style.background = "#005a4e";
            submitBtn.style.cursor = "wait";
        });
    }

    /**
     * 4. Color Picker Interaction
     * U tusi qofka midabka uu doortay dhabarka (Preview)
     */
    if (colorInput && textInput) {
        colorInput.addEventListener('input', function() {
            // Haddii aysan sawir/muuqaal jirin, qoraalka dhabarkiisa u tusi midabka
            if (!imageInput.files[0] && !videoInput.files[0]) {
                textInput.style.backgroundColor = this.value;
            }
        });
    }
});