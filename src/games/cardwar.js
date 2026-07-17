// 🎴 抽牌对决 - Card War (2P)
const { v4 } = require('uuid');
const result = require('../utils/result');
const games = new Map();

const CARDS = [{e:'🂢',v:2},{e:'🂣',v:3},{e:'🂤',v:4},{e:'🂥',v:5},{e:'🂦',v:6},{e:'🂧',v:7},{e:'🂨',v:8},{e:'🂩',v:9},{e:'🂪',v:10},{e:'🂫',v:11},{e:'🂭',v:12},{e:'🂮',v:13},{e:'🂡',v:14}];

module.exports = {
  id: 'cardwar', name: '🎴 抽牌对决',
  async startPlay(ctx) {
    const lang=(ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
    if(ctx.chat.id>0)return ctx.reply(lang==='zh'?'🎴 *抽牌对决*\n\n把这个Bot拉进群和朋友对战！\n\n双方各抽一张牌，点数大的人获胜！':'🎴 *Card War*\n\nAdd this bot to a group and play!\n\nEach player draws a card. Higher card wins!',{parse_mode:'Markdown'});
    const id=v4().slice(0,6);
    games.set(id,{id,chatId:ctx.chat.id,players:[{id:ctx.from.id,username:ctx.from.username||'Player'}],status:'waiting',lang});
    await ctx.reply(lang==='zh'?`🎴 *抽牌对决*\n\n${ctx.from.username||'Player'} 发起了对决！\n\n点击加入，2人开始对战！`:`🎴 *Card War*\n\n${ctx.from.username||'Player'} challenged you!\n\nJoin to battle!`,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🎴 '+(lang==='zh'?'加入':'Join'),callback_data:`game_cardwar_join_${id}`}],[{text:lang==='zh'?'开始':'Start',callback_data:`game_cardwar_start_${id}`}],[{text:'❌',callback_data:`game_cardwar_cancel_${id}`}]]}});
  },
  async handleCallback(ctx, action) {
    const parts=action.split('_');const sub=parts[0],id=parts.slice(1).join('_');const g=games.get(id);if(!g)return ctx.answerCbQuery('❌');
    if(sub==='join'){
      if(g.players.find(p=>p.id===ctx.from.id))return ctx.answerCbQuery('❌');
      if(g.players.length>=2)return ctx.answerCbQuery('❌');
      g.players.push({id:ctx.from.id,username:ctx.from.username||'Player'});
      await ctx.editMessageText(g.lang==='zh'?`🎴 *抽牌对决*\n\n${g.players[0].username} VS ${g.players[1].username}\n\n准备开始！`:`🎴 *Card War*\n\nPlayers: ${g.players[0].username} VS ${g.players[1].username}\n\nReady!`,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🎴 '+(g.lang==='zh'?'开始对决':'Draw!'),callback_data:`game_cardwar_start_${id}`}],[{text:'❌',callback_data:`game_cardwar_cancel_${id}`}]]}});
      return ctx.answerCbQuery(g.lang==='zh'?'已加入':'Joined');
    }
    if(sub==='start'){
      g.status='playing';const c1=CARDS[Math.floor(Math.random()*13)],c2=CARDS[Math.floor(Math.random()*13)];
      let resultMsg='';
      if(c1.v>c2.v){resultMsg=result.win(g.lang,{winner:g.players[0].username+' 🎴',game:'🎴 '+(g.lang==='zh'?'抽牌对决':'Card War'),stats:{[g.players[0].username]:c1.e+'('+c1.v+')',[g.players[1].username]:c2.e+'('+c2.v+')'}});
      }else if(c2.v>c1.v){resultMsg=result.win(g.lang,{winner:g.players[1].username+' 🎴',game:'🎴 '+(g.lang==='zh'?'抽牌对决':'Card War'),stats:{[g.players[0].username]:c1.e+'('+c1.v+')',[g.players[1].username]:c2.e+'('+c2.v+')'}});
      }else{resultMsg=result.draw(g.lang,{players:[g.players[0].username,g.players[1].username]});}
      await ctx.editMessageText(resultMsg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🎴 '+(g.lang==='zh'?'再战一局':'Rematch'),callback_data:'game_cardwar_new'}]]}});
      games.delete(id);
      return ctx.answerCbQuery('🎴');
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
    const cards=['\uD83C\uDCA2','\uD83C\uDCA3','\uD83C\uDCA4','\uD83C\uDCA5','\uD83C\uDCA6','\uD83C\uDCA7','\uD83C\uDCA8','\uD83C\uDCA9','\uD83C\uDCAA','\uD83C\uDCAB','\uD83C\uDCAD','\uD83C\uDCAE','\uD83C\uDCA1'];
    const vals=[2,3,4,5,6,7,8,9,10,11,12,13,14];
    const cc1=cards[Math.floor(Math.random()*13)],cc2=cards[Math.floor(Math.random()*13)];
    const v1=vals[cards.indexOf(cc1)],v2=vals[cards.indexOf(cc2)];
    const r=require('./utils/result');
    let msg;
    if(v1>v2)msg=r.win(gg.lang,{winner:gg.players[0].username+' 🂴',game:'🂴 '+(gg.lang==='zh'?'抽牌对决':'Card War'),stats:{[gg.players[0].username]:cc1+'('+v1+')',[gg.players[1].username]:cc2+'('+v2+')'}});
    else if(v2>v1)msg=r.win(gg.lang,{winner:gg.players[1].username+' 🂴',game:'🂴 '+(gg.lang==='zh'?'抽牌对决':'Card War'),stats:{[gg.players[0].username]:cc1+'('+v1+')',[gg.players[1].username]:cc2+'('+v2+')'}});
    else msg=r.draw(gg.lang,{players:[gg.players[0].username,gg.players[1].username]});
    await ctx.editMessageText(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🂴 '+(gg.lang==='zh'?'再战一局':'Rematch'),callback_data:'game_cardwar_new'}]]}});
    games.delete(ngid);
    return ctx.answerCbQuery('🂴');
  }

  if(sub==='cancel'){games.delete(id);await ctx.editMessageText('❌');return ctx.answerCbQuery('❌');}
    if(action==='new')return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};
