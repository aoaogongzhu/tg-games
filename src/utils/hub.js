// ─── Game Hub V4 — Social Games ──────────────────────────────────
const i18n = require("./i18n");

const ALL_GAMES = ["drawguess","spy","friendquiz","truth","wheel","potato","rather","truthdice"];
const gameModules = {};
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
