// 🎯 射击靶场 - Shooting Range (Solo)
const { v4 } = require('uuid');
const result = require('../utils/result');
const games = new Map();

module.exports = {
  id: 'shooting', name: '🎯 射击靶场',
  async startPlay(ctx) {
    const lang = (ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
    const msg = lang === 'zh' ? '🎯 *射击靶场*\n\n你有 5 发子弹，瞄准靶心射击！\n靶心分数：10环=10分，越往外越低。\n\n点击射击！' : '🎯 *Shooting Range*\n\nYou have 5 bullets. Shoot the target!\nBullseye = 10 points, decreasing outward.\n\nFire!';
    const id = v4().slice(0,6);
    games.set(id, { id, shots: 0, score: 0, lang });
    await ctx.reply(msg, { parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '🎯 ' + (lang==='zh'?'射击':'Shoot!'), callback_data: `game_shooting_shoot_${id}` }]] }
    });
  },
  async handleCallback(ctx, action) {
    if (action.startsWith('shoot_')) {
      const id = action.split('_')[1];
      const g = games.get(id); if (!g) return ctx.answerCbQuery('❌');
      g.shots++;
      const accuracy = Math.random();
      let points = 0, msg = '';
      if (accuracy > 0.9) { points = 10; msg = g.lang==='zh'?'🎯 10环！完美命中！':'🎯 Bullseye! Perfect!'; }
      else if (accuracy > 0.75) { points = 8; msg = g.lang==='zh'?'🎯 8环！好枪法！':'🎯 8 rings! Great shot!'; }
      else if (accuracy > 0.55) { points = 6; msg = g.lang==='zh'?'🎯 6环，不错':'🎯 6 rings, not bad'; }
      else if (accuracy > 0.35) { points = 4; msg = g.lang==='zh'?'🎯 4环，还行':'🎯 4 rings, okay'; }
      else if (accuracy > 0.15) { points = 2; msg = g.lang==='zh'?'🎯 2环，偏了':'🎯 2 rings, off target'; }
      else { points = 0; msg = g.lang==='zh'?'💨 脱靶！':'💨 Missed!'; }
      g.score += points;
      if (g.shots >= 5) {
        const isRecord = g.score >= 40;
        const winMsg = result.win(g.lang, { winner: ctx.from.username||'Player', game: '🎯 '+(g.lang==='zh'?'射击靶场':'Shooting Range'), score: g.score+'/50', isRecord, stats: { [g.lang==='zh'?'命中率':'Accuracy']: Math.round(g.score/50*100)+'%', [g.lang==='zh'?'总环数':'Total']: g.score+'/50' } });
        await ctx.editMessageText(winMsg, { parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: [[{ text: '🎯 ' + (g.lang==='zh'?'再来一局':'Play Again'), callback_data: 'game_shooting_new' }]] }
        });
        games.delete(id);
      } else {
        await ctx.editMessageText(
          (g.lang==='zh'?`🎯 第 ${g.shots}/5 枪\n${msg}\n当前得分：${g.score}/50\n\n继续射击！`:`🎯 Shot ${g.shots}/5\n${msg}\nScore: ${g.score}/50\n\nKeep shooting!`),
          { reply_markup: { inline_keyboard: [[{ text: '🎯 ' + (g.lang==='zh'?'继续射击':'Shoot'), callback_data: `game_shooting_shoot_${id}` }]] } }
        );
      }
      return ctx.answerCbQuery(msg);
    }
    if (action === 'new') return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};
