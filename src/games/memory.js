// 🧠 记忆挑战 - Memory Challenge (Solo)
const { v4 } = require('uuid');
const result = require('../utils/result');
const games = new Map();

module.exports = {
  id: 'memory', name: '🧠 记忆挑战',
  async startPlay(ctx) {
    const lang = (ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
    const msg = lang==='zh'?'🧠 *记忆挑战*\n\n我会显示一串数字，记住它然后按顺序输入！\n每轮增加一位数，看你能记住几位！':'🧠 *Memory Challenge*\n\nI will show a sequence of numbers. Remember it and type them back!\nEach round adds one more digit. How many can you remember?';
    const id=v4().slice(0,6);
    const seq=Array.from({length:5},()=>Math.floor(Math.random()*10)).join('');
    games.set(id,{id,seq,round:1,lang});
    await ctx.reply(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🧠 '+ (lang==='zh'?'开始':'Start'),callback_data:`game_memory_show_${id}`}]]}});
  },
  async handleCallback(ctx, action) {
    if(action.startsWith('show_')){
      const id=action.split('_')[1];const g=games.get(id);if(!g)return ctx.answerCbQuery('❌');
      await ctx.editMessageText(g.lang==='zh'?`🧠 *记住这个数字*\n\n**${g.seq}**\n\n⏳ 3秒后消失...`:`🧠 *Remember this*\n\n**${g.seq}**\n\n⏳ It will disappear in 3 seconds...`,{parse_mode:'Markdown'});
      setTimeout(async()=>{
        if(!games.has(id))return;
        // Build answer buttons (digits 0-9)
        const btns=[];
        for(let i=0;i<5;i++)btns.push({text:`${i}`,callback_data:`game_memory_digit_${id}_${i}`});
        const btns2=[];
        for(let i=5;i<10;i++)btns2.push({text:`${i}`,callback_data:`game_memory_digit_${id}_${i}`});
        try{await ctx.editMessageText(
          g.lang==='zh'?`🧠 *输入你记住的数字*\n\n共 ${g.seq.length} 位`:`🧠 *Type the number*\n\n${g.seq.length} digits`,
          {parse_mode:'Markdown',reply_markup:{inline_keyboard:[btns,btns2,[{text:'✅ '+(g.lang==='zh'?'确认':'Submit'),callback_data:`game_memory_check_${id}`}]]}}
        );}catch(e){}
      },2000);
      return ctx.answerCbQuery();
    }
    if(action.startsWith('digit_')){
      const parts=action.split('_');const id=parts[2];const d=parts[3];
      const g=games.get(id);if(!g)return ctx.answerCbQuery('❌');
      g.answer=(g.answer||'')+d;
      return ctx.answerCbQuery(d);
    }
    if(action.startsWith('check_')){
      const id=action.split('_')[1];const g=games.get(id);if(!g)return ctx.answerCbQuery('❌');
      const correct=g.answer===g.seq;
      if(correct){
        if(g.round>=7){
          await ctx.editMessageText(result.win(g.lang,{winner:ctx.from.username||'Player',game:'🧠 '+(g.lang==='zh'?'记忆挑战':'Memory'),score:g.round+'/7',isRecord:true,stats:{[g.lang==='zh'?'最高轮次':'Best Round']:g.round}}),{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🧠 '+(g.lang==='zh'?'再来一局':'Play Again'),callback_data:'game_memory_new'}]]}});
          games.delete(id);
        }else{
          g.round++;g.seq+=Math.floor(Math.random()*10);g.answer='';
          await ctx.editMessageText(g.lang==='zh'?`✅ 正确！进入第 ${g.round} 轮\n记住这个数字...`:`✅ Correct! Round ${g.round}\nRemember this...`,{parse_mode:'Markdown'});
          setTimeout(async()=>{
            if(!games.has(id))return;
            try{await ctx.editMessageText(g.lang==='zh'?`🧠 *记住这个数字*\n\n**${g.seq}**\n\n⏳ 3秒后...`:`🧠 *Remember this*\n\n**${g.seq}**\n\n⏳ 3 seconds...`,{parse_mode:'Markdown'});}catch(e){}
            setTimeout(async()=>{
              if(!games.has(id))return;
              const btns=[];
              for(let i=0;i<5;i++)btns.push({text:`${i}`,callback_data:`game_memory_digit_${id}_${i}`});
              const btns2=[];
              for(let i=5;i<10;i++)btns2.push({text:`${i}`,callback_data:`game_memory_digit_${id}_${i}`});
              try{await ctx.editMessageText(g.lang==='zh'?`🧠 *输入数字*\n\n共 ${g.seq.length} 位`:`🧠 *Type it*\n\n${g.seq.length} digits`,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[btns,btns2,[{text:'✅ '+(g.lang==='zh'?'确认':'Submit'),callback_data:`game_memory_check_${id}`}]]}});}catch(e){}
            },3000);
          },1000);
        }
      }else{
        await ctx.editMessageText(result.lose(g.lang,{winner:ctx.from.username||'Player',score:g.round-1,stats:{[g.lang==='zh'?'正确数字':'Answer']:g.seq,[g.lang==='zh'?'你输入':'Your input']:g.answer||'?'}}),{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🧠 '+(g.lang==='zh'?'再试一次':'Try Again'),callback_data:'game_memory_new'}]]}});
        games.delete(id);
      }
      return ctx.answerCbQuery(correct?'✅':'❌');
    }
    if(action==='new')return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};
