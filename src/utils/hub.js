// ─── Game Hub — 双语 ─────────────────────────────────────────────
const i18n = require('./i18n');
const games = [
  { id: 'duel',  type: 'miniapp', file: 'duel.html' },
  { id: 'rps',   type: 'inline' },
  { id: 'dice',  type: 'inline' },
  { id: 'truth', type: 'inline' },
  { id: 'wheel', type: 'miniapp', file: 'wheel.html' },
];

const modules = {};
games.forEach(g => {
  try { modules[g.id] = require(`../games/${g.id}`); }
  catch (e) { console.error(`Failed to load: ${g.id}`, e.message); }
});

function getMainMenuKeyboard(lang, userId) {
  const keyboard = [];
  games.forEach(g => {
    const info = i18n.t(lang, `hub.games`);
    const idx = games.indexOf(g);
    const gInfo = Array.isArray(info) ? info[idx] || info[0] : { name: g.id, desc: '' };
    if (g.type === 'inline') {
      keyboard.push([{ text: gInfo.name, callback_data: `hub_play_${g.id}` }]);
    } else {
      const url = `${process.env.APP_URL || 'http://localhost:3000'}/${g.file}?lang=${lang}`;
      keyboard.push([{ text: gInfo.name, web_app: { url } }]);
    }
  });
  // Language switch row
  const currentLang = i18n.getUserLang(userId) || lang;
  const switchLabel = currentLang === 'zh' ? '🌐 English' : '🌐 中文';
  keyboard.push([{ text: switchLabel, callback_data: 'lang_switch' }]);
  return { inline_keyboard: keyboard };
}

function getMainMenuText(lang) {
  const gamesInfo = i18n.t(lang, 'hub.games');
  const lines = games.map((g, i) => {
    const info = Array.isArray(gamesInfo) ? gamesInfo[i] || gamesInfo[0] : { name: g.id, desc: '' };
    return `${info.name} — ${info.desc}`;
  });
  return `${i18n.t(lang, 'hub.title')}\n\n${i18n.t(lang, 'hub.subtitle')}\n\n${lines.join('\n')}\n\n${i18n.t(lang, 'common.social_tag')}\n\n${i18n.t(lang, 'hub.footer')}`;
}

async function showMainMenu(ctx) {
  const lang = i18n.detectLang(ctx);
  const userId = ctx.from?.id;
  await ctx.reply(getMainMenuText(lang), {
    parse_mode: 'Markdown',
    reply_markup: getMainMenuKeyboard(lang, userId)
  });
}

async function routeCallback(ctx) {
  const data = ctx.callbackQuery?.data || '';
  if (data === 'lang_switch') {
    const userId = ctx.from?.id;
    const current = i18n.getUserLang(userId) || i18n.detectLang(ctx);
    const newLang = current === 'zh' ? 'en' : 'zh';
    i18n.setUserLang(userId, newLang);
    await ctx.editMessageText(getMainMenuText(newLang), {
      parse_mode: 'Markdown',
      reply_markup: getMainMenuKeyboard(newLang, userId)
    });
    return ctx.answerCbQuery(newLang === 'zh' ? '🌐 已切换为中文' : '🌐 Switched to English');
  }

  if (data.startsWith('hub_play_')) {
    const gameId = data.replace('hub_play_', '');
    const mod = modules[gameId];
    if (mod && mod.startPlay) return await mod.startPlay(ctx);
    return await ctx.answerCbQuery('Game unavailable');
  }

  for (const g of games) {
    if (data.startsWith(`game_${g.id}_`)) {
      const mod = modules[g.id];
      if (mod && mod.handleCallback) {
        const action = data.slice(`game_${g.id}_`.length);
        return await mod.handleCallback(ctx, action);
      }
    }
  }
  return false;
}

module.exports = { games, modules, getMainMenuKeyboard, getMainMenuText, showMainMenu, routeCallback };
