// 🎡 命运转盘 - Wheel of Fate (Bilingual Segments)
const i18n = require('../utils/i18n');

module.exports = {
  id: 'wheel', name: '🎡 命运转盘',

  async startPlay(ctx) {
    const lang = i18n.detectLang(ctx);
    return ctx.reply(`${i18n.t(lang,'wheel.title')}\n\n${i18n.t(lang,'common.social_tag')}`, {
      reply_markup: {
        inline_keyboard: [[{ text: i18n.t(lang,'wheel.spin'), web_app: {
          url: `${process.env.APP_URL}/wheel.html?lang=${lang}`
        }}]]
      }
    });
  },

  async handleCallback(ctx) { return ctx.answerCbQuery('🎡'); }
};
