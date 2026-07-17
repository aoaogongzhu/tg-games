// ?? ������ - Duel Arena (Bilingual)
const { v4: uuidv4 } = require('uuid');
const i18n = require('../utils/i18n');

const MAX_HP = 8;
const ACTIONS = ['attack', 'defend', 'heal'];
const games = new Map();
const challenges = new Map();

function detectLangFromIds(...ids) {
  for (const id of ids) {
    const pref = i18n.getUserLang(id);
    if (pref) return pref;
  }
  return 'en';
}

module.exports = {
  id: 'duel', name: '?? ������',

  async startPlay(ctx) {
    const lang = i18n.detectLang(ctx);
    if (ctx.chat.id > 0) {
      return ctx.reply(`${i18n.t(lang, 'duel.name')}\n\n${i18n.t(lang, 'common.social_tag')}`, {
        reply_markup: { inline_keyboard: [[{ text: '?? ' + i18n.t(lang, 'common.retry').replace('����һ��','Challenge'), callback_data: 'game_duel_challenge' }]] }
      });
    }
    return ctx.reply(`${i18n.t(lang, 'duel.name')}\n\n${i18n.t(lang, 'common.social_tag')}`, {
      reply_markup: { inline_keyboard: [[{ text: '?? ' + i18n.t(lang, 'duel.accept').replace('?? ',''), callback_data: 'game_duel_challenge' }]] }
    });
  },

  async handleCallback(ctx, action) {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name || 'Player';
    const lang = i18n.getUserLang(userId) || i18n.detectLang(ctx);

    if (action.startsWith('challenge_')) {
      const challengeId = action.slice(10);
      const challenge = challenges.get(challengeId);
      if (!challenge) return ctx.answerCbQuery('❌', { show_alert: true });
      if (userId === challenge.challenger.id) return ctx.answerCbQuery('不能和自己决斗', { show_alert: true });
      challenges.delete(challengeId);
      const gameId = uuidv4().slice(0, 8);
      const game = {
        id: gameId, chatId: ctx.chat.id, lang: challenge.challenger.lang || lang, turn: 1, status: 'playing', winner: null, log: [],
        players: {
          [challenge.challenger.id]: { id: challenge.challenger.id, username: challenge.challenger.username, hp: 8, action: null, lang: challenge.challenger.lang },
          [userId]: { id: userId, username, hp: 8, action: null, lang: lang }
        },
        order: [challenge.challenger.id, userId]
      };
      games.set(gameId, game);
      const url = process.env.APP_URL + '/duel.html?gameId=' + gameId + '&p1=' + challenge.challenger.id + '&p2=' + userId + '&lang=' + lang;
      try { await ctx.editMessageText((lang === 'zh' ? '⚔️ 决斗开始！' : '⚔️ Duel started!') + ' ' + challenge.challenger.username + ' VS ' + username, { parse_mode: 'Markdown' }); } catch(e) {}
      for (const pid of [challenge.challenger.id, userId]) {
        try {
          const pl = pid === challenge.challenger.id ? (challenge.challenger.lang || lang) : lang;
          await ctx.telegram.sendMessage(pid, lang === 'zh' ? '你的决斗已开始！点击进入战场：' : 'Your duel has started! Click to enter:', {
            reply_markup: { inline_keyboard: [[{ text: '⚔️ ' + (lang === 'zh' ? '进入战场' : 'Enter Battle'), web_app: { url: url + '&lang=' + pl } }]] }
          });
        } catch(e) {}
      }
      return ctx.answerCbQuery('✅');
    }

    if (action === 'challenge') {
      const challengeId = uuidv4().slice(0, 6);
      challenges.set(challengeId, {
        challenger: { id: userId, username, lang },
        chatId: ctx.chat.id, expiresAt: Date.now() + 30000
      });
      await ctx.editMessageText(
        `?? ${username} ${i18n.t(lang, 'duel.challenge')}\n\n${i18n.t(lang, 'duel.challenge_hint')}`, {
          reply_markup: { inline_keyboard: [
            [{ text: i18n.t(lang, 'duel.accept'), callback_data: `game_duel_accept_${challengeId}` }],
            [{ text: i18n.t(lang, 'duel.cancel'), callback_data: `game_duel_cancel_${challengeId}` }]
          ]}
        }
      );
      return ctx.answerCbQuery('?');
    }

    if (action.startsWith('accept_')) {
      const challengeId = action.slice(7);
      const challenge = challenges.get(challengeId);
      if (!challenge) return ctx.answerCbQuery('?', { show_alert: true });
      if (userId === challenge.challenger.id) return ctx.answerCbQuery(i18n.t(lang, 'duel.cant_self'), { show_alert: true });
      challenges.delete(challengeId);

      const gameId = uuidv4().slice(0, 8);
      const oppLang = i18n.getUserLang(userId) || i18n.detectLang(ctx);
      const game = {
        id: gameId, chatId: ctx.chat.id, lang, turn: 1, status: 'playing', winner: null, log: [],
        players: {
          [challenge.challenger.id]: { id: challenge.challenger.id, username: challenge.challenger.username, hp: MAX_HP, action: null, lang: challenge.challenger.lang },
          [userId]: { id: userId, username, hp: MAX_HP, action: null, lang: oppLang }
        },
        order: [challenge.challenger.id, userId]
      };
      games.set(gameId, game);

      const url = `${process.env.APP_URL}/duel.html?gameId=${gameId}&p1=${challenge.challenger.id}&p2=${userId}&lang=${lang}`;
      await ctx.editMessageText(
        `${i18n.t(lang, 'duel.started').replace('{p1}', challenge.challenger.username).replace('{p2}', username)}`, {
          reply_markup: { inline_keyboard: [[{ text: i18n.t(lang, 'duel.enter_battle'), web_app: { url } }]] }
        }
      );
      try {
        await ctx.telegram.sendMessage(challenge.chatId,
          i18n.t(lang, 'duel.spectate').replace(/\*/g,'').replace('{p1}', challenge.challenger.username).replace('{p2}', username));
      } catch(e) {}
      for (const pid of [challenge.challenger.id, userId]) {
        const pLang = pid === challenge.challenger.id ? challenge.challenger.lang : oppLang;
        const pUrl = `${process.env.APP_URL}/duel.html?gameId=${gameId}&p1=${challenge.challenger.id}&p2=${userId}&lang=${pLang}`;
        try {
          await ctx.telegram.sendMessage(pid, i18n.t(pLang, 'duel.your_turn'), {
            reply_markup: { inline_keyboard: [[{ text: i18n.t(pLang, 'duel.enter_battle'), web_app: { url: pUrl } }]] }
          });
        } catch(e) {}
      }
      return ctx.answerCbQuery('?');
    }

    if (action.startsWith('cancel_')) {
      const challengeId = action.slice(7);
      const c = challenges.get(challengeId);
      if (!c) return ctx.answerCbQuery('?');
      challenges.delete(challengeId);
      await ctx.editMessageText('?');
      return ctx.answerCbQuery('?');
    }
    return ctx.answerCbQuery('?');
  },

  getGame(gameId) { return games.get(gameId); },

  submitAction(gameId, playerId, action) {
    const game = games.get(gameId);
    if (!game || game.status !== 'playing') return { error: 'not active' };
    if (!ACTIONS.includes(action)) return { error: 'invalid' };
    if (!game.players[playerId]) return { error: 'not your game' };
    if (game.players[playerId].action !== null) return { error: 'already submitted' };
    game.players[playerId].action = action;
    const p1 = game.players[game.order[0]], p2 = game.players[game.order[1]];
    if (p1.action && p2.action) { this.resolveTurn(game); return { resolved: true }; }
    return { resolved: false };
  },

  resolveTurn(game) {
    const p1 = game.players[game.order[0]], p2 = game.players[game.order[1]];
    const a1 = p1.action, a2 = p2.action;
    let logKey = '', dmg1 = 0, dmg2 = 0, heal1 = 0, heal2 = 0;
    if (a1 === 'attack' && a2 === 'attack') { dmg1 = 3; dmg2 = 3; logKey = 'log_attack_attack'; }
    else if (a1 === 'attack' && a2 === 'defend') { dmg2 = 1; logKey = 'log_attack_defend'; }
    else if (a1 === 'attack' && a2 === 'heal') { dmg2 = 3; logKey = 'log_attack_heal'; }
    else if (a1 === 'defend' && a2 === 'attack') { dmg1 = 1; logKey = 'log_attack_defend'; }
    else if (a1 === 'defend' && a2 === 'defend') { logKey = 'log_defend_defend'; }
    else if (a1 === 'defend' && a2 === 'heal') { heal2 = 2; logKey = 'log_defend_heal'; }
    else if (a1 === 'heal' && a2 === 'attack') { dmg1 = 3; logKey = 'log_attack_heal'; }
    else if (a1 === 'heal' && a2 === 'defend') { heal1 = 2; logKey = 'log_defend_heal'; }
    else if (a1 === 'heal' && a2 === 'heal') { heal1 = 2; heal2 = 2; logKey = 'log_heal_heal'; }
    if (dmg1) p1.hp = Math.max(0, p1.hp - dmg1);
    if (dmg2) p2.hp = Math.max(0, p2.hp - dmg2);
    if (heal1) p1.hp = Math.min(MAX_HP, p1.hp + heal1);
    if (heal2) p2.hp = Math.min(MAX_HP, p2.hp + heal2);
    p1.action = null; p2.action = null;
    // Use short English key for log - frontend handles translation
    game.log.push({ turn: game.turn, logKey, p1Hp: p1.hp, p2Hp: p2.hp, a1, a2 });
    if (p1.hp <= 0 || p2.hp <= 0) {
      game.status = 'finished';
      if (p1.hp <= 0 && p2.hp <= 0) game.winner = 'draw';
      else game.winner = p1.hp > 0 ? p1.id : p2.id;
    }
    game.turn++;
  },

  getGameForPlayer(gameId, playerId) {
    const game = games.get(gameId);
    if (!game) return null;
    const pid = parseInt(playerId);
    const me = game.players[pid];
    if (!me) return null;
    const themId = game.order[0] === pid ? game.order[1] : game.order[0];
    const them = game.players[themId];
    return {
      id: game.id, turn: game.turn, status: game.status, winner: game.winner, maxHp: MAX_HP,
      me: { id: me.id, username: me.username, hp: me.hp, action: me.action },
      opponent: { id: them.id, username: them.username, hp: them.hp, action: them.action },
      log: game.log, lang: me.lang || 'en'
    };
  },

  getGameState(gameId) { return games.get(gameId); }
};
