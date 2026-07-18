// 🎯 默契考验 - Friend Quiz (How well do you know your friends?)
const { v4 } = require("uuid");
const games = new Map();

const QUIZ = [
  {zh:{q:"TA 最喜欢的颜色？",o:["红色","蓝色","黑色","白色","绿色","黄色"]},en:{q:"What is their favorite color?",o:["Red","Blue","Black","White","Green","Yellow"]}},
  {zh:{q:"TA 最害怕的东西？",o:["蜘蛛","蛇","高处","黑暗","鬼","蟑螂"]},en:{q:"What are they most afraid of?",o:["Spiders","Snakes","Heights","Darkness","Ghosts","Cockroaches"]}},
  {zh:{q:"TA 最爱吃什么？",o:["火锅","烧烤","寿司","披萨","面条","蛋糕"]},en:{q:"What is their favorite food?",o:["Hotpot","BBQ","Sushi","Pizza","Noodles","Cake"]}},
  {zh:{q:"TA 的爱好是什么？",o:["打游戏","看电影","听音乐","运动","看书","旅行"]},en:{q:"What is their hobby?",o:["Gaming","Movies","Music","Sports","Reading","Traveling"]}},
  {zh:{q:"TA 最想去的国家？",o:["日本","泰国","法国","美国","冰岛","澳大利亚"]},en:{q:"Which country do they want to visit most?",o:["Japan","Thailand","France","USA","Iceland","Australia"]}},
  {zh:{q:"TA 是猫派还是狗派？",o:["猫派","狗派","都喜欢","都不喜欢"]},en:{q:"Cat person or dog person?",o:["Cat","Dog","Both","Neither"]}},
];

module.exports = {
  id: "friendquiz", name: "🎯 默契考验",

  async startPlay(ctx) {
    const lang = (ctx.from?.language_code||"").startsWith("zh")?"zh":"en";
    if(ctx.chat.id > 0) return ctx.reply(lang==="zh"?"🎯 *默契考验*\n\n把这个 Bot 拉进群和朋友一起玩！\n\n规则：选一个人，其他人回答关于 TA 的问题，看谁最了解 TA！":"🎯 *Friend Quiz*\n\nAdd this bot to a group to play!\n\nRules: Pick a person, others answer questions about them. Who knows them best?",{parse_mode:"Markdown"});
    const id = v4().slice(0,6);
    games.set(id,{id,chatId:ctx.chat.id,players:[{id:ctx.from.id,username:ctx.from.username||"Player"}],status:"waiting",lang,round:0,scores:{}});
    await ctx.reply(lang==="zh"
      ?`🎯 *默契考验*\n\n${ctx.from.username||"Player"} 发起了游戏！\n\n大家来猜猜关于 TA 的问题！\n\n至少 2 人才能开始！`
      :`🎯 *Friend Quiz*\n\n${ctx.from.username||"Player"} started a game!\n\nEveryone answers questions about a person!\n\nNeed at least 2 players!`,
      {parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🎯 "+(lang==="zh"?"加入":"Join"),callback_data:`game_friendquiz_join_${id}`}],[{text:"🎯 "+(lang==="zh"?"开始":"Start"),callback_data:`game_friendquiz_start_${id}`}],[{text:"❌",callback_data:`game_friendquiz_cancel_${id}`}]]}});
  },

  async handleCallback(ctx, action) {
    const p=action.split("_");const s=p[0];const rest=p.slice(1).join("_");
    const uid=ctx.from.id,un=ctx.from.username||ctx.from.first_name||"Player";
    if(s==="join"){
      const g=games.get(rest);if(!g)return ctx.answerCbQuery("❌");
      if(g.players.find(p=>p.id===uid))return ctx.answerCbQuery("❌");
      g.players.push({id:uid,username:un});
      await ctx.editMessageText(g.lang==="zh"
        ?`🎯 *默契考验*\n\n已加入 (${g.players.length}人)：\n${g.players.map(p=>p.username).join("\n")}\n\n至少 2 人才能开始！`
        :`🎯 *Friend Quiz*\n\nPlayers (${g.players.length}):\n${g.players.map(p=>p.username).join("\n")}\n\nNeed at least 2!`,
        {parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🎯 "+(g.lang==="zh"?"加入":"Join"),callback_data:`game_friendquiz_join_${g.id}`}],[{text:"🎯 "+(g.lang==="zh"?"开始":"Start"),callback_data:`game_friendquiz_start_${g.id}`}],[{text:"❌",callback_data:`game_friendquiz_cancel_${g.id}`}]]}});
      return ctx.answerCbQuery(g.lang==="zh"?"已加入":"Joined");
    }
    if(s==="start"){
      const g=games.get(rest);if(!g||g.players.length<2)return ctx.answerCbQuery("❌");
      g.status="playing";g.targetIdx=0;
      await askQuestion(ctx,g);
      return ctx.answerCbQuery("🎯");
    }
    if(s==="answer"){
      const parts=action.split("_");const gid=parts[2];const answer=decodeURIComponent(parts.slice(3).join("_"));
      const g=games.get(gid);if(!g||g.status!=="answering")return ctx.answerCbQuery("❌");
      if(uid===g.players[g.targetIdx].id)return ctx.answerCbQuery("❌");
      g.votes[uid]=answer;
      return ctx.answerCbQuery(g.lang==="zh"?"已投票":"Voted");
    }
    if(s==="reveal"){
      const g=games.get(rest);if(!g)return ctx.answerCbQuery("❌");
      const target=g.players[g.targetIdx];
      const q=QUIZ[g.currentQ||0];const qd=g.lang==="zh"?q.zh:q.en;
      // Count answers
      const counts={};Object.values(g.votes).forEach(v=>{counts[v]=(counts[v]||0)+1;});
      const voted=Object.keys(counts).length;
      // Score
      Object.entries(g.votes).forEach(([uid,answer])=>{
        if(answer===g.correctAnswer)g.scores[parseInt(uid)]=(g.scores[parseInt(uid)]||0)+10;
      });
      // Result
      const correct=g.correctAnswer;
      const votesStr=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([a,c])=>`${a}: ${c}人`).join("\n");
      await ctx.editMessageText(g.lang==="zh"
        ?`🎯 *默契考验 — 揭晓答案！*\n\n问题：**${qd.q}**\n关于：**${target.username}**\n\n✅ 正确答案：**${correct}**\n\n📊 投票结果：\n${votesStr}\n\n${g.lang==="zh"?`${target.username} ${g.correctAnswer===qd.o[0]?"选了第一个":"选了其他"}！`:`${target.username} chose ${g.correctAnswer}!`}`
        :`🎯 *Friend Quiz — Results!*\n\nQuestion: **${qd.q}**\nAbout: **${target.username}**\n\n✅ Correct: **${correct}**\n\n📊 Votes:\n${votesStr}`,
        {parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🔄 "+(g.lang==="zh"?"下一题":"Next Q"),callback_data:`game_friendquiz_next_${g.id}`}],[{text:"🏁 "+(g.lang==="zh"?"结束":"End"),callback_data:`game_friendquiz_end_${g.id}`}]]}});
      return ctx.answerCbQuery();
    }
    if(s==="next"){
      const g=games.get(rest);if(!g)return ctx.answerCbQuery("❌");
      g.round++;
      if(g.round>=6){ // Game over after 6 questions
        await showFinal(ctx,g);games.delete(rest);return ctx.answerCbQuery("🏆");
      }
      g.targetIdx=(g.targetIdx+1)%g.players.length;
      await askQuestion(ctx,g);
      return ctx.answerCbQuery("🔄");
    }
    if(s==="end"){const g=games.get(rest);if(!g)return ctx.answerCbQuery("❌");await showFinal(ctx,g);games.delete(rest);return ctx.answerCbQuery("🏆");}
    if(s==="cancel"){games.delete(rest);await ctx.editMessageText("❌");return ctx.answerCbQuery("❌");}
    if(action==="new")return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};

async function askQuestion(ctx,g){
  const q=QUIZ[g.round%QUIZ.length];g.currentQ=g.round%QUIZ.length;
  const qd=g.lang==="zh"?q.zh:q.en;
  const target=g.players[g.targetIdx];
  g.status="answering";g.votes={};
  g.correctAnswer=qd.o[Math.floor(Math.random()*qd.o.length)];

  await ctx.editMessageText(g.lang==="zh"
    ?`🎯 *默契考验*\n\n问题（关于 **${target.username}**）：\n**${qd.q}**\n\n大家觉得 TA 会选哪个？`
    :`🎯 *Friend Quiz*\n\nQuestion (about **${target.username}**):\n**${qd.q}**\n\nWhat do you think they would pick?`,
    {parse_mode:"Markdown",reply_markup:{inline_keyboard:[
      qd.o.slice(0,Math.ceil(qd.o.length/2)).map(o=>({text:o,callback_data:`game_friendquiz_answer_${g.id}_${encodeURIComponent(o)}`})),
      qd.o.slice(Math.ceil(qd.o.length/2)).map(o=>({text:o,callback_data:`game_friendquiz_answer_${g.id}_${encodeURIComponent(o)}`})),
      [{text:"🔍 "+(g.lang==="zh"?"揭晓答案":"Reveal"),callback_data:`game_friendquiz_reveal_${g.id}`}]
    ]}}
  );
}

async function showFinal(ctx,g){
  const sorted=Object.entries(g.scores).sort((a,b)=>b[1]-a[1]);
  await ctx.editMessageText(g.lang==="zh"
    ?`🎯 *默契考验 — 最终排名*\n\n${sorted.map(([id,score],i)=>`${i+1}. ${g.players.find(p=>String(p.id)===String(id))?.username||"?"}: **${score}**分`).join("\n")}\n\n🏆 **${g.players.find(p=>String(p.id)===String(sorted[0][0]))?.username||"?"}** 最了解大家！`
    :`🎯 *Friend Quiz — Final Rankings*\n\n${sorted.map(([id,score],i)=>`${i+1}. ${g.players.find(p=>String(p.id)===String(id))?.username||"?"}: **${score}**pts`).join("\n")}\n\n🏆 **${g.players.find(p=>String(p.id)===String(sorted[0][0]))?.username||"?"}** knows everyone best!`,
    {parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🎯 "+(g.lang==="zh"?"再来一局":"Play Again"),callback_data:"game_friendquiz_new"}]]}});
}
