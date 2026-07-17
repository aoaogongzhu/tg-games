// ⚡ 反应速度 - Reaction Test (Solo)
const { v4 } = require('uuid');
const result = require('../utils/result');
const games = new Map();

module.exports = {
  id: 'reaction', name: '⚡ 反应速度',
  async startPlay(ctx) {
    const lang = (ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
    const msg = lang==='zh'?'⚡ *反应速度测试*\n\n我会随机亮灯，灯亮时尽快点击！\n共 7 轮，反应越快分数越高！\n\n准备好就点击开始！':'⚡ *Reaction Test*\n\nA light will flash randomly. Click as fast as you can!\n7 rounds. Faster = higher score!\n\nReady? Click to start!';
    const id = v4().slice(0,6);
    games.set(id,{id,total:0,rounds:0,times:[],lang});
    await ctx.reply(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'⚡ '+ (lang==='zh'?'开始测试':'Start Test'),callback_data:`game_reaction_ready_${id}`}]]}});
  },
  async handleCallback(ctx, action) {
    if(action.startsWith('ready_')){
      const id=action.split('_')[1];const g=games.get(id);
      if(!g)return ctx.answerCbQuery('❌');
      const delay=500+Math.random()*2000;
      await ctx.editMessageText(g.lang==='zh'?'⏳ 等待信号...\n\n准备好，灯快亮了！':'⏳ Waiting for signal...\n\nGet ready!');
      setTimeout(async()=>{
        if(!games.has(id))return;
        g.roundStart=Date.now();
        try{await ctx.editMessageText(
          (g.lang==='zh'?'🔴 *点击！*':'🔴 *Click!*'),
          {parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'⚡ '+ (g.lang==='zh'?'点击！':'CLICK!'),callback_data:`game_reaction_click_${id}`}]]}}
        );}catch(e){}
      },delay);
      return ctx.answerCbQuery();
    }
    if(action.startsWith('click_')){
      const id=action.split('_')[1];const g=games.get(id);
      if(!g)return ctx.answerCbQuery('❌');
      if(!g.roundStart){return ctx.answerCbQuery(g.lang==='zh'?'还没开始':'Not started');}
      const rt=Date.now()-g.roundStart;
      g.times.push(rt);g.total+=rt;g.rounds++;
      const score=Math.max(0,Math.round(1000-rt));
      if(g.rounds>=7){
        const avg=Math.round(g.total/g.rounds);
        const totalScore=Math.max(0,Math.round(7000-g.total));
        const isRecord=avg<150;
        const stats=g.lang==='zh'?{['平均反应']:avg+'ms',['最快']:Math.min(...g.times)+'ms',['总分']:totalScore}:{Avg:avg+'ms',Best:Math.min(...g.times)+'ms',Score:totalScore};
        await ctx.editMessageText(result.win(g.lang,{winner:ctx.from.username||'Player',game:'⚡ '+(g.lang==='zh'?'反应速度':'Reaction Test'),score:totalScore,isRecord,stats}),{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'⚡ '+ (g.lang==='zh'?'再测一次':'Test Again'),callback_data:'game_reaction_new'}]]}});
        games.delete(id);
      }else{
        const delay=500+Math.random()*2000;
        await ctx.editMessageText(
          (g.lang==='zh'?`⚡ 第 ${g.rounds}/7 轮\n反应时间：${rt}ms\n得分：${score}\n\n⏳ 等待下一轮...`:`⚡ Round ${g.rounds}/7\nReaction: ${rt}ms\nScore: ${score}\n\n⏳ Next round...`),
          {parse_mode:'Markdown'});
        g.roundStart=null;
        setTimeout(async()=>{
          if(!games.has(id))return;
          g.roundStart=Date.now();
          try{await ctx.editMessageText(
            (g.lang==='zh'?'🔴 *点击！*':'🔴 *Click!*'),
            {parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'⚡ '+ (g.lang==='zh'?'点击！':'CLICK!'),callback_data:`game_reaction_click_${id}`}]]}}
          );}catch(e){}
        },delay);
      }
      return ctx.answerCbQuery(rt+'ms');
    }
    if(action==='new')return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};
