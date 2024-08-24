import fs from "node:fs";

const contents: unknown = {
  width: 1280,
  height: 720,
  assets: {
    img: {
      type: "image",
      width: 100,
      height: 100,
      path: "unknown",
    },
    "main.fake": {
      type: "script",
      path: "dist/main.fake.js",
      global: true,
    }
  }
}

beforeAll(() => {
  fs.writeFileSync("game.json", JSON.stringify(contents));
});

afterAll(() => {
  if (fs.existsSync("game.json")) {
    fs.rmSync("game.json");
  }
});
