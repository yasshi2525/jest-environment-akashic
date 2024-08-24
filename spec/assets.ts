import {Scene} from "@akashic/akashic-engine";
import "./__helper/common";
import "./__helper/withGameJson";
import {env} from "./__helper/withDefaultConfig";
import {err} from "./__helper/common";

describe("assets", () => {
  it("IDで指定されたアセットを参照できる", () => {
    expect(env).toBeDefined()
    expect(env?.global).toHaveProperty(["scene"]);
    const img = (env?.global.scene as Scene).asset.getImageById("testImage1");
    expect(img).toBeDefined();
    expect(img.width).toBe(100);
    expect(err.e).not.toBeDefined();
  });
  it("/assets以下のアセットを参照できる", () => {
    expect(env).toBeDefined()
    expect(env?.global).toHaveProperty(["scene"]);
    const img = (env?.global.scene as Scene).asset.getImage("/assets/testImage2.png");
    expect(img).toBeDefined();
    expect(img.width).toBe(100);
    expect(err.e).not.toBeDefined();
  });
});
