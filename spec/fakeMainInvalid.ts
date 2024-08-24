import fs from "node:fs";
import "./__helper/common";
import "./__helper/withInvalidGameJson";
import "./__helper/withDefaultConfig";
import {err} from "./__helper/common";

describe("fakeMain", () => {
  it("game.jsonにmainプロパティが存在しないときエラー", () => {
    expect(fs.existsSync("game.json")).toBe(true)
    expect(JSON.parse(fs.readFileSync("game.json", "utf8"))).not.toHaveProperty("main");
    expect(err.e).toBeDefined();
    expect(err.e?.message).toMatch("invalid game.json");
  });
});
