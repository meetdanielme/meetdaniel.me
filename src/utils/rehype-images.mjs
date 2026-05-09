import { readFileSync } from "node:fs";
import { join } from "node:path";

const publicDir = join(process.cwd(), "public");

const png = (buffer) => {
  if (buffer.toString("ascii", 1, 4) !== "PNG") return;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
};

const gif = (buffer) => {
  if (buffer.toString("ascii", 0, 3) !== "GIF") return;
  return {
    width: buffer.readUInt16LE(6),
    height: buffer.readUInt16LE(8),
  };
};

const jpeg = (buffer) => {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return;

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return;

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }
};

const webp = (buffer) => {
  if (
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WEBP"
  ) {
    return;
  }

  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  if (chunk === "VP8L") {
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  if (chunk === "VP8X") {
    return {
      width: buffer[24] + (buffer[25] << 8) + (buffer[26] << 16) + 1,
      height: buffer[27] + (buffer[28] << 8) + (buffer[29] << 16) + 1,
    };
  }
};

const metadataFor = (src) => {
  if (!src || !src.startsWith("/")) return;

  try {
    const cleanSrc = src.split(/[?#]/)[0];
    const buffer = readFileSync(join(publicDir, cleanSrc));
    return png(buffer) || gif(buffer) || jpeg(buffer) || webp(buffer);
  } catch {
    return;
  }
};

const walk = (node) => {
  if (node.type === "element" && node.tagName === "img") {
    const properties = (node.properties ||= {});
    const metadata = metadataFor(String(properties.src || ""));

    properties.decoding ||= "async";
    properties.loading ||= "lazy";

    if (metadata) {
      properties.width ||= metadata.width;
      properties.height ||= metadata.height;
    }
  }

  node.children?.forEach(walk);
};

export default function rehypeImages() {
  return (tree) => walk(tree);
}
