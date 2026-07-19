// 🎲 骰宝 - Sic Bo
const{v4}=require("uuid");const g=new Map();const D=["","⚀","⚁","⚂","⚃","⚄","⚅"];
module.exports={id:"sicbo",name:"🎲 骰宝",
async startPlay(ctx){const l=(ctx.from?.language_code||"").startsWith("zh")?"zh":"en";const id=v4().slice(0,6);g.set(id,{id,lang:l,coins:100,round:1});
await ctx.reply(l==="zh"?("🎲 骰宝\n\n💰100金币\n\n3个骰子，猜大小或豹子！\n\n下注：5/10/25"):("🎲 Sic Bo\n\n💰100 coins\n\n3 dice! Big/Small/Triple!\n\nBet: 5/10/25"),
{reply_markup:{inline_keyboard:[[{text:"5 🪙",callback_data:"game_sicbo_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_sicbo_bet_"+id+"_10"},{text:"25 🪙",callback_data:"game_sicbo_bet_"+id+"_25"}]]}});},
async handleCallback(ctx,action){
const p=action.split("_");const s=p[0];const id=p[1];const gg=g.get(id);if(!gg)return ctx.answerCbQuery("❌");const l=gg.lang;
if(s==="bet"){gg.bet=parseInt(p[2]);
await ctx.editMessageText(l==="zh"?("🎲 第"+gg.round+"局\n\n💰"+gg.coins+"\n\n押什么？"):("🎲 Round "+gg.round+"\n\n💰"+gg.coins+"\n\nBet on?"),
{reply_markup:{inline_keyboard:[[{text:"⬆️ "+(l==="zh"?"大":"BIG"),callback_data:"game_sicbo_pick_"+id+"_big"},{text:"⬇️ "+(l==="zh"?"小":"SMALL"),callback_data:"game_sicbo_pick_"+id+"_small"},{text:"🎲 "+(l==="zh"?"豹子":"TRIPLE"),callback_data:"game_sicbo_pick_"+id+"_triple"}]]}});
return ctx.answerCbQuery("🎲");}
if(s==="pick"){const d1=Math.floor(Math.random()*6)+1,d2=Math.floor(Math.random()*6)+1,d3=Math.floor(Math.random()*6)+1;
const sum=d1+d2+d3;const isTriple=d1===d2&&d2===d3;const isBig=sum>=11&&!isTriple;const isSmall=sum<=10&&!isTriple;
let win=false,mult=0,msgg="";
if(p[2]==="triple"&&isTriple){win=true;mult=6;msgg=l==="zh"?"🎉 豹子！6倍！":"🎉 Triple! 6x!";}
else if(p[2]==="big"&&isBig){win=true;mult=1;msgg=l==="zh"?("🎉 大！"+sum+"点"):("🎉 Big! "+sum);}
else if(p[2]==="small"&&isSmall){win=true;mult=1;msgg=l==="zh"?("🎉 小！"+sum+"点"):("🎉 Small! "+sum);}
else if(isTriple)msgg=l==="zh"?("😅 开了豹子"+D[d1]+D[d2]+D[d3]):("😅 Triple "+D[d1]+D[d2]+D[d3]);
else msgg=l==="zh"?("😅 "+(isBig?"大":"小")+"了，"+sum+"点"):("😅 "+(isBig?"Big":"Small")+", "+sum);
const payout=win?gg.bet*mult:0;gg.coins+=payout-(win?gg.bet:gg.bet);
gg.round++;
if(gg.coins<=0){await ctx.editMessageText(l==="zh"?("🎲 破产了！\n\n💰最终：0🪙"):("🎲 Bankrupt!\n\n💰Final: 0🪙"),{reply_markup:{inline_keyboard:[[{text:"🎲 "+(l==="zh"?"再来":"PLAY AGAIN"),callback_data:"game_sicbo_new"}]]}});g.delete(id);}
else{await ctx.editMessageText(l==="zh"?("🎲 骰宝\n\n"+D[d1]+D[d2]+D[d3]+" = "+sum+"\n"+msgg+"\n"+(win?"+"+payout+"🪙":"-"+gg.bet+"🪙")+"\n💰"+gg.coins+"🪙\n\n继续？"):("🎲 Sic Bo\n\n"+D[d1]+D[d2]+D[d3]+" = "+sum+"\n"+msgg+"\n"+(win?"+"+payout+"🪙":"-"+gg.bet+"🪙")+"\n💰"+gg.coins+"🪙\n\nContinue?"),
{reply_markup:{inline_keyboard:[[{text:"🎲 "+(l==="zh"?"继续":"CONTINUE"),callback_data:"game_sicbo_cont_"+id},{text:"💰 "+(l==="zh"?"兑换":"CASH OUT"),callback_data:"game_sicbo_cash_"+id}]]}});}
return ctx.answerCbQuery(win?"🎉":"😅");}
if(s==="cont"){await ctx.editMessageText(l==="zh"?("🎲 第"+gg.round+"局\n\n💰"+gg.coins+"🪙\n\n下注："):("🎲 Round "+gg.round+"\n\n💰"+gg.coins+"🪙\n\nBet:"),
{reply_markup:{inline_keyboard:[[{text:"5 🪙",callback_data:"game_sicbo_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_sicbo_bet_"+id+"_10"},{text:"25 🪙",callback_data:"game_sicbo_bet_"+id+"_25"}]]}});
return ctx.answerCbQuery("🎲");}
if(s==="cash"){const final=gg.coins;await ctx.editMessageText(l==="zh"?("🎲 骰宝 - 结束\n\n💰 最终："+final+"🪙\n\n"+(final>100?"🎉+"+(final-100):final<100?"😅"+(final-100):"😐0")):("🎲 Sic Bo - Done\n\n💰Final: "+final+"🪙\n\n"+(final>100?"🎉+"+(final-100):final<100?"😅"+(final-100):"😐0")),{reply_markup:{inline_keyboard:[[{text:"🎲 "+(l==="zh"?"再来":"PLAY AGAIN"),callback_data:"game_sicbo_new"}]]}});g.delete(id);return ctx.answerCbQuery("💰");}
if(action==="new")return this.startPlay(ctx);ctx.answerCbQuery();}};