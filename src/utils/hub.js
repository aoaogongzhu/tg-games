// ─── Game Hub V2 — Categories + Ads + Contact ─────────────────────
const i18n = require('./i18n');

const gameModules = {};
['duel','rps','dice','truth','wheel','king','guess','riddle','blackjack','roulette'].forEach(id => {
  try { gameModules[id] = require(`../games/${id}`); }
  catch(e) { console.error(`Failed: ${id}`, e.message); }
});

const catGames = { social:['truth','king','wheel'], puzzle:['guess','riddle'], card:['blackjack','rps'], shoot:['roulette','duel'], casual:['dice'] };

function getLang(ctx) {
  return i18n.getUserLang(ctx.from?.id) || i18n.detectLang(ctx);
}

// ─── Text Builders ────────────────────────────────────────────────

function mainMenuText(lang) {
  const cats = i18n.t(lang, 'hub.categories');
  return `${i18n.t(lang,'hub.title')}\n\n${i18n.t(lang,'hub.subtitle')}\n${cats.map(c=>`${c.icon} ${c.name} — ${c.desc}`).join('\n')}\n\n${i18n.t(lang,'common.social_tag')}\n\n✨ ${i18n.t(lang,'ad.hint')}`;
}

function mainMenuKeyboard(lang, uid) {
  const cats = i18n.t(lang, 'hub.categories');
  const kb = [];
  for (let i = 0; i < cats.length; i += 2) {
    const row = [{ text: `${cats[i].icon} ${cats[i].name}`, callback_data: `hub_cat_${cats[i].id}` }];
    if (cats[i+1]) row.push({ text: `${cats[i+1].icon} ${cats[i+1].name}`, callback_data: `hub_cat_${cats[i+1].id}` });
    kb.push(row);
  }
  kb.push([
    { text: i18n.t(lang, 'ad.btn'), callback_data: 'hub_ad' },
    { text: i18n.t(lang, 'contact.btn'), callback_data: 'hub_contact' }
  ]);
  kb.push([{ text: (i18n.getUserLang(uid)||lang) === 'zh' ? '🌐 English' : '🌐 中文', callback_data: 'lang_switch' }]);
  return { inline_keyboard: kb };
}

function catMenuText(lang, catId) {
  const cat = i18n.t(lang, catId);
  return `${cat.title}\n\n${cat.desc}\n${cat.games.map(g=>`${g.name} — ${g.desc} (${g.mode})`).join('\n')}\n\n${i18n.t(lang,'game_select')}`;
}

function catMenuKeyboard(lang, catId) {
  const cat = i18n.t(lang, catId);
  const kb = [], games = cat.games;
  for (let i = 0; i < games.length; i += 2) {
    const row = [{ text: `${games[i].name}`, callback_data: `hub_play_${games[i].id}` }];
    if (games[i+1]) row.push({ text: `${games[i+1].name}`, callback_data: `hub_play_${games[i+1].id}` });
    kb.push(row);
  }
  kb.push([{ text: `🔙 ${i18n.t(lang,'common.back')}`, callback_data: 'hub_back' }]);
  return { inline_keyboard: kb };
}

// ─── Public API ───────────────────────────────────────────────────

async function showMainMenu(ctx) {
  const lang = getLang(ctx);
  const uid = ctx.from?.id;
  const text = mainMenuText(lang);
  const kb = mainMenuKeyboard(lang, uid);
  try {
    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, { parse_mode: 'Markdown', reply_markup: kb });
      await ctx.answerCbQuery();
    } else {
      await ctx.reply(text, { parse_mode: 'Markdown', reply_markup: kb });
    }
  } catch(e) {
    await ctx.reply(text, { parse_mode: 'Markdown', reply_markup: kb }).catch(()=>{});
  }
}

async function showCategory(ctx, catId) {
  const lang = getLang(ctx);
  try {
    await ctx.editMessageText(catMenuText(lang, catId), {
      parse_mode: 'Markdown',
      reply_markup: catMenuKeyboard(lang, catId)
    });
    await ctx.answerCbQuery();
  } catch(e) { await showMainMenu(ctx); }
}

async function routeCallback(ctx) {
  const data = ctx.callbackQuery?.data || '';
  const uid = ctx.from?.id;

  if (data === 'lang_switch') {
    const current = i18n.getUserLang(uid) || i18n.detectLang(ctx);
    const next = current === 'zh' ? 'en' : 'zh';
    i18n.setUserLang(uid, next);
    try {
      await ctx.editMessageText(mainMenuText(next), {
        parse_mode: 'Markdown',
        reply_markup: mainMenuKeyboard(next, uid)
      });
    } catch(e) { await showMainMenu(ctx).catch(()=>{}); }
    return ctx.answerCbQuery(next === 'zh' ? '🌐 已切换为中文' : '🌐 Switched to English');
  }

  if (data === 'hub_back') { await showMainMenu(ctx); return; }

  if (data === 'hub_ad') {
    const lang = getLang(ctx);
    await ctx.reply(i18n.t(lang, 'ad.msg'), { parse_mode: 'Markdown' });
    return ctx.answerCbQuery();
  }

  if (data === 'hub_contact') {
    const lang = getLang(ctx);
    await ctx.reply(i18n.t(lang, 'contact.msg'), { parse_mode: 'Markdown' });
    return ctx.answerCbQuery();
  }

  if (data.startsWith('hub_cat_')) {
    return await showCategory(ctx, data.replace('hub_cat_', ''));
  }

  if (data.startsWith('hub_play_')) {
    const gameId = data.replace('hub_play_', '');
    const mod = gameModules[gameId];
    if (mod && mod.startPlay) {
      await mod.startPlay(ctx);
      return ctx.answerCbQuery();
    }
    return ctx.answerCbQuery('❌');
  }

  for (const [id, mod] of Object.entries(gameModules)) {
    if (data.startsWith(`game_${id}_`)) {
      if (mod.handleCallback) {
        return await mod.handleCallback(ctx, data.slice(`game_${id}_`.length));
      }
    }
  }

  return false;
}

module.exports = { showMainMenu, routeCallback };
