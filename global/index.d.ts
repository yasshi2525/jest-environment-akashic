import {GameClient, GameContext} from "@akashic/headless-akashic";

/* eslint no-unused-vars: 0 */
/* eslint no-var: 0 */

declare global {
  var gameContext: GameContext<3>;
  var gameClient: GameClient<3>;
  /**
   * ユニットテスト用の Scene.
   * Scene にアクセスしやすくするためのユーティリティ.
   */
  var scene: g.Scene;
  var screenshot: (filename: string) => void;
}

declare var gameContext: GameContext<3>;
declare var gameClient: GameClient<3>;
/**
 * ユニットテスト用の Scene.
 * Scene にアクセスしやすくするためのユーティリティ.
 */
declare var scene: g.Scene;
declare var screenshot: (filename: string) => void;

export {};
