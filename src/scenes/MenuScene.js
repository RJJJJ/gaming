import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/config.js";
import { gameText } from "../data/gameText.js";
import { addCenteredText, createPanel } from "../utils/helpers.js";

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

    createPanel(this, 180, 120, 920, 470);
    addCenteredText(this, GAME_WIDTH / 2, 190, gameText.title, {
      fontSize: "48px",
      fontStyle: "700"
    });
    addCenteredText(this, GAME_WIDTH / 2, 242, gameText.subtitle, {
      fontSize: "24px",
      color: "#9fbcce"
    });
    addCenteredText(this, GAME_WIDTH / 2, 308, gameText.menuTagline, {
      fontSize: "28px"
    });
    addCenteredText(this, GAME_WIDTH / 2, 362, gameText.menuHint, {
      fontSize: "22px",
      color: "#ffd84d"
    });

    const tutorialText = [
      ...gameText.tutorialBullets.map((line) => `• ${line}`),
      "",
      ...gameText.controls
    ].join("\n");

    this.add.text(GAME_WIDTH / 2, 450, tutorialText, {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "24px",
      color: "#eff8ff",
      align: "center",
      lineSpacing: 10
    }).setOrigin(0.5);

    const button = this.add.rectangle(GAME_WIDTH / 2, 635, 250, 72, 0xffd84d, 1)
      .setStrokeStyle(3, 0xffffff, 1)
      .setInteractive({ useHandCursor: true });
    addCenteredText(this, GAME_WIDTH / 2, 635, gameText.startButton, {
      fontSize: "28px",
      color: "#1f1a03",
      fontStyle: "700"
    });

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
