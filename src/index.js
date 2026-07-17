// ─── Railway / Environment Config ─────────────────────────────────
require('dotenv').config();
const express = require('express');
const path = require('path');
const { Telegraf } = require('telegraf');
const hub = require('./utils/hub');
const duelGame = require('./games/duel');

// Auto-detect Railway public URL
if (!process.env.APP_URL && process.env.RAILWAY_PUBLIC_DOMAIN) {
  process.env.APP_URL = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
}
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN 未设置');
  console.error('   在 Railway Dashboard → Variables 中添加 BOT_TOKEN');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── Bot ──────────────────────────────────────────────────────────

bot.start((ctx) => hub.showMainMenu(ctx));

bot.on('callback_query', async (ctx) => {
  try {
    const handled = await hub.routeCallback(ctx);
    if (handled === false) await ctx.answerCbQuery('操作不识别');
  } catch (e) {
    console.error('Callback error:', e.message);
    try { await ctx.answerCbQuery('处理出错'); } catch (_) {}
  }
});

// ─── API: Duel Game ──────────────────────────────────────────────

app.get('/api/duel/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  const pid = req.query.pid;
  if (!pid) return res.status(400).json({ error: 'pid required' });
  const game = duelGame.getGameForPlayer(gameId, pid);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  res.json(game);
});

app.post('/api/duel/:gameId/action', async (req, res) => {
  const gameId = req.params.gameId;
  const { pid, action } = req.body;
  if (!pid || !action) return res.status(400).json({ error: 'pid and action required' });
  const result = duelGame.submitAction(gameId, pid, action);
  if (result.error) return res.status(400).json({ error: result.error });
  if (result.resolved) {
    const state = duelGame.getGameState(gameId);
    if (state) broadcastDuelTurn(state);
  }
  const game = duelGame.getGameForPlayer(gameId, pid);
  res.json({ success: true, game });
});

app.get('/api/duel/:gameId/poll', (req, res) => {
  const gameId = req.params.gameId;
  const pid = req.query.pid;
  if (!pid) return res.status(400).json({ error: 'pid required' });
  const game = duelGame.getGameForPlayer(gameId, pid);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  res.json({
    status: game.status, turn: game.turn,
    myAction: game.me.action, opponentAction: game.opponent.action,
    meHp: game.me.hp, opponentHp: game.opponent.hp,
    winner: game.winner, log: game.log
  });
});

async function broadcastDuelTurn(state) {
  const log = state.log[state.log.length - 1];
  const p1 = state.players[state.order[0]];
  const p2 = state.players[state.order[1]];
  try {
    if (state.status === 'finished') {
      let msg;
      if (state.winner === 'draw') {
        msg = `🤯 *平局！*\n\n${p1.username}: ${p1.hp} HP\n${p2.username}: ${p2.hp} HP`;
      } else {
        const winner = state.players[state.winner];
        msg = `🏆 *${winner.username}* 赢得决斗！\n\n${p1.username}: ${p1.hp} HP\n${p2.username}: ${p2.hp} HP`;
      }
      await bot.telegram.sendMessage(state.chatId, msg, { parse_mode: 'Markdown' });
    } else {
      await bot.telegram.sendMessage(
        state.chatId,
        `*第 ${log.turn} 回合*\n${log.log}\n\n${p1.username}: ${p1.hp} HP | ${p2.username}: ${p2.hp} HP`,
        { parse_mode: 'Markdown' }
      );
    }
  } catch (e) {}
}

// ─── Start ────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🤖 Bot: @games_lite_bot`);
  console.log(`🎮 Mini App URL: ${APP_URL}`);
});

bot.launch().then(() => console.log('✅ Bot polling started'))
  .catch(err => console.error('❌ Bot failed:', err.message));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
