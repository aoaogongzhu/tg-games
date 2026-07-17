// 🔫 西部对决 - Western Duel (2P)
const { v4 } = require('uuid');
const result = require('../utils/result');
const games = new Map();

module.exports = {
  id: 'western', name: '🔫 西部对决',
  async startPlay(ctx) {
    const lang = (ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
    if(ctx.chat.id>0)return ctx.reply(lang==='zh'?'🔫 *西部对决*\n\n把这个Bot拉进群，和朋友来一场西部枪战！\n\n规则：倒数结束后，先开枪的人获胜！':'🔫 *Western Duel*\n\nAdd this bot to a group and have a Wild West showdown!\n\nRules: After countdown, first to draw wins!',{parse_mode:'Markdown'});
    const id=v4().slice(0,6);
    games.set(id,{id,chatId:ctx.chat.id,players:[{id:ctx.from.id,username:ctx.from.username||'Player'}],status:'waiting',lang});
    await ctx.reply(lang==='zh'?`🔫 *西部对决*\n\n${ctx.from.username||'Player'} 发出了决斗挑战！\n\n规则：倒数结束后快速拔枪！先开枪的人获胜！\n\n至少2人才能开始！`:`🔫 *Western Duel*\n\n${ctx.from.username||'Player'} challenged you!\n\nRules: After countdown, quick draw! First to fire wins!\n\nNeed at least 2 players!`,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🔫 '+ (lang==='zh'?'加入对决':'Join'),callback_data:`game_western_join_${id}`}],[{text:lang==='zh'?'开始对决':'Start Duel',callback_data:`game_western_start_${id}`}],[{text:'❌',callback_data:`game_western_cancel_${id}`}]]}});
  },
  async handleCallback(ctx, action) {
    const parts=action.split('_');const sub=parts[0],id=parts.slice(1).join('_');const g=games.get(id);
    if(!g)return ctx.answerCbQuery('❌');const lang=g.lang;
    if(sub==='join'){
      if(g.players.find(p=>p.id===ctx.from.id))return ctx.answerCbQuery('❌');
      if(g.status!=='waiting')return ctx.answerCbQuery('❌');
      g.players.push({id:ctx.from.id,username:ctx.from.username||'Player'});
      await ctx.editMessageText(lang==='zh'?`🔫 *西部对决*\n\n玩家：${g.players.map(p=>p.username).join(' VS ')}\n\n准备开始对决！`:`🔫 *Western Duel*\n\nPlayers: ${g.players.map(p=>p.username).join(' VS ')}\n\nReady to duel!`,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🔫 '+(lang==='zh'?'开始':'Start'),callback_data:`game_western_start_${id}`}],[{text:'❌',callback_data:`game_western_cancel_${id}`}]]}});
      return ctx.answerCbQuery(lang==='zh'?'已加入':'Joined');
    }
    if(sub==='start'){
      if(g.players.length<2)return ctx.answerCbQuery(lang==='zh'?'至少需要2人':'Need 2 players');
      g.status='playing';g.winner=null;await ctx.editMessageText(lang==='zh'?'🔫 *对决开始！*\n\n⏳ 3...':'🔫 *Duel!*\n\n⏳ 3...',{parse_mode:'Markdown'});
      setTimeout(async()=>{try{if(!games.has(id))return;await ctx.editMessageText('⏳ 2...');}catch(e){}}
      ,1000);setTimeout(async()=>{try{if(!games.has(id))return;await ctx.editMessageText('⏳ 1...');}catch(e){}}
      ,2000);setTimeout(async()=>{try{if(!games.has(id))return;
        await ctx.editMessageText(lang==='zh'?'🔫 *开枪！* 先按下按钮的人获胜！':'🔫 *FIRE!* First to press wins!',{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🔫 '+(lang==='zh'?'开枪！':'FIRE!'),callback_data:`game_western_fire_${id}`}]]}});
        g.fireTime=Date.now()+2000; // Window closes after 2 seconds
      }catch(e){}},3000);
      setTimeout(async()=>{try{if(!games.has(id)||g.winner)return;
        await ctx.editMessageText(lang==='zh'?'⏰ 时间到！双方都没开枪...\n🤝 平局！':'⏰ Time up! Neither fired...\n🤝 Draw!',{reply_markup:{inline_keyboard:[[{text:'🔫 '+(lang==='zh'?'再来一局':'Rematch'),callback_data:'game_western_new'}]]}});
        games.delete(id);
      }catch(e){}},5000);
      return ctx.answerCbQuery();
    }
    if(sub==='fire'){
      if(g.status!=='playing'||g.winner)return ctx.answerCbQuery('⏰');
      g.winner=ctx.from.id;
      const winner=g.players.find(p=>p.id===ctx.from.id);
      const loser=g.players.find(p=>p.id!==ctx.from.id);
      const rt=((g.fireTime||Date.now())-Date.now()+2000);
      await ctx.editMessageText(result.win(lang,{winner:winner.username+' 🤠',game:'🔫 '+(lang==='zh'?'西部对决':'Western Duel'),score:rt>0?Math.round(rt)+'ms':'⚡最快',stats:{[lang==='zh'?'对手':'Opponent']:loser?.username||'?',[lang==='zh'?'反应':'Reaction']:rt>0?Math.round(rt)+'ms':'⚡'},isRecord:rt<300}),{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🔫 '+(lang==='zh'?'再来一局':'Rematch'),callback_data:'game_western_new'}]]}});
      games.delete(id);
      return ctx.answerCbQuery('🤠');
    }
    if(s==='accept2'){
    const cg=games.get(id);
    if(!cg||!cg.isOpen)return ctx.answerCbQuery('❌');
    if(ctx.from.id===cg.challenger.id)return ctx.answerCbQuery('❌');
    const ngid=v4().slice(0,6);
    games.set(ngid,{...cg,id:ngid,chatId:ctx.chat.id,players:[cg.challenger,{id:ctx.from.id,username:ctx.from.username||'Player'}],status:'playing'});
    games.delete(id);
    const gg=games.get(ngid);
    if(!gg)return ctx.answerCbQuery('❌');
    await ctx.editMessageText(gg.lang==='zh'?'🔫 *对决开始！*\n\n⏳ 3...':'🔫 *Duel!*\n\n⏳ 3...',{parse_mode:'Markdown'});
    setTimeout(async()=>{try{if(!games.has(ngid))return;await ctx.editMessageText('⏳ 2...');}catch(e){}},1000);
    setTimeout(async()=>{try{if(!games.has(ngid))return;await ctx.editMessageText('⏳ 1...');}catch(e){}},2000);
    setTimeout(async()=>{try{if(!games.has(ngid))return;await ctx.editMessageText(gg.lang==='zh'?'🔫 *开枪！* 先按下按钮的人获胜！':'🔫 *FIRE!* First to press wins!',{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🔫 '+(gg.lang==='zh'?'开枪！':'FIRE!'),callback_data:`game_western_fire_${ngid}`}]]}});
      gg.fireTime=Date.now()+2000;}catch(e){}},3000);
    setTimeout(async()=>{try{if(!games.has(ngid)||gg.winner)return;await ctx.editMessageText(gg.lang==='zh'?'⏰ 时间到！平局！':'⏰ Time up! Draw!',{reply_markup:{inline_keyboard:[[{text:'🔫 '+(gg.lang==='zh'?'再来一局':'Rematch'),callback_data:'game_western_new'}]]}});games.delete(ngid);}catch(e){}},5000);
    return ctx.answerCbQuery('🔫');
  }

  if(sub==='cancel'){games.delete(id);await ctx.editMessageText('❌');return ctx.answerCbQuery('❌');}
    if(action==='new')return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};
