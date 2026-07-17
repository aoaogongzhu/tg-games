# 🎮 游戏大厅 — Telegram 社交小游戏合集

5 个按钮驱动的社交小游戏，部署到 Railway 即可和朋友一起玩。

## 游戏列表

| 游戏 | 类型 | 玩法 |
|------|------|------|
| ⚔️ 决斗场 | Mini App | 8HP 回合制 1v1 对战，约 30 秒一局 |
| 🪨 猜拳王 | 按钮 | 三局两胜猜拳 |
| 🎲 生死骰子 | 按钮 | 猜 1-6，一下定输赢 |
| 💬 真心话大冒险 | 按钮 | 随机出题，群里一起玩 |
| 🎡 命运转盘 | Mini App | 8 格转盘动画，转出你的命运 |

## 部署到 Railway（5 分钟）

### 1. 推送代码到 GitHub

```bash
# 在你的电脑上
cd tg-duel-game
git init
git add .
git commit -m "init: 5 social mini games for Telegram"

# 在 GitHub 创建新仓库（不要加 README、.gitignore），然后：
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

### 2. 在 Railway 部署

1. 打开 [Railway Dashboard](https://railway.app/dashboard)
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择你刚推送的仓库
4. Railway 会自动检测 Node.js 并开始部署
5. 部署完成后，点你的项目 → **Settings** → **Domains** → **Generate Domain**
6. 记下生成的域名（如 `xxx.up.railway.app`）

### 3. 配置环境变量

在 Railway Dashboard → 你的项目 → **Variables**，添加：

| 变量 | 值 | 说明 |
|------|-----|------|
| `BOT_TOKEN` | `8854930994:AAEGwNfzd0_uZcIX6AAgUPNwepI7pwnqPV8` | 你的 Bot Token |

**🚀 `APP_URL` 不需要手动设置**！Railway 会自动通过 `RAILWAY_PUBLIC_DOMAIN` 检测。

### 4. 配置 BotFather

在 Telegram 中打开 [@BotFather](https://t.me/BotFather)：

```
/setdomain
→ 选择 games_lite_bot
→ 输入你的 Railway 域名（xxx.up.railway.app，不加 https://）

/mybots
→ games_lite_bot → Bot Settings → Menu Button
→ URL: https://你的域名.up.railway.app/duel.html
→ 按钮文字: 🎮 游戏大厅
```

### 5. 开玩！

打开 Telegram → 找到 `@games_lite_bot` → 发 `/start`

把 Bot 拉到一个群组里，和朋友一起玩！

## 本地开发

```bash
cp .env.example .env
# 编辑 .env 填入 BOT_TOKEN 和 APP_URL

npm install
npm start
```

## 技术栈

- **Bot**: Node.js + Telegraf
- **后端**: Express.js
- **前端**: 纯 HTML/CSS/JS (Telegram Mini App)
- **游戏数据**: 内存存储
- **部署**: Railway
