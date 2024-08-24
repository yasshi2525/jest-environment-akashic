import fs from "node:fs";
import "./__helper/common";
import "./__helper/withGameJson";
import "./__helper/withDefaultConfig";
import {err} from "./__helper/common";
import {env} from "./__helper/withDefaultConfig";

describe("fakeMain", () => {
  it("ユニットテスト用game.jsonが./main.fake.jsを参照している", () => {
    expect(env).toBeDefined()
    const contents = JSON.parse(fs.readFileSync(".game.fake.json", "utf8"));
    expect(contents.main).toEqual("./.main.fake.js");
    expect(contents.assets).toHaveProperty([".main.fake"]);
    expect(err.e).not.toBeDefined();
  });
});
