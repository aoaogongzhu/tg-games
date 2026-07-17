// 🎲 双人骰子 - Dice Duel (2P)
const { v4 } = require('uuid');
const result = require('../utils/result');
const games = new Map();

module.exports = {
  id: 'diceduel', name: '🎲 双人骰子',
  async startPlay(ctx) {
    const lang=(ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
    if(ctx.chat.id>0)return ctx.reply(lang==='zh'?'🎲 *双人骰子*\n\n把Bot拉进群和朋友对战！\n\n双方各掷2个骰子，点数总和大的获胜！':'🎲 *Dice Duel*\n\nAdd bot to group!\n\nEach rolls 2 dice. Higher total wins!',{parse_mode:'Markdown'});
    const id=v4().slice(0,6);
    games.set(id,{id,chatId:ctx.chat.id,players:[{id:ctx.from.id,username:ctx.from.username||'Player'}],status:'waiting',lang});
    await ctx.reply(lang==='zh'?`🎲 *双人骰子*\n\n${ctx.from.username||'Player'} 发起了挑战！\n\n点击加入！`:`🎲 *Dice Duel*\n\n${ctx.from.username||'Player'} challenged!\n\nJoin now!`,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🎲 '+(lang==='zh'?'加入':'Join'),callback_data:`game_diceduel_join_${id}`}],[{text:'🎲 '+(lang==='zh'?'开始':'Roll'),callback_data:`game_diceduel_roll_${id}`}],[{text:'❌',callback_data:`game_diceduel_cancel_${id}`}]]}});
  },
  async handleCallback(ctx, action) {
    const p=action.split('_');const s=p[0],id=p.slice(1).join('_');const g=games.get(id);if(!g)return ctx.answerCbQuery('❌');
    if(s==='join'){
      if(g.players.find(p=>p.id===ctx.from.id))return ctx.answerCbQuery('❌');
      g.players.push({id:ctx.from.id,username:ctx.from.username||'Player'});
      await ctx.editMessageText(g.lang==='zh'?`🎲 *双人骰子*\n\n${g.players[0].username} VS ${g.players[1].username}\n\n开始掷骰！`:`🎲 *Dice Duel*\n\n${g.players[0].username} VS ${g.players[1].username}\n\nRoll!`,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🎲 '+(g.lang==='zh'?'掷骰':'Roll'),callback_data:`game_diceduel_roll_${id}`}],[{text:'❌',callback_data:`game_diceduel_cancel_${id}`}]]}});
      return ctx.answerCbQuery(g.lang==='zh'?'已加入':'Joined');
    }
    if(s==='roll'){
      g.status='playing';const r1a=Math.floor(Math.random()*6)+1,r1b=Math.floor(Math.random()*6)+1,t1=r1a+r1b;
      const r2a=Math.floor(Math.random()*6)+1,r2b=Math.floor(Math.random()*6)+1,t2=r2a+r2b;
      const dice=['⚀','⚁','⚂','⚃','⚄','⚅'];
      let msg;
      if(t1>t2){msg=result.win(g.lang,{winner:g.players[0].username+' 🎲',game:'🎲 '+(g.lang==='zh'?'双人骰子':'Dice Duel'),stats:{[g.players[0].username]:dice[r1a-1]+dice[r1b-1]+'='+t1,[g.players[1].username]:dice[r2a-1]+dice[r2b-1]+'='+t2}});}
      else if(t2>t1){msg=result.win(g.lang,{winner:g.players[1].username+' 🎲',game:'🎲 '+(g.lang==='zh'?'双人骰子':'Dice Duel'),stats:{[g.players[0].username]:dice[r1a-1]+dice[r1b-1]+'='+t1,[g.players[1].username]:dice[r2a-1]+dice[r2b-1]+'='+t2}});}
      else{msg=result.draw(g.lang,{players:[g.players[0].username,g.players[1].username]});}
      await ctx.editMessageText(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🎲 '+(g.lang==='zh'?'再来一局':'Rematch'),callback_data:'game_diceduel_new'}]]}});
      games.delete(id);
      return ctx.answerCbQuery('🎲');
    }
    if(s==='cancel'){games.delete(id);await ctx.editMessageText('❌');return ctx.answerCbQuery('❌');}
    if(action==='new')return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};
