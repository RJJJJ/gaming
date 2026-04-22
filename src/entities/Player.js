import Phaser from "phaser";
import { clamp } from "../utils/helpers.js";

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDragX(1500);
    this.setMaxVelocity(360, 820);

    this.moveSpeed = 280;
    this.jumpVelocity = -480;
    this.facing = "right";
    this.health = 5;
    this.score = 0;
    this.toolsCollected = 0;
    this.risksCleared = 0;
    this.safeHits = 0;
    this.hasShield = false;
    this.verifyBoostUntil = 0;
    this.invulnerableUntil = 0;
    this.lastShotAt = 0;
  }

  updateMovement(cursors, keys) {
    const left = cursors.left.isDown || keys.left.isDown;
    const right = cursors.right.isDown || keys.right.isDown;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(cursors.up) ||
      Phaser.Input.Keyboard.JustDown(cursors.space) ||
      Phaser.Input.Keyboard.JustDown(keys.jump);

    if (left) {
      this.setVelocityX(-this.moveSpeed);
      this.facing = "left";
    } else if (right) {
      this.setVelocityX(this.moveSpeed);
      this.facing = "right";
    }

    if (jumpPressed && this.body.blocked.down) {
      this.setVelocityY(this.jumpVelocity);
    }
  }

  canShoot(time) {
    return time - this.lastShotAt >= 220;
  }

  recordShot(time) {
    this.lastShotAt = time;
  }

  getShotVelocity() {
    return this.facing === "left" ? -560 : 560;
  }

  addScore(amount) {
    this.score = Math.max(0, this.score + amount);
  }

  addVerifyBoost(time, duration) {
    this.verifyBoostUntil = time + duration;
  }

  hasVerifyBoost(time) {
    return time < this.verifyBoostUntil;
  }

  takeDamage(amount, time) {
    if (time < this.invulnerableUntil) {
      return false;
    }

    this.invulnerableUntil = time + 1000;

    if (this.hasShield) {
      this.hasShield = false;
      return "shield";
    }

    this.health = clamp(this.health - amount, 0, 5);
    return true;
  }
}
