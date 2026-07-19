// 🃏 21点 - Blackjack
const{v4}=require("uuid");const g=new Map();const C=["🂢","🂣","🂤","🂥","🂦","🂧","🂨","🂩","🂪","🂫","🂭","🂮","🂡"];const V=[2,3,4,5,6,7,8,9,10,10,10,10,11];
function sum(h){let s=h.reduce((a,c)=>a+V[c],0),a=h.filter(x=>x===12).length;while(s>21&&a>0){s-=10;a--}return s;}
function hand(h){return h.map(x=>C[x]).join(" ")+" = "+sum(h);}
module.exports={id:"bj",name:"🃏 21点",
async startPlay(ctx){const l=(ctx.from?.language_code||"").startsWith("zh")?"zh":"en";const id=v4().slice(0,6);g.set(id,{id,lang:l,coins:100,round:1});
await ctx.reply(l==="zh"?("🃏 21点\n\n💰100🪙\n\n和庄家比21点！\n\n下注："):("🃏 Blackjack\n\n💰100🪙\n\nBeat the dealer!\n\nBet:"),
{reply_markup:{inline_keyboard:[[{text:"5 🪙",callback_data:"game_bj_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_bj_bet_"+id+"_10"},{text:"25 🪙",callback_data:"game_bj_bet_"+id+"_25"}]]}});},
async handleCallback(ctx,action){
const p=action.split("_");const s=p[0];const id=p[1];const gg=g.get(id);if(!gg)return ctx.answerCbQuery("❌");const l=gg.lang;
if(s==="bet"){gg.bet=parseInt(p[2]);gg.ph=[Math.floor(Math.random()*13),Math.floor(Math.random()*13)];gg.dh=[Math.floor(Math.random()*13),Math.floor(Math.random()*13)];
gg.done=false;
await ctx.editMessageText(l==="zh"?("🃏 第"+gg.round+"局\n\n你："+hand(gg.ph)+"\n庄家："+C[gg.dh[0]]+" + ?\n\n要牌还是停牌？"):("🃏 Round "+gg.round+"\n\nYou: "+hand(gg.ph)+"\nDealer: "+C[gg.dh[0]]+" + ?\n\nHit or Stand?"),
{reply_markup:{inline_keyboard:[[{text:"➕ "+(l==="zh"?"要牌":"HIT"),callback_data:"game_bj_hit_"+id},{text:"⏸️ "+(l==="zh"?"停牌":"STAND"),callback_data:"game_bj_stand_"+id}]]}});
return ctx.answerCbQuery("🃏");}
if(s==="hit"){gg.ph.push(Math.floor(Math.random()*13));const ps=sum(gg.ph);
if(ps>21){gg.done=true;gg.coins-=gg.bet;
await ctx.editMessageText(l==="zh"?("💥 爆牌！\n\n你："+hand(gg.ph)+"\n庄家："+hand(gg.dh)+"\n\n😅 输了"+gg.bet+"🪙\n💰"+gg.coins+"🪙"):("💥 Bust!\n\nYou: "+hand(gg.ph)+"\nDealer: "+hand(gg.dh)+"\n\n😅 Lost "+gg.bet+"🪙\n💰"+gg.coins+"🪙"),
{reply_markup:{inline_keyboard:[[{text:"🃏 "+(l==="zh"?"继续":"CONTINUE"),callback_data:"game_bj_cont_"+id}]]}});
}else{await ctx.editMessageText(l==="zh"?("你："+hand(gg.ph)+"\n庄家："+C[gg.dh[0]]+" + ?\n\n继续要牌还是停牌？"):("You: "+hand(gg.ph)+"\nDealer: "+C[gg.dh[0]]+" + ?\n\nHit or Stand?"),
{reply_markup:{inline_keyboard:[[{text:"➕ "+(l==="zh"?"要牌":"HIT"),callback_data:"game_bj_hit_"+id},{text:"⏸️ "+(l==="zh"?"停牌":"STAND"),callback_data:"game_bj_stand_"+id}]]}});}
return ctx.answerCbQuery(ps<=21?"➕":"💥");}
if(s==="stand"){gg.done=true;while(sum(gg.dh)<17)gg.dh.push(Math.floor(Math.random()*13));
const ps=sum(gg.ph),ds=sum(gg.dh);let msgg="";
if(ds>21||ps>ds){msgg=l==="zh"?"🎉 你赢了！":"🎉 You win!";gg.coins+=gg.bet;}
else if(ps===ds){msgg=l==="zh"?"😐 平局":"😐 Push";}
else{msgg=l==="zh"?"😅 庄家赢了":"😅 Dealer wins";gg.coins-=gg.bet;}
await ctx.editMessageText(l==="zh"?("🃏 结果\n\n你："+hand(gg.ph)+"\n庄家："+hand(gg.dh)+"\n\n"+msgg+"\n\n💰"+gg.coins+"🪙"):("🃏 Result\n\nYou: "+hand(gg.ph)+"\nDealer: "+hand(gg.dh)+"\n\n"+msgg+"\n\n💰"+gg.coins+"🪙"),
{reply_markup:{inline_keyboard:[[{text:"🃏 "+(l==="zh"?"继续":"CONTINUE"),callback_data:"game_bj_cont_"+id}]]}});
return ctx.answerCbQuery(msgg.includes("🎉")?"🎉":"😅");}
if(s==="cont"){gg.round++;gg.bet=0;
await ctx.editMessageText(l==="zh"?("🃏 第"+gg.round+"局\n\n💰"+gg.coins+"🪙\n\n下注："):("🃏 Round "+gg.round+"\n\n💰"+gg.coins+"🪙\n\nBet:"),
{reply_markup:{inline_keyboard:[[{text:"5 🪙",callback_data:"game_bj_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_bj_bet_"+id+"_10"},{text:"25 🪙",callback_data:"game_bj_bet_"+id+"_25"}]]}});
return ctx.answerCbQuery("🃏");}
if(action==="new")return this.startPlay(ctx);ctx.answerCbQuery();}};