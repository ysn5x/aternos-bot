const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

const servers = [
    { host: 'mintifun.aternos.me', port: 56469 },
    { host: 'norvexmc.aternos.me', port: 37993 }
];

const BOT_PASSWORD = "AternosBotPassword123!";

const namePrefixes = ['Pro', 'Dark', 'Shadow', 'Neo', 'Cyber', 'Mega', 'Ultra', 'Fast', 'Ghost', 'Legend', 'Kral', 'Reis'];
const nameSuffixes = ['Gamer', 'Craft', 'Player', 'Boy', 'King', 'Lord', 'Ninja', 'Warrior', 'Hero', 'Master', 'Pro'];

function generateAIIdentity() {
    const prefix = namePrefixes[Math.floor(Math.random() * namePrefixes.length)];
    const suffix = nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)];
    const number = Math.floor(Math.random() * 89999 + 10000);
    return `${prefix}${suffix}_${number}`;
}

function generateDynamicChat(botContext) {
    const subjects = ["bu sunucu", "aternos", "oyun", "survival", "bu harita", "spawn", "akşam", "lag"];
    const actions = ["çok iyi", "fenaymış", "sarıyor", "donuyor", "lag yapıyor", "10 numara", "değişikmiş"];
    const tags = ["dostlar", "hocam", "reis", "beyler", "kankalar", ""];
    
    const r1 = subjects[Math.floor(Math.random() * subjects.length)];
    const r2 = actions[Math.floor(Math.random() * actions.length)];
    const r3 = tags[Math.floor(Math.random() * tags.length)];

    const variations = [
        () => `sa ${r3}`.trim(),
        () => `${r1} ${r2} ${r3}`.trim(),
        () => `koordinat: ${botContext.entity ? Math.round(botContext.entity.position.x) : 0}, ${botContext.entity ? Math.round(botContext.entity.position.z) : 0}`,
        () => `/help`,
        () => `/spawn`,
        () => `fps drop giriyo bi secde edem ${r3}`.trim(),
        () => `şu ${r1} düzelse keşke`,
        () => `maden kazan var mı ${r3}?`
    ];

    return variations[Math.floor(Math.random() * variations.length)]();
}

function aiSmoothLook(bot, targetYaw, targetPitch, durationMs) {
    return new Promise((resolve) => {
        if (!bot || !bot.entity) return resolve();
        const startYaw = bot.entity.yaw;
        const startPitch = bot.entity.pitch;
        const startTime = Date.now();

        const interval = setInterval(() => {
            if (!bot || !bot.entity) {
                clearInterval(interval);
                return resolve();
            }
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            
            const ease = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const currentYaw = startYaw + (targetYaw - startYaw) * ease;
            const currentPitch = startPitch + (targetPitch - startPitch) * ease;

            bot.look(currentYaw, currentPitch, true).catch(() => {});

            if (progress >= 1) {
                clearInterval(interval);
                resolve();
            }
        }, 30);
    });
}

function runAIBotInstance(serverInfo) {
    return new Promise((resolve) => {
        const botName = generateAIIdentity();
        console.log(`[AI-CORE] ${serverInfo.host} için yeni oturum başlatılıyor -> ${botName}`);

        const bot = mineflayer.createBot({
            host: serverInfo.host,
            port: serverInfo.port,
            username: botName,
            version: false
        });

        bot.loadPlugin(pathfinder);

        let activeRoutines = [];
        let isSessionClosed = false;
        let isRegisteredOrLogged = false;
        let reconnectAttempts = 0;

        const closeSession = () => {
            if (isSessionClosed) return;
            isSessionClosed = true;
            activeRoutines.forEach(routine => clearInterval(routine));
            try {
                bot.quit();
            } catch (e) {}
            console.log(`[AI-CORE] ${serverInfo.host} oturumu sonlandırıldı.`);
            resolve();
        };

        // 35 saniye sonra güvenli çıkış
        const watchdog = setTimeout(closeSession, 35000);
        activeRoutines.push(watchdog);

        bot.once('spawn', async () => {
            console.log(`[AI-CORE] Oyuna giriş yapıldı (${botName}). Güvenlik ve Kimlik Doğrulama aktif.`);

            // Otomatik Login/Register ve Unban komut denemesi
            setTimeout(() => {
                if (!isRegisteredOrLogged) {
                    try {
                        bot.chat(`/register ${BOT_PASSWORD} ${BOT_PASSWORD}`);
                        bot.chat(`/login ${BOT_PASSWORD}`);
                        // Eğer önceki banlardan kalan bir engel durumu varsa otomatik unban/pardon komutları dener
                        bot.chat(`/pardon ${botName}`);
                        bot.chat(`/unban ${botName}`);
                    } catch (e) {}
                    isRegisteredOrLogged = true;
                }
            }, 2000);

            const movements = new Movements(bot);
            movements.canDig = false;
            bot.pathfinder.setMovements(movements);

            // 1. Görüş Döngüsü
            const visionRoutine = setInterval(async () => {
                if (isSessionClosed || !bot.entity) return;
                const dynamicYaw = bot.entity.yaw + (Math.random() - 0.5) * 3.14;
                const dynamicPitch = (Math.random() - 0.5) * 0.6;
                await aiSmoothLook(bot, dynamicYaw, dynamicPitch, 1000);
            }, 3500);
            activeRoutines.push(visionRoutine);

            // 2. Hareket ve Chat Döngüsü
            const actionRoutine = setInterval(() => {
                if (isSessionClosed || !bot.entity) return;

                const decisionRoll = Math.random();
                if (decisionRoll > 0.4 && decisionRoll < 0.8) {
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 350);
                } else if (decisionRoll >= 0.8) {
                    bot.setControlState('sneak', true);
                    setTimeout(() => bot.setControlState('sneak', false), 800);
                }

                if (bot.entity) {
                    const radius = 7;
                    const destX = bot.entity.position.x + (Math.random() - 0.5) * radius;
                    const destZ = bot.entity.position.z + (Math.random() - 0.5) * radius;

                    try {
                        bot.pathfinder.setGoal(new goals.GoalXZ(destX, destZ), false);
                    } catch (err) {
                        bot.setControlState('forward', true);
                        setTimeout(() => bot.setControlState('forward', false), 1500);
                    }
                }

                if (Math.random() > 0.5) {
                    try {
                        bot.chat(generateDynamicChat(bot));
                    } catch (e) {}
                }

                if (Math.random() > 0.6) {
                    try {
                        bot.swingArm('right');
                    } catch (e) {}
                }

            }, 4000);
            activeRoutines.push(actionRoutine);
        });

        bot.on('error', (err) => {
            console.log(`[AI-ERROR] ${serverInfo.host} bağlantı hatası:`, err.message);
            closeSession();
        });

        // KICK / BAN DURUMUNDA OTOMATİK YENİDEN BAĞLANMA (RETRY)
        bot.on('kicked', (reason) => {
            console.log(`[AI-KICK/BAN] ${serverInfo.host} sunucusundan atıldı:`, reason);
            
            // Eğer maksimum 2 kez kick yerdiyse farklı bir isimle anında tekrar bağlanmayı dene
            if (reconnectAttempts < 2) {
                reconnectAttempts++;
                console.log(`[RETRY] Farklı kimlikle yeniden bağlanma deneniyor (Deneme: ${reconnectAttempts})...`);
                isSessionClosed = true;
                activeRoutines.forEach(r => clearInterval(r));
                try { bot.quit(); } catch (e) {}
                
                // 3 saniye bekleyip aynı sunucuya tekrar bağlan
                setTimeout(() => {
                    runAIBotInstance(serverInfo).then(resolve);
                }, 3000);
            } else {
                closeSession();
            }
        });
    });
}

async function startAIPipeline() {
    for (const server of servers) {
        await runAIBotInstance(server);
        await new Promise(r => setTimeout(r, 5000));
    }
    console.log("[AI-CORE] Tüm sunucu döngüleri tamamlandı.");
    process.exit(0);
}

startAIPipeline();
