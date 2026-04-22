import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/config.js";
import { gameText } from "../data/gameText.js";
import { createPanel } from "../utils/helpers.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x07111f);

    const grid = this.add.graphics();
    grid.lineStyle(1, 0x17324f, 0.9);
    for (let x = 0; x <= GAME_WIDTH; x += 64) {
      grid.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += 64) {
      grid.lineBetween(0, y, GAME_WIDTH, y);
    }

    const panelX = 170;
    const panelY = 72;
    const panelWidth = 940;
    const panelHeight = 576;
    const panelPaddingX = 54;

    createPanel(this, panelX, panelY, panelWidth, panelHeight);

    const titleY = panelY + 52;
    const centerX = GAME_WIDTH / 2;

    this.add.text(centerX, titleY, gameText.title, {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "44px",
      color: "#eff8ff",
      fontStyle: "700",
      stroke: "#07111f",
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 3, color: "#000000", blur: 6, fill: true }
    }).setOrigin(0.5, 0);

    this.add.text(centerX, titleY + 60, gameText.subtitle, {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "22px",
      color: "#9fbcce",
      stroke: "#07111f",
      strokeThickness: 4
    }).setOrigin(0.5, 0);

    this.add.text(centerX, titleY + 106, gameText.menuTagline, {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "26px",
      color: "#ffd84d",
      stroke: "#07111f",
      strokeThickness: 4
    }).setOrigin(0.5, 0);

    const blockWidth = panelWidth - panelPaddingX * 2;
    const leftX = panelX + panelPaddingX;
    const missionY = titleY + 168;
    const controlsY = missionY + 170;

    this.add.rectangle(centerX, missionY + 62, blockWidth, 122, 0x11273f, 0.78)
      .setStrokeStyle(2, 0x45d0ff, 0.85);
    this.add.text(leftX, missionY, "任務重點", {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "24px",
      color: "#eff8ff",
      fontStyle: "700",
      stroke: "#07111f",
      strokeThickness: 4
    });
    this.add.text(leftX, missionY + 36, [
      "• 清除 AI 風險",
      "• 收集安全工具",
      "• 不要打中正確做法",
      "• 保留人類判斷與查證"
    ].join("\n"), {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "23px",
      color: "#eff8ff",
      lineSpacing: 10,
      stroke: "#07111f",
      strokeThickness: 4
    });

    this.add.rectangle(centerX, controlsY + 46, blockWidth, 92, 0x11273f, 0.74)
      .setStrokeStyle(2, 0x45d0ff, 0.78);
    this.add.text(leftX, controlsY, "操作提示", {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "24px",
      color: "#eff8ff",
      fontStyle: "700",
      stroke: "#07111f",
      strokeThickness: 4
    });
    this.add.text(leftX, controlsY + 34, [
      "• 移動：A / D 或 ← / →",
      "• 跳躍：W / ↑ / 空白鍵",
      "• 射擊：J / 滑鼠左鍵"
    ].join("\n"), {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "21px",
      color: "#eff8ff",
      lineSpacing: 8,
      stroke: "#07111f",
      strokeThickness: 4
    });

    this.add.text(centerX, panelY + panelHeight - 112, gameText.menuHint, {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "21px",
      color: "#9fbcce",
      stroke: "#07111f",
      strokeThickness: 4
    }).setOrigin(0.5, 0.5);

    const buttonY = panelY + panelHeight - 52;
    const button = this.add.rectangle(centerX, buttonY, 280, 74, 0xffd84d, 1)
      .setStrokeStyle(3, 0xffffff, 1)
      .setInteractive({ useHandCursor: true });

    this.add.text(centerX, buttonY, gameText.startButton, {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "28px",
      color: "#1f1a03",
      fontStyle: "700"
    }).setOrigin(0.5);

    button.on("pointerover", () => button.setFillStyle(0xffe98c, 1));
    button.on("pointerout", () => button.setFillStyle(0xffd84d, 1));
    button.on("pointerdown", () => {
      this.registry.set("runData", {
        score: 0,
        risksCleared: 0,
        toolsCollected: 0,
        safeHits: 0,
        quizCorrect: false
      });
      this.scene.start("GameScene");
    });
  }
}
