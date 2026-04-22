import Phaser from "phaser";
import { GAME_WIDTH } from "../game/config.js";
import { gameText } from "../data/gameText.js";
import { addCenteredText, createPanel } from "../utils/helpers.js";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  create() {
    const runData = this.registry.get("runData") ?? {
      score: 0,
      risksCleared: 0,
      toolsCollected: 0,
      safeHits: 0,
      quizCorrect: false,
      stageFailed: false
    };
    const success = !runData.stageFailed && runData.quizCorrect;

    this.add.rectangle(GAME_WIDTH / 2, 360, GAME_WIDTH, 720, 0x07111f);
    createPanel(this, 170, 90, 940, 540);

    addCenteredText(this, GAME_WIDTH / 2, 148, gameText.resultTitle, {
      fontSize: "42px",
      color: "#ffd84d",
      fontStyle: "700",
      stroke: "#07111f",
      strokeThickness: 6
    });
    addCenteredText(this, GAME_WIDTH / 2, 206, success ? gameText.successLabel : gameText.failLabel, {
      fontSize: "26px",
      color: success ? "#6dff8a" : "#ffd84d",
      stroke: "#07111f",
      strokeThickness: 4
    });

    const stats = [
      `已清除風險：${runData.risksCleared}`,
      `已收集工具：${runData.toolsCollected}`,
      `誤傷正確做法：${runData.safeHits}`,
      `最終分數：${runData.score}`
    ].join("\n");

    this.add.text(260, 280, stats, {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "28px",
      color: "#eff8ff",
      lineSpacing: 16,
      stroke: "#07111f",
      strokeThickness: 4
    });

    this.add.text(700, 272, gameText.resultLessons.map((line, index) => `${index + 1}. ${line}`).join("\n"), {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "26px",
      color: "#9fbcce",
      lineSpacing: 18,
      stroke: "#07111f",
      strokeThickness: 4
    });

    const button = this.add.rectangle(GAME_WIDTH / 2, 568, 260, 72, 0xffd84d, 1)
      .setStrokeStyle(3, 0xffffff, 1)
      .setInteractive({ useHandCursor: true });
    addCenteredText(this, GAME_WIDTH / 2, 568, gameText.resultRestart, {
      fontSize: "28px",
      color: "#1f1a03",
      fontStyle: "700"
    });

    button.on("pointerover", () => button.setFillStyle(0xffe98c, 1));
    button.on("pointerout", () => button.setFillStyle(0xffd84d, 1));
    button.on("pointerdown", () => this.scene.start("MenuScene"));
  }
}
