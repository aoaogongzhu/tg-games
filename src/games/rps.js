// 🪨 猜拳王 - Rock Paper Scissors, best of 3
const { Markup } = require('telegraf');
const { v4: uuidv4 } = require('uuid');

const games = new Map();
const CHOICES = [
  { id: 'rock', emoji: '🪨', label: '石头', beats: 'scissors' },
  { id: 'paper', emoji: '📄', label: '布', beats: 'rock' },
  { id: 'scissors', emoji: '✂️', label: '剪刀', beats: 'paper' }
];

module.exports = {
  id: 'rps',
  name: '🪨 猜拳王',

  async startPlay(ctx) {
    if (ctx.chat.id > 0) {
      return ctx.reply('🪨 *猜拳王*\n\n在群组中点击"发起"和朋友玩！', {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: '🆕 发起猜拳', callback_data: 'game_rps_challenge' }]]
        }
      });
    }

    return ctx.reply('🪨 *猜拳王 — 三局两胜*\n\n和朋友来一局！', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '🆕 发起猜拳', callback_data: 'game_rps_challenge' }]]
      }
    });
  },

  async handleCallback(ctx, action) {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name || 'Player';

    if (action === 'challenge') {
      const id = uuidv4().slice(0, 6);
      games.set(id, {
        id, challenger: { id: userId, username },
        chatId: ctx.chat.id, status: 'waiting'
      });
      return ctx.editMessageText(
        `🪨 ${username} 发起了猜拳挑战！`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🪨 接受挑战', callback_data: `game_rps_accept_${id}` }],
              [{ text: '❌ 取消', callback_data: `game_rps_cancel_${id}` }]
            ]
          }
        }
      );
    }

    if (action.startsWith('accept_')) {
      const gameId = action.slice(7);
      const game = games.get(gameId);
      if (!game || game.status !== 'waiting') return ctx.answerCbQuery('已过期', { show_alert: true });
      if (userId === game.challenger.id) return ctx.answerCbQuery('不能和自己玩', { show_alert: true });

      game.opponent = { id: userId, username };
      game.state = { [game.challenger.id]: null, [userId]: null };
      game.scores = { [game.challenger.id]: 0, [userId]: 0 };
      game.round = 1;
      game.status = 'playing';

      await ctx.editMessageText(
        `🪨 *${game.challenger.username} VS ${username}*\n\n第 1 局！出拳吧！`,
        { parse_mode: 'Markdown' }
      );

      // Ask both to choose
      for (const p of [game.challenger, game.opponent]) {
        try {
          await ctx.telegram.sendMessage(p.id, '🪨 出拳！', {
            reply_markup: {
              inline_keyboard: [[
                { text: '🪨 石头', callback_data: `game_rps_move_${gameId}_${p.id}_rock` },
                { text: '📄 布', callback_data: `game_rps_move_${gameId}_${p.id}_paper` },
                { text: '✂️ 剪刀', callback_data: `game_rps_move_${gameId}_${p.id}_scissors` }
              ]]
            }
          });
        } catch (e) {}
      }

      return ctx.answerCbQuery('✅ 猜拳开始！');
    }

    if (action.startsWith('move_')) {
      const parts = action.split('_');
      const gameId = parts[1];
      const pid = parseInt(parts[2]);
      const choice = parts[3];

      const game = games.get(gameId);
      if (!game || game.status !== 'playing') return ctx.answerCbQuery('游戏已结束');
      if (pid !== userId) return ctx.answerCbQuery('这不是你的回合');

      game.state[pid] = choice;
      await ctx.answerCbQuery(`你出了 ${CHOICES.find(c => c.id === choice)?.emoji || choice}`);

      // Check if both have chosen
      const [p1, p2] = [game.challenger, game.opponent];
      if (game.state[p1.id] && game.state[p2.id]) {
        this.resolveRound(ctx, game);
      } else {
        // Update waiting message
        try {
          const doneCount = Object.values(game.state).filter(Boolean).length;
          await ctx.telegram.sendMessage(game.chatId, `⏳ 等待双方出拳...（${doneCount}/2）`);
        } catch (e) {}
      }

      return;
    }

    if (action.startsWith('cancel_')) {
      const gameId = action.slice(7);
      const game = games.get(gameId);
      if (game && game.challenger.id === userId) {
        games.delete(gameId);
        await ctx.editMessageText('❌ 已取消');
      }
      return ctx.answerCbQuery('已取消');
    }

    if (action === 'again') {
      // Restart handled via new challenge
      return ctx.answerCbQuery('发起新的一局吧！');
    }

    return ctx.answerCbQuery('未知操作');
  },

  async resolveRound(ctx, game) {
    const p1 = game.challenger;
    const p2 = game.opponent;
    const c1 = game.state[p1.id];
    const c2 = game.state[p2.id];
    const choice1 = CHOICES.find(c => c.id === c1);
    const choice2 = CHOICES.find(c => c.id === c2);

    let roundMsg = `🪨 *第 ${game.round} 局结果*\n\n`;
    roundMsg += `${p1.username}: ${choice1?.emoji || '?'} ${choice1?.label}\n`;
    roundMsg += `${p2.username}: ${choice2?.emoji || '?'} ${choice2?.label}\n\n`;

    let winner = null;
    if (c1 === c2) {
      roundMsg += '😐 平局！';
    } else if (choice1.beats === c2) {
      roundMsg += `🏆 ${p1.username} 赢了这一局！`;
      game.scores[p1.id]++;
      winner = p1.id;
    } else {
      roundMsg += `🏆 ${p2.username} 赢了这一局！`;
      game.scores[p2.id]++;
      winner = p2.id;
    }

    game.state = { [p1.id]: null, [p2.id]: null };
    game.round++;

    const s1 = game.scores[p1.id];
    const s2 = game.scores[p2.id];
    roundMsg += `\n\n📊 比分: ${p1.username} ${s1} - ${s2} ${p2.username}`;

    if (s1 >= 2 || s2 >= 2) {
      game.status = 'finished';
      if (s1 >= 2) {
        roundMsg += `\n\n🎉 *${p1.username} 赢得了比赛！*`;
      } else {
        roundMsg += `\n\n🎉 *${p2.username} 赢得了比赛！*`;
      }
      try {
        await ctx.telegram.sendMessage(game.chatId, roundMsg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🔄 再来一局', callback_data: 'game_rps_again' }]]
          }
        });
      } catch (e) {}
      games.delete(game.id);
    } else {
      roundMsg += '\n\n下一局！出拳吧！';
      try {
        await ctx.telegram.sendMessage(game.chatId, roundMsg, { parse_mode: 'Markdown' });
      } catch (e) {}

      // Ask both to choose again
      for (const p of [p1, p2]) {
        try {
          await ctx.telegram.sendMessage(p.id, `🪨 第 ${game.round} 局，出拳！`, {
            reply_markup: {
              inline_keyboard: [[
                { text: '🪨 石头', callback_data: `game_rps_move_${game.id}_${p.id}_rock` },
                { text: '📄 布', callback_data: `game_rps_move_${game.id}_${p.id}_paper` },
                { text: '✂️ 剪刀', callback_data: `game_rps_move_${game.id}_${p.id}_scissors` }
              ]]
            }
          });
        } catch (e) {}
      }
    }
  }
};
