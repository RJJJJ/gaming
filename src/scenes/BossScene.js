import Phaser from "phaser";
import { Player } from "../entities/Player.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/config.js";
import { HUD } from "../ui/HUD.js";
import { gameText } from "../data/gameText.js";

const BOSS_PATTERNS = [
  { label: "錯誤答案彈幕", color: 0xff6b6b, count: 3, spread: 52, speed: -220, damage: 1 },
  { label: "偏見標籤飛彈", color: 0xffa94d, count: 2, spread: 96, speed: -280, damage: 1 },
  { label: "敏感資料吸附波", color: 0xff4d94, count: 1, spread: 0, speed: -360, damage: 2 }
];

export class BossScene extends Phaser.Scene {
  constructor() {
    super("BossScene");
  }

  create() {
    this.bossDefeated = false;
    this.statusMessage = gameText.bossIntro;

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x08111f);

    for (let x = 80; x < GAME_WIDTH; x += 140) {
      this.add.rectangle(x, 170, 56, 180, 0x123252, 0.52);
      this.add.rectangle(x + 24, 250, 110, 6, 0x45d0ff, 0.32);
    }

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(GAME_WIDTH / 2, 660, "platform")
      .setDisplaySize(GAME_WIDTH, 120)
      .refreshBody()
      .setVisible(false);

    this.add.rectangle(GAME_WIDTH / 2, 650, GAME_WIDTH, 140, 0x0d2035, 1)
      .setStrokeStyle(3, 0x45d0ff, 0.34);

    const runData = this.registry.get("runData");
    this.player = new Player(this, 180, 540);
    this.player.score = runData.score;
    this.player.risksCleared = runData.risksCleared;
    this.player.toolsCollected = runData.toolsCollected;
    this.player.safeHits = runData.safeHits;

    this.physics.add.collider(this.player, this.platforms);

    this.bullets = this.physics.add.group({ allowGravity: false });
    this.enemyShots = this.physics.add.group({ allowGravity: false });
    this.physics.add.collider(this.enemyShots, this.platforms);

    this.boss = this.physics.add.sprite(980, 300, "boss");
    this.boss.body.allowGravity = false;
    this.boss.hp = 18;
    this.boss.maxHp = 18;
    this.boss.direction = -1;

    this.bossLabel = this.add.text(this.boss.x, this.boss.y, gameText.bossName, {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "26px",
      color: "#121232",
      fontStyle: "700"
    }).setOrigin(0.5);

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

    this.attackTimer = this.time.addEvent({
      delay: 1400,
      loop: true,
      callback: () => this.fireBossPattern()
    });
  }

  createBossBar() {
    this.add.rectangle(724, 42, 500, 34, 0x08121f, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x45d0ff, 1);
    this.bossBar = this.add.rectangle(728, 46, 492, 26, 0xff6b6b, 1).setOrigin(0, 0);
    this.add.text(724, 14, `${gameText.bossName} 血量`, {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "22px",
      color: "#eff8ff"
    });
  }

  tryShoot() {
    if (this.bossDefeated || !this.player.canShoot(this.time.now)) {
      return;
    }

    const bullet = this.bullets.create(
      this.player.x + (this.player.facing === "left" ? -24 : 24),
      this.player.y - 10,
      "bullet"
    );
    bullet.body.allowGravity = false;
    bullet.setVelocityX(this.player.getShotVelocity());
    bullet.setTint(0xfff17a);
    this.player.recordShot(this.time.now);
  }

  fireBossPattern() {
    const pattern = Phaser.Utils.Array.GetRandom(BOSS_PATTERNS);
    this.statusMessage = `Boss 攻擊：${pattern.label}`;

    for (let i = 0; i < pattern.count; i += 1) {
      const offset = (i - (pattern.count - 1) / 2) * pattern.spread;
      const shot = this.enemyShots.create(this.boss.x - 100, this.boss.y + offset, "bullet");
      shot.setTint(pattern.color);
      shot.body.allowGravity = false;
      shot.setVelocity(pattern.speed, offset * 0.4);
      shot.damage = pattern.damage;
    }
  }

  handleBossHit(bullet, boss) {
    bullet.destroy();
    if (this.bossDefeated) {
      return;
    }

    boss.hp -= 1;
    this.player.addScore(12);
    this.player.risksCleared += 1;
    this.statusMessage = "核心錯誤正在瓦解";
    this.updateBossBar();

    if (boss.hp <= 0) {
      this.player.addScore(60);
      this.completeBossFight();
    }
  }

  handlePlayerShot(player, shot) {
    shot.destroy();
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
    this.bossBar.width = 492 * Phaser.Math.Clamp(this.boss.hp / this.boss.maxHp, 0, 1);
  }

  completeBossFight() {
    this.bossDefeated = true;
    this.attackTimer.remove(false);
    this.enemyShots.clear(true, true);
    this.bossLabel.destroy();
    this.boss.destroy();
    this.statusMessage = "核心已淨化，準備最終判斷";

    const runData = this.registry.get("runData");
    Object.assign(runData, {
      score: this.player.score,
      risksCleared: this.player.risksCleared,
      toolsCollected: this.player.toolsCollected,
      safeHits: this.player.safeHits,
      stageFailed: false
    });
    this.registry.set("runData", runData);

    this.time.delayedCall(900, () => this.scene.start("QuizScene"));
  }

  update() {
    this.player.updateMovement(this.cursors, this.keys);
    if (Phaser.Input.Keyboard.JustDown(this.keys.shoot)) {
      this.tryShoot();
    }

    if (!this.bossDefeated) {
      this.boss.y = 300 + Math.sin(this.time.now / 260) * 60;
      this.boss.x += this.boss.direction * 1.1;
      if (this.boss.x < 860 || this.boss.x > 1080) {
        this.boss.direction *= -1;
      }
      this.bossLabel.setPosition(this.boss.x, this.boss.y);
    }

    this.bullets.getChildren().forEach((bullet) => {
      if (bullet.x > GAME_WIDTH + 60 || bullet.x < -60) {
        bullet.destroy();
      }
    });
    this.enemyShots.getChildren().forEach((shot) => {
      if (shot.x > GAME_WIDTH + 60 || shot.x < -60 || shot.y > GAME_HEIGHT + 60) {
        shot.destroy();
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
