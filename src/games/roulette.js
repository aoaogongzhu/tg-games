// 💥 俄罗斯轮盘 - Russian Roulette (Bilingual, multiplayer)
const { v4: uuidv4 } = require('uuid');
const games = new Map();

module.exports = {
  id: 'roulette', name: '💥 俄罗斯轮盘',
  async startPlay(ctx) {
    const lang = (ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
    if(ctx.chat.id>0)return ctx.reply(lang==='zh'?'💥 *俄罗斯轮盘*\n\n把这个Bot拉进群，和朋友一起玩俄罗斯轮盘！':'💥 *Russian Roulette*\n\nAdd this bot to a group and play with friends!',{parse_mode:'Markdown'});
    const userId=ctx.from.id;
    // Check if there is an active game in this chat
    for(const[,g]of games){if(g.chatId===ctx.chat.id&&g.status==='waiting'){
      // Join existing
      if(g.players.find(p=>p.id===userId))return ctx.answerCbQuery(lang==='zh'?'你已经在游戏中了':'You are already in the game');
      g.players.push({id:userId,username:ctx.from.username||'Player',alive:true});
      await ctx.editMessageText(
        (lang==='zh'?`💥 *俄罗斯轮盘*\n\n玩家 (${g.players.length}人)：\n${g.players.map((p,i)=>`${i+1}. ${p.username}`).join('\n')}\n\n至少2人才能开始！`:`💥 *Russian Roulette*\n\nPlayers (${g.players.length}):\n${g.players.map((p,i)=>`${i+1}. ${p.username}`).join('\n')}\n\nNeed at least 2 to start!`),
        {parse_mode:'Markdown',reply_markup:{inline_keyboard:[
          [{text:'💥 '+ (lang==='zh'?'加入游戏':'Join'),callback_data:`game_roulette_join_${g.id}`}],
          g.players.length>=2?[{text:'🔫 '+ (lang==='zh'?'开始游戏':'Start'),callback_data:`game_roulette_start_${g.id}`}]:[],
          [{text:'❌',callback_data:`game_roulette_cancel_${g.id}`}]
        ].filter(r=>r.length)}}
      );
      return ctx.answerCbQuery(lang==='zh'?'已加入游戏':'Joined!');
    }}
    // Create new
    const id=uuidv4().slice(0,6);
    games.set(id,{id,chatId:ctx.chat.id,players:[{id:userId,username:ctx.from.username||'Player',alive:true}],status:'waiting',lang,bullet:-1,turn:0});
    await ctx.reply(
      (lang==='zh'?`💥 *俄罗斯轮盘*\n\n${ctx.from.username||'Player'} 创建了游戏！\n\n规则：6发弹仓，1发子弹。轮流扣动扳机...\n\n点击加入，至少2人开始！`:`💥 *Russian Roulette*\n\n${ctx.from.username||'Player'} created a game!\n\nRules: 6 chambers, 1 bullet. Take turns pulling the trigger...\n\nTap Join, need at least 2 to start!`),
      {parse_mode:'Markdown',reply_markup:{inline_keyboard:[
        [{text:'💥 '+ (lang==='zh'?'加入游戏':'Join'),callback_data:`game_roulette_join_${id}`}],
        [{text:'❌',callback_data:`game_roulette_cancel_${id}`}]
      ]}}
    );
  },
  async handleCallback(ctx, action) {
    const parts=action.split('_');const sub=parts[0],gameId=parts.slice(1).join('_');
    const g=games.get(gameId);if(!g)return ctx.answerCbQuery('❌');
    const lang=g.lang;const userId=ctx.from.id;
    if(sub==='join'){
      if(g.players.find(p=>p.id===userId))return ctx.answerCbQuery(lang==='zh'?'已在游戏中':'Already in');
      g.players.push({id:userId,username:ctx.from.username||'Player',alive:true});
      await ctx.editMessageText(
        (lang==='zh'?`💥 *俄罗斯轮盘*\n\n玩家 (${g.players.length}人)：\n${g.players.map((p,i)=>`${i+1}. ${p.username}`).join('\n')}\n\n至少2人才能开始！`:`💥 *Russian Roulette*\n\nPlayers (${g.players.length}):\n${g.players.map((p,i)=>`${i+1}. ${p.username}`).join('\n')}\n\nNeed at least 2 to start!`),
        {parse_mode:'Markdown',reply_markup:{inline_keyboard:[
          [{text:'💥 '+ (lang==='zh'?'加入':'Join'),callback_data:`game_roulette_join_${g.id}`}],
          g.players.length>=2?[{text:'🔫 '+ (lang==='zh'?'开始':'Start'),callback_data:`game_roulette_start_${g.id}`}]:[],
          [{text:'❌',callback_data:`game_roulette_cancel_${g.id}`}]
        ].filter(r=>r.length)}}
      );
      return ctx.answerCbQuery(lang==='zh'?'已加入':'Joined');
    }
    if(sub==='start'){
      if(g.status!=='waiting')return ctx.answerCbQuery('❌');
      g.status='playing';g.bullet=Math.floor(Math.random()*6);g.turn=0;
      // Shuffle player order
      for(let i=g.players.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[g.players[i],g.players[j]]=[g.players[j],g.players[i]]}
      await nextTurn(ctx,g);
      return ctx.answerCbQuery('🔫');
    }
    if(sub==='shoot'){
      if(g.status!=='playing')return ctx.answerCbQuery('❌');
      const current=g.players[g.turn];
      if(current.id!==userId)return ctx.answerCbQuery(lang==='zh'?'还没轮到你':'Not your turn');
      if(g.chamber===g.bullet){
        current.alive=false;
        const msg=lang==='zh'?`💥 *砰！* ${current.username} 中弹了！\n\n${current.username} 出局！`:`💥 *BANG!* ${current.username} got shot!\n\n${current.username} is out!`;
        const alive=g.players.filter(p=>p.alive);
        if(alive.length<=1){
          const winner=alive[0];
          await ctx.editMessageText(lang==='zh'?`💥 *游戏结束！*\n\n🎉 ${winner.username} 是最后的幸存者！`:`💥 *Game Over!*\n\n🎉 ${winner.username} is the last survivor!`,{
            parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'💥 '+ (lang==='zh'?'再来一局':'Play Again'),callback_data:'game_roulette_new'}]]}
          });
          games.delete(g.id);
        }else{
          g.chamber=(g.chamber+1)%6;
          g.turn=(g.turn+1)%g.players.length;
          while(!g.players[g.turn].alive)g.turn=(g.turn+1)%g.players.length;
          await ctx.editMessageText(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🔫 '+ (lang==='zh'?'下一个开枪':'Next Shoot'),callback_data:`game_roulette_shoot_${g.id}`}]]}});
        }
      }else{
        const msg=lang==='zh'?`😰 *咔哒* ${current.username} 活了下来！\n\n下一个！`:`😰 *Click* ${current.username} survived!\n\nNext!`;
        g.chamber=(g.chamber+1)%6;
        g.turn=(g.turn+1)%g.players.length;
        while(!g.players[g.turn].alive)g.turn=(g.turn+1)%g.players.length;
        await ctx.editMessageText(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🔫 '+ (lang==='zh'?'开枪':'Shoot'),callback_data:`game_roulette_shoot_${g.id}`}]]}});
      }
      return ctx.answerCbQuery('🔫');
    }
    if(sub==='cancel'){games.delete(gameId);await ctx.editMessageText('❌');return ctx.answerCbQuery('❌');}
    if(action==='new')return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};

async function nextTurn(ctx,g){
  g.chamber=0;
  g.turn=0;while(!g.players[g.turn].alive)g.turn=(g.turn+1)%g.players.length;
  const current=g.players[g.turn];
  const msg=g.lang==='zh'?`🔫 *俄罗斯轮盘 - 开始！*\n\n弹仓已装弹，${g.players.length}人参与\n\n${current.username}，轮到你了！\n\n扣动扳机...`:`🔫 *Russian Roulette - Start!*\n\nChamber loaded, ${g.players.length} players\n\n${current.username}, its your turn!\n\nPull the trigger...`;
  await ctx.editMessageText(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🔫 '+ (g.lang==='zh'?'开枪':'Shoot'),callback_data:`game_roulette_shoot_${g.id}`}]]}});
}
