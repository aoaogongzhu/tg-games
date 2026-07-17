// ─── i18n Module — 中文 / English (V2 with categories, ads, contact) ──
const strings = {
  zh: {
    _name: '中文',
    common: { loading: '加载中...', close: '关闭', retry: '再试一次', back: '🔙 返回大厅', social_tag: '👥 和朋友一起玩的社交游戏' },
    hub: {
      title: '🎮 游戏大厅',
      subtitle: '🎯 选择分类，和朋友一起嗨！',
      footer: '👇 点击按钮选择分类',
      categories: [
        { id: 'social', icon: '👥', name: '社交派对', desc: '真心话 · 国王 · 命运转盘' },
        { id: 'puzzle', icon: '🧩', name: '益智解谜', desc: '猜数字 · 猜谜语' },
        { id: 'card', icon: '🃏', name: '棋牌娱乐', desc: '21点 · 猜拳王' },
        { id: 'shoot', icon: '🎯', name: '射击竞技', desc: '俄式轮盘 · 决斗场' },
        { id: 'casual', icon: '🎲', name: '休闲时光', desc: '生死骰子' }
      ]
    },
    social: {
      title: '👥 社交派对',
      desc: '和朋友们一起玩，笑到肚子疼！',
      games: [
        { id: 'truth', name: '💬 真心话大冒险', desc: '经典的派对游戏', mode: '👥 多人' },
        { id: 'king', name: '👑 国王游戏', desc: '国王的命令必须服从', mode: '👥 多人' },
        { id: 'wheel', name: '🎡 命运转盘', desc: '转出你的命运', mode: '👤 单人' },
        { id: 'western', name: '🔫 西部对决', desc: '快速拔枪，决一胜负', mode: '👫 双人' }
      ]
    },
    puzzle: {
      title: '🧩 益智解谜',
      desc: '动动脑筋，挑战你的智商！',
      games: [
        { id: 'guess', name: '🔢 猜数字', desc: '猜中我心中的数字', mode: '👤 单人' },
        { id: 'riddle', name: '❓ 猜谜语', desc: '看看你能答对几个', mode: '👤 单人' },
        { id: 'memory', name: '🧠 记忆挑战', desc: '记住数字序列', mode: '👤 单人' },
        { id: 'quiz', name: '🤔 知识问答', desc: '5道知识题', mode: '👤 单人' }
      ]
    },
    card: {
      title: '🃏 棋牌娱乐',
      desc: '牌桌上的较量！',
      games: [
        { id: 'blackjack', name: '🃏 21点', desc: '挑战庄家，看谁更接近21', mode: '👤 单人' },
        { id: 'rps', name: '🪨 猜拳王', desc: '三局两胜猜拳', mode: '👫 双人' },
        { id: 'cardwar', name: '🂴 抽牌对决', desc: '抽牌比大小', mode: '👫 双人' },
        { id: 'slot', name: '🎰 老虎机', desc: '拉杆中奖', mode: '👤 单人' }
      ]
    },
    shoot: {
      title: '🎯 射击竞技',
      desc: '扣动扳机，决一胜负！',
      games: [
        { id: 'roulette', name: '💥 俄罗斯轮盘', desc: '6发1弹，敢赌吗', mode: '👥 多人' },
        { id: 'duel', name: '⚔️ 决斗场', desc: '好友1v1回合制对战', mode: '👫 双人' },
        { id: 'shooting', name: '🎯 射击靶场', desc: '5发子弹打靶', mode: '👤 单人' },
        { id: 'reaction', name: '⚡ 反应速度', desc: '测试你的反应', mode: '👤 单人' }
      ]
    },
    casual: {
      title: '🎲 休闲时光',
      desc: '放松一下，随手玩玩',
      games: [
        { id: 'dice', name: '🎲 生死骰子', desc: '猜点数，一把定输赢', mode: '👤 单人' },
        { id: 'lucky', name: '🎪 幸运抽奖', desc: '3次抽奖机会', mode: '👤 单人' },
        { id: 'challenge', name: '🏅 每日挑战', desc: '随机挑战任务', mode: '👤 单人' },
        { id: 'diceduel', name: '🎲 双人骰子', desc: '和朋友比运气', mode: '👫 双人' }
      ]
    },
    ad: {
      title: '📢 广告合作',
      msg: '📢 *广告合作*\n\n欢迎品牌合作、游戏推广、赞助接入！\n\n您的广告可以出现在：\n• 🎮 游戏大厅顶部广告位\n• ⚔️ 决斗场加载页面\n• 🎡 命运转盘结果页\n• 🎲 游戏结果播报中\n\n📞 联系方式：https://t.me/pincess_aoao\n\n期待与您的合作！🤝',
      btn: '📢 广告合作',
      hint: '广告位招商中，点击查看详情'
    },
    contact: {
      title: '📞 联系我们',
      msg: '📞 *联系我们*\n\n有任何建议、反馈或合作意向，欢迎联系！\n\n🆔 Telegram: https://t.me/pincess_aoao\n\n期待听到你的声音！💬',
      btn: '📞 联系我们'
    },
    cat_btn: '🎮 分类游戏',
    game_select: '选一个游戏开始！'
  },

  en: {
    _name: 'English',
    common: { loading: 'Loading...', close: 'Close', retry: 'Try again', back: '🔙 Back to Lobby', social_tag: '👥 Social party games to play with friends' },
    hub: {
      title: '🎮 Game Lobby',
      subtitle: '🎯 Pick a category and have fun!',
      footer: '👇 Tap a category to browse games',
      categories: [
        { id: 'social', icon: '👥', name: 'Party', desc: 'Truth/Dare · King · Wheel' },
        { id: 'puzzle', icon: '🧩', name: 'Puzzle', desc: 'Guess Number · Riddles' },
        { id: 'card', icon: '🃏', name: 'Cards', desc: 'Blackjack · RPS' },
        { id: 'shoot', icon: '🎯', name: 'Shooting', desc: 'Roulette · Duel' },
        { id: 'casual', icon: '🎲', name: 'Casual', desc: 'Dice of Fate' }
      ]
    },
    social: {
      title: '👥 Party Games',
      desc: 'Laugh out loud with friends!',
      games: [
        { id: 'truth', name: '💬 Truth or Dare', desc: 'The classic party game', mode: '👥 Group' },
        { id: 'king', name: '👑 King Game', desc: 'The king commands!', mode: '👥 Group' },
        { id: 'wheel', name: '🎡 Wheel of Fate', desc: 'Spin your destiny', mode: '👤 Solo' },
        { id: 'western', name: '🔫 Western Duel', desc: 'Quick draw showdown', mode: '👫 2P' }
      ]
    },
    puzzle: {
      title: '🧩 Puzzles',
      desc: 'Challenge your brain!',
      games: [
        { id: 'guess', name: '🔢 Guess Number', desc: 'Guess the number', mode: '👤 Solo' },
        { id: 'riddle', name: '❓ Riddles', desc: 'How many can you solve?', mode: '👤 Solo' },
        { id: 'memory', name: '🧠 Memory Challenge', desc: 'Remember the sequence', mode: '👤 Solo' },
        { id: 'quiz', name: '🤔 Quiz', desc: '5 trivia questions', mode: '👤 Solo' }
      ]
    },
    card: {
      title: '🃏 Card Games',
      desc: 'Battle at the table!',
      games: [
        { id: 'blackjack', name: '🃏 Blackjack', desc: 'Beat the dealer at 21', mode: '👤 Solo' },
        { id: 'rps', name: '🪨 RPS King', desc: 'Best of 3 Rock Paper Scissors', mode: '👫 2P' },
        { id: 'cardwar', name: '🂴 Card War', desc: 'Draw cards, higher wins', mode: '👫 2P' },
        { id: 'slot', name: '🎰 Slot Machine', desc: 'Pull the lever!', mode: '👤 Solo' }
      ]
    },
    shoot: {
      title: '🎯 Shooting',
      desc: 'Pull the trigger!',
      games: [
        { id: 'roulette', name: '💥 Russian Roulette', desc: '6 rounds, 1 bullet. Feel lucky?', mode: '👥 Group' },
        { id: 'duel', name: '⚔️ Duel Arena', desc: '1v1 turn-based battle', mode: '👫 2P' },
        { id: 'shooting', name: '🎯 Shooting Range', desc: '5 bullet target practice', mode: '👤 Solo' },
        { id: 'reaction', name: '⚡ Reaction Test', desc: 'Test your reflexes', mode: '👤 Solo' }
      ]
    },
    casual: {
      title: '🎲 Casual',
      desc: 'Relax and have fun',
      games: [
        { id: 'dice', name: '🎲 Dice of Fate', desc: 'Predict the roll', mode: '👤 Solo' },
        { id: 'lucky', name: '🎪 Lucky Draw', desc: '3 chances to win', mode: '👤 Solo' },
        { id: 'challenge', name: '🏅 Daily Challenge', desc: 'Random challenge', mode: '👤 Solo' },
        { id: 'diceduel', name: '🎲 Dice Duel', desc: 'Dice battle with friends', mode: '👫 2P' }
      ]
    },
    ad: {
      title: '📢 Advertise',
      msg: '📢 *Advertise With Us*\n\nWelcome brands, game publishers, and sponsors!\n\nYour ad can appear in:\n• 🎮 Game lobby banner\n• ⚔️ Duel arena loading page\n• 🎡 Wheel of Fate result page\n• 🎲 Game result broadcasts\n\n📞 Contact: https://t.me/pincess_aoao\n\nWe look forward to working with you! 🤝',
      btn: '📢 Advertise',
      hint: 'Sponsorship available, tap for details'
    },
    contact: {
      title: '📞 Contact Us',
      msg: '📞 *Contact Us*\n\nHave feedback, suggestions, or want to collaborate? Reach out!\n\n🆔 Telegram: https://t.me/pincess_aoao\n\nWe would love to hear from you! 💬',
      btn: '📞 Contact Us'
    },
    cat_btn: '🎮 Categories',
    game_select: 'Pick a game to play!'
  }
};

function t(lang, key) {
  if (!lang || !strings[lang]) lang = 'zh';
  const keys = key.split('.');
  let val = strings[lang];
  for (const k of keys) {
    if (val && val[k] !== undefined) val = val[k];
    else return strings['zh'][keys[0]]?.[keys.slice(1).join('.')] || key;
  }
  return val;
}

function detectLang(ctx) {
  const code = (ctx.from?.language_code || '').toLowerCase();
  if (code.startsWith('zh')) return 'zh';
  return 'en';
}

const userPrefs = new Map();
function getUserLang(userId) { return userPrefs.get(userId) || null; }
function setUserLang(userId, lang) { userPrefs.set(userId, lang); }

const SEGMENT_COLORS = ['#e74c3c','#f39c12','#3498db','#9b59b6','#2ecc71','#e67e22','#1abc9c','#e94560'];

module.exports = { strings, t, detectLang, getUserLang, setUserLang, SEGMENT_COLORS };
