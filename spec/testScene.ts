import "./__helper/common";
import "./__helper/withGameJson";
import "./__helper/withDefaultConfig";
import {env} from "./__helper/withDefaultConfig";
import {err} from "./__helper/common";
import {Game, Scene, E} from "@akashic/akashic-engine";
import {GameContext} from "@akashic/headless-akashic";

describe('testScene', () => {
  it("最初の実行ではsceneが差し替えられないが、以降差し替えられる", async () => {
    (env!.global.scene as Scene).append(new E({ scene: env!.global.scene as Scene }));
    expect((env!.global.scene as Scene).children).toHaveLength(1);
    await env!.handleTestEvent({ ...jest.fn(), name: "test_done" } as any)
    await env!.handleTestEvent({ ...jest.fn(), name: "test_start" } as any)
    expect((env!.global.scene as Scene).children).toHaveLength(0);
    expect(err.e).not.toBeDefined();
  });
  it("手動でsceneを追加した場合、差し替えはされない", async () => {
    const game = (env!.global.g as any).game as Game;
    game.replaceScene(new Scene({ game, name: "myCustomScene" }));
    await (env!.global.gameContext as GameContext<3>).step();
    expect(game.scene()!.name).toEqual("myCustomScene");
    await env!.handleTestEvent({ ...jest.fn(), name: "test_done" } as any);
    await env!.handleTestEvent({ ...jest.fn(), name: "test_start" } as any);
    expect(game.scene()!.name).toEqual("myCustomScene");
  });
  it("手動でsceneを追加し、かつ古いのが残っている場合、警告がでる", async () => {
    const game = (env!.global.g as any).game as Game;
    game.pushScene(new Scene({ game, name: "myCustomScene" }));
    await (env!.global.gameContext as GameContext<3>).step();
    expect(game.scene()!.name).toEqual("myCustomScene");
    await env!.handleTestEvent({ ...jest.fn(), name: "test_done" } as any);
    console.warn = jest.fn();
    await env!.handleTestEvent({ ...jest.fn(), name: "test_start" } as any);
    expect(console.warn).toHaveBeenCalled();
    expect(game.scene()!.name).toEqual("myCustomScene");
  });
});
