require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { Telegraf } = require('telegraf');
const hub = require('./utils/hub');
let duelGame; try { duelGame = require('./games/duel'); } catch(e) { duelGame = null; }
const i18n = require('./utils/i18n');

if (!process.env.APP_URL && process.env.RAILWAY_PUBLIC_DOMAIN) {
  process.env.APP_URL = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
}
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN 未设置');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── Bot ──────────────────────────────────────────────────────────

bot.start((ctx) => hub.showMain(ctx));

bot.on('callback_query', async (ctx) => {
  try {
    const handled = await hub.routeCB(ctx);
    if (handled === false) await ctx.answerCbQuery('❓');
  } catch (e) {
    console.error('Callback error:', e.message);
    try { await ctx.answerCbQuery('❌'); } catch (_) {}
  }
});

// ─── API: Duel ────────────────────────────────────────────────────

app.get('/api/duel/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  const pid = req.query.pid;
  if (!pid) return res.status(400).json({ error: 'pid required' });
  const game = duelGame.getGameForPlayer(gameId, pid);
  if (!game) return res.status(404).json({ error: 'not found' });
  res.json(game);
});

app.post('/api/duel/:gameId/action', async (req, res) => {
  const gameId = req.params.gameId;
  const { pid, action } = req.body;
  if (!pid || !action) return res.status(400).json({ error: 'required' });
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
  if (!game) return res.status(404).json({ error: 'not found' });
  res.json({
    status: game.status, turn: game.turn,
    myAction: game.me.action, opponentAction: game.opponent.action,
    meHp: game.me.hp, opponentHp: game.opponent.hp,
    winner: game.winner, log: game.log, lang: game.lang || 'en'
  });
});

// ─── Bilingual Broadcast ──────────────────────────────────────────

async function broadcastDuelTurn(state) {
  const log = state.log[state.log.length - 1];
  const p1 = state.players[state.order[0]];
  const p2 = state.players[state.order[1]];
  const lang = state.lang || 'en';

  try {
    if (state.status === 'finished') {
      let msg;
      if (state.winner === 'draw') {
        msg = i18n.t(lang, 'duel.draw_broadcast')
          .replace('{p1}', p1.username).replace('{hp1}', p1.hp)
          .replace('{p2}', p2.username).replace('{hp2}', p2.hp);
      } else {
        const winner = state.players[state.winner];
        const loser = state.players[state.order[0]].id === winner.id
          ? state.players[state.order[1]] : state.players[state.order[0]];
        msg = i18n.t(lang, 'duel.win_broadcast')
          .replace('{winner}', winner.username).replace('{hp1}', loser.hp)
          .replace('{loser}', loser.username).replace('{hp2}', winner.hp);
      }
      await bot.telegram.sendMessage(state.chatId, msg, { parse_mode: 'Markdown' });
    } else {
      const logText = i18n.t(lang, 'duel.' + (log.logKey || 'log_attack_attack'));
      const msg = i18n.t(lang, 'duel.round_broadcast')
        .replace('{n}', log.turn).replace('{log}', logText)
        .replace('{p1}', p1.username).replace('{hp1}', p1.hp)
        .replace('{p2}', p2.username).replace('{hp2}', p2.hp);
      await bot.telegram.sendMessage(state.chatId, msg, { parse_mode: 'Markdown' });
    }
  } catch (e) {}
}



// ─── Diagnostic ──────────────────────────────────────────────────
bot.command('status', (ctx) => {
  const hub = require('./utils/hub');
  const ALL = ['drawguess','spy','friendquiz','truth','wheel','potato','rather','truthdice'];
  let msg = '🎮 *Game Status*\\n\\n';
  ALL.forEach(id => {
    try { const m = require('./games/'+id); msg += '✅ '+id+' = '+m.name+'\\n'; }
    catch(e) { msg += '❌ '+id+': '+e.message.split('\\n')[0]+'\\n'; }
  });
  msg += '\\n📊 Total: '+ALL.length+' games';
  ctx.reply(msg, { parse_mode: 'Markdown' });
});

// ─── Start ────────────────────────────────────────────────────────


// ??? Draw & Guess API ?????????????????????????????????????????????
const DRAW_DIR = path.join(__dirname, "..", "public", "drawings");
if (!fs.existsSync(DRAW_DIR)) fs.mkdirSync(DRAW_DIR, { recursive: true });

app.post('/api/draw/submit', express.json(), (req, res) => {
  const { gameId, playerId, image } = req.body;
  if (!gameId || !image) return res.status(400).json({ success: false });
  const filename = gameId + '.png';
  const buffer = Buffer.from(image.split(',')[1], 'base64');
  fs.writeFileSync(path.join(DRAW_DIR, filename), buffer);
  // Try to send the image to the game chat
  const g = drawGuessGame?.getGame?.(gameId);
  if (g && g.chatId && bot) {
    bot.telegram.sendPhoto(g.chatId, { source: buffer }, {
      caption: (g.lang === 'zh' ? '?? ???????????\n\n??????????' : '?? Drawing ready! Guess what it is?\n\nTap a button to guess:'),
      reply_markup: { inline_keyboard: g.guessOptions || [] }
    }).catch(e => console.error('sendPhoto:', e.message));
  }
  res.json({ success: true });
});

app.get('/api/draw/image/:gameId', (req, res) => {
  const filepath = path.join(DRAW_DIR, req.params.gameId + '.png');
  if (fs.existsSync(filepath)) res.sendFile(filepath);
  else res.status(404).json({ error: 'not found' });
});

app.listen(PORT, () => {
  console.log(`🌐 Server on port ${PORT}`);
  console.log(`🤖 Bot: @games_lite_bot`);
  console.log(`🎮 Mini App URL: ${APP_URL}`);
  console.log(`🌐 Bilingual: 中文 / English`);
});

bot.launch().then(() => console.log('✅ Bot online'))
  .catch(err => console.error('❌ Bot failed:', err.message));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err?.message || err);
});

