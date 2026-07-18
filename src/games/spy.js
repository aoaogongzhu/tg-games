// 🕵️ Who is the Spy / 谁是卧底
const { v4 } = require("uuid");
const games = new Map();

const PAIRS = [
  {zh:["苹果","梨子"],en:["apple","pear"]},
  {zh:["猫","狗"],en:["cat","dog"]},
  {zh:["飞机","直升机"],en:["airplane","helicopter"]},
  {zh:["太阳","月亮"],en:["sun","moon"]},
  {zh:["咖啡","茶"],en:["coffee","tea"]},
  {zh:["足球","篮球"],en:["football","basketball"]},
  {zh:["钢琴","吉他"],en:["piano","guitar"]},
  {zh:["眼镜","墨镜"],en:["glasses","sunglasses"]},
  {zh:["雨伞","雨衣"],en:["umbrella","raincoat"]},
  {zh:["蛋糕","面包"],en:["cake","bread"]},
  {zh:["火车","地铁"],en:["train","subway"]},
  {zh:["椅子","沙发"],en:["chair","sofa"]},
  {zh:["书","杂志"],en:["book","magazine"]},
  {zh:["电话","手机"],en:["telephone","smartphone"]},
  {zh:["雪花","冰块"],en:["snow","ice"]},
];

module.exports = {
  id: "spy", name: "🕵️ 谁是卧底",

  async startPlay(ctx) {
    const lang = (ctx.from?.language_code||"").startsWith("zh")?"zh":"en";
    if(ctx.chat.id > 0) return ctx.reply(lang==="zh"?"🕵️ *谁是卧底*\n\n把这个 Bot 拉进群和朋友一起玩！":"🕵️ *Who is the Spy*\n\nAdd this bot to a group and play with friends!",{parse_mode:"Markdown"});
    const id = v4().slice(0,6);
    games.set(id,{id,chatId:ctx.chat.id,players:[{id:ctx.from.id,username:ctx.from.username||"Player"}],status:"waiting",lang});
    await ctx.reply(lang==="zh"
      ?`🕵️ *谁是卧底*\n\n${ctx.from.username||"Player"} 发起了游戏！\n\n规则：大家拿到相似的词语，其中一人拿到不同的「卧底词」。通过描述找出卧底！\n\n至少 3 人才能开始！`
      :`🕵️ *Who is the Spy*\n\n${ctx.from.username||"Player"} started a game!\n\nRules: Everyone gets similar words, one person gets a different "spy" word. Find the spy through descriptions!\n\nNeed at least 3 players!`,
      {parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🕵️ "+(lang==="zh"?"加入":"Join"),callback_data:`game_spy_join_${id}`}],[{text:"🎯 "+(lang==="zh"?"开始":"Start"),callback_data:`game_spy_start_${id}`}],[{text:"❌",callback_data:`game_spy_cancel_${id}`}]]}});
  },

  async handleCallback(ctx, action) {
    const p=action.split("_");const s=p[0];const rest=p.slice(1).join("_");
    const uid=ctx.from.id,un=ctx.from.username||ctx.from.first_name||"Player";
    if(s==="join"){
      const g=games.get(rest);if(!g)return ctx.answerCbQuery("❌");
      if(g.players.find(p=>p.id===uid))return ctx.answerCbQuery("❌");
      g.players.push({id:uid,username:un});
      await ctx.editMessageText(g.lang==="zh"
        ?`🕵️ *谁是卧底*\n\n已加入 (${g.players.length}人)：\n${g.players.map(p=>p.username).join("\n")}\n\n至少 3 人才能开始！`
        :`🕵️ *Who is the Spy*\n\nPlayers (${g.players.length}):\n${g.players.map(p=>p.username).join("\n")}\n\nNeed at least 3!`,
        {parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🕵️ "+(g.lang==="zh"?"加入":"Join"),callback_data:`game_spy_join_${g.id}`}],[{text:"🎯 "+(g.lang==="zh"?"开始":"Start"),callback_data:`game_spy_start_${g.id}`}],[{text:"❌",callback_data:`game_spy_cancel_${g.id}`}]]}});
      return ctx.answerCbQuery(g.lang==="zh"?"已加入":"Joined");
    }
    if(s==="start"){
      const g=games.get(rest);if(!g||g.players.length<3)return ctx.answerCbQuery("❌");
      g.status="playing";g.spyIdx=Math.floor(Math.random()*g.players.length);
      const pair=PAIRS[Math.floor(Math.random()*PAIRS.length)];
      g.pair=pair;
      g.phase="describe";g.describeIdx=0;
      g.votes={};g.eliminated=[];g.roundVotes={};

      // Send words privately
      for(let i=0;i<g.players.length;i++){
        const p=g.players[i];
        const word=i===g.spyIdx ? (g.lang==="zh"?pair.zh[1]:pair.en[1]) : (g.lang==="zh"?pair.zh[0]:pair.en[0]);
        try{
          await ctx.telegram.sendMessage(p.id,
            g.lang==="zh"?`🕵️ *你的词语*：**${word}**\n\n记住你的词，不要让别人知道！`:`🕵️ *Your word*: **${word}**\n\nRemember your word, don't let others know!`,
            {parse_mode:"Markdown"}
          );
        }catch(e){}
      }

      // Start description round
      await ctx.editMessageText(g.lang==="zh"
        ?`🕵️ *游戏开始！*\n\n词语已私聊发送给每位玩家👆\n\n现在每人轮流向大家描述自己的词（不要直接说出这个词！）\n\n**${g.players[0].username}** 先开始描述！`
        :`🕵️ *Game started!*\n\nWords sent to each player via DM 👆\n\nNow each player describes their word (don't say it directly!)\n\n**${g.players[0].username}** goes first!`,
        {parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"✅ "+(g.lang==="zh"?"描述完毕":"Done Describing"),callback_data:`game_spy_describe_${g.id}`}]]}});
      return ctx.answerCbQuery("🕵️");
    }
    if(s==="describe"){
      const g=games.get(rest);if(!g)return ctx.answerCbQuery("❌");
      g.describeIdx++;
      if(g.describeIdx>=g.players.length){
        // Voting phase
        g.phase="vote";
        const btns=g.players.filter(p=>g.eliminated.indexOf(p.id)<0).map(p=>({text:p.username,callback_data:`game_spy_vote_${g.id}_${p.id}`}));
        await ctx.editMessageText(g.lang==="zh"?"🕵️ *投票环节！*\n\n大家觉得谁是卧底？投票吧！":"🕵️ *Voting time!*\n\nWho do you think is the spy? Vote now!",{parse_mode:"Markdown",reply_markup:{inline_keyboard:btns.map(b=>[b])}});
      }else{
        // Find next non-eliminated player
        let next=g.describeIdx;
        while(g.eliminated.indexOf(g.players[next]?.id)>=0)next=(next+1)%g.players.length;
        if(next<g.players.length){
          await ctx.editMessageText(g.lang==="zh"
            ?`🕵️ **${g.players[next].username}** 请描述你的词：`
            :`🕵️ **${g.players[next].username}** describe your word:`,
            {parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"✅ "+(g.lang==="zh"?"描述完毕":"Done"),callback_data:`game_spy_describe_${g.id}`}]]}});
        }else{
          g.describeIdx=g.players.length;
          g.phase="vote";
          const btns=g.players.filter(p=>g.eliminated.indexOf(p.id)<0).map(p=>({text:p.username,callback_data:`game_spy_vote_${g.id}_${p.id}`}));
          await ctx.editMessageText(g.lang==="zh"?"🕵️ *投票环节！*\n\n大家觉得谁是卧底？投票吧！":"🕵️ *Voting time!*\n\nWho do you think is the spy? Vote now!",{parse_mode:"Markdown",reply_markup:{inline_keyboard:btns.map(b=>[b])}});
        }
      }
      return ctx.answerCbQuery("✅");
    }
    if(s==="vote"){
      const parts=action.split("_");const gid=parts[2];const target=parseInt(parts[3]);
      const g=games.get(gid);if(!g||g.phase!=="vote")return ctx.answerCbQuery("❌");
      if(g.eliminated.indexOf(uid)>=0)return ctx.answerCbQuery("❌");
      g.votes[uid]=target;
      return ctx.answerCbQuery(g.lang==="zh"?"已投票":"Voted");
    }
    if(s==="reveal"){
      const g=games.get(rest);if(!g)return ctx.answerCbQuery("❌");
      const spy=g.players[g.spyIdx];
      const votes={};Object.values(g.votes).forEach(v=>{votes[v]=(votes[v]||0)+1;});
      const maxVotes=Math.max(...Object.values(votes),0);
      const mostVoted=Object.keys(votes).filter(k=>votes[k]===maxVotes).map(Number);
      const spyCaught=mostVoted.includes(g.players[g.spyIdx].id);

      // Result
      let resultMsg=g.lang==="zh"
        ?`🕵️ *投票结果*\n\n卧底是：**${spy.username}**\n卧底词：**${(g.lang==="zh"?g.pair.zh[1]:g.pair.en[1])}**\n平民词：**${(g.lang==="zh"?g.pair.zh[0]:g.pair.en[0])}**\n\n`
        :`🕵️ *Vote Results*\n\nThe spy was: **${spy.username}**\nSpy word: **${(g.lang==="zh"?g.pair.zh[1]:g.pair.en[1])}**\nCivilian word: **${(g.lang==="zh"?g.pair.zh[0]:g.pair.en[0])}**\n\n`;
      if(spyCaught)resultMsg+=g.lang==="zh"?"🎉 *卧底被抓住了！平民获胜！*":"🎉 *The spy was caught! Civilians win!*";
      else resultMsg+=g.lang==="zh"?"😈 *卧底隐藏成功！卧底获胜！*":"😈 *The spy wins!*";
      await ctx.editMessageText(resultMsg,{parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🕵️ "+(g.lang==="zh"?"再来一局":"Play Again"),callback_data:"game_spy_new"}]]}});
      games.delete(rest);
      // Count votes for all voters
      return ctx.answerCbQuery(spyCaught?"🎉":"😈");
    }
    if(s==="cancel"){games.delete(rest);await ctx.editMessageText("❌");return ctx.answerCbQuery("❌");}
    if(action==="new")return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};
