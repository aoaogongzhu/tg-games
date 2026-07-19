const fs = require("fs");
const dir = "C:\\Users\\19927\\tg-duel-game\\src\\games\\";
const SYMS = ["🍒","🍋","🔔","⭐","7️⃣","💎","👑"];
const PAY = {0:[2,3,3,5,5,10,15], 1:[5,10,15,25,50,100,200]};

// 🎰 Enhanced Slots
fs.writeFileSync(dir+"slots.js", `// 🎰 老虎机 - Enhanced
const{v4}=require("uuid");const gs=new Map();const S=${JSON.stringify(SYMS)};const P=${JSON.stringify(PAY)};
module.exports={id:"slots",name:"🎰 老虎机",
async startPlay(ctx){const l=(ctx.from?.language_code||"").startsWith("zh")?"zh":"en";const id=v4().slice(0,6);gs.set(id,{id,lang:l,coins:100});
await ctx.reply(l==="zh"?"🎰 老虎机\\n\\n💰 金币：100\\n\\n选择下注金额：":"🎰 Slot Machine\\n\\n💰 Coins: 100\\n\\nChoose your bet:",
{reply_markup:{inline_keyboard:[[{text:"1 🪙",callback_data:"game_slots_bet_"+id+"_1"},{text:"5 🪙",callback_data:"game_slots_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_slots_bet_"+id+"_10"}],[{text:"25 🪙",callback_data:"game_slots_bet_"+id+"_25"},{text:"50 🪙",callback_data:"game_slots_bet_"+id+"_50"}]]}});},
async handleCallback(ctx,action){
const p=action.split("_");const s=p[0];const id=p[1];const g=gs.get(id);
if(!g)return ctx.answerCbQuery("❌");const l=g.lang;
if(s==="bet"){const amt=parseInt(p[2]);g.bet=amt;
await ctx.editMessageText(l==="zh"?("🎰 老虎机\\n\\n💰 "+g.coins+" 金币\\n\\n下注："+amt+" 🪙\\n\\n点击拉杆！"):("🎰 Slot Machine\\n\\n💰 "+g.coins+" coins\\n\\nBet: "+amt+" 🪙\\n\\nPull the lever!"),
{reply_markup:{inline_keyboard:[[{text:"🎰 "+(l==="zh"?"拉杆！":"SPIN!"),callback_data:"game_slots_spin_"+id}]]}});
return ctx.answerCbQuery("🎰");}
if(s==="spin"){if(!g.bet)return ctx.answerCbQuery("❌");
const a=S[Math.floor(Math.random()*7)],b=S[Math.floor(Math.random()*7)],c=S[Math.floor(Math.random()*7)];
const idx=[a,b,c].map(x=>S.indexOf(x));let win=0,msg="";
if(a===b&&b===c){win=g.bet*P[1][idx[0]];msg=l==="zh"?("🎉🎉🎉 三个"+a+"！"):("🎉🎉🎉 Triple "+a+"!");}
else if(a===b||b===c||a===c){const m=idx.filter((v,i,ar)=>ar.indexOf(v)!==i)[0];win=g.bet*P[0][m];msg=l==="zh"?("🎉 两个"+S[m]+"！"):("🎉 Two "+S[m]+"!");}
else{msg=l==="zh"?"😅 没中":"😅 No luck";}
g.coins+=win-g.bet;
await ctx.editMessageText(l==="zh"?("🎰 老虎机\\n\\n║ "+a+" | "+b+" | "+c+" ║\\n\\n"+msg+"\\n"+(win>0?("+"+win+" 🪙"):("-"+g.bet+" 🪙"))+"\\n💰 "+g.coins+" 金币"):("🎰 Slot Machine\\n\\n║ "+a+" | "+b+" | "+c+" ║\\n\\n"+msg+"\\n"+(win>0?("+"+win+" 🪙"):("-"+g.bet+" 🪙"))+"\\n💰 "+g.coins+" coins"),
{reply_markup:{inline_keyboard:[[{text:"🎰 "+(l==="zh"?"继续赌":"PLAY ON"),callback_data:"game_slots_cont_"+id},{text:"💰 "+(l==="zh"?"兑换退出":"CASH OUT"),callback_data:"game_slots_cash_"+id}]]}});
g.bet=0;return ctx.answerCbQuery(win?"🎉":"😅");}
if(s==="cont"){await ctx.editMessageText(l==="zh"?("🎰 老虎机\\n\\n💰 "+g.coins+" 金币\\n\\n选择下注："):("🎰 Slot Machine\\n\\n💰 "+g.coins+" coins\\n\\nChoose bet:"),
{reply_markup:{inline_keyboard:[[{text:"1 🪙",callback_data:"game_slots_bet_"+id+"_1"},{text:"5 🪙",callback_data:"game_slots_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_slots_bet_"+id+"_10"}],[{text:"25 🪙",callback_data:"game_slots_bet_"+id+"_25"},{text:"50 🪙",callback_data:"game_slots_bet_"+id+"_50"}]]}});
return ctx.answerCbQuery("🎰");}
if(s==="cash"){await ctx.editMessageText(l==="zh"?("🎰 老虎机 - 结束\\n\\n💰 最终金币：**"+g.coins+"**\\n\\n"+(g.coins>100?"🎉 赚了 "+(g.coins-100)+" 金币！":g.coins<100?"😅 输了 "+(100-g.coins)+" 金币...":"😐 不赚不赔")):("🎰 Slot Machine - Done\\n\\n💰 Final coins: **"+g.coins+"**\\n\\n"+(g.coins>100?"🎉 Won "+(g.coins-100)+" coins!":g.coins<100?"😅 Lost "+(100-g.coins)+" coins...":"😐 Broke even")),
{reply_markup:{inline_keyboard:[[{text:"🎰 "+(l==="zh"?"再玩一次":"PLAY AGAIN"),callback_data:"game_slots_new"}]]}});
gs.delete(id);return ctx.answerCbQuery("💰");}
if(action==="new")return this.startPlay(ctx);
ctx.answerCbQuery();}};`, "utf-8");
console.log("slots: OK");

// 🎲 Enhanced High/Low
fs.writeFileSync(dir+"highlow.js", `// 🎲 猜大小 - Enhanced
const{v4}=require("uuid");const g=new Map();const D=["","⚀","⚁","⚂","⚃","⚄","⚅"];
module.exports={id:"highlow",name:"🎲 猜大小",
async startPlay(ctx){const l=(ctx.from?.language_code||"").startsWith("zh")?"zh":"en";const id=v4().slice(0,6);g.set(id,{id,lang:l,coins:100,round:1,bet:0,streak:0});
await ctx.reply(l==="zh"?("🎲 猜大小\\n\\n💰 金币："+100+"\\n5轮挑战！\\n\\n选择下注金额："):("🎲 High/Low\\n\\n💰 Coins: "+100+"\\n5 rounds!\\n\\nChoose bet:"),
{reply_markup:{inline_keyboard:[[{text:"5 🪙",callback_data:"game_highlow_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_highlow_bet_"+id+"_10"},{text:"25 🪙",callback_data:"game_highlow_bet_"+id+"_25"}]]}});},
async handleCallback(ctx,action){
const p=action.split("_");const s=p[0];const id=p[1];const gg=g.get(id);if(!gg)return ctx.answerCbQuery("❌");const l=gg.lang;
if(s==="bet"){gg.bet=parseInt(p[2]);gg.first=Math.floor(Math.random()*6)+1;
await ctx.editMessageText(l==="zh"?("🎲 第"+gg.round+"/5 轮\\n\\n💰 "+gg.coins+" 金币\\n🔥 连胜："+gg.streak+"\\n\\n当前点数："+D[gg.first]+" "+gg.first+"\\n\\n下一个会比"+gg.first+"高还是低？"):("🎲 Round "+gg.round+"/5\\n\\n💰 "+gg.coins+" coins\\n🔥 Streak: "+gg.streak+"\\n\\nCurrent: "+D[gg.first]+" "+gg.first+"\\n\\nHigher or Lower?"),
{reply_markup:{inline_keyboard:[[{text:"⬆️ "+(l==="zh"?"高":"HIGH"),callback_data:"game_highlow_guess_"+id+"_high"},{text:"⬇️ "+(l==="zh"?"低":"LOW"),callback_data:"game_highlow_guess_"+id+"_low"}]]}});
return ctx.answerCbQuery("🎲");}
if(s==="guess"){const bet=gg.bet;if(!bet)return ctx.answerCbQuery("❌");
const sec=Math.floor(Math.random()*6)+1;const win=(p[2]==="high"&&sec>gg.first)||(p[2]==="low"&&sec<gg.first);
const tie=sec===gg.first;let result="";
if(tie){result=l==="zh"?"🤝 平局！不加不减":"🤝 Tie! No change";}
else if(win){gg.streak++;const mult=gg.streak>=3?2:1;const winAmt=bet*mult;gg.coins+=winAmt;result=l==="zh"?("🎉 赢了 "+winAmt+" 🪙"+(mult>1?" (双倍！)":"")):("🎉 Won "+winAmt+" 🪙"+(mult>1?" (Double!)":""));}
else{gg.streak=0;gg.coins-=bet;result=l==="zh"?("😅 输了 "+bet+" 🪙"):("😅 Lost "+bet+" 🪙");}
gg.round++;gg.bet=0;
if(gg.round>5||gg.coins<=0){const final=l==="zh"?("🎲 猜大小 - 结束\\n\\n💰 最终金币："+gg.coins+"\\n\\n"+(gg.coins>100?"🎉 赚了 "+(gg.coins-100):gg.coins<100?"😅 输了 "+(100-gg.coins):"😐 不赚不赔")+" 🪙"):("🎲 High/Low - Done\\n\\n💰 Final coins: "+gg.coins+"\\n\\n"+(gg.coins>100?"🎉 Won "+(gg.coins-100):gg.coins<100?"😅 Lost "+(100-gg.coins):"😐 Broke even")+" 🪙");
await ctx.editMessageText(final,{reply_markup:{inline_keyboard:[[{text:"🎲 "+(l==="zh"?"再玩一次":"PLAY AGAIN"),callback_data:"game_highlow_new"}]]}});g.delete(id);
}else{const nf=Math.floor(Math.random()*6)+1;gg.first=nf;
await ctx.editMessageText(l==="zh"?("🎲 第"+gg.round+"/5 轮\\n\\n💰 "+gg.coins+" 金币\\n🔥 连胜："+gg.streak+"\\n\\n"+result+"\\n\\n当前点数："+D[nf]+" "+nf+"\\n\\n下一个会比"+nf+"高还是低？"):("🎲 Round "+gg.round+"/5\\n\\n💰 "+gg.coins+" coins\\n🔥 Streak: "+gg.streak+"\\n\\n"+result+"\\n\\nCurrent: "+D[nf]+" "+nf+"\\n\\nHigher or Lower?"),
{reply_markup:{inline_keyboard:[[{text:"⬆️ "+(l==="zh"?"高":"HIGH"),callback_data:"game_highlow_guess_"+id+"_high"},{text:"⬇️ "+(l==="zh"?"低":"LOW"),callback_data:"game_highlow_guess_"+id+"_low"}]]}});}
return ctx.answerCbQuery(win?"🎉":"😅");}
if(action==="new")return this.startPlay(ctx);ctx.answerCbQuery();}};`, "utf-8");
console.log("highlow: OK");

// 🃏 Enhanced Dragon Tiger
fs.writeFileSync(dir+"dragontiger.js", `// 🃏 龙虎斗 - Enhanced
const{v4}=require("uuid");const g=new Map();const C=["🂢","🂣","🂤","🂥","🂦","🂧","🂨","🂩","🂪","🂫","🂭","🂮","🂡"];const V=[2,3,4,5,6,7,8,9,10,11,12,13,14];
module.exports={id:"dragontiger",name:"🃏 龙虎斗",
async startPlay(ctx){const l=(ctx.from?.language_code||"").startsWith("zh")?"zh":"en";const id=v4().slice(0,6);g.set(id,{id,lang:l,coins:100,round:1,bet:0});
await ctx.reply(l==="zh"?("🃏 龙虎斗\\n\\n💰 金币：100\\n\\n押龙🐉 或 虎🐯，A最大！\\n\\n选择下注金额："):("🃏 Dragon Tiger\\n\\n💰 Coins: 100\\n\\nBet Dragon or Tiger! Ace highest!\\n\\nChoose bet:"),
{reply_markup:{inline_keyboard:[[{text:"5 🪙",callback_data:"game_dragontiger_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_dragontiger_bet_"+id+"_10"},{text:"25 🪙",callback_data:"game_dragontiger_bet_"+id+"_25"}]]}});},
async handleCallback(ctx,action){
const p=action.split("_");const s=p[0];const id=p[1];const gg=g.get(id);if(!gg)return ctx.answerCbQuery("❌");const l=gg.lang;
if(s==="bet"){gg.bet=parseInt(p[2]);
await ctx.editMessageText(l==="zh"?("🃏 第"+gg.round+"局\\n\\n💰 "+gg.coins+" 金币\\n\\n下注："+gg.bet+" 🪙\\n\\n押谁？"):("🃏 Round "+gg.round+"\\n\\n💰 "+gg.coins+" coins\\n\\nBet: "+gg.bet+" 🪙\\n\\nWho wins?"),
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
if(gg.round>10||gg.coins<=0){const final=l==="zh"?("🃏 龙虎斗 - 结束\\n\\n💰 最终："+gg.coins+" 🪙\\n\\n"+(gg.coins>100?"🎉 +"+(gg.coins-100):gg.coins<100?"😅 "+(gg.coins-100):"😐 0")+" 🪙"):("🃏 Dragon Tiger - Done\\n\\n💰 Final: "+gg.coins+" 🪙\\n\\n"+(gg.coins>100?"🎉 +"+(gg.coins-100):gg.coins<100?"😅 "+(gg.coins-100):"😐 0")+" 🪙");
await ctx.editMessageText(final,{reply_markup:{inline_keyboard:[[{text:"🃏 "+(l==="zh"?"再玩一次":"PLAY AGAIN"),callback_data:"game_dragontiger_new"}]]}});g.delete(id);
}else{await ctx.editMessageText(l==="zh"?("🃏 第"+gg.round+"局\\n\\n"+msg+"\\n\\n🐉 龙："+dc+"\\n🐯 虎："+tc+"\\n\\n💰 "+gg.coins+" 金币\\n\\n下注："):("🃏 Round "+gg.round+"\\n\\n"+msg+"\\n\\n🐉 Dragon: "+dc+"\\n🐯 Tiger: "+tc+"\\n\\n💰 "+gg.coins+" coins\\n\\nYour bet:"),
{reply_markup:{inline_keyboard:[[{text:"5 🪙",callback_data:"game_dragontiger_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_dragontiger_bet_"+id+"_10"},{text:"25 🪙",callback_data:"game_dragontiger_bet_"+id+"_25"}]]}});}
return ctx.answerCbQuery(win?"🎉":"😅");}
if(action==="new")return this.startPlay(ctx);ctx.answerCbQuery();}};`, "utf-8");
console.log("dragontiger: OK");

// Verify all 3
try{require(dir+"slots.js");console.log("slots LOADED")}catch(e){console.log("slots FAIL:"+e.message)}
try{require(dir+"highlow.js");console.log("highlow LOADED")}catch(e){console.log("highlow FAIL:"+e.message)}
try{require(dir+"dragontiger.js");console.log("dragontiger LOADED")}catch(e){console.log("dragontiger FAIL:"+e.message)}
