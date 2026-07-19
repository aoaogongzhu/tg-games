// 🎲 猜大小 - Enhanced
const{v4}=require("uuid");const g=new Map();const D=["","⚀","⚁","⚂","⚃","⚄","⚅"];
module.exports={id:"highlow",name:"🎲 猜大小",
async startPlay(ctx){const l=(ctx.from?.language_code||"").startsWith("zh")?"zh":"en";const id=v4().slice(0,6);g.set(id,{id,lang:l,coins:100,round:1,bet:0,streak:0});
await ctx.reply(l==="zh"?("🎲 猜大小\n\n💰 金币："+100+"\n5轮挑战！\n\n选择下注金额："):("🎲 High/Low\n\n💰 Coins: "+100+"\n5 rounds!\n\nChoose bet:"),
{reply_markup:{inline_keyboard:[[{text:"5 🪙",callback_data:"game_highlow_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_highlow_bet_"+id+"_10"},{text:"25 🪙",callback_data:"game_highlow_bet_"+id+"_25"}]]}});},
async handleCallback(ctx,action){
const p=action.split("_");const s=p[0];const id=p[1];const gg=g.get(id);if(!gg)return ctx.answerCbQuery("❌");const l=gg.lang;
if(s==="bet"){gg.bet=parseInt(p[2]);gg.first=Math.floor(Math.random()*6)+1;
await ctx.editMessageText(l==="zh"?("🎲 第"+gg.round+"/5 轮\n\n💰 "+gg.coins+" 金币\n🔥 连胜："+gg.streak+"\n\n当前点数："+D[gg.first]+" "+gg.first+"\n\n下一个会比"+gg.first+"高还是低？"):("🎲 Round "+gg.round+"/5\n\n💰 "+gg.coins+" coins\n🔥 Streak: "+gg.streak+"\n\nCurrent: "+D[gg.first]+" "+gg.first+"\n\nHigher or Lower?"),
{reply_markup:{inline_keyboard:[[{text:"⬆️ "+(l==="zh"?"高":"HIGH"),callback_data:"game_highlow_guess_"+id+"_high"},{text:"⬇️ "+(l==="zh"?"低":"LOW"),callback_data:"game_highlow_guess_"+id+"_low"}]]}});
return ctx.answerCbQuery("🎲");}
if(s==="guess"){const bet=gg.bet;if(!bet)return ctx.answerCbQuery("❌");
const sec=Math.floor(Math.random()*6)+1;const win=(p[2]==="high"&&sec>gg.first)||(p[2]==="low"&&sec<gg.first);
const tie=sec===gg.first;let result="";
if(tie){result=l==="zh"?"🤝 平局！不加不减":"🤝 Tie! No change";}
else if(win){gg.streak++;const mult=gg.streak>=3?2:1;const winAmt=bet*mult;gg.coins+=winAmt;result=l==="zh"?("🎉 赢了 "+winAmt+" 🪙"+(mult>1?" (双倍！)":"")):("🎉 Won "+winAmt+" 🪙"+(mult>1?" (Double!)":""));}
else{gg.streak=0;gg.coins-=bet;result=l==="zh"?("😅 输了 "+bet+" 🪙"):("😅 Lost "+bet+" 🪙");}
gg.round++;gg.bet=0;
if(gg.round>5||gg.coins<=0){const final=l==="zh"?("🎲 猜大小 - 结束\n\n💰 最终金币："+gg.coins+"\n\n"+(gg.coins>100?"🎉 赚了 "+(gg.coins-100):gg.coins<100?"😅 输了 "+(100-gg.coins):"😐 不赚不赔")+" 🪙"):("🎲 High/Low - Done\n\n💰 Final coins: "+gg.coins+"\n\n"+(gg.coins>100?"🎉 Won "+(gg.coins-100):gg.coins<100?"😅 Lost "+(100-gg.coins):"😐 Broke even")+" 🪙");
await ctx.editMessageText(final,{reply_markup:{inline_keyboard:[[{text:"🎲 "+(l==="zh"?"再玩一次":"PLAY AGAIN"),callback_data:"game_highlow_new"}]]}});g.delete(id);
}else{const nf=Math.floor(Math.random()*6)+1;gg.first=nf;
await ctx.editMessageText(l==="zh"?("🎲 第"+gg.round+"/5 轮\n\n💰 "+gg.coins+" 金币\n🔥 连胜："+gg.streak+"\n\n"+result+"\n\n当前点数："+D[nf]+" "+nf+"\n\n下一个会比"+nf+"高还是低？"):("🎲 Round "+gg.round+"/5\n\n💰 "+gg.coins+" coins\n🔥 Streak: "+gg.streak+"\n\n"+result+"\n\nCurrent: "+D[nf]+" "+nf+"\n\nHigher or Lower?"),
{reply_markup:{inline_keyboard:[[{text:"⬆️ "+(l==="zh"?"高":"HIGH"),callback_data:"game_highlow_guess_"+id+"_high"},{text:"⬇️ "+(l==="zh"?"低":"LOW"),callback_data:"game_highlow_guess_"+id+"_low"}]]}});}
return ctx.answerCbQuery(win?"🎉":"😅");}
if(action==="new")return this.startPlay(ctx);ctx.answerCbQuery();}};