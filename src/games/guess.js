// 🔢 猜数字 - Guess Number (Bilingual)
const { v4: uuidv4 } = require('uuid');
const games = new Map();

module.exports = {
  id: 'guess', name: '🔢 猜数字',
  async startPlay(ctx) { // Actually, we need lang from context
    const lang = (ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
    const msg = lang==='zh' ? '🔢 *猜数字*\n\n我心里想了一个 1-200 之间的数字，你猜是几？\n每次我都会告诉你「大了」或「小了」！' : '🔢 *Guess Number*\n\nI am thinking of a number between 1-200. Can you guess it?\nI will tell you "higher" or "lower" each time!';
    const id = uuidv4().slice(0,6);
    games.set(id,{num:Math.floor(Math.random()*200)+1,attempts:0,id,lang});
    await ctx.reply(msg,{parse_mode:'Markdown',
      reply_markup:{inline_keyboard:[
        ['1-20','21-40','41-60'].map(n=>({text:n,callback_data:`game_guess_range_${id}_${n.split('-')[0]}_${n.split('-')[1]}`})),
        ['61-80','81-100'].map(n=>({text:n,callback_data:`game_guess_range_${id}_${n.split('-')[0]}_${n.split('-')[1]}`})),
        [{text:'❌ '+ (lang==='zh'?'取消':'Cancel'),callback_data:`game_guess_cancel_${id}`}]
      ]}
    });
  },
  async handleCallback(ctx, action) {
    if(action.startsWith('range_')) {
      const parts=action.split('_');const id=parts[1];const lo=parseInt(parts[2]),hi=parseInt(parts[3]);
      const g=games.get(id);if(!g)return ctx.answerCbQuery('❌');
      g.lo=lo;g.hi=hi;
      await ctx.editMessageText(g.lang==='zh'?`🔢 猜 ${lo}-${hi} 之间的数字，选一个范围：`: `🔢 Guess ${lo}-${hi}, pick a range:`,{
        reply_markup:{inline_keyboard:[
          Array.from({length:Math.min(5,hi-lo+1)},(_,i)=>({text:`${lo+i}`,callback_data:`game_guess_pick_${id}_${lo+i}`})),
          lo+5<=hi?Array.from({length:Math.min(5,hi-lo-4)},(_,i)=>({text:`${lo+5+i}`,callback_data:`game_guess_pick_${id}_${lo+5+i}`})):[],
        ]}
      });
      return ctx.answerCbQuery();
    }
    if(action.startsWith('pick_')) {
      const parts=action.split('_');const id=parts[1];const guess=parseInt(parts[2]);
      const g=games.get(id);if(!g)return ctx.answerCbQuery('❌');
      g.attempts++;
      if(guess===g.num){
        const msg=g.lang==='zh'?`🎉 *猜中了！* 就是 ${g.num}！\n你用了 ${g.attempts} 次猜中！`:`🎉 *Correct!* It was ${g.num}!\nYou got it in ${g.attempts} tries!`;
        await ctx.editMessageText(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🔢 '+ (g.lang==='zh'?'再来一局':'Play Again'),callback_data:'game_guess_new'}]]}});
        games.delete(id);
        return ctx.answerCbQuery('🎉');
      }
      const hint=guess<g.num?(g.lang==='zh'?'📈 小了，再大一点！':'📈 Too low!'):(g.lang==='zh'?'📉 大了，再小一点！':'📉 Too high!');
      const remaining=g.lang==='zh'?`第 ${g.attempts} 次猜，继续：`:`Attempt ${g.attempts}, keep going:`;
      await ctx.editMessageText(`🔢 ${hint}\n\n${remaining}`,{
        reply_markup:{inline_keyboard:[
          Array.from({length:Math.min(5,g.hi-g.lo+1)},(_,i)=>{
            const v=g.lo+i;
            return {text:`${v}`,callback_data:`game_guess_pick_${id}_${v}`};
          }),
          Array.from({length:Math.min(5,Math.max(0,g.hi-g.lo-4))},(_,i)=>{
            const v=g.lo+5+i;
            return v<=g.hi?{text:`${v}`,callback_data:`game_guess_pick_${id}_${v}`}:null;
          }).filter(Boolean),
        ].filter(r=>r.length>0)}
      });
      return ctx.answerCbQuery(hint);
    }
    if(action==='new')return this.startPlay(ctx);
    if(action.startsWith('cancel_')){games.delete(action.split('_')[1]);await ctx.editMessageText('❌');return ctx.answerCbQuery('❌');}
    ctx.answerCbQuery();
  }
};
