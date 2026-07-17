// 🎲 生死骰子 - Predict dice roll
const { Markup } = require('telegraf');

module.exports = {
  id: 'dice',
  name: '🎲 生死骰子',

  async startPlay(ctx) {
    const msg = '🎲 *生死骰子*\n\n机器人会掷一个骰子（1-6），猜中就是赢家！';
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          ['1', '2', '3'].map(n => ({ text: `🎲 ${n}`, callback_data: `game_dice_bet_${n}` })),
          ['4', '5', '6'].map(n => ({ text: `🎲 ${n}`, callback_data: `game_dice_bet_${n}` })),
        ]
      }
    });
  },

  async handleCallback(ctx, action) {
    if (action.startsWith('bet_')) {
      const guess = parseInt(action.slice(4));
      if (isNaN(guess) || guess < 1 || guess > 6) return ctx.answerCbQuery('无效');

      const username = ctx.from.username || ctx.from.first_name || 'Player';
      const result = Math.floor(Math.random() * 6) + 1;
      const win = guess === result;

      const diceEmojis = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      const msg =
        `🎲 *生死骰子*\n\n` +
        `${username} 猜了 *${guess}* ${diceEmojis[guess]}\n\n` +
        `结果：*${result}* ${diceEmojis[result]}\n\n` +
        (win ? '🎉 *猜中了！真正的赌神！*' : '😅 *没中，下次再来！*');

      await ctx.editMessageText(msg, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: '🎲 再掷一次', callback_data: 'game_dice_retry' }]]
        }
      });
      return ctx.answerCbQuery(win ? '🎉 中了！' : '😅 没中');
    }

    if (action === 'retry') {
      return this.startPlay(ctx);
    }

    return ctx.answerCbQuery('未知操作');
  }
};
