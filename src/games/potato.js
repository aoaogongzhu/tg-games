// 🔥 炸弹传递 - Hot Potato
const { v4 } = require("uuid");
const games = new Map();

module.exports = {
  id: "potato", name: "🔥 炸弹传递",
  async startPlay(ctx) {
    const lang=(ctx.from?.language_code||"").startsWith("zh")?"zh":"en";
    if(ctx.chat.id>0)return ctx.reply(lang==="zh"?"🔥 *炸弹传递*\n\n把Bot拉进群和朋友一起玩！":"🔥 *Hot Potato*\n\nAdd bot to a group to play!",{parse_mode:"Markdown"});
    const id=v4().slice(0,6);
    games.set(id,{id,chatId:ctx.chat.id,players:[{id:ctx.from.id,username:ctx.from.username||"Player"}],status:"waiting",lang,timer:null});
    await ctx.reply(lang==="zh"?`🔥 *炸弹传递*\n\n${ctx.from.username||"Player"} 发起了游戏！\n\n定时炸弹在手中传递，爆炸时谁拿着谁出局！\n\n至少 2 人才能开始！`:`🔥 *Hot Potato*\n\n${ctx.from.username||"Player"} started a game!\n\nPass the bomb before it explodes! \n\nNeed at least 2 players!`,{parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🔥 "+(lang==="zh"?"加入":"Join"),callback_data:`game_potato_join_${id}`}],[{text:"💣 "+(lang==="zh"?"开始":"Start"),callback_data:`game_potato_start_${id}`}],[{text:"❌",callback_data:`game_potato_cancel_${id}`}]]}});
  },
  async handleCallback(ctx,action){
    const p=action.split("_");const s=p[0];const rest=p.slice(1).join("_");const uid=ctx.from.id,un=ctx.from.username||ctx.from.first_name||"Player";
    if(s==="join"||s==="join2"){
      const g=games.get(rest);if(!g)return ctx.answerCbQuery("❌");if(g.players.find(p=>p.id===uid))return ctx.answerCbQuery("❌");
      g.players.push({id:uid,username:un});
      await ctx.editMessageText(g.lang==="zh"?`🔥 *炸弹传递*\n\n已加入 (${g.players.length}人):\n${g.players.map(p=>p.username).join("\n")}\n\n至少2人才能开始！`:`🔥 *Hot Potato*\n\nPlayers (${g.players.length}):\n${g.players.map(p=>p.username).join("\n")}\n\nNeed at least 2!`,{parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🔥 "+(g.lang==="zh"?"加入":"Join"),callback_data:`game_potato_join2_${g.id}`}],[{text:"💣 "+(g.lang==="zh"?"开始":"Start"),callback_data:`game_potato_start_${g.id}`}],[{text:"❌",callback_data:`game_potato_cancel_${g.id}`}]]}});
      return ctx.answerCbQuery(g.lang==="zh"?"已加入":"Joined");
    }
    if(s==="start"){
      const g=games.get(rest);if(!g||g.players.length<2)return ctx.answerCbQuery("❌");
      g.status="playing";g.holder=Math.floor(Math.random()*g.players.length);g.alive=g.players.map(()=>true);
      g.bombTimer=15+Math.floor(Math.random()*15);
      await startPotatoRound(ctx,g);
      return ctx.answerCbQuery("💣");
    }
    if(s==="pass"){
      const g=games.get(rest);if(!g||g.status!=="playing")return ctx.answerCbQuery("❌");
      if(g.holders && g.holders[g.holder]?.id!==uid)return ctx.answerCbQuery(g.lang==="zh"?"还没轮到你":"Not your turn");
      // Check if current holder is still alive
      if(!g.alive[g.holder])return ctx.answerCbQuery("❌");
      // Pass to random alive player
      const aliveIdx=g.alive.map((a,i)=>a?i:-1).filter(i=>i>=0&&i!==g.holder);
      const nextIdx=aliveIdx[Math.floor(Math.random()*aliveIdx.length)];
      g.holder=nextIdx;
      g.bombTimer=10+Math.floor(Math.random()*10);
      // Cancel old timer and set new one
      if(g.timer){clearTimeout(g.timer);}
      await ctx.editMessageText(g.lang==="zh"?`🔥 *炸弹传递*\n\n💣 **${g.players[g.holder].username}** 接到了炸弹！\n⏱ ${g.bombTimer}秒内必须传出去！\n\n存活: ${g.alive.filter(a=>a).length}/${g.players.length}人`:`🔥 *Hot Potato*\n\n💣 **${g.players[g.holder].username}** caught the bomb!\n⏱ Pass within ${g.bombTimer}s!\n\nAlive: ${g.alive.filter(a=>a).length}/${g.players.length}`,{parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🔥 "+(g.lang==="zh"?"传给下一个人":"Pass"),callback_data:`game_potato_pass_${g.id}`}],[{text:"⏱ "+(g.lang==="zh"?"等待爆炸":"Wait"),callback_data:`game_potato_wait_${g.id}`}]]}});
      g.timer=setTimeout(()=>explode(ctx,g),g.bombTimer*1000);
      return ctx.answerCbQuery("🔥");
    }
    if(s==="wait"){
      return ctx.answerCbQuery(g.lang==="zh"?"⏱ 炸弹还在倒计时...":"⏱ Bomb is ticking...");
    }
    if(s==="cancel"){if(g.timer)clearTimeout(g.timer);games.delete(rest);await ctx.editMessageText("❌");return ctx.answerCbQuery("❌");}
    if(action==="new")return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};

function startPotatoRound(ctx,g){
  const msg=g.lang==="zh"?`🔥 *炸弹传递 - 开始！*\n\n💣 **${g.players[g.holder].username}** 拿到了炸弹！\n⏱ ${g.bombTimer}秒内必须传出去！\n\n点击「传给下一个人」把炸弹丢掉！`:`🔥 *Hot Potato - Start!*\n\n💣 **${g.players[g.holder].username}** got the bomb!\n⏱ Pass within ${g.bombTimer}s!\n\nTap "Pass" to get rid of it!`;
  ctx.editMessageText(msg,{parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🔥 "+(g.lang==="zh"?"传给下一个人":"Pass"),callback_data:`game_potato_pass_${g.id}`}],[{text:"⏱ "+(g.lang==="zh"?"等待爆炸":"Wait"),callback_data:`game_potato_wait_${g.id}`}]]}});
  g.timer=setTimeout(()=>explode(ctx,g),g.bombTimer*1000);
}

function explode(ctx,g){
  if(!games.has(g.id)||g.status!=="playing")return;
  g.alive[g.holder]=false;
  const alive=g.alive.filter(a=>a);
  if(alive.length<=1){
    const winnerIdx=g.alive.indexOf(true);
    const winner=g.players[winnerIdx>=0?winnerIdx:0];
    ctx.editMessageText(g.lang==="zh"?`💥 *炸弹爆炸了！*\n\n**${g.players[g.holder].username}** 被淘汰了！\n\n🏆 **${winner.username}** 是最后的幸存者！`:`💥 *Bomb exploded!*\n\n**${g.players[g.holder].username}** is out!\n\n🏆 **${winner.username}** is the last survivor!`,{parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🔥 "+(g.lang==="zh"?"再来一局":"Play Again"),callback_data:"game_potato_new"}]]}});
    games.delete(g.id);
  }else{
    // Find next holder (random alive)
    const aliveIdx=g.alive.map((a,i)=>a?i:-1).filter(i=>i>=0);
    g.holder=aliveIdx[Math.floor(Math.random()*aliveIdx.length)];
    g.bombTimer=12+Math.floor(Math.random()*12);
    ctx.editMessageText(g.lang==="zh"?`💥 **${g.players.filter((_,i)=>!g.alive[i]).pop()?.username||"?"}** 被淘汰了！\n\n🔥 炸弹传到了 **${g.players[g.holder].username}** 手中！\n⏱ ${g.bombTimer}秒内传出去！`:`💥 **${g.players.filter((_,i)=>!g.alive[i]).pop()?.username||"?"}** is out!\n\n🔥 **${g.players[g.holder].username}** got the bomb!\n⏱ Pass within ${g.bombTimer}s!`,{parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🔥 "+(g.lang==="zh"?"传给下一个人":"Pass"),callback_data:`game_potato_pass_${g.id}`}],[{text:"⏱ "+(g.lang==="zh"?"等待爆炸":"Wait"),callback_data:`game_potato_wait_${g.id}`}]]}});
    g.timer=setTimeout(()=>explode(ctx,g),g.bombTimer*1000);
  }
}
