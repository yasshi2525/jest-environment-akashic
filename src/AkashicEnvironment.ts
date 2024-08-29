import NodeEnvironment from "jest-environment-node";
import {GameConfiguration, ScriptAssetConfigurationBase} from "@akashic/game-configuration";
import {EnvironmentContext, JestEnvironmentConfig} from "@jest/environment";
import {Event} from "jest-circus";
import {GameClient, GameContext} from "@akashic/headless-akashic";
import fs from "node:fs";
import path from "node:path";
import crypto from 'node:crypto'

const GAME_JSON_PATH = "game.json";
const FAKE_MAIN_SCRIPT = "'use strict'\nmodule.exports = () => {}";
const TARGET_FAKE_MAIN_SCRIPT_PATH_HOLDER = ".main.fake-{uuid}.js";
const FAKE_GAME_JSON_FILENAME_HOLDER = ".game.fake-{uuid}.json";
const TARGET_FAKE_GAME_JSON_PATH_HOLDER = FAKE_GAME_JSON_FILENAME_HOLDER;
const DEFAULT_SCREENSHOT_DIR = "tmp/screenshot";
const PLAYER_NAME = "test-user-001";
const TEST_SCENE_NAME = "__test-scene__";

/**
 * Akashic Engine の機能をサンドボックスとして利用可能にした環境
 */
export class AkashicEnvironment extends NodeEnvironment {
  private readonly screenshotDir;
  private readonly originalGameJsonContents: GameConfiguration;
  private _uuid?: string
  private gameContext?: GameContext<3>;
  private gameClient?: GameClient<3>;
  private needsSceneReplace = false;

  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
    const options = config.projectConfig.testEnvironmentOptions
    if ("screenshotDir" in options) {
      if (typeof options.screenshotDir !== "string") {
        throw new Error("screenshotDir must be a string");
      }
      this.screenshotDir =  options.screenshotDir;
    } else {
      this.screenshotDir = DEFAULT_SCREENSHOT_DIR;
    }
    this.originalGameJsonContents = this.parseGameJson();
  }

  override async setup() {
    await super.setup();
    this._uuid = crypto.randomUUID()
    process.on("SIGINT", () => this.removeTempFiles());
    this.createFakeGameJson();
    this.gameContext = new GameContext<3>({ gameJsonPath: this.resolveUUID(TARGET_FAKE_GAME_JSON_PATH_HOLDER) });
    this.gameClient = await this.gameContext.getGameClient({
      player: { id: PLAYER_NAME, name: PLAYER_NAME },
      renderingMode: "canvas",
    });
    await this.gameContext.step();
    const testScene = await this.prepareTestScene();

    this.global.g = { ...this.gameClient.g, game: this.gameClient.game };
    this.global.gameContext = this.gameContext;
    this.global.gameClient = this.gameClient;
    this.global.scene = testScene;
    this.global.screenshot = (filename: string) => this.screenshot(filename);
  }

  override async teardown() {
    this.removeTempFiles();
    if (this.gameClient) {
      this.gameClient = undefined;
    }
    if (this.gameContext) {
      await this.gameContext.destroy();
    }
    await super.teardown();
  }

  async handleTestEvent(event: Event) {
    switch (event.name) {
      case "test_start":
        if (!this.gameContext) {
          throw new Error("game context has been destroyed");
        }
        if (!this.gameClient) {
          throw new Error("game client has been destroyed");
        }
        if (this.needsSceneReplace) {
          if (this.gameClient.game.scene()?.name === TEST_SCENE_NAME) {
            this.gameClient.game.popScene();
            await this.gameContext.step();
            this.global.scene = await this.prepareTestScene();
            this.needsSceneReplace = false;
          } else {
            if (this.gameClient.game.scenes.find(scene => scene.name === TEST_SCENE_NAME)) {
              console.warn("replace test scene was skipped because changing scene was detected. " +
                `If it causes memory leak, please remove test scene named ${TEST_SCENE_NAME} from g.game manually`);
            }
          }
        }
        break;
      case "test_done":
        this.needsSceneReplace = true;
        break;
    }
  }

  /**
   * 一時ファイルを作成する際の識別子を取得します.
   */
  get uuid() {
    if (!this._uuid) {
      throw new Error('uuid is not exist before setup()')
    }
    return this._uuid
  }

  private parseGameJson (): GameConfiguration {
    if (!fs.existsSync(GAME_JSON_PATH)) {
      throw new Error("game.json was not found");
    }
    return JSON.parse(fs.readFileSync(GAME_JSON_PATH, "utf8"));
  }

  private createFakeGameJson () {
    if ("main" in this.originalGameJsonContents) {
      this.insertFakeMainAsset();
      fs.writeFileSync(this.resolveUUID(TARGET_FAKE_GAME_JSON_PATH_HOLDER), JSON.stringify(this.originalGameJsonContents));
    } else {
      throw new Error("invalid game.json file. 'main' property was not found")
    }
  }

  private extractAssetIDs (): string[] {
    if (Array.isArray(this.originalGameJsonContents.assets)) {
      throw new Error("array type of 'assets' parameter in game.json is not supported");
    }
    return Object.entries(this.originalGameJsonContents.assets).filter(([, value]) => value.type !== "script").map(([key, ]) => key);
  }

  private insertFakeMainAsset () {
    if (Array.isArray(this.originalGameJsonContents.assets)) {
      throw new Error("array type of 'assets' parameter in game.json is not supported");
    }
    fs.writeFileSync(this.resolveUUID(TARGET_FAKE_MAIN_SCRIPT_PATH_HOLDER), FAKE_MAIN_SCRIPT);
    this.originalGameJsonContents.main = "./" + this.resolveUUID(TARGET_FAKE_MAIN_SCRIPT_PATH_HOLDER);
    this.originalGameJsonContents.assets[path.basename(this.resolveUUID(TARGET_FAKE_MAIN_SCRIPT_PATH_HOLDER), ".js")] = {
      type: "script",
      path: this.resolveUUID(TARGET_FAKE_MAIN_SCRIPT_PATH_HOLDER),
      global: true,
    } as ScriptAssetConfigurationBase;
  }

  private async prepareTestScene () {
    if (!this.gameClient) {
      throw new Error("game client has been destroyed");
    }
    const scene = new this.gameClient.g.Scene({
      game: this.gameClient.game,
      name: TEST_SCENE_NAME,
      assetIds: this.extractAssetIDs(),
      assetPaths: ["/assets/**/*"],
    })
    this.gameClient.game.pushScene(scene);
    await this.gameClient.advanceUntil(() => this.gameClient?.game.scene()?.name === TEST_SCENE_NAME);
    return scene;
  }

  private removeTempFiles () {
    if (fs.existsSync(this.resolveUUID(TARGET_FAKE_MAIN_SCRIPT_PATH_HOLDER))) {
      fs.rmSync(this.resolveUUID(TARGET_FAKE_MAIN_SCRIPT_PATH_HOLDER));
    }
    if (fs.existsSync(this.resolveUUID(TARGET_FAKE_GAME_JSON_PATH_HOLDER))) {
      fs.rmSync(this.resolveUUID(TARGET_FAKE_GAME_JSON_PATH_HOLDER));
    }
  }

  resolveUUID (patternHolder: string) {
    if (!this._uuid) {
      throw new Error("uuid is not set")
    }
    return patternHolder.replace("{uuid}", this._uuid);
  }

  private screenshot (filename: string) {
    if (!this.gameClient) {
      throw new Error("game client has been destroyed");
    }
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
    fs.writeFileSync(path.resolve(this.screenshotDir, filename), this.gameClient.getPrimarySurfaceCanvas().toBuffer());
  }
}
