import fs from "node:fs";
import "./__helper/common";
import "./__helper/withDefaultConfig";
import {err} from "./__helper/common";

describe("fakeMain", () => {
  it("game.jsonが存在しないときエラー", () => {
    expect(fs.existsSync("game.json")).toBe(false);
    expect(err.e).toBeDefined();
    expect(err.e?.message).toMatch("game.json was not found");
  });
});
