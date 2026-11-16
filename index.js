const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const sock = makeWASocket({ logger: pino({ level: 'silent' }), auth: state, printInTerminal: true });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (u) => {
        const { connection, lastDisconnect } = u;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) start();
        } else if (connection === 'open') {
            console.log('KYZER BOT ONLINE 🔥');
        }
    });
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const from = msg.key.remoteJid;
        if (text.toLowerCase() === '.ping') {
            await sock.sendMessage(from, { text: 'KYZER BOT ONLINE 🔥 Pong!' });
        }
        if (text.toLowerCase() === '.menu') {
            await sock.sendMessage(from, { text: 'KYZER BOT MENU\n\n.ping - Check bot\n.menu - Menu' });
        }
    });
}
start();
