import {GameConfiguration} from "@akashic/game-configuration";
import fs from "node:fs";

const contents: GameConfiguration = {
  width: 1280,
  height: 720,
  main: "./testMain.js",
  assets: {
    testImage1: {
      type: "image",
      width: 100,
      height: 100,
      path: "testImage1.png",
    },
    "assets/testImage2.png": {
      type: "image",
      width: 100,
      height: 100,
      path: "assets/testImage2.png",
    },
    testMain: {
      type: "script",
      path: "testMain.js",
      global: true,
    }
  },
  environment: {
    "sandbox-runtime": "3"
  }
}

beforeAll(() => {
  fs.writeFileSync("testMain.js", "'use strict'\nmodule.exports = () => {}");
  fs.writeFileSync("game.json", JSON.stringify(contents));
});

afterAll(() => {
  if (fs.existsSync("testMain.js")) {
    fs.rmSync("testMain.js");
  }
  if (fs.existsSync("game.json")) {
    fs.rmSync("game.json");
  }
});
