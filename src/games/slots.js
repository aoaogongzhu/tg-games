// 🎰 老虎机 - Enhanced
const{v4}=require("uuid");const gs=new Map();const S=["🍒","🍋","🔔","⭐","7️⃣","💎","👑"];const P={"0":[2,3,3,5,5,10,15],"1":[5,10,15,25,50,100,200]};
module.exports={id:"slots",name:"🎰 老虎机",
async startPlay(ctx){const l=(ctx.from?.language_code||"").startsWith("zh")?"zh":"en";const id=v4().slice(0,6);gs.set(id,{id,lang:l,coins:100});
await ctx.reply(l==="zh"?"🎰 老虎机\n\n💰 金币：100\n\n选择下注金额：":"🎰 Slot Machine\n\n💰 Coins: 100\n\nChoose your bet:",
{reply_markup:{inline_keyboard:[[{text:"1 🪙",callback_data:"game_slots_bet_"+id+"_1"},{text:"5 🪙",callback_data:"game_slots_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_slots_bet_"+id+"_10"}],[{text:"25 🪙",callback_data:"game_slots_bet_"+id+"_25"},{text:"50 🪙",callback_data:"game_slots_bet_"+id+"_50"}]]}});},
async handleCallback(ctx,action){
const p=action.split("_");const s=p[0];const id=p[1];const g=gs.get(id);
if(!g)return ctx.answerCbQuery("❌");const l=g.lang;
if(s==="bet"){const amt=parseInt(p[2]);g.bet=amt;
await ctx.editMessageText(l==="zh"?("🎰 老虎机\n\n💰 "+g.coins+" 金币\n\n下注："+amt+" 🪙\n\n点击拉杆！"):("🎰 Slot Machine\n\n💰 "+g.coins+" coins\n\nBet: "+amt+" 🪙\n\nPull the lever!"),
{reply_markup:{inline_keyboard:[[{text:"🎰 "+(l==="zh"?"拉杆！":"SPIN!"),callback_data:"game_slots_spin_"+id}]]}});
return ctx.answerCbQuery("🎰");}
if(s==="spin"){if(!g.bet)return ctx.answerCbQuery("❌");
const a=S[Math.floor(Math.random()*7)],b=S[Math.floor(Math.random()*7)],c=S[Math.floor(Math.random()*7)];
const idx=[a,b,c].map(x=>S.indexOf(x));let win=0,msg="";
if(a===b&&b===c){win=g.bet*P[1][idx[0]];msg=l==="zh"?("🎉🎉🎉 三个"+a+"！"):("🎉🎉🎉 Triple "+a+"!");}
else if(a===b||b===c||a===c){const m=idx.filter((v,i,ar)=>ar.indexOf(v)!==i)[0];win=g.bet*P[0][m];msg=l==="zh"?("🎉 两个"+S[m]+"！"):("🎉 Two "+S[m]+"!");}
else{msg=l==="zh"?"😅 没中":"😅 No luck";}
g.coins+=win-g.bet;
await ctx.editMessageText(l==="zh"?("🎰 老虎机\n\n║ "+a+" | "+b+" | "+c+" ║\n\n"+msg+"\n"+(win>0?("+"+win+" 🪙"):("-"+g.bet+" 🪙"))+"\n💰 "+g.coins+" 金币"):("🎰 Slot Machine\n\n║ "+a+" | "+b+" | "+c+" ║\n\n"+msg+"\n"+(win>0?("+"+win+" 🪙"):("-"+g.bet+" 🪙"))+"\n💰 "+g.coins+" coins"),
{reply_markup:{inline_keyboard:[[{text:"🎰 "+(l==="zh"?"继续赌":"PLAY ON"),callback_data:"game_slots_cont_"+id},{text:"💰 "+(l==="zh"?"兑换退出":"CASH OUT"),callback_data:"game_slots_cash_"+id}]]}});
g.bet=0;return ctx.answerCbQuery(win?"🎉":"😅");}
if(s==="cont"){await ctx.editMessageText(l==="zh"?("🎰 老虎机\n\n💰 "+g.coins+" 金币\n\n选择下注："):("🎰 Slot Machine\n\n💰 "+g.coins+" coins\n\nChoose bet:"),
{reply_markup:{inline_keyboard:[[{text:"1 🪙",callback_data:"game_slots_bet_"+id+"_1"},{text:"5 🪙",callback_data:"game_slots_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_slots_bet_"+id+"_10"}],[{text:"25 🪙",callback_data:"game_slots_bet_"+id+"_25"},{text:"50 🪙",callback_data:"game_slots_bet_"+id+"_50"}]]}});
return ctx.answerCbQuery("🎰");}
if(s==="cash"){await ctx.editMessageText(l==="zh"?("🎰 老虎机 - 结束\n\n💰 最终金币：**"+g.coins+"**\n\n"+(g.coins>100?"🎉 赚了 "+(g.coins-100)+" 金币！":g.coins<100?"😅 输了 "+(100-g.coins)+" 金币...":"😐 不赚不赔")):("🎰 Slot Machine - Done\n\n💰 Final coins: **"+g.coins+"**\n\n"+(g.coins>100?"🎉 Won "+(g.coins-100)+" coins!":g.coins<100?"😅 Lost "+(100-g.coins)+" coins...":"😐 Broke even")),
{reply_markup:{inline_keyboard:[[{text:"🎰 "+(l==="zh"?"再玩一次":"PLAY AGAIN"),callback_data:"game_slots_new"}]]}});
gs.delete(id);return ctx.answerCbQuery("💰");}
if(action==="new")return this.startPlay(ctx);
ctx.answerCbQuery();}};