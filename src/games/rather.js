// 🤔 你选哪个 - Would You Rather
const { v4 } = require("uuid"); const games = new Map();
const QUESTIONS = JSON.parse('[{"zh":{"q":"不能吃最喜欢的东西","a":"失去味觉"},"en":{"q":"Never eat favorite food","a":"Lose taste"}},{"zh":{"q":"能飞但不能降落","a":"能瞬移但只能去厕所"},"en":{"q":"Fly but can\u0027t land","a":"Teleport to toilets"}},{"zh":{"q":"永远年轻但没钱","a":"永远有钱但很老"},"en":{"q":"Young forever poor","a":"Rich forever old"}},{"zh":{"q":"能听懂动物","a":"能说所有语言"},"en":{"q":"Understand animals","a":"Speak languages"}},{"zh":{"q":"一天48小时","a":"一周3天"},"en":{"q":"48-hour days","a":"3-day weeks"}},{"zh":{"q":"能隐身但无法说话","a":"能读心但必须诚实"},"en":{"q":"Invisible but mute","a":"Read minds but honest"}},{"zh":{"q":"永远无法说谎","a":"永远无法说实话"},"en":{"q":"Never lie","a":"Never tell truth"}},{"zh":{"q":"住在海边","a":"住在山顶"},"en":{"q":"Live by beach","a":"Live on mountain"}},{"zh":{"q":"永远不会饿","a":"永远不会累"},"en":{"q":"Never hungry","a":"Never tired"}},{"zh":{"q":"会所有乐器","a":"会所有运动"},"en":{"q":"Master instruments","a":"Master sports"}}]');
module.exports = {
  id:"rather",name:"\uD83E\uDD14 \u4F60\u9009\u54EA\u4E2A",
  async startPlay(ctx){
    const lang=(ctx.from?.language_code||"").startsWith("zh")?"zh":"en";
    if(ctx.chat.id>0)return ctx.reply(lang==="zh"?"\uD83E\uDD14 *\u4F60\u9009\u54EA\u4E2A*\n\n\u628ABot\u62C9\u8FDB\u7FA4\u548C\u670B\u53CB\u4E00\u8D77\u73A9\uFF01":"\uD83E\uDD14 *Would You Rather*\n\nAdd bot to a group to play!",{parse_mode:"Markdown"});
    const id=v4().slice(0,6);
    const q=QUESTIONS[Math.floor(Math.random()*QUESTIONS.length)];
    const qd=lang==="zh"?q.zh:q.en;
    games.set(id,{id,chatId:ctx.chat.id,players:[],status:"playing",lang,q,qd,votes:{}});
    await ctx.reply(lang==="zh"?("\uD83E\uDD14 *\u4F60\u9009\u54EA\u4E2A*\n\n"+qd.q+"\n\u2753 **\u8FD8\u662F**\n"+qd.a+"\n\n\u70B9\u51FB\u6309\u94AE\u6295\u7968\uFF01"):("\uD83E\uDD14 *Would You Rather*\n\n"+qd.q+"\n\u2753 **OR**\n"+qd.a+"\n\nTap to vote!"),{parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:(TA+" "+(lang==="zh"?"\u9009A":"Pick A")),callback_data:("game_rather_vote_"+id+"_a")},{text:(TB+" "+(lang==="zh"?"\u9009B":"Pick B")),callback_data:("game_rather_vote_"+id+"_b")}],[{text:"\uD83D\uDCCA "+(lang==="zh"?"\u770B\u7ED3\u679C":"Results"),callback_data:("game_rather_result_"+id)}]]}});
  },
  async handleCallback(ctx,action){
    const p=action.split("_");const s=p[0];const rest=p.slice(1).join("_");const un=ctx.from.username||ctx.from.first_name||"Player";
    if(s==="vote"){const gid=rest.split("_")[0];const ch=rest.split("_")[1];const g=games.get(gid);if(!g)return ctx.answerCbQuery("\u274C");g.votes[un]={id:ctx.from.id,choice:ch};return ctx.answerCbQuery(g.lang==="zh"?("\u4F60\u9009\u4E86"+(ch==="a"?"A":"B")):("You picked "+(ch==="a"?"A":"B")));}
    if(s==="result"){const g=games.get(rest);if(!g)return ctx.answerCbQuery("\u274C");const aV=Object.values(g.votes).filter(v=>v.choice==="a").length;const bV=Object.values(g.votes).filter(v=>v.choice==="b").length;await ctx.editMessageText(g.lang==="zh"?("\uD83E\uDD14 *\u6295\u7968\u7ED3\u679C*\n\n"+g.qd.q+"\n\u2753 "+g.qd.a+"\n\n"+TA+" "+aV+"\u7968\n"+TB+" "+bV+"\u7968"):("\uD83E\uDD14 *Results*\n\n"+g.qd.q+"\n\u2753 "+g.qd.a+"\n\n"+TA+" "+aV+"\n"+TB+" "+bV),{parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"\uD83D\uDD04 "+(g.lang==="zh"?"\u4E0B\u4E00\u9898":"Next"),callback_data:"game_rather_new"}]]}});return ctx.answerCbQuery("\uD83D\uDCCA");}
    if(action==="new")return this.startPlay(ctx);ctx.answerCbQuery();
  }
};