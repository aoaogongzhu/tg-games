// 👑 国王游戏 - King Game (Bilingual)
module.exports = {
  id: 'king', name: '👑 国王游戏',
  async startPlay(ctx) {
    const lang = (ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
    const prompts = lang==='zh' ? [
      '和右边的人深情对视10秒',
      '用最肉麻的语气对左边的人说“我爱你”',
      '模仿一个动物叫声，大家猜是什么',
      '发一条“我是笨蛋”到朋友圈（截图发群）',
      '给你最近联系的人发一句“我想你了”',
      '用屁股写自己的名字',
      '吃一口你身边最奇怪的东西',
      '做10个俯卧撑',
      '用唱歌的语气说一段话',
      '倒立或者劈叉（能做到的程度）',
      '和群里的一个人互换头像一天',
      '把你相册最近一张照片发到群里',
      '对你右边的说一句真心话',
      '闭着眼睛转3圈然后走直线',
      '模仿一个明星的口头禅',
      '用方言说一段绕口令',
      '给你妈妈发一句“我爱你”',
      '把手机交给左边的人玩30秒',
      '做20个深蹲',
      '讲一个笑话，没人笑就罚再做5个俯卧撑',
      '发一条语音唱一首歌',
      '模仿一个电视剧角色的经典台词',
      '用身体写一个字母让大家猜',
      '和右边的人十指相扣10秒',
      '把你最近的搜索记录截屏发群',
      '说你人生中最尴尬的一件事',
      '给你微信里最后一个发消息的人发“晚安”',
      '用三种语言说“我爱你”',
      '跳一段舞（录视频发群）',
      '给在座的人每人一个拥抱（或表情包）',
    ] : [
      'Stare into the eyes of the person on your right for 10 seconds',
      'Say "I love you" to the person on your left in the cheesiest way',
      'Make an animal sound and have others guess it',
      'Post "I am a fool" on social media (screenshot proof)',
      'Text your last contacted person "I miss you"',
      'Write your name in the air using your butt',
      'Eat the weirdest thing within arms reach',
      'Do 10 pushups',
      'Say a sentence in a singing voice',
      'Try to do a handstand or split',
      'Swap profile pics with someone in the group for a day',
      'Share the last photo in your camera roll',
      'Tell a truth to the person on your right',
      'Spin around 3 times with eyes closed then walk straight',
      'Imitate a famous person catchphrase',
      'Say a tongue twister in a dialect',
      'Text your mom "I love you"',
      'Hand your phone to the person on your left for 30 seconds',
      'Do 20 squats',
      'Tell a joke, if nobody laughs do 5 more pushups',
      'Send a voice message singing a song',
      'Imitate a famous movie quote',
      'Write a letter with your body and have others guess it',
      'Interlock fingers with the person on your right for 10 seconds',
      'Screenshot your recent search history and share it',
      'Share your most embarrassing life moment',
      'Text "good night" to the last person you messaged',
      'Say "I love you" in 3 different languages',
      'Dance and record a video (share in group)',
      'Give everyone in the group a virtual hug (emoji is fine)',
    ];
    const cmd = prompts[Math.floor(Math.random()*prompts.length)];
    await ctx.reply(
      `👑 *国王游戏*\n\n${ctx.from.username||'Player'} 抽到了：\n\n🔥 *${cmd}*`,
      { parse_mode:'Markdown',
        reply_markup:{inline_keyboard:[[{text:lang==='zh'?'👑 再抽一个':'👑 Another',callback_data:'game_king_again'}]]} }
    );
  },
  async handleCallback(ctx, action) {
    if(action==='again') return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};
