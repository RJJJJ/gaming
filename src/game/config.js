import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene.js";
import { MenuScene } from "../scenes/MenuScene.js";
import { GameScene } from "../scenes/GameScene.js";
import { BossScene } from "../scenes/BossScene.js";
import { QuizScene } from "../scenes/QuizScene.js";
import { ResultScene } from "../scenes/ResultScene.js";

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const gameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#07111f",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 980 },
      debug: false
    }
  },
  scene: [
    BootScene,
    MenuScene,
    GameScene,
    BossScene,
    QuizScene,
    ResultScene
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
