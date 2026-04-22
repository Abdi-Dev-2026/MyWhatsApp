/**
 * STARRED_MESSAGES.JS - Maamulka fariimaha calaamadsan
 */

document.addEventListener("DOMContentLoaded", function() {
    console.log("Starred Messages System Active");
});

/**
 * 1. Ka saarista fariinta calaamadda (Unstar)
 */
function unstarMessage(msgId) {
    // CSRF Token-ka ka soo qaado HTML-ka
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch('/toggle-star-message/', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded', 
            'X-CSRFToken': csrfToken 
        },
        body: 'message_id=' + msgId
    })
    .then(res => res.json())
    .then(data => {
        if (data.action === 'removed' || data.status === 'success') {
            const item = document.getElementById('fav-item-' + msgId);
            if (item) {
                // Animation qurux badan
                item.style.transition = 'all 0.4s ease';
                item.style.opacity = '0';
                item.style.transform = 'translateX(50px)';
                
                setTimeout(() => {
                    item.remove();
                    // Haddii waxba soo harayn, reload gareey si Empty State-ku u soo baxo
                    const remainingItems = document.querySelectorAll('.starred-item');
                    if (remainingItems.length === 0) {
                        location.reload();
                    }
                }, 400);
            }
        }
    })
    .catch(err => {
        console.error("Unstar error:", err);
    });
}

/**
 * 2. Koobiyeynta qoraalka (Copy Text)
 */
function copyStarredText(event, msgId) {
    const textElement = document.getElementById('text-' + msgId);
    if (!textElement) return;

    const text = textElement.innerText;
    const btn = event.currentTarget; // Badanka hadda la taabtay

    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined">done</span> Copied!';
        btn.style.color = "#00a884";

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.color = "";
        }, 2000);
    }).catch(err => {
        console.error('Copy failed', err);
    });
}

/**
 * 3. Video & Audio Playback Optimization
 * Markii mid la shido, kuwa kale ha istaageen
 */
document.addEventListener('play', function(e){
    var mediaElements = document.querySelectorAll('video, audio');
    for(var i = 0, len = mediaElements.length; i < len;i++){
        if(mediaElements[i] != e.target){
            mediaElements[i].pause();
        }
    }
}, true);