export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(24, 18).setScrollFactor(0).setDepth(30);

    const bg = scene.add.rectangle(0, 0, 420, 120, 0x08121f, 0.76).setOrigin(0);
    bg.setStrokeStyle(2, 0x45d0ff, 0.9);

    this.healthText = scene.add.text(18, 16, "", this.textStyle());
    this.scoreText = scene.add.text(18, 46, "", this.textStyle());
    this.toolText = scene.add.text(18, 76, "", this.textStyle());
    this.statusText = scene.add.text(238, 16, "", {
      ...this.textStyle(),
      fontSize: "18px",
      color: "#ffd84d",
      wordWrap: { width: 162 }
    });

    this.container.add([bg, this.healthText, this.scoreText, this.toolText, this.statusText]);
  }

  textStyle() {
    return {
      fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
      fontSize: "22px",
      color: "#eff8ff"
    };
  }

  update(player, extraStatus = "") {
    this.healthText.setText(`血量 ${player.health}${player.hasShield ? " +盾" : ""}`);
    this.scoreText.setText(`分數 ${player.score}  風險 ${player.risksCleared}`);
    this.toolText.setText(`工具 ${player.toolsCollected}  誤傷 ${player.safeHits}`);
    this.statusText.setText(extraStatus);
  }
}
