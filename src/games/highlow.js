// 🎲 猜大小
const{v4}=require("uuid");const g=new Map();const D=["","⚀","⚁","⚂","⚃","⚄","⚅"];
module.exports={id:"highlow",name:"🎲 猜大小",async startPlay(ctx){
const l=(ctx.from?.language_code||"").startsWith("zh")?"zh":"en";const id=v4().slice(0,6);
const f=Math.floor(Math.random()*6)+1;g.set(id,{id,lang:l,first:f});
await ctx.reply(l==="zh"?("🎲 猜大小\n\n当前："+D[f]+" "+f+"\n\n下一个会比"+f+"高还是低？"):("🎲 High/Low\n\nCurrent: "+D[f]+" "+f+"\n\nHigher or Lower?"),
{reply_markup:{inline_keyboard:[[{text:"⬆️ "+(l==="zh"?"高":"HIGH"),callback_data:"game_highlow_bet_"+id+"_high"},{text:"⬇️ "+(l==="zh"?"低":"LOW"),callback_data:"game_highlow_bet_"+id+"_low"}]]}});},
async handleCallback(ctx,action){
const p=action.split("_");const id=p[0];const bet=p[1];const gg=g.get(id);if(!gg)return ctx.answerCbQuery("❌");
const sec=Math.floor(Math.random()*6)+1;const win=(bet==="high"&&sec>gg.first)||(bet==="low"&&sec<gg.first);
const tie=sec===gg.first;let msg;
if(gg.lang==="zh"){if(tie)msg="🎲 平局！都是"+gg.first;else if(win)msg="🎉 你赢了！"+gg.first+" → "+sec;else msg="😅 你输了！"+gg.first+" → "+sec;
}else{if(tie)msg="🎲 Tie! Both "+gg.first;else if(win)msg="🎉 You win! "+gg.first+" → "+sec;else msg="😅 You lose! "+gg.first+" → "+sec;}
await ctx.editMessageText(msg,{reply_markup:{inline_keyboard:[[{text:"🎲 "+(gg.lang==="zh"?"再来一局":"PLAY AGAIN"),callback_data:"game_highlow_new"}]]}});
g.delete(id);return ctx.answerCbQuery(win?"🎉":"😅");}};