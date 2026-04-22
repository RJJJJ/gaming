# AI 防線：安全與判斷之戰

`AI Defense: Ethics & Safety Run` 是一個以面試展示與科學館展示為目標的 Phaser 3 橫向射擊教育遊戲 MVP。玩家扮演「AI 守門員」，在 AI 系統世界中分辨風險、收集工具、避免誤傷正確做法，最後透過關底選擇完成 AI 論理與安全教育流程。

## 教育目標

- 讓玩家理解 AI 可能出錯，不能盲信。
- 讓玩家辨認偏差、公平與私隱風險。
- 讓玩家知道敏感資料不應隨便輸入 AI。
- 讓玩家建立「重要結果要再查證」的習慣。

## 遊戲玩法

- 左右移動、跳躍與射擊，清除 AI 風險敵人。
- 收集「查證工具」、「私隱保護」、「人工判斷」三種道具。
- 畫面中會出現正確做法標記，例如「再次查證」、「保護私隱」，這些不是敵人，打中會扣分。
- 主關卡後進入 Boss 戰，擊敗「失控核心 AI」。
- Boss 戰結束後完成教育選擇，再進入結算畫面。

## 技術棧

- Phaser 3
- JavaScript
- Vite

## 如何安裝

```bash
npm install
```

## 如何啟動

```bash
npm run dev
```

預設會啟動本地 Vite 開發伺服器。

## 如何 build

```bash
npm run build
```

## GitHub Pages 發布

- 此專案已配置 GitHub Pages workflow。
- 推送到 `main` 後，GitHub Actions 會自動 build 並部署。
- 預期展示網址為：`https://rjjjj.github.io/gaming/`

## 專案結構簡介

```text
src/
  data/
    enemyData.js
    gameText.js
    itemData.js
  entities/
    enemies.js
    items.js
    Player.js
  game/
    config.js
  scenes/
    BootScene.js
    BossScene.js
    GameScene.js
    MenuScene.js
    QuizScene.js
    ResultScene.js
  ui/
    HUD.js
  utils/
    helpers.js
  main.js
index.html
package.json
README.md
```

## 展示建議

- 適合在面試中展示「教育內容如何融入玩法」。
- 適合在科學館以投影或桌面螢幕快速體驗。
- 一局流程短，可在 3 至 5 分鐘內完成整體展示。
- 不依賴外部素材，方便本地執行與後續部署成網頁 demo。
