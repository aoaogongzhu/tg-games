// 🤔 知识问答 - Quiz (Solo)
const { v4 } = require('uuid');
const result = require('../utils/result');

const QUIZ = [
  {zh:{q:'地球距离太阳大约多远？',a:'1.5亿公里',o:['1.5亿公里','5000万公里','3亿公里','10亿公里']},en:{q:'How far is Earth from the Sun?',a:'150 million km',o:['150 million km','50 million km','300 million km','1 billion km']},idx:0},
  {zh:{q:'水的化学式是什么？',a:'H₂O',o:['H₂O','CO₂','NaCl','O₂']},en:{q:'What is the chemical formula of water?',a:'H₂O',o:['H₂O','CO₂','NaCl','O₂']},idx:1},
  {zh:{q:'哪个国家面积最大？',a:'俄罗斯',o:['俄罗斯','中国','美国','加拿大']},en:{q:'Which country has the largest area?',a:'Russia',o:['Russia','China','USA','Canada']},idx:2},
  {zh:{q:'血液循环是谁发现的？',a:'哈维',o:['哈维','达尔文','牛顿','爱因斯坦']},en:{q:'Who discovered blood circulation?',a:'Harvey',o:['Harvey','Darwin','Newton','Einstein']},idx:3},
  {zh:{q:'一年有多少天？',a:'365',o:['365','360','366','370']},en:{q:'How many days in a year?',a:'365',o:['365','360','366','370']},idx:4},
  {zh:{q:'人类有多少对染色体？',a:'23',o:['23','22','24','46']},en:{q:'How many chromosome pairs do humans have?',a:'23',o:['23','22','24','46']},idx:5},
  {zh:{q:'珠穆朗玛峰多高？',a:'8848米',o:['8848米','8000米','9000米','7500米']},en:{q:'How tall is Mount Everest?',a:'8848m',o:['8848m','8000m','9000m','7500m']},idx:6},
];
const games = new Map();

module.exports = {
  id: 'quiz', name: '🤔 知识问答',
  async startPlay(ctx) {
    const lang = (ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
    const id=v4().slice(0,6);const idx=Math.floor(Math.random()*QUIZ.length);
    const q=QUIZ[idx];const qd=lang==='zh'?q.zh:q.en;
    const shuffled=[...qd.o].sort(()=>Math.random()-0.5);
    games.set(id,{id,correct:qd.a,score:0,total:0,shuffled,lang,idx});
    await ctx.reply((lang==='zh'?`🤔 *知识问答*\n\n${qd.q}`:`🤔 *Quiz*\n\n${qd.q}`),{parse_mode:'Markdown',
      reply_markup:{inline_keyboard:[
        shuffled.slice(0,2).map(a=>({text:a,callback_data:`game_quiz_ans_${id}_${encodeURIComponent(a)}_${encodeURIComponent(qd.a)}`})),
        shuffled.slice(2).map(a=>({text:a,callback_data:`game_quiz_ans_${id}_${encodeURIComponent(a)}_${encodeURIComponent(qd.a)}`})),
      ]}
    });
  },
  async handleCallback(ctx, action) {
    if(action.startsWith('ans_')){
      const parts=action.split('_');const id=parts[2];const chosen=decodeURIComponent(parts[3]),correct=decodeURIComponent(parts[4]);
      const g=games.get(id);if(!g)return ctx.answerCbQuery('❌');
      g.total++;const ok=chosen===correct;
      if(ok)g.score++;
      const lang=g.lang;
      const mm=lang==='zh'?(ok?'✅ 正确！':'❌ 答案是: '+correct):(ok?'✅ Correct!':'❌ Answer: '+correct);
      if(g.total>=5){
        const isRecord=g.score>=4;const stats=lang==='zh'?{['正确率']:g.score+'/'+g.total,['正确数']:g.score}:{Score:g.score+'/'+g.total,Correct:g.score};
        await ctx.editMessageText(result.win(lang,{winner:ctx.from.username||'Player',game:'🤔 '+(lang==='zh'?'知识问答':'Quiz'),score:g.score+'/'+g.total,isRecord,stats}),{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🤔 '+(lang==='zh'?'再来一轮':'Play Again'),callback_data:'game_quiz_new'}]]}});
        games.delete(id);
      }else{
        const idx=Math.floor(Math.random()*QUIZ.length);const q=QUIZ[idx];const qd=lang==='zh'?q.zh:q.en;const shuffled=[...qd.o].sort(()=>Math.random()-0.5);
        games.set(id,{id,correct:qd.a,score:g.score,total:g.total,shuffled,lang,idx});
        await ctx.editMessageText((lang==='zh'?`${mm}\n\n第 ${g.total+1}/5 题\n${qd.q}`:`${mm}\n\nQ ${g.total+1}/5\n${qd.q}`),{parse_mode:'Markdown',reply_markup:{inline_keyboard:[
          shuffled.slice(0,2).map(a=>({text:a,callback_data:`game_quiz_ans_${id}_${encodeURIComponent(a)}_${encodeURIComponent(qd.a)}`})),
          shuffled.slice(2).map(a=>({text:a,callback_data:`game_quiz_ans_${id}_${encodeURIComponent(a)}_${encodeURIComponent(qd.a)}`})),
        ]}});
      }
      return ctx.answerCbQuery(mm);
    }
    if(action==='new')return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};
