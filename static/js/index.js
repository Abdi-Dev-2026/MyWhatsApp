/* static/js/index.js */

/**
 * INDEX.JS - Wuxuu maamulaa Dashboard-ka iyo Billboard-ka 3D
 */

document.addEventListener("DOMContentLoaded", function() {
    console.log("WhatsApp Index Loaded...");
    
    // Hubi haddii uu jiro video billboard ah si loogu diyaariyo tijaabo
    const bgVideo = document.getElementById('bg-video');
    if (bgVideo) {
        // Marmarka qaarkood browser-ka ayaa u baahan in video-ga 
        // la iska hubiyo inuu si toos ah u shaqaynayo
        bgVideo.play().catch(error => {
            console.log("Autoplay waxaa hor istaagay browser-ka.");
        });
    }
});

/**
 * 1. TOGGLE MUTE - Maamulka codka video-ga billboard-ka
 */
function toggleMute() {
    const video = document.getElementById('bg-video');
    const icon = document.getElementById('vol-icon');
    
    if (video) {
        if (video.muted) {
            video.muted = false;
            icon.innerText = "volume_up";
            console.log("Codka waa la shiday");
        } else {
            video.muted = true;
            icon.innerText = "volume_off";
            console.log("Codka waa la damiyey");
        }
    }
}

/**
 * 2. TOGGLE BILLBOARD - Qari ama tus background-ka oo dhan
 */
function toggleBillboard() {
    const bb = document.getElementById('global-billboard');
    if (bb) {
        if (bb.style.opacity === '0') {
            bb.style.opacity = '1';
            bb.style.zIndex = '-1'; // Dib ugu celi background-ka
        } else {
            bb.style.opacity = '0';
        }
    }
}

/**
 * 3. FOCUS MODE - Qari chat-ka si aad u aragto billboard-ka oo kaliya
 */
function focusBillboard() {
    const app = document.querySelector('.app-container');
    const icon = document.getElementById('focus-icon');
    
    if (app) {
        if (app.style.display === 'none') {
            app.style.display = 'block';
            icon.innerText = "fullscreen";
            // Dib u soo celi brightness-ka videoga haddii loo baahdo
            document.querySelectorAll('.media-layer').forEach(el => {
                el.style.filter = "brightness(0.4)";
            });
        } else {
            app.style.display = 'none';
            icon.innerText = "fullscreen_exit";
            // Marka focus mode la galo, iftiinka video-ga kordhi
            document.querySelectorAll('.media-layer').forEach(el => {
                el.style.filter = "brightness(1)";
            });
        }
    }
}

/**
 * 4. SEARCH & NAVIGATION (Kordhin mustaqbalka)
 * Halkan waxaad ku dari kartaa animations-ka marka bogga la furayo
 */
const chatItems = document.querySelectorAll('.chat-item');
chatItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = "rgba(42, 57, 66, 0.8)";
    });
    item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = "rgba(17, 27, 33, 0.6)";
    });
});