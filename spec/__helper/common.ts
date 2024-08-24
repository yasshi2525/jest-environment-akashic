import fs from "node:fs";
import path from "node:path";

export const err: { e?: Error } = {};

beforeAll(() => {
  fs.cpSync(path.resolve(__dirname, "testImage.png"), "testImage1.png");
  fs.mkdirSync("assets", { recursive: true });
  fs.cpSync(path.resolve(__dirname, "testImage.png"), "assets/testImage2.png");
})

afterAll(() => {
  if (fs.existsSync("testImage1.png")) {
    fs.rmSync("testImage1.png");
  }
  if (fs.existsSync("assets")) {
    fs.rmSync("assets", { recursive: true });
  }
})
