const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

const servers = [
    { host: 'mintifun.aternos.me', port: 56469 },
    { host: 'norvexmc.aternos.me', port: 37993 }
];

// Kimlik ve İsim Havuzu
const namePrefixes = ['Pro', 'Dark', 'Shadow', 'Neo', 'Cyber', 'Mega', 'Ultra', 'Fast', 'Ghost', 'Legend', 'Kral', 'Reis'];
const nameSuffixes = ['Gamer', 'Craft', 'Player', 'Boy', 'King', 'Lord', 'Ninja', 'Warrior', 'Hero', 'Master', 'Pro'];

function generateAIIdentity() {
    const prefix = namePrefixes[Math.floor(Math.random() * namePrefixes.length)];
    const suffix = nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)];
    const number = Math.floor(Math.random() * 89999 + 10000);
    return `${prefix}${suffix}_${number}`;
}

// Tamamen Algoritmik ve Dinamik Ceyran Eden Chat Üretici (Kod içinde düz metin görünmez)
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

    const selectedFunc = variations[Math.floor(Math.random() * variations.length)];
    return selectedFunc();
}

// Akıcı Fare Hareketi (Smooth Mouse Matrisi)
function aiSmoothLook(bot, targetYaw, targetPitch, durationMs) {
    return new Promise((resolve) => {
        const startYaw = bot.entity.yaw;
        const startPitch = bot.entity.pitch;
        const startTime = Date.now();

        const interval = setInterval(() => {
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
        console.log(`[AI-CORE] ${serverInfo.host} için profil oluşturuldu -> ${botName}`);

        const bot = mineflayer.createBot({
            host: serverInfo.host,
            port: serverInfo.port,
            username: botName,
            version: false
        });

        bot.loadPlugin(pathfinder);

        let activeRoutines = [];
        let isSessionClosed = false;

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

        const watchdog = setTimeout(closeSession, 45000);
        activeRoutines.push(watchdog);

        bot.once('spawn', async () => {
            console.log(`[AI-CORE] Oyuna giriş yapıldı. Dinamik motor aktif.`);

            const movements = new Movements(bot);
            movements.canDig = false;
            bot.pathfinder.setMovements(movements);

            // 1. Görüş / Bakış Döngüsü
            const visionRoutine = setInterval(async () => {
                if (isSessionClosed) return;
                const dynamicYaw = bot.entity.yaw + (Math.random() - 0.5) * 3.14;
                const dynamicPitch = (Math.random() - 0.5) * 0.6;
                await aiSmoothLook(bot, dynamicYaw, dynamicPitch, 1000);
            }, 3500);
            activeRoutines.push(visionRoutine);

            // 2. Otonom Hareket ve Reaksiyon Döngüsü
            const actionRoutine = setInterval(() => {
                if (isSessionClosed) return;

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

                // Dinamik türetilen mesajları gönder
                if (Math.random() > 0.5) {
                    const generatedMessage = generateDynamicChat(bot);
                    try {
                        bot.chat(generatedMessage);
                    } catch (e) {}
                }

                if (Math.random() > 0.6) {
                    try {
                        bot.swingArm('right');
                    } catch (e) {}
                }

            }, 4000);
            activeRoutines.push(actionRoutine);

            bot.on('chat', (username, message) => {
                if (username === bot.username) return;
                if (Math.random() > 0.7) {
                    setTimeout(() => {
                        try {
                            bot.chat(`aleykümselam ${username}`);
                        } catch (e) {}
                    }, 2000);
                }
            });
        });

        bot.on('error', (err) => {
            console.log(`[AI-ERROR] ${serverInfo.host} hata:`, err.message);
            closeSession();
        });

        bot.on('kicked', (reason) => {
            console.log(`[AI-KICK] ${serverInfo.host} atıldı:`, reason);
            closeSession();
        });
    });
}

async function startAIPipeline() {
    for (const server of servers) {
        await runAIBotInstance(server);
        await new Promise(r => setTimeout(r, 5000));
    }
    console.log("[AI-CORE] Tüm işlemler tamamlandı.");
    process.exit(0);
}

startAIPipeline();
