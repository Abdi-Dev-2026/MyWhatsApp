async function sendMessage(msgText) {
    if (!navigator.onLine) {
        // 1. Ku kaydi fariinta IndexedDB (sidii aan horay u sameynay)
        await saveMessageOffline("Me", msgText, new Date());

        // 2. Isku diiwaangeli Background Sync
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('send-offline-messages');
            console.log("Sync ayaa la qorsheeyey!");
        }
    } else {
        // Halkan geli koodhkaaga caadiga ah ee WebSocket-ka fariinta ku dira
    }
}