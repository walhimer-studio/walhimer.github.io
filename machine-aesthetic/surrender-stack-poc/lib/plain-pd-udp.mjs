import dgram from "dgram";

/** Plain-text UDP for Pure Data vanilla (no oscparse). Port 7401. */
export function createPlainPdSender(host = "127.0.0.1", port = 7401) {
  const socket = dgram.createSocket("udp4");
  return {
    sendLine(...parts) {
      const line = `${parts.join(" ")};\n`;
      socket.send(Buffer.from(line, "utf8"), port, host);
    },
    close() {
      socket.close();
    },
  };
}

/** Mirror express snapshot as space-separated lines Pd [route] can read. */
export function expressToPlainPd(plain, snap, operator = {}) {
  const stopMotion = !!operator.stopMotion;
  const hz =
    (55 + (snap.seed % 97)) * (0.55 + (snap.vitality ?? 0.5) * 0.9) * (0.8 + (snap.traits?.machine ?? 0.5) * 0.4);
  const speed = Math.max(0, Number(operator.speed) ?? 100) / 100;
  plain.sendLine("stop", stopMotion ? 1 : 0);
  plain.sendLine("seed", snap.seed >>> 0);
  plain.sendLine("generation", snap.generation ?? 0);
  plain.sendLine("stress", (snap.stress ?? 0).toFixed(4));
  plain.sendLine("energy", stopMotion ? "0.0000" : Math.max(0.12, (snap.vitality ?? 0.5) * 0.6).toFixed(4));
  plain.sendLine("hz", (stopMotion ? hz : hz * speed).toFixed(2));
}
