from mcstatus import JavaServer

SERVERS = [
    "mintifun.aternos.me:56469",
    "norvexmc.aternos.me:37993"
]

if __name__ == "__main__":
    for address in SERVERS:
        try:
            server = JavaServer.lookup(address, timeout=10.0)
            status = server.status()
            print(f"[{address}] Aktif | Ping: {status.latency}ms | Oyuncu: {status.players.online}")
        except Exception:
            print(f"[{address}] Kapalı veya açılıyor.")
