/* static/js/quiz.js */

/**
 * QUIZ.JS - Maamulka Tartanka Aqoonta (Challenge)
 */

document.addEventListener("DOMContentLoaded", function() {
    console.log("Quiz System Ready...");
    
    // Marka qofku doorto option, ka saar wixii digniin ah
    const options = document.querySelectorAll('.option-item');
    options.forEach(item => {
        item.addEventListener('click', function() {
            const card = this.closest('.question-card');
            card.style.borderColor = "#00a884"; // Ku celi cagaarka caadiga ah
        });
    });
});

/**
 * Hubinta Natiijada Tartanka
 */
function checkResults() {
    const form = document.getElementById('quizForm');
    if (!form) return;

    const questions = form.querySelectorAll('.question-card');
    let score = 0;
    let total = questions.length;
    let answeredAll = true;

    questions.forEach((card, index) => {
        const radios = card.querySelectorAll('input[type="radio"]');
        const selected = card.querySelector('input[type="radio"]:checked');
        
        if (selected) {
            const userAnswer = selected.value;
            const correctAnswer = selected.getAttribute('data-correct');
            
            // 1. Hubi haddii uu saxay ama qalday
            if (userAnswer === correctAnswer) {
                score++;
                selected.parentElement.style.background = "rgba(0, 168, 132, 0.2)"; // Cagaar khafiif ah
                selected.parentElement.style.borderColor = "#00a884";
            } else {
                selected.parentElement.style.background = "rgba(242, 92, 92, 0.2)"; // Casaan khafiif ah
                selected.parentElement.style.borderColor = "#f25c5c";
                
                // Tus jawaabta saxda ahayd (Optional)
                radios.forEach(r => {
                    if (r.value === correctAnswer) {
                        r.parentElement.style.border = "1px dashed #00a884";
                    }
                });
            }
        } else {
            answeredAll = false;
            card.style.borderColor = "#f25c5c"; // Cadey in su'aashan la dhaafay
        }
    });

    // 2. Haddii uu su'aalo ka tagay ogeysii
    if (!answeredAll) {
        alert("Fadlan dhammaan su'aalaha ka jawaab ka hor intaanad gudbin!");
        return;
    }

    // 3. Curyaami badanka si aan laba jeer loo riixin
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Natiijada waa la xisaabinayaa...";
    }

    // 4. Tus natiijada kama dambaysta ah
    setTimeout(() => {
        let message = "";
        const boqolkiiba = (score / total) * 100;

        if (boqolkiiba === 100) {
            message = "Masha Allah! Waxaad dhalisay dhibcaha ugu sarreeya! 🏆";
        } else if (boqolkiiba >= 50) {
            message = "Guul! Waxaad gudubtay imtixaanka. 👍";
        } else {
            message = "Iska yara dadaal, mar kale isku day. 😊";
        }

        alert(`${message}\n\nNatiijadaada waa: ${score} / ${total}`);
        
        // 5. Dib u celi (Back to Dashboard)
        window.location.href = "/";
    }, 800);
}