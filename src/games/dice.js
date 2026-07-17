// 🎲 生死骰子 - Dice of Fate (Bilingual)
const i18n = require('../utils/i18n');

module.exports = {
  id: 'dice', name: '🎲 生死骰子',

  async startPlay(ctx) {
    const lang = i18n.detectLang(ctx);
    const nums = ['2-4','5-7','8-10','11-12'];
    return ctx.reply(i18n.t(lang,'dice.title'), {
      reply_markup: {
        inline_keyboard: [
          nums.map(n => ({ text: n, callback_data: `game_dice_bet_${n.replace('-','_')}` }))
        ]
      }
    });
  },

  async handleCallback(ctx, action) {
    const lang = i18n.getUserLang(ctx.from.id) || i18n.detectLang(ctx);
    if (action.startsWith('bet_')) {
      const parts2 = action.slice(4).split('_');
      const lo = parseInt(parts2[0]), hi = parseInt(parts2[1]);
      if (isNaN(lo) || isNaN(hi)) return ctx.answerCbQuery('❌');
      const username = ctx.from.username || ctx.from.first_name || 'Player';
      const r1 = Math.floor(Math.random() * 6) + 1, r2 = Math.floor(Math.random() * 6) + 1;
      const total = r1 + r2;
      const win = total >= lo && total <= hi;
      const diceEmojis = ['','⚀','⚁','⚂','⚃','⚄','⚅'];
      const msg = i18n.t(lang,'dice.result')
        .replace('{player}', username)
        .replace('{guess}', lo+'-'+hi)
        .replace('{emoji}', '🎲')
        .replace('{result}', total)
        .replace('{dice}', diceEmojis[r1]+diceEmojis[r2])
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
