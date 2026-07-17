// ⚔️ 决斗场 - Turn-based duel (HP=8, ~30s per game)
const { Markup } = require('telegraf');
const { v4: uuidv4 } = require('uuid');

const MAX_HP = 8;
const ACTIONS = ['attack', 'defend', 'heal'];
const games = new Map();
const challenges = new Map();

module.exports = {
  id: 'duel',
  name: '⚔️ 决斗场',

  async startPlay(ctx) {
    const chatId = ctx.chat.id;
    if (chatId > 0) {
      // Private chat - show info
      return ctx.reply(
        '⚔️ *决斗场*\n\n两人回合制对战！在群组中使用：\n\n点击下方按钮开始决斗！',
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🆕 发起挑战', callback_data: 'game_duel_challenge' }]]
          }
        }
      );
    }

    // In group - ask who to fight
    return ctx.reply(
      '⚔️ *决斗场*\n\n点击下方按钮发起挑战！',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: '🆕 发起挑战', callback_data: 'game_duel_challenge' }]]
        }
      }
    );
  },

  async handleCallback(ctx, action) {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name || 'Player';

    if (action === 'challenge') {
      const challengeId = uuidv4().slice(0, 6);
      challenges.set(challengeId, {
        challenger: { id: userId, username },
        chatId: ctx.chat.id,
        expiresAt: Date.now() + 30000
      });

      await ctx.editMessageText(
        `⚔️ ${username} 发起了决斗挑战！\n\n30秒内点击接受！`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '⚔️ 接受挑战', callback_data: `game_duel_accept_${challengeId}` }],
              [{ text: '❌ 取消', callback_data: `game_duel_cancel_${challengeId}` }]
            ]
          }
        }
      );
      return ctx.answerCbQuery('挑战已发出！');
    }

    if (action.startsWith('accept_')) {
      const challengeId = action.slice(7);
      const challenge = challenges.get(challengeId);
      if (!challenge) return ctx.answerCbQuery('❌ 挑战已过期', { show_alert: true });
      if (userId === challenge.challenger.id) return ctx.answerCbQuery('不能和自己决斗', { show_alert: true });

      challenges.delete(challengeId);

      const gameId = uuidv4().slice(0, 8);
      const game = {
        id: gameId,
        chatId: challenge.chatId,
        players: {
          [challenge.challenger.id]: { id: challenge.challenger.id, username: challenge.challenger.username, hp: MAX_HP, action: null },
          [userId]: { id: userId, username, hp: MAX_HP, action: null }
        },
        order: [challenge.challenger.id, userId],
        turn: 1,
        status: 'playing',
        winner: null,
        log: []
      };
      games.set(gameId, game);

      const url = `${process.env.APP_URL}/duel.html?gameId=${gameId}&p1=${challenge.challenger.id}&p2=${userId}`;

      await ctx.editMessageText(
        `⚔️ *决斗开始！*\n${challenge.challenger.username} VS ${username}\n\n点击下方按钮进入战场！`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '⚔️ 进入战场', web_app: { url } }]]
          }
        }
      );

      // Broadcast to group
      try {
        await ctx.telegram.sendMessage(
          challenge.chatId,
          `⚔️ *${challenge.challenger.username}* VS *${username}* 的决斗已经开始！\n快来观战！`,
          { parse_mode: 'Markdown' }
        );
      } catch (e) {}

      // Send private messages to both players
      for (const pid of [challenge.challenger.id, userId]) {
        try {
          await ctx.telegram.sendMessage(pid, '⚔️ 你的决斗已开始！点击进入战场：', {
            reply_markup: { inline_keyboard: [[{ text: '⚔️ 进入战场', web_app: { url } }]] }
          });
        } catch (e) {}
      }

      return ctx.answerCbQuery('✅ 决斗开始！');
    }

    if (action.startsWith('cancel_')) {
      const challengeId = action.slice(7);
      const challenge = challenges.get(challengeId);
      if (!challenge) return ctx.answerCbQuery('已过期');
      challenges.delete(challengeId);
      await ctx.editMessageText('❌ 挑战已取消');
      return ctx.answerCbQuery('已取消');
    }

    return ctx.answerCbQuery('未知操作');
  },

  // ─── Game Logic (used by server API) ──────────────────────────

  getGame(gameId) { return games.get(gameId); },

  submitAction(gameId, playerId, action) {
    const game = games.get(gameId);
    if (!game || game.status !== 'playing') return { error: 'Game not active' };
    if (!ACTIONS.includes(action)) return { error: 'Invalid action' };
    if (!game.players[playerId]) return { error: 'Not your game' };
    if (game.players[playerId].action !== null) return { error: 'Already submitted' };

    game.players[playerId].action = action;
    const p1 = game.players[game.order[0]];
    const p2 = game.players[game.order[1]];

    if (p1.action && p2.action) {
      this.resolveTurn(game);
      return { resolved: true };
    }
    return { resolved: false };
  },

  resolveTurn(game) {
    const p1 = game.players[game.order[0]];
    const p2 = game.players[game.order[1]];
    const a1 = p1.action;
    const a2 = p2.action;
    let logMsg = '', dmg1 = 0, dmg2 = 0, heal1 = 0, heal2 = 0;

    if (a1 === 'attack' && a2 === 'attack') { dmg1 = 3; dmg2 = 3; logMsg = '⚔️ 双方对砍！'; }
    else if (a1 === 'attack' && a2 === 'defend') { dmg2 = 1; logMsg = '🛡️ 攻击被挡住了！'; }
    else if (a1 === 'attack' && a2 === 'heal') { dmg2 = 3; logMsg = '⚡ 攻击打断了治疗！'; }
    else if (a1 === 'defend' && a2 === 'attack') { dmg1 = 1; logMsg = '🛡️ 攻击被挡住了！'; }
    else if (a1 === 'defend' && a2 === 'defend') { logMsg = '🛡️🛡️ 互相防御，无事发生'; }
    else if (a1 === 'defend' && a2 === 'heal') { heal2 = 2; logMsg = '💚 趁机恢复！'; }
    else if (a1 === 'heal' && a2 === 'attack') { dmg1 = 3; logMsg = '⚡ 治疗被打断！'; }
    else if (a1 === 'heal' && a2 === 'defend') { heal1 = 2; logMsg = '💚 趁机恢复！'; }
    else if (a1 === 'heal' && a2 === 'heal') { heal1 = 2; heal2 = 2; logMsg = '💚💚 一起恢复'; }

    if (dmg1) p1.hp = Math.max(0, p1.hp - dmg1);
    if (dmg2) p2.hp = Math.max(0, p2.hp - dmg2);
    if (heal1) p1.hp = Math.min(MAX_HP, p1.hp + heal1);
    if (heal2) p2.hp = Math.min(MAX_HP, p2.hp + heal2);

    p1.action = null;
    p2.action = null;

    const turnLog = { turn: game.turn, log: logMsg, p1Hp: p1.hp, p2Hp: p2.hp, a1, a2 };
    game.log.push(turnLog);

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
      log: game.log
    };
  },

  getGameState(gameId) {
    const game = games.get(gameId);
    if (!game) return null;
    return game;
  }
};
