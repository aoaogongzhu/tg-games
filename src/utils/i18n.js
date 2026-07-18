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
    draw: {
      title: '🎨 创意绘画',
      desc: '拿起画笔，让朋友猜你画了什么！',
      games: [
        { id: 'drawguess', name: '🎨 你画我猜', desc: '画图让朋友猜，经典派对游戏', mode: '👥 多人' }
      ]
    },
    spy: {
      title: '🕵️ 推理社交',
      desc: '谁是卧底？考验朋友间的默契！',
      games: [
        { id: 'spy', name: '🕵️ 谁是卧底', desc: '找出隐藏的卧底', mode: '👥 多人' },
        { id: 'friendquiz', name: '🎯 默契考验', desc: '你有多了解你的朋友？', mode: '👥 多人' }
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
    party: {
      title: '🎪 派对社交',
      desc: '经典派对游戏，和朋友一起嗨！',
      games: [
        { id: 'truth', name: '💬 真心话大冒险', desc: '和朋友一起玩火的游戏', mode: '👥 多人' },
        { id: 'wheel', name: '🎡 命运转盘', desc: '转出你的命运', mode: '👤 单人' },
        { id: 'potato', name: '🔥 炸弹传递', desc: '定时炸弹传递游戏', mode: '👥 多人' }
      ]
    },
    challenge: {
      title: '🔥 竞技挑战',
      desc: '烧脑选择题，命运骰子！',
      games: [
        { id: 'rather', name: '🤔 你选哪个', desc: '两难选择题', mode: '👥 多人' },
        { id: 'truthdice', name: '🎲 真心话骰子', desc: '掷骰决定你的命运', mode: '👥 多人' }
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
    draw: {
      title: '🎨 Drawing Games',
      desc: 'Pick up the brush and let friends guess!',
      games: [
        { id: 'drawguess', name: '🎨 Draw & Guess', desc: 'Draw and let friends guess', mode: '👥 Group' }
      ]
    },
    spy: {
      title: '🕵️ Social Deduction',
      desc: 'Find the spy, test your friendship!',
      games: [
        { id: 'spy', name: '🕵️ Who is the Spy', desc: 'Find the hidden spy', mode: '👥 Group' },
        { id: 'friendquiz', name: '🎯 Friend Quiz', desc: 'How well do you know your friends?', mode: '👥 Group' }
      ]
    },
    party: {
      title: '🎪 Party Games',
      desc: 'Classic party games with friends!',
      games: [
        { id: 'truth', name: '💬 Truth or Dare', desc: 'The classic party game', mode: '👥 Group' },
        { id: 'wheel', name: '🎡 Wheel of Fate', desc: 'Spin your destiny', mode: '👤 Solo' },
        { id: 'potato', name: '🔥 Hot Potato', desc: 'Pass the bomb!', mode: '👥 Group' }
      ]
    },
    challenge: {
      title: '🔥 Challenge',
      desc: 'Tough choices, fate dice!',
      games: [
        { id: 'rather', name: '🤔 Would You Rather', desc: 'Dilemma voting', mode: '👥 Group' },
        { id: 'truthdice', name: '🎲 Truth Dice', desc: 'Roll your fate', mode: '👥 Group' }
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

