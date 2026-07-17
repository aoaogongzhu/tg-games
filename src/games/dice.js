// 🎲 生死骰子 - Dice of Fate (Bilingual)
const i18n = require('../utils/i18n');

module.exports = {
  id: 'dice', name: '🎲 生死骰子',

  async startPlay(ctx) {
    const lang = i18n.detectLang(ctx);
    const nums = ['1','2','3','4','5','6'];
    return ctx.reply(i18n.t(lang,'dice.title'), {
      reply_markup: {
        inline_keyboard: [
          nums.slice(0,3).map(n => ({ text: i18n.t(lang,'dice.guess').replace('{n}',n), callback_data: `game_dice_bet_${n}` })),
          nums.slice(3).map(n => ({ text: i18n.t(lang,'dice.guess').replace('{n}',n), callback_data: `game_dice_bet_${n}` }))
        ]
      }
    });
  },

  async handleCallback(ctx, action) {
    const lang = i18n.getUserLang(ctx.from.id) || i18n.detectLang(ctx);
    if (action.startsWith('bet_')) {
      const guess = parseInt(action.slice(4));
      if (isNaN(guess) || guess < 1 || guess > 6) return ctx.answerCbQuery('❌');
      const username = ctx.from.username || ctx.from.first_name || 'Player';
      const result = Math.floor(Math.random() * 6) + 1;
      const win = guess === result;
      const diceEmojis = ['','⚀','⚁','⚂','⚃','⚄','⚅'];
      const msg = i18n.t(lang,'dice.result')
        .replace('{player}', username)
        .replace('{guess}', guess)
        .replace('{emoji}', diceEmojis[guess])
        .replace('{result}', result)
        .replace('{dice}', diceEmojis[result])
        .replace('{outcome}', win ? i18n.t(lang,'dice.win') : i18n.t(lang,'dice.lose'));
      await ctx.editMessageText(msg, {
        reply_markup: { inline_keyboard: [[{ text: i18n.t(lang,'dice.retry'), callback_data: 'game_dice_retry' }]] }
      });
      return ctx.answerCbQuery(win ? i18n.t(lang,'dice.outcome_win') : i18n.t(lang,'dice.outcome_lose'));
    }
    if (action === 'retry') return this.startPlay(ctx);
    return ctx.answerCbQuery('❓');
  }
};
