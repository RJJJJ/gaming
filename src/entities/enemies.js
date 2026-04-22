import Phaser from "phaser";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, "enemy-body");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.config = config;
    this.id = config.id;
    this.hp = config.hp;
    this.damage = config.damage;
    this.score = config.score;
    this.behavior = config.behavior;
    this.baseY = y;
    this.spawnTime = scene.time.now;

    this.setDisplaySize(config.width, config.height);
    this.setTint(config.color);
    this.setCollideWorldBounds(false);
    this.setImmovable(false);
    this.setDepth(8);
    this.body.allowGravity = config.behavior !== "float";
  }

  updateBehavior(time, playerX) {
    if (this.behavior === "float") {
      this.y = this.baseY + Math.sin((time - this.spawnTime) / 260) * 18;
      this.setVelocityX(-this.config.speed);
    }

    if (this.behavior === "ground") {
      this.setVelocityX(-this.config.speed);
    }

    if (this.behavior === "dash") {
      const direction = playerX < this.x ? -1 : 1;
      this.setVelocityX(direction * this.config.speed);
    }
  }

  hit() {
    this.hp -= 1;
    return this.hp <= 0;
  }
}

export function createEnemyLabel(scene, enemy) {
  const label = scene.add.text(enemy.x, enemy.y, enemy.config.label, {
    fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
    fontSize: "16px",
    color: enemy.config.textColor,
    fontStyle: "700",
    stroke: "#07111f",
    strokeThickness: 4,
    shadow: { offsetX: 0, offsetY: 2, color: "#000000", blur: 4, fill: true }
  }).setOrigin(0.5).setDepth(12);

  label.enemyRef = enemy;
  return label;
}
