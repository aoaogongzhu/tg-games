// 🎨 你画我猜 - Draw & Guess (Social Party Game)
const { v4 } = require("uuid");

const WORDS_ZH = ["苹果","太阳","飞机","鱼","猫","狗","花","树","房子","汽车","月亮","星星","蛋糕","冰淇淋","雨伞","自行车","蝴蝶","雪人","火箭","钢琴","吉他","篮球","足球","彩虹","火山","海豚","企鹅","熊猫","眼镜","电话","钥匙","钟表","口罩","礼物","城堡","桥","船","梯子","风扇","灯泡","蜡烛","剪刀","梳子","牙刷","牙膏","枕头","被子","餐桌","沙发"];
const WORDS_EN = ["apple","sun","airplane","fish","cat","dog","flower","tree","house","car","moon","star","cake","ice cream","umbrella","bicycle","butterfly","snowman","rocket","piano","guitar","basketball","football","rainbow","volcano","dolphin","penguin","panda","glasses","telephone","key","clock","mask","gift","castle","bridge","ship","ladder","fan","light bulb","candle","scissors","comb","toothbrush","toothpaste","pillow","blanket","table","sofa"];

const games = new Map();

module.exports = {
  id: "drawguess", name: "🎨 你画我猜",

  async startPlay(ctx) {
    const lang = (ctx.from?.language_code||"").startsWith("zh")?"zh":"en";
    const msg = lang==="zh"
      ? "🎨 *你画我猜*\n\n一个人画画，其他人猜！\n\n点击加入，至少 2 人才能开始！"
      : "🎨 *Draw & Guess*\n\nOne person draws, others guess!\n\nTap to join, need at least 2 to start!";
    const id = v4().slice(0,6);
    games.set(id, { id, chatId: ctx.chat.id, players: [{ id: ctx.from.id, username: ctx.from.username || "Player" }], status: "waiting", lang, round: 0, scores: {} });
    await ctx.reply(msg, { parse_mode: "Markdown", reply_markup: { inline_keyboard: [
      [{ text: "🎨 " + (lang==="zh"?"加入游戏":"Join"), callback_data: `game_drawguess_join_${id}` }],
      [{ text: "🎯 " + (lang==="zh"?"开始游戏":"Start"), callback_data: `game_drawguess_start_${id}` }],
      [{ text: "❌", callback_data: `game_drawguess_cancel_${id}` }]
    ]}});
  },

  async handleCallback(ctx, action) {
    const p = action.split("_"); const s = p[0]; const rest = p.slice(1).join("_");
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name || "Player";

    if (s === "join" || s === "join2") {
      const g = games.get(rest); if (!g) return ctx.answerCbQuery("❌");
      if (g.players.find(p => p.id === userId)) return ctx.answerCbQuery("❌");
      g.players.push({ id: userId, username });
      await ctx.editMessageText(
        (g.lang==="zh"?`🎨 *你画我猜*\n\n已加入玩家 (${g.players.length}人)：\\n${g.players.map((p,i)=>i+1+". "+p.username).join("\\n")}\\n\\n至少 2 人才能开始！`:`🎨 *Draw & Guess*\\n\\nPlayers (${g.players.length}):\\n${g.players.map((p,i)=>i+1+". "+p.username).join("\\n")}\\n\\nNeed at least 2!`),
        { parse_mode:"Markdown", reply_markup: { inline_keyboard: [
          [{ text: "🎨 "+(g.lang==="zh"?"加入":"Join"), callback_data: `game_drawguess_join2_${g.id}` }],
          [{ text: "🎯 "+(g.lang==="zh"?"开始":"Start"), callback_data: `game_drawguess_start_${g.id}` }],
          [{ text: "❌", callback_data: `game_drawguess_cancel_${g.id}` }]
        ]}}
      );
      return ctx.answerCbQuery(g.lang==="zh"?"已加入":"Joined");
    }

    if (s === "start") {
      const g = games.get(rest); if (!g || g.players.length < 2) return ctx.answerCbQuery("❌");
      g.status = "playing"; g.round = 0; g.scores = {};
      g.players.forEach(p => { g.scores[p.id] = 0; });
      await startRound(ctx, g);
      return ctx.answerCbQuery("🎨");
    }

    if (s === "guess") {
      const parts = action.split("_"); // guess_{gameId}_{playerId}_{correctWord}
      const guessGameId = parts[1]; const guessPlayerId = parts[2]; const guessWord = decodeURIComponent(parts.slice(3).join("_"));
      const g = games.get(guessGameId); if (!g || g.status !== "guessing") return ctx.answerCbQuery("❌");
      const drawer = g.players[g.drawerIdx];
      if (userId === drawer.id) return ctx.answerCbQuery(g.lang==="zh"?"你不能猜自己画的":"You can't guess your own");
      const isCorrect = guessWord === g.currentWord;
      if (isCorrect) {
        g.scores[userId] = (g.scores[userId] || 0) + 10;
        g.scores[drawer.id] = (g.scores[drawer.id] || 0) + 5;
        g.status = "reveal";
        await ctx.editMessageText(
          (g.lang==="zh"?`🎨 *猜对了！*\\n\\n🎉 ${username} 猜对了！\\n正确答案：**${g.currentWord}**\\n\\n📊 当前得分：\\n${g.players.map(p=>p.username+": **"+(g.scores[p.id]||0)+"**").join("\\n")}`:`🎨 *Correct!*\\n\\n🎉 ${username} got it!\\nAnswer: **${g.currentWord}**\\n\\n📊 Scores:\\n${g.players.map(p=>p.username+": **"+(g.scores[p.id]||0)+"**").join("\\n")}`),
          { parse_mode:"Markdown", reply_markup: { inline_keyboard: [[{ text: "🔄 "+(g.lang==="zh"?"下一轮":"Next Round"), callback_data: `game_drawguess_next_${guessGameId}` }]] }}
        );
      } else {
        return ctx.answerCbQuery(g.lang==="zh"?"❌ 不对，再猜":"❌ Wrong, try again");
      }
      return ctx.answerCbQuery("🎉");
    }

    if (s === "next") {
      const g = games.get(rest); if (!g) return ctx.answerCbQuery("❌");
      g.round++;
      if (g.round >= g.players.length) {
        // Game over
        const winner = Object.entries(g.scores).sort((a,b) => b[1]-a[1])[0];
        const wPlayer = g.players.find(p => String(p.id) === String(winner[0]));
        await ctx.editMessageText(
          (g.lang==="zh"?`🎨 *游戏结束！*\\n\\n🏆 **${wPlayer?.username||"?"}** 获胜！\\n\\n📊 最终排名：\\n${g.players.sort((a,b)=>(g.scores[b.id]||0)-(g.scores[a.id]||0)).map((p,i)=>`${i+1}. ${p.username}: **${g.scores[p.id]||0}**`).join("\\n")}`:`🎨 *Game Over!*\\n\\n🏆 **${wPlayer?.username||"?"}** wins!\\n\\n📊 Final Rankings:\\n${g.players.sort((a,b)=>(g.scores[b.id]||0)-(g.scores[a.id]||0)).map((p,i)=>`${i+1}. ${p.username}: **${g.scores[p.id]||0}**`).join("\\n")}`),
          { parse_mode:"Markdown", reply_markup: { inline_keyboard: [[{ text: "🎨 "+(g.lang==="zh"?"再来一局":"Play Again"), callback_data: "game_drawguess_new" }]] }}
        );
        games.delete(rest);
      } else {
        await startRound(ctx, g);
      }
      return ctx.answerCbQuery();
    }

    if (s === "cancel") { games.delete(rest); await ctx.editMessageText("❌"); return ctx.answerCbQuery("❌"); }
    if (action === "new") return this.startPlay(ctx);
    ctx.answerCbQuery();
  },

  getGame(id) { return games.get(id); }
};

async function startRound(ctx, g) {
  const drawer = g.players[g.round % g.players.length];
  const words = g.lang === "zh" ? WORDS_ZH : WORDS_EN;
  const word = words[Math.floor(Math.random() * words.length)];
  g.currentWord = word;
  g.drawerIdx = g.players.indexOf(drawer);
  g.status = "drawing";

  // Build guess options (4 random words including correct one)
  let options = [word];
  while (options.length < 4) {
    const r = words[Math.floor(Math.random() * words.length)];
    if (!options.includes(r)) options.push(r);
  }
  options.sort(() => Math.random() - 0.5);
  g.guessOptions = options;

  // Tell drawer to draw
  const drawUrl = `${process.env.APP_URL}/draw.html?gameId=${g.id}&pid=${drawer.id}&word=${encodeURIComponent(word)}&lang=${g.lang}`;
  try {
    await ctx.telegram.sendMessage(drawer.id,
      (g.lang==="zh"?`🎨 轮到你了！画这个词：**${word}**\\n\\n点击下方按钮打开画板，画完提交！⏱ 60秒`:`🎨 Your turn! Draw: **${word}**\\n\\nOpen the canvas below and draw! ⏱ 60s`),
      { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: "🎨 "+(g.lang==="zh"?"打开画板":"Open Canvas"), web_app: { url: drawUrl } }]] } }
    );
  } catch(e) {}

  // Announce to group
  await ctx.telegram.sendMessage(g.chatId,
    (g.lang==="zh"?`🎨 **${drawer.username}** 正在画画...\\n\\n猜对了 +10 分，画画的人 +5 分！\\n\\n画作提交后会显示在这里，届时点击下方按钮猜答案！`:`🎨 **${drawer.username}** is drawing...\\n\\nGuess correct = +10 pts, Drawer gets +5 pts!\\n\\nWhen the drawing is ready, guess below!`),
    { parse_mode: "Markdown" }
  );

  // Set timeout for drawing (60 seconds) - if no submission, auto-next
  setTimeout(async () => {
    if (!games.has(g.id) || g.status !== "drawing") return;
    g.status = "guessing";
    // Send the drawing (might not be available if drawer didn't submit)
    await ctx.telegram.sendMessage(g.chatId,
      (g.lang==="zh"?`⏱ 时间到！猜猜 ${drawer.username} 画了什么？\\n\\n点击下方按钮猜答案！`:`⏱ Time up! Guess what ${drawer.username} drew?\\n\\nPick an answer below!`),
      { reply_markup: { inline_keyboard: [
        options.slice(0,2).map(o => ({ text: o, callback_data: `game_drawguess_guess_${g.id}_${drawer.id}_${encodeURIComponent(word)}` })),
        options.slice(2).map(o => ({ text: o, callback_data: `game_drawguess_guess_${g.id}_${drawer.id}_${encodeURIComponent(word)}` })),
      ]}}
    );
  }, 60000);
}
