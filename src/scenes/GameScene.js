import Phaser from "phaser";
import { Player } from "../entities/Player.js";
import { Enemy, createEnemyLabel } from "../entities/enemies.js";
import { Collectible, SafeMarker } from "../entities/items.js";
import { enemyData } from "../data/enemyData.js";
import { itemData } from "../data/itemData.js";
import { gameText } from "../data/gameText.js";
import { GAME_HEIGHT } from "../game/config.js";
import { HUD } from "../ui/HUD.js";
import { createPanel } from "../utils/helpers.js";

const SAFE_MARKERS = [
  { label: "再次查證", x: 1260, y: 600 },
  { label: "保護私隱", x: 1940, y: 600 },
  { label: "人工覆核", x: 2860, y: 600 },
  { label: "來源確認", x: 3480, y: 600 }
];

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.worldWidth = 4200;
    this.stageEndX = 3900;
    this.stageFinished = false;
    this.statusMessage = "主防線掃描中";

    this.physics.world.setBounds(0, 0, this.worldWidth, GAME_HEIGHT);
    this.cameras.main.setBounds(0, 0, this.worldWidth, GAME_HEIGHT);

    this.createBackground();
    this.createPlatforms();

    this.player = new Player(this, 180, 540);
    this.player.body.setSize(46, 70);

    this.physics.add.collider(this.player, this.platforms);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setLerp(0.07, 0.07);
    this.cameras.main.setDeadzone(220, 120);

    this.bullets = this.physics.add.group({ allowGravity: false, immovable: true });
    this.enemies = this.physics.add.group();
    this.items = this.physics.add.group({ allowGravity: false });
    this.safeMarkers = this.physics.add.group({ allowGravity: false });
    this.enemyLabels = [];

    this.spawnStageContent();
    this.createTutorialOverlay();

    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemy, null, this);
    this.physics.add.overlap(this.player, this.items, this.handleCollectItem, null, this);
    this.physics.add.overlap(this.bullets, this.safeMarkers, this.handleSafeMarkerHit, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.W,
      shoot: Phaser.Input.Keyboard.KeyCodes.J
    });

    this.input.on("pointerdown", (pointer) => {
      if (pointer.leftButtonDown()) {
        this.tryShoot();
      }
    });

    this.hud = new HUD(this);
  }

  createBackground() {
    this.add.rectangle(this.worldWidth / 2, GAME_HEIGHT / 2, this.worldWidth, GAME_HEIGHT, 0x07111f);

    for (let i = 0; i < 26; i += 1) {
      const x = i * 170 + 60;
      this.add.rectangle(x, 120, 6, 180, 0x103250, 0.5);
      this.add.rectangle(x + 48, 180, 90, 16, 0x12385d, 0.45);
      this.add.rectangle(x + 16, 280, 136, 4, 0x45d0ff, 0.26);
    }

    this.add.rectangle(this.worldWidth / 2, 650, this.worldWidth, 140, 0x0d2035, 1)
      .setStrokeStyle(3, 0x45d0ff, 0.32);
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(this.worldWidth / 2, 660, "platform")
      .setDisplaySize(this.worldWidth, 120)
      .refreshBody()
      .setVisible(false);

    [
      [680, 548, 180, 26],
      [1170, 462, 220, 26],
      [1620, 565, 180, 26],
      [2140, 490, 220, 26],
      [2720, 540, 180, 26],
      [3290, 455, 230, 26]
    ].forEach(([x, y, width, height]) => {
      this.platforms.create(x, y, "platform")
        .setDisplaySize(width, height)
        .refreshBody()
        .setVisible(false);
      this.add.rectangle(x, y, width, height, 0x183759, 1).setStrokeStyle(2, 0x45d0ff, 0.6);
    });
  }

  createTutorialOverlay() {
    this.tutorialContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(40);
    this.tutorialContainer.add(createPanel(this, 120, 80, 420, 250));
    this.tutorialContainer.add(this.add.text(150, 108, gameText.tutorialTitle, {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "28px",
      color: "#ffd84d",
      fontStyle: "700"
    }));
    this.tutorialContainer.add(this.add.text(150, 156, [
      ...gameText.tutorialBullets.map((line) => `• ${line}`),
      "",
      ...gameText.controls
    ].join("\n"), {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "20px",
      color: "#eff8ff",
      lineSpacing: 8
    }));

    this.time.delayedCall(4500, () => {
      this.tweens.add({
        targets: this.tutorialContainer,
        alpha: 0,
        duration: 420,
        onComplete: () => this.tutorialContainer.destroy()
      });
    });
  }

  spawnStageContent() {
    [
      ["hallucination", 760, 360],
      ["bias", 1080, 600],
      ["privacy", 1380, 600],
      ["hallucination", 1820, 310],
      ["bias", 2140, 428],
      ["privacy", 2480, 600],
      ["hallucination", 2960, 365],
      ["bias", 3340, 412],
      ["privacy", 3600, 600]
    ].forEach(([type, x, y]) => this.spawnEnemy(type, x, y));

    [
      ["verify", 920, 380],
      ["shield", 1560, 502],
      ["judgment", 2360, 430],
      ["verify", 3070, 395]
    ].forEach(([type, x, y]) => this.spawnItem(type, x, y));

    SAFE_MARKERS.forEach(({ label, x, y }) => this.spawnSafeMarker(label, x, y));
  }

  spawnEnemy(type, x, y) {
    const enemy = new Enemy(this, x, y, enemyData[type]);
    this.enemies.add(enemy);
    this.enemyLabels.push(createEnemyLabel(this, enemy));
  }

  spawnItem(type, x, y) {
    const item = new Collectible(this, x, y, itemData[type]);
    this.items.add(item);
    item.labelRef = this.add.text(x, y + 42, item.config.label, {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "18px",
      color: "#eff8ff"
    }).setOrigin(0.5);
  }

  spawnSafeMarker(label, x, y) {
    const marker = new SafeMarker(this, x, y, label);
    this.safeMarkers.add(marker);
    marker.labelRef = this.add.text(x, y, label, {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "18px",
      color: "#023427",
      fontStyle: "700"
    }).setOrigin(0.5);
  }

  tryShoot() {
    if (this.stageFinished || !this.player.canShoot(this.time.now)) {
      return;
    }

    const bullet = this.bullets.create(
      this.player.x + (this.player.facing === "left" ? -24 : 24),
      this.player.y - 10,
      "bullet"
    );
    bullet.setVelocityX(this.player.getShotVelocity());
    bullet.body.allowGravity = false;
    bullet.setTint(this.player.hasVerifyBoost(this.time.now) ? 0x4dd8ff : 0xfff17a);
    bullet.setDepth(18);
    this.player.recordShot(this.time.now);
  }

  handleBulletEnemy(bullet, enemy) {
    bullet.destroy();
    if (!enemy.active) {
      return;
    }

    if (enemy.hit()) {
      this.player.risksCleared += 1;
      this.player.addScore(enemy.score);
      this.statusMessage = `已清除：${enemy.config.label}`;
      this.destroyEnemy(enemy);
    }
  }

  destroyEnemy(enemy) {
    this.enemyLabels = this.enemyLabels.filter((label) => {
      if (label.enemyRef === enemy) {
        label.destroy();
        return false;
      }
      return true;
    });
    enemy.destroy();
  }

  handlePlayerEnemy(player, enemy) {
    const result = player.takeDamage(enemy.damage, this.time.now);
    if (!result) {
      return;
    }

    this.statusMessage = result === "shield"
      ? "私隱保護吸收了傷害"
      : `遭受 ${enemy.config.label} 攻擊`;
    if (result !== "shield") {
      this.cameras.main.shake(120, 0.005);
    }
  }

  handleCollectItem(player, item) {
    player.toolsCollected += 1;
    player.addScore(item.config.score);

    if (item.itemId === "shield") {
      player.hasShield = true;
    }
    if (item.itemId === "verify") {
      player.addVerifyBoost(this.time.now, 7000);
    }

    this.statusMessage = `已取得：${item.config.label}`;
    item.labelRef?.destroy();
    item.destroy();
  }

  handleSafeMarkerHit(bullet, marker) {
    bullet.destroy();
    this.player.safeHits += 1;
    this.player.addScore(-20);
    this.statusMessage = `${gameText.safeHitWarning}：${marker.safeLabel}`;
    this.showFloatingText(marker.x, marker.y - 62, gameText.safeHitWarning, "#52f5c8");
    marker.setTint(0xf7ff8d);
    this.time.delayedCall(220, () => marker.setTint(0x52f5c8));
  }

  showFloatingText(x, y, text, color = "#ffd84d") {
    const label = this.add.text(x, y, text, {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "20px",
      color,
      stroke: "#07111f",
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: label,
      y: y - 20,
      alpha: 0,
      duration: 1000,
      onComplete: () => label.destroy()
    });
  }

  update(time) {
    if (this.stageFinished) {
      return;
    }

    this.player.updateMovement(this.cursors, this.keys);
    if (Phaser.Input.Keyboard.JustDown(this.keys.shoot)) {
      this.tryShoot();
    }

    this.enemies.getChildren().forEach((enemy) => enemy.updateBehavior(time, this.player.x));
    this.items.getChildren().forEach((item) => {
      item.updateFloat(time);
      if (item.labelRef?.active) {
        item.labelRef.setPosition(item.x, item.y + 42);
      }
    });
    this.safeMarkers.getChildren().forEach((marker) => {
      if (marker.labelRef?.active) {
        marker.labelRef.setPosition(marker.x, marker.y);
      }
    });
    this.enemyLabels.forEach((label) => {
      if (label.enemyRef?.active) {
        label.setPosition(label.enemyRef.x, label.enemyRef.y);
      }
    });

    this.bullets.getChildren().forEach((bullet) => {
      if (bullet.x < -40 || bullet.x > this.worldWidth + 40) {
        bullet.destroy();
      }
    });

    if (this.player.health <= 0) {
      this.finishStage(false);
      return;
    }

    if (this.player.x >= this.stageEndX) {
      this.finishStage(true);
      return;
    }

    const extraStatus = this.player.hasVerifyBoost(time) ? "查證工具啟動" : this.statusMessage;
    this.hud.update(this.player, extraStatus);
  }

  finishStage(success) {
    this.stageFinished = true;
    const runData = this.registry.get("runData");
    Object.assign(runData, {
      score: this.player.score,
      risksCleared: this.player.risksCleared,
      toolsCollected: this.player.toolsCollected,
      safeHits: this.player.safeHits,
      stageFailed: !success
    });
    this.registry.set("runData", runData);

    if (!success) {
      this.scene.start("ResultScene");
      return;
    }

    this.cameras.main.fadeOut(500, 7, 17, 31);
    this.time.delayedCall(520, () => this.scene.start("BossScene"));
  }
}
