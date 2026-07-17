// 🎪 幸运抽奖 - Lucky Draw (Solo)
const { v4 } = require('uuid');
const result = require('../utils/result');
const games = new Map();

module.exports = {
  id: 'lucky', name: '🎪 幸运抽奖',
  async startPlay(ctx) {
    const lang=(ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
    const id=v4().slice(0,6);
    const prizes=lang==='zh'?['🎉 恭喜发财（+20分）','💎 钻石大奖（+50分）','🎁 惊喜礼物（+10分）','😅 再接再厉（+2分）','🔥 好运连连（+15分）','💫 幸运之星（+30分）','🍀 四叶草（+5分）','🌟 一等奖（+100分）']:['🎉 Lucky! (+20)','💎 Diamond (+50)','🎁 Surprise (+10)','😅 Try again (+2)','🔥 Lucky streak (+15)','💫 Star luck (+30)','🍀 Clover (+5)','🌟 Jackpot (+100)'];
    const scores=[20,50,10,2,15,30,5,100];
    games.set(id,{id,prizes,scores,draws:[],lang});
    await ctx.reply(lang==='zh'?'🎪 *幸运抽奖*\n\n你有 3 次抽奖机会！\n每次从奖池中随机抽取一份奖励！\n\n祝你好运！':'🎪 *Lucky Draw*\n\nYou have 3 draws!\nEach time you get a random prize!\n\nGood luck!',{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🎪 '+(lang==='zh'?'抽奖':'Draw'),callback_data:`game_lucky_draw_${id}`}]]}});
  },
  async handleCallback(ctx, action) {
    if(action.startsWith('draw_')){
      const id=action.split('_')[1];const g=games.get(id);if(!g)return ctx.answerCbQuery('❌');
      const i=Math.floor(Math.random()*g.prizes.length);const prize=g.prizes[i],score=g.scores[i];
      g.draws.push({prize,score});
      if(g.draws.length>=3){
        const total=g.draws.reduce((a,d)=>a+d.score,0);const isRecord=total>=80;
        const stats={};g.draws.forEach((d,j)=>{stats[g.lang==='zh'?`第${j+1}次`:`Draw ${j+1}`]=d.prize+' ('+d.score+')';});
        stats[g.lang==='zh'?'总分':'Total']=total;
        await ctx.editMessageText(result.win(g.lang,{winner:ctx.from.username||'Player',game:'🎪 '+(g.lang==='zh'?'幸运抽奖':'Lucky Draw'),score:total,isRecord,stats}),{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🎪 '+(g.lang==='zh'?'再抽一次':'Try Again'),callback_data:'game_lucky_new'}]]}});
        games.delete(id);
      }else{
        await ctx.editMessageText(g.lang==='zh'?`🎪 *幸运抽奖*\n\n🎉 ${prize}（+${score}分）\n\n第 ${g.draws.length}/3 次\n\n继续抽奖！`:`🎪 *Lucky Draw*\n\n🎉 ${prize} (+${score})\n\nDraw ${g.draws.length}/3\n\nKeep going!`,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🎪 '+(g.lang==='zh'?'继续抽奖':'Draw Again'),callback_data:`game_lucky_draw_${id}`}]]}});
      }
      return ctx.answerCbQuery(prize);
    }
    if(action==='new')return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};
