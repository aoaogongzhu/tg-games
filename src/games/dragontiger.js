// 🃏 龙虎斗 - Enhanced
const{v4}=require("uuid");const g=new Map();const C=["🂢","🂣","🂤","🂥","🂦","🂧","🂨","🂩","🂪","🂫","🂭","🂮","🂡"];const V=[2,3,4,5,6,7,8,9,10,11,12,13,14];
module.exports={id:"dragontiger",name:"🃏 龙虎斗",
async startPlay(ctx){const l=(ctx.from?.language_code||"").startsWith("zh")?"zh":"en";const id=v4().slice(0,6);g.set(id,{id,lang:l,coins:100,round:1,bet:0});
await ctx.reply(l==="zh"?("🃏 龙虎斗\n\n💰 金币：100\n\n押龙🐉 或 虎🐯，A最大！\n\n选择下注金额："):("🃏 Dragon Tiger\n\n💰 Coins: 100\n\nBet Dragon or Tiger! Ace highest!\n\nChoose bet:"),
{reply_markup:{inline_keyboard:[[{text:"5 🪙",callback_data:"game_dragontiger_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_dragontiger_bet_"+id+"_10"},{text:"25 🪙",callback_data:"game_dragontiger_bet_"+id+"_25"}]]}});},
async handleCallback(ctx,action){
const p=action.split("_");const s=p[0];const id=p[1];const gg=g.get(id);if(!gg)return ctx.answerCbQuery("❌");const l=gg.lang;
if(s==="bet"){gg.bet=parseInt(p[2]);
await ctx.editMessageText(l==="zh"?("🃏 第"+gg.round+"局\n\n💰 "+gg.coins+" 金币\n\n下注："+gg.bet+" 🪙\n\n押谁？"):("🃏 Round "+gg.round+"\n\n💰 "+gg.coins+" coins\n\nBet: "+gg.bet+" 🪙\n\nWho wins?"),
{reply_markup:{inline_keyboard:[[{text:"🐉 "+(l==="zh"?"龙":"DRAGON"),callback_data:"game_dragontiger_pick_"+id+"_dragon"},{text:"🐯 "+(l==="zh"?"虎":"TIGER"),callback_data:"game_dragontiger_pick_"+id+"_tiger"},{text:"🤝 "+(l==="zh"?"和":"TIE"),callback_data:"game_dragontiger_pick_"+id+"_tie"}]]}});
return ctx.answerCbQuery("🃏");}
if(s==="pick"){const bet=gg.bet;if(!bet)return ctx.answerCbQuery("❌");
const dc=C[Math.floor(Math.random()*13)],tc=C[Math.floor(Math.random()*13)];const dv=V[C.indexOf(dc)],tv=V[C.indexOf(tc)];
let winner="tie";if(dv>tv)winner="dragon";else if(tv>dv)winner="tiger";
const win=p[2]===winner;let payout=0,msg="";
if(winner==="tie"&&p[2]==="tie"){payout=bet*8;gg.coins+=payout;msg=l==="zh"?("🤝 和局！赢 "+payout+" 🪙 (8倍！)"):("🤝 Tie! Win "+payout+" 🪙 (8x!)");}
else if(win){payout=bet*2;gg.coins+=payout;msg=l==="zh"?("🎉 赢了！+"+payout+" 🪙"):("🎉 Win! +"+payout+" 🪙");}
else{gg.coins-=bet;msg=l==="zh"?("😅 输了 "+bet+" 🪙"):("😅 Lost "+bet+" 🪙");}
gg.round++;gg.bet=0;
if(gg.round>10||gg.coins<=0){const final=l==="zh"?("🃏 龙虎斗 - 结束\n\n💰 最终："+gg.coins+" 🪙\n\n"+(gg.coins>100?"🎉 +"+(gg.coins-100):gg.coins<100?"😅 "+(gg.coins-100):"😐 0")+" 🪙"):("🃏 Dragon Tiger - Done\n\n💰 Final: "+gg.coins+" 🪙\n\n"+(gg.coins>100?"🎉 +"+(gg.coins-100):gg.coins<100?"😅 "+(gg.coins-100):"😐 0")+" 🪙");
await ctx.editMessageText(final,{reply_markup:{inline_keyboard:[[{text:"🃏 "+(l==="zh"?"再玩一次":"PLAY AGAIN"),callback_data:"game_dragontiger_new"}]]}});g.delete(id);
}else{await ctx.editMessageText(l==="zh"?("🃏 第"+gg.round+"局\n\n"+msg+"\n\n🐉 龙："+dc+"\n🐯 虎："+tc+"\n\n💰 "+gg.coins+" 金币\n\n下注："):("🃏 Round "+gg.round+"\n\n"+msg+"\n\n🐉 Dragon: "+dc+"\n🐯 Tiger: "+tc+"\n\n💰 "+gg.coins+" coins\n\nYour bet:"),
{reply_markup:{inline_keyboard:[[{text:"5 🪙",callback_data:"game_dragontiger_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_dragontiger_bet_"+id+"_10"},{text:"25 🪙",callback_data:"game_dragontiger_bet_"+id+"_25"}]]}});}
return ctx.answerCbQuery(win?"🎉":"😅");}
if(action==="new")return this.startPlay(ctx);ctx.answerCbQuery();}};