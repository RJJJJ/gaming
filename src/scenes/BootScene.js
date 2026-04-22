import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.createTextures();
  }

  create() {
    this.registry.set("runData", {
      score: 0,
      risksCleared: 0,
      toolsCollected: 0,
      safeHits: 0,
      quizCorrect: false
    });

    this.scene.start("MenuScene");
  }

  createTextures() {
    this.makeRectTexture("player", 56, 74, 0x45d0ff, 0xffffff);
    this.makeRectTexture("enemy-body", 96, 64, 0xffffff, 0x0d0d0d);
    this.makeRectTexture("item-body", 56, 56, 0xffffff, 0x0d0d0d);
    this.makeRectTexture("safe-body", 124, 58, 0xffffff, 0x0d0d0d);
    this.makeRectTexture("bullet", 18, 8, 0xfff17a, 0xffd84d);
    this.makeRectTexture("boss", 260, 220, 0x8f7cff, 0xffffff);
    this.makeRectTexture("platform", 240, 30, 0x183759, 0x45d0ff);
  }

  makeRectTexture(key, width, height, fillColor, strokeColor) {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(fillColor, 1);
    graphics.lineStyle(4, strokeColor, 1);
    graphics.fillRoundedRect(0, 0, width, height, 16);
    graphics.strokeRoundedRect(0, 0, width, height, 16);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }
}
