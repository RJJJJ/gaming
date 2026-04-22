import Phaser from "phaser";
import { Player } from "../entities/Player.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/config.js";
import { HUD } from "../ui/HUD.js";
import { gameText } from "../data/gameText.js";

const BOSS_PATTERNS = [
  { label: "錯誤答案彈幕", color: 0xff6b6b, count: 3, spread: 52, speed: -220, damage: 1 },
  { label: "偏見標籤飛彈", color: 0xffa94d, count: 2, spread: 96, speed: -280, damage: 1 },
  { label: "敏感資料吸附波", color: 0xff4d94, count: 1, spread: 0, speed: -340, damage: 2 }
];

export class BossScene extends Phaser.Scene {
  constructor() {
    super("BossScene");
  }

  create() {
    this.bossDefeated = false;
    this.statusMessage = gameText.bossIntro;
    this.bossBarMaxWidth = 492;
    this.lastBossHitAt = 0;

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x08111f);

    for (let x = 80; x < GAME_WIDTH; x += 140) {
      this.add.rectangle(x, 170, 56, 180, 0x123252, 0.52).setDepth(0);
      this.add.rectangle(x + 24, 250, 110, 6, 0x45d0ff, 0.32).setDepth(0);
    }

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(GAME_WIDTH / 2, 660, "platform")
      .setDisplaySize(GAME_WIDTH, 120)
      .refreshBody()
      .setVisible(false);
    this.platforms.create(640, 520, "platform")
      .setDisplaySize(170, 22)
      .refreshBody()
      .setVisible(false);
    this.platforms.create(860, 470, "platform")
      .setDisplaySize(150, 22)
      .refreshBody()
      .setVisible(false);

    this.add.rectangle(GAME_WIDTH / 2, 650, GAME_WIDTH, 140, 0x0d2035, 1)
      .setStrokeStyle(3, 0x45d0ff, 0.34)
      .setDepth(1);
    this.add.rectangle(640, 520, 170, 22, 0x183759, 1)
      .setStrokeStyle(2, 0x45d0ff, 0.65)
      .setDepth(1);
    this.add.rectangle(860, 470, 150, 22, 0x183759, 1)
      .setStrokeStyle(2, 0x45d0ff, 0.65)
      .setDepth(1);

    const runData = this.registry.get("runData");
    this.player = new Player(this, 180, 540);
    this.player.score = runData.score;
    this.player.risksCleared = runData.risksCleared;
    this.player.toolsCollected = runData.toolsCollected;
    this.player.safeHits = runData.safeHits;
    this.player.setDepth(10);

    this.physics.add.collider(this.player, this.platforms);

    this.bullets = this.physics.add.group({ allowGravity: false });
    this.enemyShots = this.physics.add.group({ allowGravity: false });
    this.physics.add.collider(this.enemyShots, this.platforms);

    this.boss = this.physics.add.sprite(980, 430, "boss");
    this.boss.body.allowGravity = false;
    this.boss.setDepth(8);
    this.boss.setSize(220, 170, true);
    this.boss.hp = 12;
    this.boss.maxHp = 12;
    this.boss.direction = -1;
    this.boss.baseY = 430;

    this.physics.add.overlap(this.bullets, this.boss, this.handleBossHit, null, this);
    this.physics.add.overlap(this.player, this.enemyShots, this.handlePlayerShot, null, this);

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
    this.createBossBar();
    this.updateBossBar();

    this.attackTimer = this.time.addEvent({
      delay: 1600,
      loop: true,
      callback: () => this.fireBossPattern()
    });
  }

  createBossBar() {
    this.add.rectangle(724, 42, 500, 34, 0x08121f, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x45d0ff, 1)
      .setDepth(30);
    this.bossBar = this.add.rectangle(728, 46, this.bossBarMaxWidth, 26, 0xff6b6b, 1)
      .setOrigin(0, 0)
      .setDepth(31);
    this.bossTitle = this.add.text(724, 14, `${gameText.bossName} 血量`, {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "22px",
      color: "#eff8ff",
      stroke: "#07111f",
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 2, color: "#000000", blur: 4, fill: true }
    }).setDepth(31);
  }

  tryShoot() {
    if (this.bossDefeated || !this.player.canShoot(this.time.now)) {
      return;
    }

    const offsetX = this.player.facing === "left" ? -28 : 28;
    const bulletY = this.player.body.center.y - 14;
    const bullet = this.bullets.create(this.player.x + offsetX, bulletY, "bullet");

    bullet.body.allowGravity = false;
    bullet.setDepth(12);
    bullet.setVelocityX(this.player.getShotVelocity());
    bullet.setTint(0xfff17a);
    this.player.recordShot(this.time.now);
  }

  fireBossPattern() {
    if (this.bossDefeated || !this.boss.active) {
      return;
    }

    const pattern = Phaser.Utils.Array.GetRandom(BOSS_PATTERNS);
    this.statusMessage = `Boss 攻擊：${pattern.label}`;

    for (let i = 0; i < pattern.count; i += 1) {
      const offset = (i - (pattern.count - 1) / 2) * pattern.spread;
      const shot = this.enemyShots.create(this.boss.x - 110, this.boss.y + offset, "bullet");
      shot.setTint(pattern.color);
      shot.setDepth(11);
      shot.body.allowGravity = false;
      shot.setVelocity(pattern.speed, offset * 0.32);
      shot.damage = pattern.damage;
    }
  }

  handleBossHit(bullet, boss) {
    if (!bullet.active || this.bossDefeated || !boss.active) {
      return;
    }

    const now = this.time.now;
    if (now - this.lastBossHitAt < 80) {
      bullet.disableBody(true, true);
      return;
    }

    this.lastBossHitAt = now;
    bullet.disableBody(true, true);

    boss.hp = Math.max(0, boss.hp - 1);
    this.player.addScore(12);
    this.player.risksCleared += 1;
    this.statusMessage = `命中核心弱點 (${boss.hp}/${boss.maxHp})`;
    this.updateBossBar();
    this.showBossHitFeedback();

    if (boss.hp <= 0) {
      this.player.addScore(60);
      this.completeBossFight();
    }
  }

  showBossHitFeedback() {
    this.boss.setTintFill(0xffffff);
    this.tweens.add({
      targets: this.boss,
      x: this.boss.x - 10,
      duration: 50,
      yoyo: true,
      repeat: 1
    });
    this.time.delayedCall(90, () => {
      if (this.boss?.active) {
        this.boss.clearTint();
      }
    });

    const hitText = this.add.text(this.boss.x, this.boss.y - 130, "-1", {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "28px",
      color: "#fff7a8",
      stroke: "#07111f",
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: hitText,
      y: hitText.y - 28,
      alpha: 0,
      duration: 500,
      onComplete: () => hitText.destroy()
    });
  }

  handlePlayerShot(player, shot) {
    shot.disableBody(true, true);
    const result = player.takeDamage(shot.damage ?? 1, this.time.now);
    if (!result) {
      return;
    }

    this.statusMessage = result === "shield"
      ? "私隱護盾擋下了攻擊"
      : "遭到核心攻擊";
    if (result !== "shield") {
      this.cameras.main.shake(120, 0.005);
    }
  }

  updateBossBar() {
    const ratio = Phaser.Math.Clamp(this.boss.hp / this.boss.maxHp, 0, 1);
    this.bossBar.displayWidth = this.bossBarMaxWidth * ratio;
  }

  completeBossFight() {
    if (this.bossDefeated) {
      return;
    }

    this.bossDefeated = true;
    this.attackTimer?.remove(false);
    this.enemyShots.clear(true, true);
    this.statusMessage = "核心已淨化，準備最終判斷";
    this.updateBossBar();

    const runData = this.registry.get("runData");
    Object.assign(runData, {
      score: this.player.score,
      risksCleared: this.player.risksCleared,
      toolsCollected: this.player.toolsCollected,
      safeHits: this.player.safeHits,
      stageFailed: false
    });
    this.registry.set("runData", runData);

    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 320,
      onComplete: () => {
        this.boss.destroy();
        this.time.delayedCall(400, () => this.scene.start("QuizScene"));
      }
    });
  }

  update() {
    this.player.updateMovement(this.cursors, this.keys);
    if (Phaser.Input.Keyboard.JustDown(this.keys.shoot)) {
      this.tryShoot();
    }

    if (!this.bossDefeated && this.boss.active) {
      this.boss.y = this.boss.baseY + Math.sin(this.time.now / 320) * 22;
      this.boss.x += this.boss.direction * 0.9;
      if (this.boss.x < 900 || this.boss.x > 1080) {
        this.boss.direction *= -1;
      }
    }

    this.bullets.getChildren().forEach((bullet) => {
      if (bullet.active && (bullet.x > GAME_WIDTH + 60 || bullet.x < -60)) {
        bullet.disableBody(true, true);
      }
    });

    this.enemyShots.getChildren().forEach((shot) => {
      if (shot.active && (shot.x > GAME_WIDTH + 60 || shot.x < -60 || shot.y > GAME_HEIGHT + 60)) {
        shot.disableBody(true, true);
      }
    });

    if (this.player.health <= 0) {
      const runData = this.registry.get("runData");
      Object.assign(runData, {
        score: this.player.score,
        risksCleared: this.player.risksCleared,
        toolsCollected: this.player.toolsCollected,
        safeHits: this.player.safeHits,
        stageFailed: true
      });
      this.registry.set("runData", runData);
      this.scene.start("ResultScene");
      return;
    }

    this.hud.update(this.player, this.statusMessage);
  }
}
