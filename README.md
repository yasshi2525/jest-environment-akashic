# 概要
## 目的
[Akashic Engine](https://akashic-games.github.io/) を利用したコードのユニットテスト記述・実行支援を目的に、サンドボックス環境を提供します.

## 特徴
本ライブラリを利用すると、Akashic Engineの機能が混在するクラス・関数に対しても個々の動作を確認しやすくなります.
例えば「自作ロジックを組み込んだ `g.Sprite` のクリック時の動作」をテストコードとして記述しやすくなります.
また、動作中のスナップショットを画像出力することで、意図した通りにテストされているか目視確認もできます.
  
*Q: どうして動作確認をテストコードとして記述するの？*

A: 仕様変更時も変更していない従来のコードが正しく動作するか、目視に頼らず自動的にテストできるからです.
テストを自動化することで動作確認の手間を減らし、ゲーム開発を効率的に進められます.
  
*Q: すでにあるテスト支援ライブラリ ([`@akashic-games/headless-akashic`](https://github.com/akashic-games/headless-akashic)) との違いは？*

A: `@akashic-games/headless-akashic` を使うとAkashic Engineを用いたゲームスクリプトをテストできます.
しかし、これはゲーム全体を一からスタートさせるため、ゲームの途中部分からの動作確認や一部機能だけのテストがしづらい側面があります.

そこで、特定の処理や特定の条件下での動きといった個々の動作確認をしやすくするため、
Akashic Engineが動作する使い捨ての軽量環境を提供します.
動作環境は自動で再構築されるため、面倒な初期化処理をその都度書く必要はありません.

一方、図形や画像のレンダリングも行われるため、これを画像出力することで目視で動作確認しながらテストコードを記述できます.

# インストール方法・利用方法
`akashic init` して構築したプロジェクトで、下記のコマンドを実行してください.

```shell
npm install --dev @yasshi2525/jest-environment-akashic
```

`jest.config.js` に下記を追記してください.

```javascript
module.exports = {
  // ...
  testEnvironment: "@yasshi2525/jest-environment-akashic"
  // ...
}
```

`tsconfig.json` の `compilerOptions.types[]` に下記を追記してください.

```json
{
  "compilerOptions": {
    "types": [
      "@yasshi2525/jest-environment-akashic-global"
    ]
  }
}
```

以上の手順で、テストコード (`spec` ディレクトリ配下のコード) で下記のグローバル変数が利用できます.

* `g`, `g.game`: 実際のAkashic Engineの実行環境のものが格納されます.
* `scene`: 空の `g.Scene`. テスト単位 ([`test`](https://jestjs.io/ja/docs/next/api#testname-fn-timeout) または `it` メソッド単位) でリセットされます. 
   追加したエンティティやハンドラの削除処理を記述する必要はありません.
* `screenshot(filename: string)`: 現在の画面を画像として出力します. ファイルは `./tmp/screenshot` 以下に出力されます.

また、ゲーム進行を制御する以下の [`@akashic-games/headless-akashic`](https://github.com/akashic-games/headless-akashic) の機能がグローバル変数として利用可能です.

* `gameContext`: `GameContext<3>`
* `gameClient`: `GameClient<3>`

# サンプル
<details>
<summary>TypeScript</summary>

## TypeScript

### テスト対象

`src/button.ts`

```typescript
type ButtonStatus = "ON" | "OFF";

/**
 * 押下すると ON, 離すと OFF になるボタン
 */
export class Button extends g.FilledRect {
	private _status: ButtonStatus = "OFF";
	constructor(opts: g.FilledRectParameterObject) {
		super(opts);
		// 押下されると ON
		this.onPointDown.add(() => this.on());
		// 離されると OFF
		this.onPointUp.add(() => this.off());
	}

	/**
	 * ON状態にします
	 */
	on(): void {
		this._status = "ON";
		this.opacity = 0.5;
		this.modified();
	}

	/**
	 * OFF状態にします
	 */
	off(): void {
		this._status = "OFF";
		this.opacity = 1;
		this.modified();
	}

	/**
	 * ボタンの状態を取得します
	 */
	get status(): string {
		return this._status;
	}
}
```

### テストコード

```typescript
import {Button} from "../src/button";

describe("button", () => {
	it ("on()を実行するとON状態になる", async () => {
		const button = new Button({ scene, width: 100, height: 100, cssColor: "red", touchable: true });
		scene.append(button);
		await gameContext.step();
		button.on();
		expect(button.status).toEqual("ON");
		await gameContext.step();
		screenshot("on.png");
	});
	it("off()を実行するとOFF状態になる", async () => {
		const button = new Button({ scene, width: 100, height: 100, cssColor: "red", touchable: true });
		scene.append(button);
		await gameContext.step();
		button.on();
		button.off();
		expect(button.status).toEqual("OFF");
		await gameContext.step();
		screenshot("off.png");
	});
	it("押下するとON状態になる", async () => {
		const button = new Button({ scene, width: 100, height: 100, cssColor: "red", touchable: true });
		scene.append(button);
		await gameContext.step();
		gameClient.sendPointDown(50, 50, 1);
		await gameContext.step();
		expect(button.status).toEqual("ON");
		await gameContext.step();
		screenshot("down.png");
	});
	it("離すとOFF状態になる", async () => {
		const button = new Button({ scene, width: 100, height: 100, cssColor: "red", touchable: true });
		scene.append(button);
		await gameContext.step();
		gameClient.sendPointDown(50, 50, 1);
		await gameContext.step();
		gameClient.sendPointUp(50, 50, 1);
		await gameContext.step();
		expect(button.status).toEqual("OFF");
		await gameContext.step();
		screenshot("up.png");
	});
});
```

</details>

# オプション

`jest.config.js` に下記を追記することで、設定を変更することができます.  

```javascript
module.exports = {
  // ...
  testEnvironmentOptions: {
    screenshotDir: "<スクリーンショットの出力先>", // 任意, デフォルト値 "./tmp/screenshot"
  }
  // ...
}
```

# Author

@yasshi2525 ([X](https://x.com/yasshi2525))

# License

MIT License
