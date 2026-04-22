import Phaser from "phaser";

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, "item-body");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.itemId = config.id;
    this.config = config;
    this.setDisplaySize(52, 52);
    this.setTint(config.color);
    this.body.allowGravity = false;
    this.baseY = y;
    this.spawnTime = scene.time.now;
  }

  updateFloat(time) {
    this.y = this.baseY + Math.sin((time - this.spawnTime) / 240) * 8;
  }
}

export class SafeMarker extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, label) {
    super(scene, x, y, "safe-body");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.safeLabel = label;
    this.setDisplaySize(120, 58);
    this.setTint(0x52f5c8);
    this.body.allowGravity = false;
  }
}
