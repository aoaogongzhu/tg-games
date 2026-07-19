// 🃏 龙虎斗
const{v4}=require("uuid");const g=new Map();
const C=["🂡","🂢","🂣","🂤","🂥","🂦","🂧","🂨","🂩","🂪","🂫","🂭","🂮"];const V=[14,2,3,4,5,6,7,8,9,10,11,12,13];
module.exports={id:"dragontiger",name:"🃏 龙虎斗",async startPlay(ctx){
const l=(ctx.from?.language_code||"").startsWith("zh")?"zh":"en";const id=v4().slice(0,6);g.set(id,{id,lang:l});
await ctx.reply(l==="zh"?"🃏 龙虎斗\n\n押龙还是虎？":"🃏 Dragon Tiger\n\nBet on Dragon or Tiger?",
{reply_markup:{inline_keyboard:[[{text:"🐉 "+(l==="zh"?"龙":"DRAGON"),callback_data:"game_dragontiger_bet_"+id+"_dragon"},{text:"🐯 "+(l==="zh"?"虎":"TIGER"),callback_data:"game_dragontiger_bet_"+id+"_tiger"}]]}});},
async handleCallback(ctx,action){
const p=action.split("_");const id=p[0];const bet=p[1];const gg=g.get(id);if(!gg)return ctx.answerCbQuery("❌");
const dc=C[Math.floor(Math.random()*13)],tc=C[Math.floor(Math.random()*13)];const dv=V[C.indexOf(dc)],tv=V[C.indexOf(tc)];
let winner="tie";if(dv>tv)winner="dragon";else if(tv>dv)winner="tiger";
const win=(bet===winner);let msg;
if(gg.lang==="zh"){msg="🃏 龙虎斗\n\n🐉 龙："+dc+"\n🐯 虎："+tc+"\n\n";if(winner==="tie")msg+="🤝 平局！";else if(win)msg+="🎉 你赢了！";else msg+="😅 你输了！";
}else{msg="🃏 Dragon Tiger\n\n🐉 Dragon: "+dc+"\n🐯 Tiger: "+tc+"\n\n";if(winner==="tie")msg+="🤝 Tie!";else if(win)msg+="🎉 You win!";else msg+="😅 You lose!";}
await ctx.editMessageText(msg,{reply_markup:{inline_keyboard:[[{text:"🃏 "+(gg.lang==="zh"?"再来一局":"PLAY AGAIN"),callback_data:"game_dragontiger_new"}]]}});
g.delete(id);return ctx.answerCbQuery(win?"🎉":"😅");}};