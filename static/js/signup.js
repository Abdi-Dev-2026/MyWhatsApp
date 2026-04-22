/* static/js/signup.js */

/**
 * SIGNUP.JS - Maamulka diiwaangelinta akoonada cusub
 */

document.addEventListener("DOMContentLoaded", function() {
    const signupForm = document.querySelector('form');
    const fullNameInput = document.querySelector('input[name="full_name"]');
    const phoneInput = document.querySelector('input[name="phone"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const submitBtn = document.querySelector('button[type="submit"]');

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            let errors = [];

            // 1. Hubi Magaca (Waa inuu ugu yaraan ka kooban yahay laba kalmadood)
            const nameValue = fullNameInput.value.trim();
            if (nameValue.split(' ').length < 2) {
                errors.push("Fadlan geli magacaaga oo dhamaystiran.");
                fullNameInput.style.borderColor = "#f25c5c";
            } else {
                fullNameInput.style.borderColor = "transparent";
            }

            // 2. Hubi Nambarka (Nambaro kaliya iyo dhererka)
            const phoneValue = phoneInput.value.trim();
            if (isNaN(phoneValue) || phoneValue.length < 6) {
                errors.push("Nambarka taleefanku waa inuu noqdaa nambar sax ah.");
                phoneInput.style.borderColor = "#f25c5c";
            } else {
                phoneInput.style.borderColor = "transparent";
            }

            // 3. Hubi Password-ka (Awoodda Password-ka)
            if (passwordInput.value.length < 6) {
                errors.push("Password-ku waa inuu ka koobnaadaa ugu yaraan 6 xaraf.");
                passwordInput.style.borderColor = "#f25c5c";
            } else {
                passwordInput.style.borderColor = "transparent";
            }

            // Haddii ay jiraan qaladaad, jooji dirista foomka
            if (errors.length > 0) {
                e.preventDefault();
                alert(errors.join("\n"));
                return;
            }

            // 4. Visual Feedback (Marka uu submit dhaco)
            submitBtn.disabled = true;
            submitBtn.innerText = "Diiwaangelintu way socotaa...";
            submitBtn.style.opacity = "0.7";
            submitBtn.style.cursor = "not-allowed";
        });
    }

    // 5. Nadiifi midabka cas (border-ka) marka qofku bilaabo qoraalka
    const allInputs = [fullNameInput, phoneInput, passwordInput];
    allInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.style.borderColor === "rgb(242, 92, 92)") { // #f25c5c
                input.style.borderColor = "var(--wa-green)";
            }
        });
    });
});

/**
 * 6. Error Message Auto-hide
 * Haddii server-ka uu soo celiyo qalad (sida nambar hore loo isticmaalay)
 */
const serverError = document.querySelector('.error-msg');
if (serverError) {
    setTimeout(() => {
        serverError.style.transition = "all 0.8s ease";
        serverError.style.opacity = "0";
        serverError.style.transform = "translateY(-10px)";
        setTimeout(() => serverError.remove(), 800);
    }, 4000);
}