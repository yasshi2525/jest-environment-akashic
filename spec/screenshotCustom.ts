import fs from "node:fs";
import "./__helper/common";
import "./__helper/withGameJson";
import "./__helper/withCustomConfig";
import {env} from "./__helper/withDefaultConfig";

describe("screenshot", () => {
  it("オプションで出力先を変更できる", () => {
    (env?.global as any).screenshot("screenshot1.png");
    expect(fs.existsSync("tmp/custom/screenshot1.png"))
  });
  afterEach(() => {
    if (fs.existsSync("tmp/custom/screenshot1.png")) {
      fs.rmSync("tmp/custom/screenshot1.png");
    }
  });
})
