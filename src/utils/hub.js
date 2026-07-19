// ─── Game Hub V5 — Simple flat menu, no i18n, no Markdown ───────
const GAMES = [
  { id: "drawguess", name: "\uD83C\uDFA8 \u4F60\u753B\u6211\u731C", desc: "\u753B\u56FE\u8BA9\u670B\u53CB\u731C" },
  { id: "spy", name: "\uD83D\uDD75\uFE0F \u8C01\u662F\u5367\u5E95", desc: "\u627E\u51FA\u9690\u85CF\u7684\u5367\u5E95" },
  { id: "friendquiz", name: "\uD83C\uDFAF \u9ED8\u5951\u8003\u9A8C", desc: "\u4F60\u6709\u591A\u4E86\u89E3\u670B\u53CB" },
  { id: "truth", name: "\uD83D\uDCAC \u771F\u5FC3\u8BDD\u5927\u5192\u9669", desc: "\u7ECF\u5178\u6D3E\u5BF9\u6E38\u620F" },
  { id: "slots", name: "\uD83C\uDFB0 \u8001\u864E\u673A", desc: "\u62C9\u6746\u4E2D\u5927\u5956" },
  { id: "highlow", name: "\uD83C\uDFB2 \u731C\u5927\u5C0F", desc: "\u731C\u70B9\u6570\u8F93\u8D62" },
  { id: "dragontiger", name: "\uD83C\uDCCF \u9F99\u864E\u6597", desc: "\u8D4C\u573A\u7ECF\u5178\u6BD4\u5927\u5C0F" },
  { id: "sicbo", name: "\uD83C\uDFB2 \u9AB0\u5B9D", desc: "\u4E09\u9AB0\u731C\u5927\u5C0F" },
  { id: "bj", name: "\uD83C\uDCCF 21\u70B9", desc: "\u548C\u5E84\u5BB6\u6BD4\u70B9\u6570" },
  { id: "roulette", name: "\uD83C\uDFAF \u8F6E\u76D8", desc: "\u731C\u7EA2\u9ED1\u5927\u5C0F" },
  { id: "potato", name: "\uD83D\uDD25 \u70B8\u5F39\u4F20\u9012", desc: "\u5B9A\u65F6\u70B8\u5F39\u6E38\u620F" },
];
const gameModules = {};
GAMES.forEach(g => { try { gameModules[g.id] = require("../games/" + g.id); } catch(e) { console.error("Failed: " + g.id, e.message); } });

function getLang(ctx) { return (ctx.from?.language_code || "").startsWith("zh") ? "zh" : "en"; }

async function showMain(ctx) {
  const lang = getLang(ctx);
  let text = "\uD83C\uDFAE \u6E38\u620F\u5927\u5385\n\n";
  GAMES.forEach(g => { text += g.name + " - " + g.desc + "\n"; });
  text += "\n\uD83D\uDC65 \u548C\u670B\u53CB\u4E00\u8D77\u73A9\uFF01";
  const kb = [];
  for (let i = 0; i < GAMES.length; i += 2) {
    const row = [{ text: GAMES[i].name, callback_data: "play_" + GAMES[i].id }];
    if (GAMES[i+1]) row.push({ text: GAMES[i+1].name, callback_data: "play_" + GAMES[i+1].id });
    kb.push(row);
  }
  kb.push([{ text: "\uD83D\uDCE2 " + (lang==="zh"?"\u5E7F\u544A\u5408\u4F5C":"Advertise"), callback_data: "ad" }, { text: "\uD83D\uDCDE " + (lang==="zh"?"\u8054\u7CFB\u6211\u4EEC":"Contact"), callback_data: "contact" }]);
  kb.push([{ text: "\uD83D\uDCE8 " + (lang==="zh"?"\u9080\u8BF7\u597D\u53CB":"Invite Friends"), callback_data: "invite" }]);
  kb.push([{ text: (lang==="zh"?"\uD83C\uDF10 English":"\uD83C\uDF10 \u4E2D\u6587"), callback_data: "lang" }]);
  try { await ctx.reply(text, { reply_markup: { inline_keyboard: kb } }); } catch(e) { console.error("showMain:", e.message); }
}

async function routeCB(ctx) {
  const d = ctx.callbackQuery?.data || ""; const uid = ctx.from?.id;
  if (d === "lang") {
    const cur = (ctx.from?.language_code||"").startsWith("zh")?"zh":"en";
    if (cur === "zh") { ctx.from.language_code = "en"; } else { ctx.from.language_code = "zh"; }
    await showMain(ctx); return ctx.answerCbQuery();
  }
  if (d === "invite") {
    const msg = "\uD83C\uDFAE " + (getLang(ctx)==="zh"?"\u6765\u548C\u6211\u4E00\u8D77\u73A9\u6E38\u620F\u5427\uFF01\n\n@games_lite_bot":"Come play games with me!\n\n@games_lite_bot");
    await ctx.reply(msg);
    return ctx.answerCbQuery();
  }

  if (d === "ad") { await ctx.reply("\uD83D\uDCE2 \u5E7F\u544A\u5408\u4F5C\n\n\u6B22\u8FCE\u54C1\u724C\u5408\u4F5C\uFF01\n\u8054\u7CFB: https://t.me/pincess_aoao"); return ctx.answerCbQuery(); }
  if (d === "contact") { await ctx.reply("\uD83D\uDCDE \u8054\u7CFB\u6211\u4EEC\n\nTelegram: https://t.me/pincess_aoao"); return ctx.answerCbQuery(); }

  if (d.startsWith("play_")) {
    const gid = d.slice(5); const mod = gameModules[gid];
    if (mod && mod.startPlay) {
      try { await mod.startPlay(ctx); } catch(e) { try { await ctx.reply("\u274C \u6E38\u620F\u542F\u52A8\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5"); } catch(_) {} }
      return ctx.answerCbQuery().catch(()=>{});
    }
    return ctx.answerCbQuery("\u274C").catch(()=>{});
  }

  for (const [id, mod] of Object.entries(gameModules)) {
    if (d.startsWith("game_" + id + "_")) {
      if (mod.handleCallback) return await mod.handleCallback(ctx, d.slice(("game_" + id + "_").length));
    }
  }
  return false;
}

module.exports = { showMain, routeCB, getLang };
