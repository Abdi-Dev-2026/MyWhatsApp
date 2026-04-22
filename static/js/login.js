/**
 * LOGIN.JS - Maamulka soo gelitaanka akoonka (Version Sax ah)
 */

document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.querySelector('form');
    // Waxaan u beddelnay 'system_id' maadaama views-kaaga uu saas raadinayo
    const idInput = document.querySelector('input[name="system_id"]') || document.querySelector('input[name="phone"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const submitBtn = document.querySelector('button[type="submit"]');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            
            // 1. Hubi in ID-ga uusan madnayn (Wuxuu aqbalayaa B1, B2, iwm)
            const idValue = idInput.value.trim();
            if (idValue === "" || idValue.length < 2) {
                e.preventDefault();
                alert("Fadlan geli ID-gaaga saxda ah (Tusaale: B1).");
                idInput.focus();
                return;
            }

            // 2. Hubi in password-ku uusan madnayn
            if (passwordInput.value.length < 4) {
                e.preventDefault();
                alert("Password-ku waa inuu ka badnaadaa 4 xaraf.");
                passwordInput.focus();
                return;
            }

            // 3. Muuji in shaqadu socoto (Visual Feedback)
            submitBtn.disabled = true;
            submitBtn.innerText = "Soo gelayaa...";
            submitBtn.style.opacity = "0.7";
            submitBtn.style.cursor = "not-allowed";
        });
    }

    // 4. Kordhinta khibradda (Input focus effects)
    if (idInput && passwordInput) {
        const inputs = [idInput, passwordInput];
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.transform = "scale(1.01)";
                input.style.transition = "transform 0.2s ease";
            });
            input.addEventListener('blur', () => {
                input.style.transform = "scale(1)";
            });
        });
    }
});

/**
 * 5. Error Message Fade Out
 */
const errorMsg = document.querySelector('.error-msg');
if (errorMsg) {
    setTimeout(() => {
        errorMsg.style.transition = "opacity 1s ease";
        errorMsg.style.opacity = "0";
        setTimeout(() => errorMsg.remove(), 1000);
    }, 5000);
}