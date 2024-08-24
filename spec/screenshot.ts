import fs from "node:fs";
import "./__helper/common";
import "./__helper/withGameJson";
import "./__helper/withDefaultConfig";
import {env} from "./__helper/withDefaultConfig";

describe("screenshot", () => {
  it("スクリーンショットがとれる", () => {
    (env?.global as any).screenshot("screenshot1.png");
    expect(fs.existsSync("tmp/screenshot/screenshot1.png"))
  });
  it("スクリーンショットは上書きされる", () => {
    (env?.global as any).screenshot("screenshot1.png");
    (env?.global as any).screenshot("screenshot1.png");
    expect(fs.existsSync("tmp/screenshot/screenshot1.png"))
  });
  afterEach(() => {
    if (fs.existsSync("tmp/screenshot/screenshot1.png")) {
      fs.rmSync("tmp/screenshot/screenshot1.png");
    }
  });
});
