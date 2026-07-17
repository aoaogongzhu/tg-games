// 🎡 命运转盘 - Spin the wheel (Mini App based)
module.exports = {
  id: 'wheel',
  name: '🎡 命运转盘',

  async startPlay(ctx) {
    return ctx.reply(
      '🎡 *命运转盘*\n\n点击下方按钮打开转盘，转动你的命运！',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🎡 打开转盘', web_app: { url: `${process.env.APP_URL}/wheel.html` } }
          ]]
        }
      }
    );
  },

  async handleCallback(ctx, action) {
    return ctx.answerCbQuery('请在 Mini App 中打开转盘');
  }
};
