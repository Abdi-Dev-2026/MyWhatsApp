/* static/js/chat_room.js - FULLY FUNCTIONAL VERSION */

// --- 0. CONFIGURATION & WEBSOCKET ---
const chatSocket = new WebSocket(wsUrl);

// --- 1. GLOBAL VARIABLES ---
let currentMsgId = null;
let currentMsgText = "";
let mediaRecorder;
let audioChunks = [];

// WebRTC Variables
let localStream;
let peerConnection;
let isVideoCall = false;
const configuration = {
    iceServers: [
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' }
    ]
};

// --- 2. WEBSOCKET MAIN HANDLER ---
chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    
    // Fariimaha Caadiga ah
    if (data.type === 'chat_message') {
        location.reload(); 
    }

    // Signals-ka Wicitaanka (WebRTC)
    if (data.type === 'call_signal') {
        handleCallSignal(data);
    }

    // Reactions
    if (data.reaction) {
        console.log("Reaction la helay:", data.reaction);
    }
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

// --- 3. INITIALIZATION (DOM Ready) ---
document.addEventListener("DOMContentLoaded", function() {
    const container = document.querySelector('.message-container');
    if (container) container.scrollTop = container.scrollHeight;

    const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfInput) window.csrftoken = csrfInput.value;

    // Listeners for Call Buttons
    const videoBtn = document.getElementById('make-video-call');
    const audioBtn = document.getElementById('make-audio-call');
    if (videoBtn) videoBtn.addEventListener('click', () => startCall(true));
    if (audioBtn) audioBtn.addEventListener('click', () => startCall(false));
});

// Helper: Get CSRF Cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// --- 4. CHAT FORM & INPUTS ---
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message_text');

function autoSubmit() {
    if (chatForm) {
        if (chatSocket.readyState === WebSocket.OPEN) {
            chatSocket.send(JSON.stringify({ 'type': 'chat_message' }));
        }
        setTimeout(() => { chatForm.submit(); }, 100);
    }
}

if (messageInput) {
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (this.value.trim() !== "") chatForm.dispatchEvent(new Event('submit'));
        }
    });
}

if (chatForm) {
    chatForm.addEventListener('submit', function() {
        if (chatSocket.readyState === WebSocket.OPEN) {
            chatSocket.send(JSON.stringify({ 'type': 'chat_message' }));
        }
    });
}

function createSticker(input) {
    if (input.files && input.files[0]) {
        document.getElementById('is_sticker_val').value = "true";
        autoSubmit();
    }
}

// --- 5. CONTEXT MENU & REPLY LOGIC ---
function showStickerMenu(e, msgId, imgUrl, isSender, isSticker) {
    e.preventDefault();
    currentMsgId = msgId;
    const menu = document.getElementById('stickerMenu');
    const msgElement = document.getElementById('message-' + msgId);
    const textContent = msgElement.querySelector('.text-content');
    
    currentMsgText = textContent ? textContent.innerText : (isSticker === 'true' ? "Sticker" : "Media");

    menu.style.display = 'block';
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';

    const delEveryone = document.getElementById('deleteEveryoneBtn');
    if(delEveryone) delEveryone.style.display = (isSender === 'true') ? 'flex' : 'none';
}

function hideStickerMenu() {
    const menu = document.getElementById('stickerMenu');
    if (menu) menu.style.display = 'none';
}

function replyMsg() {
    const replyPreview = document.getElementById('replyPreview');
    const msgElement = document.getElementById('message-' + currentMsgId);
    if (!msgElement) return;
    const senderName = msgElement.getAttribute('data-sender-name');

    document.getElementById('reply_id_input').value = currentMsgId;
    document.getElementById('replyUser').innerText = "Replying to " + senderName;
    document.getElementById('replyText').innerText = currentMsgText;
    
    replyPreview.style.display = 'block';
    if (messageInput) messageInput.focus();
    hideStickerMenu();
}

// --- 6. VOICE RECORDING ---
const recordBtn = document.getElementById('record-btn');
if (recordBtn) {
    recordBtn.addEventListener('click', async () => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
                    const file = new File([audioBlob], "voice_note.mp3", { type: "audio/mpeg" });
                    const voiceInput = document.getElementById('voice_blob_input');
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    voiceInput.files = dataTransfer.files;
                    autoSubmit();
                };
                mediaRecorder.start();
                recordBtn.style.color = "red";
                recordBtn.innerText = "fiber_manual_record"; 
            } catch (err) { alert("Fadlan oggolow mic-ga."); }
        } else {
            mediaRecorder.stop();
            recordBtn.style.color = "#8696a0";
            recordBtn.innerText = "mic";
        }
    });
}

// --- 7. WEBRTC CALLING LOGIC (HAGAAJIN BUUXA) ---
const callOverlay = document.getElementById('call-overlay');
const callStatus = document.getElementById('call-status');

async function startCall(isVideo) {
    isVideoCall = isVideo;
    if (callOverlay) callOverlay.style.display = 'flex';
    if (callStatus) callStatus.innerText = "Wicitaan baa socda...";

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
        document.getElementById('localVideo').srcObject = localStream;
        
        // Fur weelka muuqaalka
        const videoContainer = document.getElementById('video-container');
        if (videoContainer) videoContainer.style.display = isVideo ? 'block' : 'none';

        await createPeerConnection();
        
        // Ku dar tracks-kaaga xiriirka
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        chatSocket.send(JSON.stringify({
            'type': 'call_signal',
            'action': 'offering',
            'offer': offer,
            'call_type': isVideo ? 'video' : 'audio'
        }));
    } catch (e) {
        console.error("Error starting call:", e);
        alert("Camera ama Mic lama heli karo.");
        endCall();
    }
}

async function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);

    // QABASHADA MUUQAALKA QOFKA KALE
    peerConnection.ontrack = (event) => {
        console.log("Track cusub ayaa ka yimid qofka kale...");
        const remoteVid = document.getElementById('remoteVideo');
        if (remoteVid) {
            remoteVid.srcObject = event.streams[0];
            // Hubi in weelka video-gu furan yahay haddii uu video yahay
            const videoContainer = document.getElementById('video-container');
            if (videoContainer && isVideoCall) videoContainer.style.display = 'block';
        }
        callStatus.innerText = "Waa la isku xiray";
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            chatSocket.send(JSON.stringify({
                'type': 'call_signal',
                'action': 'candidate',
                'candidate': event.candidate
            }));
        }
    };
}

async function handleCallSignal(data) {
    if (data.action === 'offering') {
        if (callOverlay) callOverlay.style.display = 'flex';
        if (callStatus) callStatus.innerText = `Wicitaan ${data.call_type} ah...`;
        
        if (confirm(`Wicitaan ${data.call_type} ah ayaa kuu soo dhacay. Ma qabanaysaa?`)) {
            isVideoCall = (data.call_type === 'video');
            try {
                localStream = await navigator.mediaDevices.getUserMedia({ video: isVideoCall, audio: true });
                document.getElementById('localVideo').srcObject = localStream;
                
                const videoContainer = document.getElementById('video-container');
                if (videoContainer) videoContainer.style.display = isVideoCall ? 'block' : 'none';

                await createPeerConnection();
                localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
                
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                
                chatSocket.send(JSON.stringify({ 
                    'type': 'call_signal', 
                    'action': 'answering', 
                    'answer': answer 
                }));
            } catch (err) {
                console.error("Error answering call:", err);
                endCall();
            }
        } else {
            chatSocket.send(JSON.stringify({ 'type': 'call_signal', 'action': 'hangup' }));
            endCall();
        }
    } else if (data.action === 'answering') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.action === 'candidate') {
        if (peerConnection && data.candidate) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (e) { console.error("Error adding ice candidate", e); }
        }
    } else if (data.action === 'hangup') {
        endCall();
    }
}

function endCall() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    if (callOverlay) callOverlay.style.display = 'none';
    
    // Nadiifi muuqaalka element-yada
    const lv = document.getElementById('localVideo');
    const rv = document.getElementById('remoteVideo');
    if (lv) lv.srcObject = null;
    if (rv) rv.srcObject = null;
}

function endCallAction() {
    chatSocket.send(JSON.stringify({ 'type': 'call_signal', 'action': 'hangup' }));
    endCall();
}

// --- 8. UI HELPERS & MODALS ---
function openProfileModal(imgSrc) {
    const modal = document.getElementById("profileModal");
    const modalImg = document.getElementById("modalImg");
    if (modal) { modal.style.display = "flex"; modalImg.src = imgSrc; }
}

window.onclick = function(event) {
    if (!event.target.closest('.sticker-menu') && !event.target.closest('.msg')) hideStickerMenu();
    if (event.target.id === "profileModal") document.getElementById("profileModal").style.display = "none";
};
// 1. Furista Database-ka Browser-ka
const dbRequest = indexedDB.open("WhatsAppOfflineDB", 1);

dbRequest.onupgradeneeded = (event) => {
    let db = event.target.result;
    if (!db.objectStoreNames.contains("messages")) {
        db.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
    }
};

// 2. Shaqada Kaydinta Fariinta
function saveMessageOffline(sender, message, timestamp) {
    const dbRequest = indexedDB.open("WhatsAppOfflineDB", 1);
    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("messages", "readwrite");
        const store = transaction.objectStore("messages");
        store.add({ sender, message, timestamp });
    };
}

// 3. Shaqada soo bixinta fariimaha marka internet-ku go'an yahay
function loadOfflineMessages() {
    const dbRequest = indexedDB.open("WhatsAppOfflineDB", 1);
    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("messages", "readonly");
        const store = transaction.objectStore("messages");
        const getAll = store.getAll();

        getAll.onsuccess = () => {
            const messages = getAll.result;
            messages.forEach(msg => {
                // Halkan koodhkaaga fariinta shaashadda ku soo bandhiga geli
                console.log("Offline Msg:", msg.message);
            });
        };
    };
}
window.addEventListener('offline', () => {
    document.getElementById('status-bar').innerText = "Internet-ka ayaa kaa go'an (Offline Mode)";
    document.getElementById('status-bar').style.backgroundColor = "orange";
    loadOfflineMessages(); // Soo bandhig fariimihii hore ee ku kaydsanaa browser-ka
});

window.addEventListener('online', () => {
    document.getElementById('status-bar').innerText = "Online";
    document.getElementById('status-bar').style.backgroundColor = "#00a884";
});