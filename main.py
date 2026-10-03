import time
from mcstatus import JavaServer

SERVERS = [
    "mintifun.aternos.me:56469",
    "norvexmc.aternos.me:37993"
]

INTERVAL = 120  # Her 2 dakikada bir kontrol

if __name__ == "__main__":
    while True:
        for address in SERVERS:
            try:
                server = JavaServer.lookup(address, timeout=10.0)
                status = server.status()
                print(f"[{address}] Aktif | Ping: {status.latency}ms | Oyuncu: {status.players.online}")
            except Exception:
                print(f"[{address}] Kapalı veya açılıyor.")

        time.sleep(INTERVAL)