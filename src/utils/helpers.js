export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function createPanel(scene, x, y, width, height, options = {}) {
  const {
    fillColor = 0x0b1a2d,
    fillAlpha = 0.88,
    strokeColor = 0x45d0ff,
    strokeAlpha = 0.95,
    radius = 18
  } = options;

  const panel = scene.add.graphics();
  panel.fillStyle(fillColor, fillAlpha);
  panel.lineStyle(2, strokeColor, strokeAlpha);
  panel.fillRoundedRect(x, y, width, height, radius);
  panel.strokeRoundedRect(x, y, width, height, radius);
  return panel;
}

export function addCenteredText(scene, x, y, text, style = {}) {
  return scene.add.text(x, y, text, {
    fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif',
    color: "#eff8ff",
    align: "center",
    ...style
  }).setOrigin(0.5);
}

export function formatChoiceKey(index) {
  return ["A", "B", "C"][index] ?? "";
}
