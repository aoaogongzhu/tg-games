// 💬 真心话大冒险 - Truth or Dare (Bilingual)
const i18n = require('../utils/i18n');

module.exports = {
  id: 'truth', name: '💬 真心话大冒险',

  async startPlay(ctx) {
    const lang = i18n.detectLang(ctx);
    return ctx.reply(i18n.t(lang,'truth.title'), {
      reply_markup: {
        inline_keyboard: [[
          { text: i18n.t(lang,'truth.truth'), callback_data: 'game_truth_truth' },
          { text: i18n.t(lang,'truth.dare'), callback_data: 'game_truth_dare' }
        ]]
      }
    });
  },

  async handleCallback(ctx, action) {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name || 'Player';
    const lang = i18n.getUserLang(userId) || i18n.detectLang(ctx);

    if (action === 'truth') {
      const truths = i18n.t(lang, 'truth.truths');
      const q = Array.isArray(truths) ? truths[Math.floor(Math.random() * truths.length)] : '?';
      const msg = i18n.t(lang,'truth.truth_msg').replace('{player}',username).replace('{question}',q);
      await ctx.editMessageText(msg, {
        reply_markup: { inline_keyboard: [[
          { text: i18n.t(lang,'truth.shuffle'), callback_data: 'game_truth_truth' },
          { text: i18n.t(lang,'truth.next'), callback_data: 'game_truth_new' }
        ]]}
      });
      return ctx.answerCbQuery(i18n.t(lang,'truth.truth_hint'));
    }

    if (action === 'dare') {
      const dares = i18n.t(lang, 'truth.dares');
      const d = Array.isArray(dares) ? dares[Math.floor(Math.random() * dares.length)] : '?';
      const msg = i18n.t(lang,'truth.dare_msg').replace('{player}',username).replace('{challenge}',d);
      await ctx.editMessageText(msg, {
        reply_markup: { inline_keyboard: [[
          { text: i18n.t(lang,'truth.shuffle'), callback_data: 'game_truth_dare' },
          { text: i18n.t(lang,'truth.next'), callback_data: 'game_truth_new' }
        ]]}
      });
      return ctx.answerCbQuery(i18n.t(lang,'truth.dare_hint'));
    }

    if (action === 'new') return this.startPlay(ctx);
    return ctx.answerCbQuery('❓');
  }
};
