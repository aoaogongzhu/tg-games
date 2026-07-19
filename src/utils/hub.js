// ─── Game Hub V4 — Social Games ──────────────────────────────────
const i18n = require("./i18n");

const ALL_GAMES = ["drawguess","spy","friendquiz","truth","wheel","potato","rather","truthdice"];
const gameModules = {};
const CATEGORIES = [
  { id: "draw", icon: "\uD83C\uDFA8", name: { zh: "\u521B\u610F\u7ED8\u753B", en: "Drawing" }, desc: { zh: "\u4F60\u753B\u6211\u731C", en: "Draw & Guess" } },
  { id: "spy", icon: "\uD83D\uDD75\uFE0F", name: { zh: "\u63A8\u7406\u793E\u4EA4", en: "Deduction" }, desc: { zh: "\u8C01\u662F\u5367\u5E95 \u00B7 \u9ED8\u5951\u8003\u9A8C", en: "Spy \u00B7 Friend Quiz" } },
  { id: "party", icon: "\uD83C\uDFAA", name: { zh: "\u6D3E\u5BF9\u793E\u4EA4", en: "Party" }, desc: { zh: "\u771F\u5FC3\u8BDD \u00B7 \u547D\u8FD0\u8F6C\u76D8 \u00B7 \u70B8\u5F39\u4F20\u9012", en: "Truth/Dare \u00B7 Wheel \u00B7 Potato" } },
  { id: "challenge", icon: "\uD83D\uDD25", name: { zh: "\u7ADE\u6280\u6311\u6218", en: "Challenge" }, desc: { zh: "\u4F60\u9009\u54EA\u4E2A \u00B7 \u771F\u5FC3\u8BDD\u9AB0\u5B50", en: "Rather \u00B7 Truth Dice" } },
];
const CAT_GAMES = {
  draw: [{ id: "drawguess", name: { zh: "\uD83C\uDFA8 \u4F60\u753B\u6211\u731C", en: "\uD83C\uDFA8 Draw & Guess" }, desc: { zh: "\u753B\u56FE\u8BA9\u670B\u53CB\u731C", en: "Draw and let friends guess" }, mode: { zh: "\uD83D\uDC65 \u591A\u4EBA", en: "\uD83D\uDC65 Group" } }],
  spy: [
    { id: "spy", name: { zh: "\uD83D\uDD75\uFE0F \u8C01\u662F\u5367\u5E95", en: "\uD83D\uDD75\uFE0F Who is the Spy" }, desc: { zh: "\u627E\u51FA\u9690\u85CF\u7684\u5367\u5E95", en: "Find the hidden spy" }, mode: { zh: "\uD83D\uDC65 \u591A\u4EBA", en: "\uD83D\uDC65 Group" } },
    { id: "friendquiz", name: { zh: "\uD83C\uDFAF \u9ED8\u5951\u8003\u9A8C", en: "\uD83C\uDFAF Friend Quiz" }, desc: { zh: "\u4F60\u6709\u591A\u4E86\u89E3\u670B\u53CB\uFF1F", en: "How well do you know friends?" }, mode: { zh: "\uD83D\uDC65 \u591A\u4EBA", en: "\uD83D\uDC65 Group" } }
  ],
  party: [
    { id: "truth", name: { zh: "\uD83D\uDCAC \u771F\u5FC3\u8BDD\u5927\u5192\u9669", en: "\uD83D\uDCAC Truth or Dare" }, desc: { zh: "\u7ECF\u5178\u7684\u6D3E\u5BF9\u6E38\u620F", en: "Classic party game" }, mode: { zh: "\uD83D\uDC65 \u591A\u4EBA", en: "\uD83D\uDC65 Group" } },
    { id: "wheel", name: { zh: "\uD83C\uDFA1 \u547D\u8FD0\u8F6C\u76D8", en: "\uD83C\uDFA1 Wheel of Fate" }, desc: { zh: "\u8F6C\u51FA\u4F60\u7684\u547D\u8FD0", en: "Spin your destiny" }, mode: { zh: "\uD83D\uDC64 \u5355\u4EBA", en: "\uD83D\uDC64 Solo" } },
    { id: "potato", name: { zh: "\uD83D\uDD25 \u70B8\u5F39\u4F20\u9012", en: "\uD83D\uDD25 Hot Potato" }, desc: { zh: "\u5B9A\u65F6\u70B8\u5F39\u4F20\u9012\u6E38\u620F", en: "Pass the bomb!" }, mode: { zh: "\uD83D\uDC65 \u591A\u4EBA", en: "\uD83D\uDC65 Group" } }
  ],
  challenge: [
    { id: "rather", name: { zh: "\uD83E\uDD14 \u4F60\u9009\u54EA\u4E2A", en: "\uD83E\uDD14 Would You Rather" }, desc: { zh: "\u4E24\u96BE\u9009\u62E9\u9898", en: "Dilemma voting" }, mode: { zh: "\uD83D\uDC65 \u591A\u4EBA", en: "\uD83D\uDC65 Group" } },
    { id: "truthdice", name: { zh: "\uD83C\uDFB2 \u771F\u5FC3\u8BDD\u9AB0\u5B50", en: "\uD83C\uDFB2 Truth Dice" }, desc: { zh: "\u63B7\u9AB0\u51B3\u5B9A\u4F60\u7684\u547D\u8FD0", en: "Roll your fate" }, mode: { zh: "\uD83D\uDC65 \u591A\u4EBA", en: "\uD83D\uDC65 Group" } }
  ]
};


ALL_GAMES.forEach(id => { try { gameModules[id] = require(`../games/${id}`); } catch(e) { console.error(`Failed: ${id}`, e.message); } });

function getLang(ctx) { return i18n.getUserLang(ctx.from?.id) || i18n.detectLang(ctx); }

function mainMenuText(lang) {
  return `🎮 ${i18n.t(lang,"hub.title")}\n${i18n.t(lang,"hub.subtitle")}\n\n👥 ${i18n.t(lang,"common.social_tag")}\n✨ ${i18n.t(lang,"ad.hint")}`;
}

function mainMenuKeyboard(lang, uid) {
  const cats = i18n.t(lang, "hub.categories");
  const kb = [];
  for (let i = 0; i < cats.length; i += 2) {
    const row = [{ text: `${cats[i].icon} ${cats[i].name}`, callback_data: `hub_cat_${cats[i].id}` }];
    if (cats[i+1]) row.push({ text: `${cats[i+1].icon} ${cats[i+1].name}`, callback_data: `hub_cat_${cats[i+1].id}` });
    kb.push(row);
  }
  kb.push([{ text: i18n.t(lang, "ad.btn"), callback_data: "hub_ad" }, { text: i18n.t(lang, "contact.btn"), callback_data: "hub_contact" }]);
  kb.push([{ text: "\uD83D\uDCE8 " + (lang === "zh" ? "邀请好友" : "Invite Friends"), callback_data: "hub_invite" }]);
  kb.push([{ text: (i18n.getUserLang(uid)||lang) === "zh" ? "\uD83C\uDF10 English" : "\uD83C\uDF10 中文", callback_data: "lang_switch" }]);
  return { inline_keyboard: kb };
}

function catMenuText(lang, catId) {
  const cat = i18n.t(lang, catId);
  return `${cat.title}\n${cat.desc}\n${cat.games.map(g=>`${g.name} - ${g.desc} (${g.mode})`).join("\n")}\n\n${i18n.t(lang,"game_select")}`;
}

function catMenuKeyboard(lang, catId) {
  const cat = i18n.t(lang, catId); const kb = []; const games = cat.games || [];
  for (let i = 0; i < games.length; i += 2) {
    const row = [{ text: games[i].name, callback_data: `hub_play_${games[i].id}` }];
    if (games[i+1]) row.push({ text: games[i+1].name, callback_data: `hub_play_${games[i+1].id}` });
    kb.push(row);
  }
  kb.push([{ text: `\uD83D\uDD19 ${i18n.t(lang,"common.back")}`, callback_data: "hub_back" }]);
  return { inline_keyboard: kb };
}

async function sendOrEdit(ctx, text, kb) {
  try {
    if (ctx.callbackQuery) { await ctx.editMessageText(text, { parse_mode: "Markdown", reply_markup: kb }); return true; }
    else { await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb }); return true; }
  } catch(e) {
    try { await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb }).catch(()=>{}); return true; } catch(e2) { return false; }
  }
}

async function showMainMenu(ctx) {
  const lang = getLang(ctx); const uid = ctx.from?.id;
  await sendOrEdit(ctx, mainMenuText(lang), mainMenuKeyboard(lang, uid));
}

async function showCategory(ctx, catId) {
  const lang = getLang(ctx);
  try { await ctx.editMessageText(catMenuText(lang, catId), { parse_mode: "Markdown", reply_markup: catMenuKeyboard(lang, catId) }).catch(()=>showMainMenu(ctx)); } catch(e) { await showMainMenu(ctx); }
}

async function routeCallback(ctx) {
  const data = ctx.callbackQuery?.data || ""; const uid = ctx.from?.id;

  if (data === "lang_switch") {
    const current = i18n.getUserLang(uid) || i18n.detectLang(ctx); const next = current === "zh" ? "en" : "zh";
    i18n.setUserLang(uid, next);
    await sendOrEdit(ctx, mainMenuText(next), mainMenuKeyboard(next, uid));
    return;
  }

  if (data === "hub_back") { await showMainMenu(ctx); return; }

  if (data === "hub_ad") {
    try {
      const lang = getLang(ctx);
      await ctx.reply(i18n.t(lang, "ad.msg")).catch(() => {});
    } catch(e) {}
    return ctx.answerCbQuery().catch(()=>{});
  }
  if (data === "hub_contact") {
    try {
      const lang = getLang(ctx);
      await ctx.reply(i18n.t(lang, "contact.msg")).catch(() => {});
    } catch(e) {}
    return ctx.answerCbQuery().catch(()=>{});
  }
  if (data === "hub_invite") {
    try {
      const lang = getLang(ctx);
      await ctx.reply(lang === "zh" ? "\uD83C\uDFAE \u6765\u548C\u6211\u4E00\u8D77\u73A9\u6E38\u620F\u5427\uFF01\n\n@games_lite_bot \u6709\u7CBE\u5F69\u7684\u793E\u4EA4\u5C0F\u6E38\u620F\uFF01\n\n\u70B9\u51FB\u5F00\u59CB\uFF1Ahttps://t.me/games_lite_bot" : "\uD83C\uDFAE Come play games with me!\n\n@games_lite_bot has awesome social games!\n\nStart here: https://t.me/games_lite_bot").catch(()=>{});
    } catch(e) {}
    return ctx.answerCbQuery().catch(()=>{});
  }

  if (data.startsWith("hub_cat_")) { return await showCategory(ctx, data.replace("hub_cat_", "")); }

  if (data.startsWith("hub_play_")) {
    const gameId = data.replace("hub_play_", ""); const mod = gameModules[gameId];
    if (mod && mod.startPlay) { await mod.startPlay(ctx); return ctx.answerCbQuery().catch(()=>{}); }
    return ctx.answerCbQuery("\u274C").catch(()=>{});
  }

  for (const [id, mod] of Object.entries(gameModules)) {
    if (data.startsWith(`game_${id}_`)) { if (mod.handleCallback) return await mod.handleCallback(ctx, data.slice(`game_${id}_`.length)); }
  }

  return false;
}

module.exports = { showMainMenu, routeCallback };
