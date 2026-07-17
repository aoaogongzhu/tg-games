// ─── Game Hub ─────────────────────────────────────────────────────
// Central registry for all 5 games.

const games = [
  { id: 'duel',   name: '⚔️ 决斗场',    desc: '好友 1v1 回合制对战', type: 'miniapp', file: 'duel.html' },
  { id: 'rps',    name: '🪨 猜拳王',    desc: '三局两胜猜拳',       type: 'inline' },
  { id: 'dice',   name: '🎲 生死骰子',   desc: '猜点数，赌运气',      type: 'inline' },
  { id: 'truth',  name: '💬 真心话大冒险', desc: '和朋友一起玩火',    type: 'inline' },
  { id: 'wheel',  name: '🎡 命运转盘',   desc: '转出你的命运',       type: 'miniapp', file: 'wheel.html' },
];

// Initialize all game modules
const modules = {};
games.forEach(g => {
  try { modules[g.id] = require(`../games/${g.id}`); }
  catch (e) { console.error(`Failed to load game: ${g.id}`, e.message); }
});

function getMainMenuKeyboard(ctx) {
  const buttons = games.map(g => {
    if (g.type === 'inline') {
      return [{ text: g.name, callback_data: `hub_play_${g.id}` }];
    } else {
      const url = `${process.env.APP_URL || 'http://localhost:3000'}/${g.file}`;
      return [{ text: g.name, web_app: { url } }];
    }
  });
  // Arrange in 2 columns
  const keyboard = [];
  for (let i = 0; i < buttons.length; i += 2) {
    const row = buttons[i];
    if (buttons[i+1]) row.push(buttons[i+1][0]);
    keyboard.push(row);
  }
  return { inline_keyboard: keyboard };
}

function getMainMenuText(ctx) {
  return (
    '🎮 *游戏大厅*\n\n' +
    '选择一个游戏和朋友一起玩！\n\n' +
    games.map(g => `${g.name} — ${g.desc}`).join('\n') +
    '\n\n👇 点击下方按钮开始'
  );
}

async function showMainMenu(ctx) {
  await ctx.reply(getMainMenuText(ctx), {
    parse_mode: 'Markdown',
    reply_markup: getMainMenuKeyboard(ctx)
  });
}

// Route callback to game module
async function routeCallback(ctx) {
  const data = ctx.callbackQuery?.data || '';
  // Format: hub_play_{gameId} or game_{gameId}_{action}
  // For inline game flow: game_rps_start, game_rps_choose_rock, etc.

  if (data.startsWith('hub_play_')) {
    const gameId = data.replace('hub_play_', '');
    const mod = modules[gameId];
    if (mod && mod.startPlay) {
      return await mod.startPlay(ctx);
    }
    return await ctx.answerCbQuery('游戏暂不可用');
  }

  // Route to specific game
  for (const g of games) {
    if (data.startsWith(`game_${g.id}_`)) {
      const mod = modules[g.id];
      if (mod && mod.handleCallback) {
        const action = data.slice(`game_${g.id}_`.length);
        return await mod.handleCallback(ctx, action);
      }
    }
  }

  return false; // not handled
}

module.exports = { games, modules, getMainMenuKeyboard, getMainMenuText, showMainMenu, routeCallback };
