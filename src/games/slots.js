// ?? ???
const{v4}=require("uuid");const gs=new Map();const S=["??","??","??","7??","?","??"];
module.exports={id:"slots",name:"?? ???",async startPlay(ctx){
const l=(ctx.from?.language_code||"").startsWith("zh")?"zh":"en";const id=v4().slice(0,6);gs.set(id,{id,lang:l});
await ctx.reply(l==="zh"?"?? ???\n\n??????????????":"?? Slot Machine\n\nPull the lever! Match 3 to win!",{reply_markup:{inline_keyboard:[[{text:"?? "+(l==="zh"?"??":"SPIN"),callback_data:"game_slots_spin_"+id}]]}});},
async handleCallback(ctx,action){const id=action.slice(5);const g=gs.get(id);if(!g)return ctx.answerCbQuery("?");
const a=S[Math.floor(Math.random()*6)],b=S[Math.floor(Math.random()*6)],c=S[Math.floor(Math.random()*6)];
let msg=g.lang==="zh"?"?? ??":"?? No luck";
if(a===b&&b===c)msg=g.lang==="zh"?("?? ??"+a+"?????"):("?? Triple "+a+"! Jackpot!");
else if(a===b||b===c||a===c)msg=g.lang==="zh"?"?? ????????":"?? Two match! Win!";
await ctx.editMessageText((g.lang==="zh"?"?? ???\n\n? "+a+" | "+b+" | "+c+" ?\n\n"+msg:"?? Slot Machine\n\n? "+a+" | "+b+" | "+c+" ?\n\n"+msg),
{reply_markup:{inline_keyboard:[[{text:"?? "+(g.lang==="zh"?"????":"AGAIN"),callback_data:"game_slots_spin_"+id}]]}});
return ctx.answerCbQuery(msg.includes("??")?"??":"??");}};