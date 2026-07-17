// 🏅 每日挑战 - Daily Challenge (Solo)
const { v4 } = require('uuid');
const result = require('../utils/result');
const games = new Map();

// Daily challenge types
const CHALLENGES = [
  {id:'math',zh:{name:'数学挑战',desc:'在30秒内答对尽量多的数学题！',q:'3 × 7 + 5 = ?'},en:{name:'Math Challenge',desc:'Answer as many math questions as possible in 30 seconds!',q:'3 × 7 + 5 = ?'}},
  {id:'guess',zh:{name:'幸运数字',desc:'猜一个 1-10 的数字，猜中即赢！只有3次机会。'},en:{name:'Lucky Number',desc:'Guess a number 1-10. 3 chances to get it right!'}},
  {id:'streak',zh:{name:'连胜挑战',desc:'连续猜对硬币正反面，连胜越多奖励越高！'},en:{name:'Streak Challenge',desc:'Predict coin flips. Longer streak = bigger reward!'}},
];

module.exports = {
  id: 'challenge', name: '🏅 每日挑战',
  async startPlay(ctx) {
    const lang=(ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
    const id=v4().slice(0,6);const c=CHALLENGES[Math.floor(Math.random()*CHALLENGES.length)];
    const cd=lang==='zh'?c.zh:c.en;
    games.set(id,{id,challenge:c,lang,score:0,round:1});
    const msg=lang==='zh'?`🏅 *每日挑战*\n\n今日挑战：${cd.name}\n${cd.desc}\n\n准备好了吗？`:`🏅 *Daily Challenge*\n\nChallenge: ${cd.name}\n${cd.desc}\n\nReady?`;
    await ctx.reply(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🏅 '+(lang==='zh'?'开始挑战':'Start'),callback_data:`game_challenge_go_${id}`}]]}});
  },
  async handleCallback(ctx, action) {
    if(action.startsWith('go_')){
      const id=action.split('_')[1];const g=games.get(id);if(!g)return ctx.answerCbQuery('❌');
      const lang=g.lang;const c=g.challenge;
      if(c.id==='math'){
        const a=Math.floor(Math.random()*10)+1,b=Math.floor(Math.random()*10)+1,op=['+','-','×'][Math.floor(Math.random()*3)];
        let ans;if(op==='+')ans=a+b;else if(op==='-')ans=a-b;else ans=a*b;
        const choices=[ans,ans+Math.floor(Math.random()*5+1),ans-Math.floor(Math.random()*5+1),ans+Math.floor(Math.random()*10+5)].sort(()=>Math.random()-0.5).slice(0,4);
        if(g.round===1)await ctx.editMessageText(lang==='zh'?`🏅 *数学挑战*\n\n第 ${g.round} 题：${a} ${op} ${b} = ?`:`🏅 *Math Challenge*\n\nQ${g.round}: ${a} ${op} ${b} = ?`,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[
          choices.slice(0,2).map(c=>({text:`${c}`,callback_data:`game_challenge_math_${id}_${c}_${ans}`})),
          choices.slice(2).map(c=>({text:`${c}`,callback_data:`game_challenge_math_${id}_${c}_${ans}`})),
        ]}});
      }else if(c.id==='guess'){
        const secret=Math.floor(Math.random()*10)+1;
        const btns=[];for(let i=1;i<=5;i++)btns.push({text:`${i}`,callback_data:`game_challenge_num_${id}_${i}_${secret}`});
        const btns2=[];for(let i=6;i<=10;i++)btns2.push({text:`${i}`,callback_data:`game_challenge_num_${id}_${i}_${secret}`});
        await ctx.editMessageText(lang==='zh'?'🏅 *幸运数字*\n\n猜一个 1-10 的数字：':'🏅 *Lucky Number*\n\nGuess 1-10:',{parse_mode:'Markdown',reply_markup:{inline_keyboard:[btns,btns2]}});
      }else{
        await ctx.editMessageText(lang==='zh'?'🏅 *连胜挑战*\n\n硬币抛起...\n\n猜正面还是反面？':'🏅 *Streak Challenge*\n\nCoin flipped...\n\nHeads or Tails?',{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🪙 '+(lang==='zh'?'正面':'Heads'),callback_data:`game_challenge_coin_${id}_heads`},{text:'🪙 '+(lang==='zh'?'反面':'Tails'),callback_data:`game_challenge_coin_${id}_tails`}]]}});
      }
      return ctx.answerCbQuery();
    }
    if(action.startsWith('math_')){
      const p=action.split('_');const id=p[2],chosen=parseInt(p[3]),ans=parseInt(p[4]);const g=games.get(id);if(!g)return ctx.answerCbQuery('❌');
      const ok=chosen===ans;
      if(ok){g.score++;g.round++;}
      if(g.round>5||!ok){
        const stats=g.lang==='zh'?{['答对']:g.score+'/5',['正确率']:Math.round(g.score/5*100)+'%'}:{Correct:g.score+'/5',Accuracy:Math.round(g.score/5*100)+'%'};
        const isRecord=g.score>=4;
        const msg=ok?result.win(g.lang,{winner:ctx.from.username||'Player',game:'🏅 '+(g.lang==='zh'?'每日挑战':'Daily'),score:g.score+'/5',isRecord,stats}):result.lose(g.lang,{winner:ctx.from.username,score:g.score,stats});
        await ctx.editMessageText(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🏅 '+(g.lang==='zh'?'再来一次':'Try Again'),callback_data:'game_challenge_new'}]]}});
        games.delete(id);
      }else{
        const a=Math.floor(Math.random()*10)+1,b=Math.floor(Math.random()*10)+1,op=['+','-','×'][Math.floor(Math.random()*3)];
        let newAns;if(op==='+')newAns=a+b;else if(op==='-')newAns=a-b;else newAns=a*b;
        await ctx.editMessageText(g.lang==='zh'?`🏅 *数学挑战*\n✅ 正确！\n\n第 ${g.round} 题：${a} ${op} ${b} = ?`:`🏅 *Math Challenge*\n✅ Correct!\n\nQ${g.round}: ${a} ${op} ${b} = ?`,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[
          {text:'1',callback_data:`game_challenge_math_${id}_1_${newAns}`},{text:'2',callback_data:`game_challenge_math_${id}_2_${newAns}`},{text:'3',callback_data:`game_challenge_math_${id}_3_${newAns}`},
          {text:'4',callback_data:`game_challenge_math_${id}_4_${newAns}`},
        ]]}});
      }
      return ctx.answerCbQuery(ok?'✅':'❌');
    }
    if(action.startsWith('num_')){
      const p=action.split('_');const id=p[2],guess=parseInt(p[3]),secret=parseInt(p[4]);const g=games.get(id);if(!g)return ctx.answerCbQuery('❌');
      const ok=guess===secret;g.score=g.round;
      const stats=g.lang==='zh'?{['答案']:secret,['你猜']:guess,['第几次']:g.round}:{Answer:secret,YourGuess:guess,Attempt:g.round};
      const msg=ok?result.win(g.lang,{winner:ctx.from.username||'Player',game:'🏅 '+(g.lang==='zh'?'幸运数字':'Lucky Number'),score:'🎯',isRecord:g.round<=2,stats}):result.lose(g.lang,{winner:ctx.from.username,score:'❌',stats});
      await ctx.editMessageText(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🏅 '+(g.lang==='zh'?'再试一次':'Try Again'),callback_data:'game_challenge_new'}]]}});
      games.delete(id);
      return ctx.answerCbQuery(ok?'🎉':'❌');
    }
    if(action.startsWith('coin_')){
      const p=action.split('_');const id=p[2],guess=p[3];const g=games.get(id);if(!g)return ctx.answerCbQuery('❌');
      const result_coin=Math.random()<0.5?'heads':'tails';const ok=guess===result_coin;
      const emoji=result_coin==='heads'?'🪙正面':'🪙反面';
      if(ok){g.score++;g.round++;}
      const stats=g.lang==='zh'?{['结果']:emoji,['连胜']:g.score}:{Result:emoji,Streak:g.score};
      if(!ok){
        await ctx.editMessageText(result.lose(g.lang,{winner:ctx.from.username,score:g.score-1,stats}),{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🏅 '+(g.lang==='zh'?'再挑战':'Retry'),callback_data:'game_challenge_new'}]]}});
        games.delete(id);
      }else if(g.score>=5){
        await ctx.editMessageText(result.win(g.lang,{winner:ctx.from.username+' 🔥',game:'🏅 '+(g.lang==='zh'?'连胜挑战':'Streak'),score:g.score,isRecord:true,stats}),{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🏅 '+(g.lang==='zh'?'继续挑战':'Keep Going'),callback_data:'game_challenge_new'}]]}});
        games.delete(id);
      }else{
        await ctx.editMessageText(g.lang==='zh'?`🏅 *连胜挑战*\n✅ ${emoji} 猜对了！连胜 ${g.score} 次！\n\n继续猜？`:`🏅 *Streak Challenge*\n✅ ${emoji} Correct! Streak: ${g.score}\n\nKeep going?`,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🪙 '+(g.lang==='zh'?'正面':'Heads'),callback_data:`game_challenge_coin_${id}_heads`},{text:'🪙 '+(g.lang==='zh'?'反面':'Tails'),callback_data:`game_challenge_coin_${id}_tails`}]]}});
      }
      return ctx.answerCbQuery(ok?'✅':('❌ '+emoji));
    }
    if(action==='new')return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};
