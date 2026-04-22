/**
 * SEARCH.JS - Maamulka raadinta dadka cusub (Version Sax ah)
 */

document.addEventListener("DOMContentLoaded", function() {
    const searchForm = document.querySelector('form');
    // Waxaan u beddelnay 'target_id' si uu ula mid noqdo HTML-ka cusub
    const targetInput = document.querySelector('input[name="target_id"]');
    const searchBtn = document.querySelector('button[type="submit"]');

    if (searchForm && targetInput) {
        searchForm.addEventListener('submit', function(e) {
            const targetValue = targetInput.value.trim();

            // 1. Hubi in wax la geliyay (Validation)
            if (targetValue === "") {
                e.preventDefault();
                alert("Fadlan geli ID-ga qofka aad raadinayso.");
                targetInput.focus();
                return;
            }

            // 2. Hubi dhererka ID-ga (Si looga fogaado raadin madhan)
            if (targetValue.length < 2) {
                e.preventDefault();
                alert("ID-gu waa inuu ka koobnaadaa ugu yaraan 2 xaraf.");
                targetInput.focus();
                return;
            }

            // 3. Visual Feedback: Muuji in raadintu socoto
            searchBtn.disabled = true;
            searchBtn.innerText = "Raadinayaa...";
            searchBtn.style.opacity = "0.7";
            searchBtn.style.cursor = "wait";
        });
    }

    // 4. Input Focus Effect: Si loo dareemo inuu yahay "Interactive"
    if (targetInput) {
        targetInput.addEventListener('focus', () => {
            targetInput.style.transform = "scale(1.02)";
            targetInput.style.transition = "transform 0.3s ease";
        });

        targetInput.addEventListener('blur', () => {
            targetInput.style.transform = "scale(1)";
        });
    }
});

/**
 * 5. Error Message Fade Out
 * Haddii fariin error ah ay ka timaado server-ka, ka baabi'i 5 ilbiriqsi ka dib.
 */
const errorMsg = document.querySelector('.error-msg');
if (errorMsg) {
    setTimeout(() => {
        errorMsg.style.transition = "opacity 1s ease";
        errorMsg.style.opacity = "0";
        setTimeout(() => errorMsg.remove(), 1000);
    }, 5000);
}