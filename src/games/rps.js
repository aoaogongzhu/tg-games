// 🪨 猜拳王 - RPS King (Bilingual)
const { v4: uuidv4 } = require('uuid');
const i18n = require('../utils/i18n');

const games = new Map();
const CHOICES = [
  { id: 'rock', emoji: '🪨' },
  { id: 'paper', emoji: '📄' },
  { id: 'scissors', emoji: '✂️' }
];

module.exports = {
  id: 'rps', name: '🪨 猜拳王',

  async startPlay(ctx) {
    const lang = i18n.detectLang(ctx);
    const msg = ctx.chat.id > 0 ? `${i18n.t(lang,'rps.title')}\n\n${i18n.t(lang,'common.social_tag')}` : i18n.t(lang,'rps.title');
    return ctx.reply(msg, {
      reply_markup: { inline_keyboard: [[{ text: '🆕 ' + i18n.t(lang,'rps.accept'), callback_data: 'game_rps_challenge' }]] }
    });
  },

  async handleCallback(ctx, action) {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name || 'Player';
    const lang = i18n.getUserLang(userId) || i18n.detectLang(ctx);

    if (action === 'challenge') {
      const id = uuidv4().slice(0, 6);
      games.set(id, { id, challenger: { id: userId, username, lang }, chatId: ctx.chat.id, status: 'waiting' });
      return ctx.editMessageText(`🪨 ${username} ${i18n.t(lang,'rps.challenge')}`, {
        reply_markup: { inline_keyboard: [
          [{ text: i18n.t(lang,'rps.accept'), callback_data: `game_rps_accept_${id}` }],
          [{ text: '❌', callback_data: `game_rps_cancel_${id}` }]
        ]}
      });
    }

    if (action.startsWith('challenge_')) {
      const chId = action.slice(10);
      const ch = games.get(chId);
      if (!ch || !ch.isOpen) return ctx.answerCbQuery('❌', { show_alert: true });
      if (userId === ch.challenger.id) return ctx.answerCbQuery('不能和自己玩', { show_alert: true });
      const oppLang = i18n.getUserLang(userId) || i18n.detectLang(ctx);
      ch.opponent = { id: userId, username, lang: oppLang };
      ch.state = {}; ch.scores = {}; ch.round = 1; ch.status = 'playing';
      ch.state[ch.challenger.id] = null; ch.state[userId] = null;
      ch.scores[ch.challenger.id] = 0; ch.scores[userId] = 0;
      ch.chatId = ctx.chat.id;
      await ctx.editMessageText('🪨 ' + ch.challenger.username + ' VS ' + username);
      for (const p of [ch.challenger, ch.opponent]) {
        const pLang = p.lang || lang;
        try { await ctx.telegram.sendMessage(p.id, '出拳！', {
          reply_markup: { inline_keyboard: [[
            { text: '🪨 石头', callback_data: 'game_rps_move_' + ch.id + '_' + p.id + '_rock' },
            { text: '📄 布', callback_data: 'game_rps_move_' + ch.id + '_' + p.id + '_paper' },
            { text: '✂️ 剪刀', callback_data: 'game_rps_move_' + ch.id + '_' + p.id + '_scissors' }
          ]]}
        }); } catch(e) {}
      }
      return ctx.answerCbQuery('✅');
    }

    if (action.startsWith('accept_')) {
      const gameId = action.slice(7);
      const game = games.get(gameId);
      if (!game) return ctx.answerCbQuery('❌', { show_alert: true });
      if (userId === game.challenger.id) return ctx.answerCbQuery('❌', { show_alert: true });
      const oppLang = i18n.getUserLang(userId) || i18n.detectLang(ctx);
      game.opponent = { id: userId, username, lang: oppLang };
      game.state = {}; game.scores = {}; game.round = 1; game.status = 'playing';
      game.state[game.challenger.id] = null; game.state[userId] = null;
      game.scores[game.challenger.id] = 0; game.scores[userId] = 0;
      await ctx.editMessageText(`${i18n.t(lang,'rps.title')}\n\n${game.challenger.username} VS ${username}`);
      for (const p of [game.challenger, game.opponent]) {
        const pLang = p.lang || lang;
        try { await ctx.telegram.sendMessage(p.id, i18n.t(pLang,'rps.enter'), {
          reply_markup: { inline_keyboard: [[
            { text: i18n.t(pLang,'rps.rock'), callback_data: `game_rps_move_${game.id}_${p.id}_rock` },
            { text: i18n.t(pLang,'rps.paper'), callback_data: `game_rps_move_${game.id}_${p.id}_paper` },
            { text: i18n.t(pLang,'rps.scissors'), callback_data: `game_rps_move_${game.id}_${p.id}_scissors` }
          ]]}
        }); } catch(e) {}
      }
      return ctx.answerCbQuery('✅');
    }

    if (action.startsWith('move_')) {
      const parts = action.split('_');
      const gameId = parts[1], pid = parseInt(parts[2]), choice = parts[3];
      const game = games.get(gameId);
      if (!game || game.status !== 'playing') return ctx.answerCbQuery('❌');
      if (pid !== userId) return ctx.answerCbQuery('❌');
      game.state[pid] = choice;
      const pLang = game.players?.[pid]?.lang || lang;
      await ctx.answerCbQuery(`✅`);
      const p1 = game.challenger, p2 = game.opponent;
      if (game.state[p1.id] && game.state[p2.id]) {
        await resolveRound(ctx, game);
      } else {
        const done = Object.values(game.state).filter(Boolean).length;
        try { await ctx.telegram.sendMessage(game.chatId, i18n.t(lang,'rps.waiting').replace('{n}',done)); } catch(e) {}
      }
      return;
    }

    if (action.startsWith('cancel_')) {
      const gameId = action.slice(7);
      const g = games.get(gameId);
      if (g) games.delete(gameId);
      await ctx.editMessageText('❌');
      return ctx.answerCbQuery('❌');
    }
    return ctx.answerCbQuery('❓');
  }
};

async function resolveRound(ctx, game) {
  const p1 = game.challenger, p2 = game.opponent;
  const c1 = game.state[p1.id], c2 = game.state[p2.id];
  const choice1 = CHOICES.find(c=>c.id===c1);
  const choice2 = CHOICES.find(c=>c.id===c2);
  const useLang = p1.lang || 'en';
  let msg = i18n.t(useLang,'rps.round_title').replace('{n}', game.round) + '\n\n';
  msg += i18n.t(useLang,'rps.round_result').replace('{p1}',p1.username).replace('{c1}',choice1?.emoji||'?').replace('{p2}',p2.username).replace('{c2}',choice2?.emoji||'?') + '\n\n';
  let winner = null;
  if (c1 === c2) { msg += i18n.t(useLang,'rps.tie'); }
  else if (['rock','scissors','paper'].indexOf(c1) === (['paper','rock','scissors'].indexOf(c2) + 1) % 3) {
    winner = p1.id; msg += i18n.t(useLang,'rps.round_win').replace('{winner}',p1.username);
  } else {
    winner = p2.id; msg += i18n.t(useLang,'rps.round_win').replace('{winner}',p2.username);
  }
  if (winner) game.scores[winner]++;
  game.state = {}; game.state[p1.id]=null; game.state[p2.id]=null;
  game.round++;
  const s1 = game.scores[p1.id], s2 = game.scores[p2.id];
  msg += '\n\n' + i18n.t(useLang,'rps.score').replace('{p1}',p1.username).replace('{s1}',s1).replace('{p2}',p2.username).replace('{s2}',s2);
  if (s1 >= 2 || s2 >= 2) {
    game.status = 'finished';
    const w = s1 >= 2 ? p1 : p2;
    msg += '\n\n' + i18n.t(useLang,'rps.match_win').replace('{winner}',w.username);
    try { await ctx.telegram.sendMessage(game.chatId, msg, {
      reply_markup: { inline_keyboard: [[{ text: '🔄', callback_data: 'game_rps_challenge' }]] }
    }); } catch(e) {}
    games.delete(game.id);
  } else {
    msg += '\n\n' + i18n.t(useLang,'rps.next_round').replace('{n}',game.round);
    try { await ctx.telegram.sendMessage(game.chatId, msg); } catch(e) {}
    for (const p of [p1, p2]) {
      const pLang = p.lang || useLang;
      try { await ctx.telegram.sendMessage(p.id, i18n.t(pLang,'rps.enter'), {
        reply_markup: { inline_keyboard: [[
          { text: i18n.t(pLang,'rps.rock'), callback_data: `game_rps_move_${game.id}_${p.id}_rock` },
          { text: i18n.t(pLang,'rps.paper'), callback_data: `game_rps_move_${game.id}_${p.id}_paper` },
          { text: i18n.t(pLang,'rps.scissors'), callback_data: `game_rps_move_${game.id}_${p.id}_scissors` }
        ]]}
      }); } catch(e) {}
    }
  }
}
