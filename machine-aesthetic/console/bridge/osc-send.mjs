import dgram from "dgram";

function pad4(n) {
  return (4 - (n % 4)) % 4;
}

function encodeString(s) {
  const buf = Buffer.from(`${s}\0`, "utf8");
  const out = Buffer.alloc(buf.length + pad4(buf.length));
  buf.copy(out);
  return out;
}

function encodeInt(i) {
  const buf = Buffer.alloc(4);
  buf.writeInt32BE(i, 0);
  return buf;
}

function encodeFloat(f) {
  const buf = Buffer.alloc(4);
  buf.writeFloatBE(f, 0);
  return buf;
}

function typeTagFor(args) {
  let tags = ",";
  for (const a of args) {
    if (typeof a === "string") tags += "s";
    else if (typeof a === "number" && Number.isInteger(a)) tags += "i";
    else if (typeof a === "number") tags += "f";
    else throw new Error(`unsupported OSC arg: ${a}`);
  }
  return tags;
}

/** Build one OSC message (UDP payload). */
export function buildOscMessage(address, args = []) {
  const parts = [encodeString(address), encodeString(typeTagFor(args))];
  for (const a of args) {
    if (typeof a === "string") parts.push(encodeString(a));
    else if (typeof a === "number" && Number.isInteger(a)) parts.push(encodeInt(a));
    else if (typeof a === "number") parts.push(encodeFloat(a));
  }
  return Buffer.concat(parts);
}

export function createOscSender(host = "127.0.0.1", port = 7400) {
  const socket = dgram.createSocket("udp4");
  return {
    send(address, ...args) {
      const payload = buildOscMessage(address, args);
      socket.send(payload, port, host);
    },
    close() {
      socket.close();
    },
  };
}
