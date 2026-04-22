/* static/js/status.js */

/**
 * STATUS.JS - Maamulka Daawashada Xaaladaha (WhatsApp Status Viewer)
 * Kani waa koodhkii midaysnaa ee Reply-ga, Love-ka, iyo Animation-ka.
 */

// 1. Hubinta Doornayaasha (Variables) si aanay laba jeer u qeexmin
if (typeof statusQueue === 'undefined') {
    var statusQueue = [];
    var currentIndex = 0;
    var isPaused = false;
    var progress = 0;
    var duration = 5000;
    var startTime = null;
    var pausedAt = 0;
    var animFrame = null;
}

/**
 * 2. Bilaabista Daawashada Status-ka
 */
function startStatusSequence(statuses) {
    if (!statuses || statuses.length === 0) return;
    
    statusQueue = statuses;
    currentIndex = 0;
    isPaused = false;
    
    const viewer = document.getElementById('statusViewer');
    if (viewer) {
        viewer.style.display = 'block';
        setupProgressBars();
        showStatus();
    }
}

/**
 * 3. Diyaarinta Progress Bars-ka (Khadadka sare)
 */
function setupProgressBars() {
    const container = document.getElementById('progressBarContainer');
    if (!container) return;

    container.innerHTML = '';
    statusQueue.forEach((_, i) => {
        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        bar.innerHTML = `<div class="progress-fill" id="fill-${i}"></div>`;
        container.appendChild(bar);
    });
}

/**
 * 4. Soo Bandhigista Status-ka Hadda taagan
 */
function showStatus() {
    cancelAnimationFrame(animFrame);
    const contentArea = document.getElementById('contentArea');
    const metaArea = document.getElementById('metaArea');
    const current = statusQueue[currentIndex];

    if (!current) {
        closeStatus();
        return;
    }

    // Cusboonaysii Avatar-ka iyo Magaca
    const avatarImg = document.getElementById('viewerAvatar');
    const nameEl = document.getElementById('viewerName');
    if(avatarImg) avatarImg.src = current.user_img || '/static/images/default.jpg';
    if(nameEl) nameEl.innerText = current.user_name;
    
    // Server-ka u sheeg in la daawaday
    fetch(`/status/viewed/${current.id}/`).catch(err => console.log("Mark viewed error"));

    // Maamul muqaalka Reply-ga iyo Reactions-ka
    const replyBox = document.getElementById('replyBox');
    const reactionArea = document.getElementById('reactionArea');
    if(replyBox) replyBox.style.display = current.can_delete ? 'none' : 'flex';
    if(reactionArea) reactionArea.style.display = current.can_delete ? 'none' : 'flex';

    // Hagaaji Progress Bars-ka
    statusQueue.forEach((_, i) => {
        const fill = document.getElementById(`fill-${i}`);
        if (fill) fill.style.width = i < currentIndex ? '100%' : '0%';
    });

    contentArea.innerHTML = '';
    if(metaArea) metaArea.innerHTML = '';

    // Tirada daawatay (Views) haddii aad adigu leedahay
    if (current.can_delete && metaArea) {
        metaArea.innerHTML = `
            <div style="cursor:pointer; background:rgba(0,0,0,0.6); padding:5px 15px; border-radius:20px;" 
                 onclick="alert('Seen by: ${current.viewers_names || 'No one yet'}')">
                👁️ ${current.view_count} views
            </div>
            <a href="/status/delete/${current.id}/" class="delete-btn" style="color:white; margin-left:15px; text-decoration:none;">Delete</a>
        `;
    }

    // Noocyada kala duwan ee Status-ka
    if (current.type === 'video' && current.url && current.url !== '#') {
        contentArea.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                <video id="statusVideo" src="${current.url}" autoplay playsinline style="max-width:100%; max-height:100%;"></video>
                ${current.text ? `<div class="status-caption">${current.text}</div>` : ''}
            </div>`;
        const vid = document.getElementById('statusVideo');
        if (vid) {
            vid.onloadedmetadata = () => startAnimation(vid.duration * 1000);
            vid.onended = nextStatus;
            vid.onerror = () => startAnimation(5000);
        }
    } 
    else if (current.type === 'image' && current.url && current.url !== '#') {
        contentArea.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                <img src="${current.url}" style="max-width:100%; max-height:100%; object-fit:contain;">
                ${current.text ? `<div class="status-caption">${current.text}</div>` : ''}
            </div>`;
        startAnimation(5000);
    } 
    else {
        contentArea.innerHTML = `<div class="text-status-display" style="background-color: ${current.bg_color || '#075E54'}; display:flex; align-items:center; justify-content:center; text-align:center; padding:20px; font-size:1.5rem; color:white; height:100%; width:100%;">
            ${current.text || ''}
        </div>`;
        startAnimation(5000);
    }
}

/**
 * 5. Animation Logic (Maamulka Progress-ka)
 */
function animate() {
    if (!isPaused) {
        let now = performance.now();
        let elapsed = now - startTime + pausedAt;
        progress = (elapsed / duration) * 100;
        
        const fill = document.getElementById(`fill-${currentIndex}`);
        if (fill) fill.style.width = Math.min(progress, 100) + '%';

        if (progress < 100) {
            animFrame = requestAnimationFrame(animate);
        } else {
            nextStatus();
        }
    }
}

function startAnimation(d) {
    duration = d || 5000;
    progress = 0;
    pausedAt = 0;
    startTime = performance.now();
    isPaused = false;
    animate();
}

/**
 * 6. Controls (Pause/Resume/Next/Prev)
 */
function pauseStatus() {
    if (isPaused) return;
    isPaused = true;
    pausedAt += performance.now() - startTime;
    cancelAnimationFrame(animFrame);
    const vid = document.getElementById('statusVideo');
    if (vid) vid.pause();
}

function resumeStatus() {
    if (!isPaused || document.activeElement === document.getElementById('replyInput')) return;
    isPaused = false;
    startTime = performance.now();
    const vid = document.getElementById('statusVideo');
    if (vid) vid.play();
    animate();
}

function nextStatus() {
    cancelAnimationFrame(animFrame);
    if (currentIndex < statusQueue.length - 1) {
        currentIndex++;
        showStatus();
    } else {
        closeStatus();
    }
}

function prevStatus() {
    cancelAnimationFrame(animFrame);
    if (currentIndex > 0) {
        currentIndex--;
        showStatus();
    } else {
        showStatus();
    }
}

function closeStatus() {
    cancelAnimationFrame(animFrame);
    const viewer = document.getElementById('statusViewer');
    if(viewer) viewer.style.display = 'none';
    const vid = document.getElementById('statusVideo');
    if (vid) vid.pause();
}

/**
 * 7. Reaction (Love) & Reply Logic
 */
function sendLove() {
    const current = statusQueue[currentIndex];
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    
    if (!current) return;

    const formData = new FormData();
    formData.append('reply_text', 'Reacted ❤️ to status');
    formData.append('is_love', 'true');

    fetch(`/reply-to-status/${current.id}/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken },
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            const btn = document.querySelector('.love-btn');
            if (btn) {
                btn.style.transform = "scale(2)";
                setTimeout(() => btn.style.transform = "scale(1)", 300);
            }
            console.log("Love reaction sent!");
        }
    });
}

function sendReply() {
    const current = statusQueue[currentIndex];
    const input = document.getElementById('replyInput');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    if (!current || !input || !input.value.trim()) return;

    const formData = new FormData();
    formData.append('reply_text', input.value);
    formData.append('is_love', 'false');

    fetch(`/reply-to-status/${current.id}/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken },
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            input.value = "";
            resumeStatus();
            alert("Fariinta waa la diray!");
            closeStatus();
        }
    });
}