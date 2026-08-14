const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projects = require("../data/projects.cjs");
const imageRoot = path.join(__dirname, "..", "assets", "images");

const expected = [
  ["touareg-x-wu-jing", "touareg-x-wu-jing-cover.png", "F71C7C211460E58AFCF18DD9A80C942DA330AACAA2600E7227A1D6E08B458FF1", 4680, 2160],
  ["universal-studio", "universal-studio-cover.jpg", "540383CF4D0B529B904675DF2F5709EA7A00DFA83777DCA1F43D1A15D428E3CA", 2276, 1280],
  ["huawei-nora-band-10", "huawei-nora-band-10-cover.jpg", "1137A09A789AC72DA5C9C2DDFDD25E0D24E34C83FA00925E25FD1B64E93EBC25", 3840, 2160],
  ["huawei-freebuds-pro-3", "huawei-freebuds-pro-3-cover.jpg", "F921A53496108E6FE923DD984B424848E7781D6E1E27AC4D0ED7F70DD0995833", 3840, 2160],
  ["sanrio-brand-2025", "sanrio-brand-2025-cover.png", "1EEF39813E4A638AA5BA2689B7CF593091B3F44F2ECDD5281DC6537E1D77F77C", 3840, 2160],
  ["oppo-r11", "oppo-r11-cover.png", "6606865A3CB575F55A7C606EFE5FF55CD8B3689ED444C90AA80E6194883EA5C4", 2448, 1038],
  ["audi-x-zheng-qinwen", "audi-x-zheng-qinwen-cover.png", "960D62FA7241CD0D7EBE24D4FC76D638CF1E4C9E243C8F084437EEA79334144B", 2457, 1199],
  ["descente-x-daniel-wu", "descente-x-daniel-wu-cover.jpg", "F1F6C5CEF06D7BF686698FBC2E44FC620C9487E9DADC6E7AA53A840692439B49", 1435, 810],
  ["friso-x-volvo", "friso-x-volvo-cover.png", "2A7AA819B2B48A0A205F4A536ED2E3021CDBC46B097DB54DED39B3262EFC6558", 1672, 941],
  ["game-for-peace", "game-for-peace-cover.png", "9CC8315634955CE9D13EA9262666272A61BBFDA61EB237861427484760966861", 3840, 2160],
  ["adidas-zne", "adidas-zne-cover.jpg", "12CAF03FB797F3A0F38B7B236E433EFB4733B1A201608A7B0F43A7ADDA51B126", 800, 450],
];

function imageDimensions(buffer) {
  if (buffer.subarray(1, 4).toString("ascii") === "PNG") {
    return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
  }
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) throw new Error("invalid JPEG marker");
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return [buffer.readUInt16BE(offset + 7), buffer.readUInt16BE(offset + 5)];
    }
    offset += 2 + length;
  }
  throw new Error("JPEG dimensions not found");
}

test("replacement covers preserve the supplied source bytes and dimensions", () => {
  for (const [slug, filename, expectedHash, width, height] of expected) {
    const file = path.join(imageRoot, filename);
    const bytes = fs.readFileSync(file);
    assert.equal(crypto.createHash("sha256").update(bytes).digest("hex").toUpperCase(), expectedHash, filename);
    assert.deepEqual(imageDimensions(bytes), [width, height], filename);
    assert.equal(projects.find((project) => project.slug === slug).poster, `assets/images/${filename}`);
  }
});

test("obsolete cover formats are removed", () => {
  for (const filename of [
    "huawei-nora-band-10-cover.png",
    "huawei-freebuds-pro-3-cover.png",
    "sanrio-brand-2025-cover.jpg",
    "descente-x-daniel-wu-cover.png",
    "friso-x-volvo-cover.jpg",
    "adidas-zne-cover.png",
  ]) assert.equal(fs.existsSync(path.join(imageRoot, filename)), false, filename);
});
