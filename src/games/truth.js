// 💬 真心话大冒险
const { Markup } = require('telegraf');

const TRUTH = [
  '你最近一次撒谎是什么时候？讲了什么谎？',
  '你对在座的哪个人有过好感？',
  '你手机里最不想让别人看到的App是什么？',
  '你做过最尴尬的事情是什么？',
  '你上一次哭是因为什么？',
  '你偷偷搜过自己的名字吗？',
  '如果可以和一个名人互换身份一天，你想换谁？',
  '你微信里最不想让对象看到的聊天记录是谁的？',
  '你做过最后悔的决定是什么？',
  '你现在最想要什么东西？',
  '你曾经偷偷拿过别人的东西吗？',
  '你洗澡的时候做过什么奇怪的事？',
  '你最怕别人知道你的什么秘密？',
  '你上一次说"我爱你"是什么时候，对谁？',
  '如果你现在变成异性，第一件事想做什么？',
];

const DARE = [
  '模仿一种动物的叫声发到群里',
  '把你手机最后一张照片发到群里',
  '用你最囧的语音说"我是小猪"发到群里',
  '连续发10个不同表情包到群里',
  '把你的微信签名改成"我爱(左边人的名字)"一天',
  '给你最近聊天的人发一句"我喜欢你"',
  '用唱歌的语调发一句语音到群里',
  '把你搜索记录截屏发到群里',
  '做一个你最丑的自拍发到群里',
  '用屁股写自己的名字（发视频）',
  '吃一口你身边最奇怪的东西',
  '给爸妈发一句"我中彩票了"',
  '把你的手机给右边的人玩30秒',
  '做10个俯卧撑',
  '倒立或者劈叉（做得到的程度）',
];

module.exports = {
  id: 'truth',
  name: '💬 真心话大冒险',

  async startPlay(ctx) {
    return ctx.reply(
      '💬 *真心话大冒险*\n\n选一个吧！',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '💬 真心话', callback_data: 'game_truth_truth' },
              { text: '🤪 大冒险', callback_data: 'game_truth_dare' }
            ]
          ]
        }
      }
    );
  },

  async handleCallback(ctx, action) {
    const username = ctx.from.username || ctx.from.first_name || 'Player';
    let msg = '';

    if (action === 'truth') {
      const q = TRUTH[Math.floor(Math.random() * TRUTH.length)];
      msg = `💬 *${username}* 选择了真心话！\n\n❓ ${q}`;
    } else if (action === 'dare') {
      const d = DARE[Math.floor(Math.random() * DARE.length)];
      msg = `🤪 *${username}* 选择了大冒险！\n\n🔥 ${d}`;
    } else {
      return ctx.answerCbQuery('未知操作');
    }

    await ctx.editMessageText(msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '🔄 换一个', callback_data: `game_truth_${action}` },
          { text: '🎯 下一个', callback_data: 'game_truth_new' }
        ]]
      }
    });
    return ctx.answerCbQuery(action === 'truth' ? '说出你的秘密！' : '做不到要接受惩罚哦！');
  }
};
