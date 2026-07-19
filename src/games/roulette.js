// 🎯 轮盘 - Roulette
const{v4}=require("uuid");const g=new Map();
const NUMS=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const REDS=[32,19,21,25,34,27,36,30,23,5,16,1,14,9,18,7,12,3];
module.exports={id:"roulette",name:"🎯 轮盘",
async startPlay(ctx){const l=(ctx.from?.language_code||"").startsWith("zh")?"zh":"en";const id=v4().slice(0,6);g.set(id,{id,lang:l,coins:100,round:1});
await ctx.reply(l==="zh"?("🎯 轮盘\n\n💰100🪙\n\n猜转盘停在哪里！\n\n下注："):("🎯 Roulette\n\n💰100🪙\n\nWhere will the ball land?\n\nBet:"),
{reply_markup:{inline_keyboard:[[{text:"5 🪙",callback_data:"game_roulette_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_roulette_bet_"+id+"_10"},{text:"25 🪙",callback_data:"game_roulette_bet_"+id+"_25"}]]}});},
async handleCallback(ctx,action){
const p=action.split("_");const s=p[0];const id=p[1];const gg=g.get(id);if(!gg)return ctx.answerCbQuery("❌");const l=gg.lang;
if(s==="bet"){gg.bet=parseInt(p[2]);
await ctx.editMessageText(l==="zh"?("🎯 第"+gg.round+"局\n\n💰"+gg.coins+"🪙\n\n押什么？"):("🎯 Round "+gg.round+"\n\n💰"+gg.coins+"🪙\n\nBet on?"),
{reply_markup:{inline_keyboard:[[{text:"🔴 "+(l==="zh"?"红":"RED"),callback_data:"game_roulette_pick_"+id+"_red"},{text:"⚫ "+(l==="zh"?"黑":"BLACK"),callback_data:"game_roulette_pick_"+id+"_black"}],[{text:"⬆️ "+(l==="zh"?"大(19-36)":"HIGH"),callback_data:"game_roulette_pick_"+id+"_high"},{text:"⬇️ "+(l==="zh"?"小(1-18)":"LOW"),callback_data:"game_roulette_pick_"+id+"_low"}]]}});
return ctx.answerCbQuery("🎯");}
if(s==="pick"){const result=NUMS[Math.floor(Math.random()*37)];const isRed=REDS.includes(result);const isBlack=!isRed&&result!==0;
let win=false,msgg="",mult=0;
if(p[2]==="red"&&isRed){win=true;mult=1;msgg=l==="zh"?"🔴 红色！":"🔴 Red!";}
else if(p[2]==="black"&&isBlack){win=true;mult=1;msgg=l==="zh"?"⚫ 黑色！":"⚫ Black!";}
else if(p[2]==="high"&&result>=19){win=true;mult=1;msgg=l==="zh"?("⬆️ 大！"+result):("⬆️ High! "+result);}
else if(p[2]==="low"&&result>=1&&result<=18){win=true;mult=1;msgg=l==="zh"?("⬇️ 小！"+result):("⬇️ Low! "+result);}
else msgg=l==="zh"?("😅 出"+result+(result===0?"":"号")):("😅 "+result);
const payout=win?gg.bet*mult:0;gg.coins+=payout-(win?0:gg.bet);
gg.round++;
if(gg.coins<=0){await ctx.editMessageText(l==="zh"?("🎯 破产！\n\n💰0🪙"):("🎯 Broke!\n\n💰0🪙"),{reply_markup:{inline_keyboard:[[{text:"🎯 "+(l==="zh"?"再来":"PLAY AGAIN"),callback_data:"game_roulette_new"}]]}});g.delete(id);}
else{await ctx.editMessageText(l==="zh"?("🎯 轮盘\n\n🎱 **"+result+"** "+(isRed?"🔴":result===0?"🟢":"⚫")+"\n"+msgg+"\n"+(win?"+"+payout+"🪙":"-"+gg.bet+"🪙")+"\n💰"+gg.coins+"🪙"):("🎯 Roulette\n\n🎱 **"+result+"** "+(isRed?"🔴":result===0?"🟢":"⚫")+"\n"+msgg+"\n"+(win?"+"+payout+"🪙":"-"+gg.bet+"🪙")+"\n💰"+gg.coins+"🪙"),
{reply_markup:{inline_keyboard:[[{text:"🎯 "+(l==="zh"?"继续":"CONTINUE"),callback_data:"game_roulette_cont_"+id},{text:"💰 "+(l==="zh"?"兑换":"CASH OUT"),callback_data:"game_roulette_cash_"+id}]]}});}
return ctx.answerCbQuery(win?"🎉":"😅");}
if(s==="cont"){await ctx.editMessageText(l==="zh"?("🎯 第"+gg.round+"局\n\n💰"+gg.coins+"🪙\n\n下注："):("🎯 Round "+gg.round+"\n\n💰"+gg.coins+"🪙\n\nBet:"),
{reply_markup:{inline_keyboard:[[{text:"5 🪙",callback_data:"game_roulette_bet_"+id+"_5"},{text:"10 🪙",callback_data:"game_roulette_bet_"+id+"_10"},{text:"25 🪙",callback_data:"game_roulette_bet_"+id+"_25"}]]}});
return ctx.answerCbQuery("🎯");}
if(s==="cash"){await ctx.editMessageText(l==="zh"?("🎯 轮盘 - 结束\n\n💰最终："+gg.coins+"🪙"):("🎯 Roulette - Done\n\n💰Final: "+gg.coins+"🪙"),{reply_markup:{inline_keyboard:[[{text:"🎯 "+(l==="zh"?"再来":"PLAY AGAIN"),callback_data:"game_roulette_new"}]]}});g.delete(id);return ctx.answerCbQuery("💰");}
if(action==="new")return this.startPlay(ctx);ctx.answerCbQuery();}};