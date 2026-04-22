import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/config.js";
import { gameText } from "../data/gameText.js";
import { addCenteredText, createPanel, formatChoiceKey } from "../utils/helpers.js";

export class QuizScene extends Phaser.Scene {
  constructor() {
    super("QuizScene");
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x07111f);
    createPanel(this, 120, 90, 1040, 530);

    addCenteredText(this, GAME_WIDTH / 2, 150, "最終安全判斷", {
      fontSize: "40px",
      color: "#ffd84d",
      fontStyle: "700"
    });
    addCenteredText(this, GAME_WIDTH / 2, 218, gameText.quizTitle, {
      fontSize: "30px",
      wordWrap: { width: 900 }
    });
    addCenteredText(this, GAME_WIDTH / 2, 278, gameText.quizPrompt, {
      fontSize: "22px",
      color: "#9fbcce"
    });

    this.optionButtons = [];
    gameText.quizOptions.forEach((option, index) => {
      const y = 380 + index * 96;
      const button = this.add.rectangle(GAME_WIDTH / 2, y, 820, 72, 0x16304e, 1)
        .setStrokeStyle(2, 0x45d0ff, 1)
        .setInteractive({ useHandCursor: true });
      const label = this.add.text(GAME_WIDTH / 2, y, option, {
        fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
        fontSize: "24px",
        color: "#eff8ff",
        align: "center",
        wordWrap: { width: 760 }
      }).setOrigin(0.5);

      button.on("pointerover", () => button.setFillStyle(0x1d4367, 1));
      button.on("pointerout", () => button.setFillStyle(0x16304e, 1));
      button.on("pointerdown", () => this.chooseOption(index));
      this.optionButtons.push({ button, label });
    });
  }

  chooseOption(index) {
    const chosen = formatChoiceKey(index);
    const correct = chosen === gameText.quizCorrect;
    const runData = this.registry.get("runData");

    if (correct) {
      runData.score += 50;
    }

    runData.quizCorrect = correct;
    this.registry.set("runData", runData);

    this.optionButtons.forEach(({ button }) => button.disableInteractive());
    addCenteredText(this, GAME_WIDTH / 2, 656, correct ? gameText.quizSuccess : gameText.quizFail, {
      fontSize: "24px",
      color: correct ? "#6dff8a" : "#ffd84d",
      wordWrap: { width: 980 }
    });

    this.time.delayedCall(1500, () => this.scene.start("ResultScene"));
  }
}
