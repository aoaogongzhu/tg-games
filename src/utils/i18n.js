// ─── i18n Module — 中文 / English ────────────────────────────────
// Central translation hub for all 5 games + bot messages.

const strings = {
  zh: {
    _name: '中文',
    common: {
      loading: '加载中...',
      close: '关闭',
      retry: '再试一次',
      social_tag: '👥 和朋友一起玩的社交游戏'
    },
    hub: {
      title: '🎮 游戏大厅',
      subtitle: '选择一个游戏，和朋友一起嗨！',
      lang_hint: '🌐 语言',
      lang_switch: 'English',
      games: [
        { name: '⚔️ 决斗场', desc: '好友 1v1 回合制对战，约 30 秒一局' },
        { name: '🪨 猜拳王', desc: '三局两胜猜拳，谁才是拳王？' },
        { name: '🎲 生死骰子', desc: '猜点数，一把定输赢' },
        { name: '💬 真心话大冒险', desc: '和朋友一起玩点火的游戏' },
        { name: '🎡 命运转盘', desc: '转出你的命运，看看今天运气如何' }
      ],
      footer: '👇 点击按钮开始游戏\n🌐 点击语言按钮切换中英文'
    },
    duel: {
      name: '⚔️ 决斗场',
      attack: '⚔️ 攻击',
      defend: '🛡️ 防御',
      heal: '💚 治疗',
      atk_desc: '造成 3 伤害',
      def_desc: '伤害减半',
      heal_desc: '恢复 2 HP',
      challenge: '发起了决斗挑战！',
      challenge_hint: '30秒内点击接受！',
      accept: '⚔️ 接受挑战',
      cancel: '❌ 取消',
      cant_self: '不能和自己决斗',
      enter_battle: '⚔️ 进入战场',
      started: '⚔️ 决斗开始！{p1} VS {p2}',
      spectate: '⚔️ *{p1}* VS *{p2}* 的决斗已经开始！快来观战！',
      your_turn: '你的决斗已开始！点击进入战场：',
      wait_turn: '第 {n} 回合 · 你的回合',
      wait_opponent: '第 {n} 回合 · 等待对手...',
      submitted: '已选择 {action}，等待对手...',
      round_result: '第 {n} 回合结果',
      round_broadcast: '*第 {n} 回合*\n{log}\n\n{p1}: {hp1} HP | {p2}: {hp2} HP',
      win: '🏆 {winner} 赢得了决斗！',
      lose: '败北...',
      draw: '🤯 平局！',
      draw_broadcast: '🤯 *平局！*\n\n{p1}: {hp1} HP\n{p2}: {hp2} HP',
      win_broadcast: '🏆 *{winner}* 赢得决斗！\n\n{loser}: {hp1} HP\n{winner}: {hp2} HP',
      log_attack_attack: '⚔️ 双方对砍！',
      log_attack_defend: '🛡️ 攻击被挡住了！',
      log_attack_heal: '⚡ 攻击打断了治疗！',
      log_defend_defend: '🛡️🛡️ 互相防御，无事发生',
      log_defend_heal: '💚 趁机恢复！',
      log_heal_heal: '💚💚 互相恢复',
      screenshot_hint: '📸 截图分享给朋友',
      total_rounds: '共 {n} 回合'
    },
    rps: {
      name: '🪨 猜拳王',
      title: '🪨 猜拳王 — 三局两胜',
      challenge: '发起了猜拳挑战！',
      accept: '🪨 接受挑战',
      enter: '出拳！',
      rock: '🪨 石头',
      paper: '📄 布',
      scissors: '✂️ 剪刀',
      round_title: '🪨 第 {n} 局结果',
      round_result: '{p1}: {c1}\n{p2}: {c2}',
      tie: '😐 平局！',
      round_win: '🏆 {winner} 赢了这一局！',
      score: '📊 比分: {p1} {s1} - {s2} {p2}',
      match_win: '🎉 *{winner} 赢得了比赛！*',
      next_round: '第 {n} 局，出拳！',
      waiting: '⏳ 等待出拳...（{n}/2）',
      waiting_opponent: '已出拳，等待对手...'
    },
    dice: {
      name: '🎲 生死骰子',
      title: '🎲 *生死骰子*\n\n机器人会掷一个骰子（1-6），猜中是赢家！',
      guess: '🎲 {n}',
      result: '🎲 *生死骰子*\n\n{player} 猜了 *{guess}* {emoji}\n\n结果：*{result}* {dice}\n\n{outcome}',
      win: '🎉 *猜中了！真正的赌神！*',
      lose: '😅 *没中，下次再来！*',
      retry: '🎲 再掷一次',
      outcome_win: '🎉 中了！',
      outcome_lose: '😅 没中'
    },
    truth: {
      name: '💬 真心话大冒险',
      title: '💬 真心话大冒险\n\n和朋友一起玩火的游戏！',
      truth: '💬 真心话',
      dare: '🤪 大冒险',
      truth_msg: '💬 *{player}* 选择了真心话！\n\n❓ {question}',
      dare_msg: '🤪 *{player}* 选择了大冒险！\n\n🔥 {challenge}',
      next: '🎯 下一个',
      shuffle: '🔄 换一个',
      truth_hint: '说出你的秘密！',
      dare_hint: '做不到要接受惩罚哦！',
      truths: [
        '你最近一次撒谎是什么时候？讲了什么谎？',
        '你对在座的哪个人有过好感？',
        '你手机里最不想让别人看到的 App 是什么？',
        '你做过最尴尬的事情是什么？',
        '你上一次哭是因为什么？',
        '你偷偷搜过自己的名字吗？',
        '如果可以和一个名人互换身份一天，你想换谁？',
        '你微信里最不想让对象看到的聊天记录是谁的？',
        '你做过最后悔的决定是什么？',
        '你现在最想要什么东西？',
        '你曾经偷偷拿过别人的东西吗？',
        '你洗澡的时候做过什么奇怪的事？',
        '你最怕别人知道你的什么秘密？',
        '你上一次说"我爱你"是什么时候，对谁？',
        '如果你现在变成异性，第一件事想做什么？'
      ],
      dares: [
        '模仿一种动物的叫声发到群里',
        '把你手机最后一张照片发到群里',
        '用你最囧的语音说"我是小猪"发到群里',
        '连续发10个不同表情包到群里',
        '把你的微信签名改成"我爱(左边人的名字)"一天',
        '给你最近聊天的人发一句"我喜欢你"',
        '用唱歌的语调发一句语音到群里',
        '把你搜索记录截屏发到群里',
        '做一个你最丑的自拍发到群里',
        '用屁股写自己的名字',
        '吃一口你身边最奇怪的东西',
        '给爸妈发一句"我中彩票了"',
        '把你的手机给右边的人玩30秒',
        '做10个俯卧撑',
        '倒立或者劈叉'
      ]
    },
    wheel: {
      name: '🎡 命运转盘',
      title: '🎡 命运转盘',
      subtitle: '转一下，看看你的命运',
      spin: '🎡 转动转盘',
      spin_again: '🎡 再转一次',
      spinning: '🎡 转动中...',
      history: '历史记录',
      hint: '命运掌握在你手中',
      segments: [
        { label: '🎉 超级大奖', desc: '🎊 今天运气爆棚！' },
        { label: '💰 发点小财', desc: '💵 小赚一笔，开心一下' },
        { label: '😅 再来一次', desc: '🔄 命运说：再来一次' },
        { label: '💔 小小惩罚', desc: '😭 接受惩罚吧！' },
        { label: '🎁 惊喜礼物', desc: '🎁 看看有什么惊喜' },
        { label: '😈 恶作剧', desc: '👻 搞个恶作剧吧' },
        { label: '💤 休息一下', desc: '😴 该休息了～' },
        { label: '🔥 好运连连', desc: '✨ 好运正在路上' }
      ]
    }
  },

  en: {
    _name: 'English',
    common: {
      loading: 'Loading...',
      close: 'Close',
      retry: 'Try again',
      social_tag: '👥 Social party games to play with friends'
    },
    hub: {
      title: '🎮 Game Lobby',
      subtitle: 'Pick a game and have fun with friends!',
      lang_hint: '🌐 Language',
      lang_switch: '中文',
      games: [
        { name: '⚔️ Duel Arena', desc: '1v1 turn-based battle, ~30s per game' },
        { name: '🪨 RPS King', desc: 'Best of 3 Rock Paper Scissors' },
        { name: '🎲 Dice of Fate', desc: 'Predict the roll, win or lose in one go' },
        { name: '💬 Truth or Dare', desc: 'The classic party game' },
        { name: '🎡 Wheel of Fate', desc: 'Spin the wheel and see your destiny' }
      ],
      footer: '👇 Tap a game to start\n🌐 Tap language button to switch'
    },
    duel: {
      name: '⚔️ Duel Arena',
      attack: '⚔️ Attack',
      defend: '🛡️ Defend',
      heal: '💚 Heal',
      atk_desc: 'Deals 3 damage',
      def_desc: 'Halves incoming damage',
      heal_desc: 'Restores 2 HP',
      challenge: 'challenged you to a duel!',
      challenge_hint: 'Accept within 30 seconds!',
      accept: '⚔️ Accept',
      cancel: '❌ Cancel',
      cant_self: 'Cannot duel yourself',
      enter_battle: '⚔️ Enter Battle',
      started: '⚔️ Duel started! {p1} VS {p2}',
      spectate: '⚔️ *{p1}* VS *{p2}* started! Come watch!',
      your_turn: 'Your duel has started! Click to enter:',
      wait_turn: 'Round {n} · Your turn',
      wait_opponent: 'Round {n} · Waiting for opponent...',
      submitted: 'Chose {action}, waiting for opponent...',
      round_result: 'Round {n} Result',
      round_broadcast: '*Round {n}*\n{log}\n\n{p1}: {hp1} HP | {p2}: {hp2} HP',
      win: '🏆 {winner} won the duel!',
      lose: 'Defeated...',
      draw: '🤯 Draw!',
      draw_broadcast: '🤯 *Draw!*\n\n{p1}: {hp1} HP\n{p2}: {hp2} HP',
      win_broadcast: '🏆 *{winner}* won!\n\n{loser}: {hp1} HP\n{winner}: {hp2} HP',
      log_attack_attack: '⚔️ Both attacked!',
      log_attack_defend: '🛡️ Attack blocked!',
      log_attack_heal: '⚡ Attack interrupted healing!',
      log_defend_defend: '🛡️🛡️ Both defended, nothing happened',
      log_defend_heal: '💚 Took time to recover!',
      log_heal_heal: '💚💚 Both recovered',
      screenshot_hint: '📸 Screenshot and share with friends',
      total_rounds: '{n} rounds total'
    },
    rps: {
      name: '🪨 RPS King',
      title: '🪨 RPS King — Best of 3',
      challenge: 'challenged you to RPS!',
      accept: '🪨 Accept',
      enter: 'Make your move!',
      rock: '🪨 Rock',
      paper: '📄 Paper',
      scissors: '✂️ Scissors',
      round_title: '🪨 Round {n} Result',
      round_result: '{p1}: {c1}\n{p2}: {c2}',
      tie: '😐 Tie!',
      round_win: '🏆 {winner} wins this round!',
      score: '📊 Score: {p1} {s1} - {s2} {p2}',
      match_win: '🎉 *{winner} wins the match!*',
      next_round: 'Round {n}, make your move!',
      waiting: '⏳ Waiting for moves... ({n}/2)',
      waiting_opponent: 'Move submitted, waiting for opponent...'
    },
    dice: {
      name: '🎲 Dice of Fate',
      title: '🎲 *Dice of Fate*\n\nI will roll a die (1-6). Guess right and win!',
      guess: '🎲 {n}',
      result: '🎲 *Dice of Fate*\n\n{player} guessed *{guess}* {emoji}\n\nResult: *{result}* {dice}\n\n{outcome}',
      win: '🎉 *Correct! You are the true gambler!*',
      lose: '😅 *Missed it, try again!*',
      retry: '🎲 Roll Again',
      outcome_win: '🎉 Correct!',
      outcome_lose: '😅 Missed'
    },
    truth: {
      name: '💬 Truth or Dare',
      title: '💬 Truth or Dare\n\nThe classic party game with friends!',
      truth: '💬 Truth',
      dare: '🤪 Dare',
      truth_msg: '💬 *{player}* chose Truth!\n\n❓ {question}',
      dare_msg: '🤪 *{player}* chose Dare!\n\n🔥 {challenge}',
      next: '🎯 Next',
      shuffle: '🔄 Another',
      truth_hint: 'Spill your secrets!',
      dare_hint: 'No backing out!',
      truths: [
        'When was the last time you lied? What was it?',
        'Who in this chat do you have a crush on?',
        'What is the most embarrassing app on your phone?',
        'What is the most awkward thing you have ever done?',
        'When was the last time you cried? Why?',
        'Have you ever Googled your own name?',
        'If you could swap lives with a celebrity for a day, who?',
        'What is the most embarrassing search in your history?',
        'What is your biggest regret?',
        'What is the one thing you want right now?',
        'Have you ever taken something that wasnt yours?',
        'What weird thing do you do in the shower?',
        'What secret are you most afraid of people finding out?',
        'When was the last time you said I love you? To who?',
        'If you woke up as the opposite gender tomorrow, whats the first thing you would do?'
      ],
      dares: [
        'Send a voice note imitating an animal to the chat',
        'Share the last photo on your phone to the chat',
        'Send "I am a cute piggy" as a voice message',
        'Send 10 different stickers in a row to the chat',
        'Change your bio to "I love (the person on your left)" for a day',
        'Send "I like you" to your most recent chat',
        'Sing a song and send it as a voice message',
        'Screenshot your search history and share it',
        'Take your ugliest selfie and post it',
        'Write your name in the air with your butt',
        'Eat the weirdest thing within arms reach',
        'Text your parents "I won the lottery!"',
        'Hand your phone to the person on your right for 30 seconds',
        'Do 10 pushups right now',
        'Try to do a handstand or split'
      ]
    },
    wheel: {
      name: '🎡 Wheel of Fate',
      title: '🎡 Wheel of Fate',
      subtitle: 'Spin it and see your destiny',
      spin: '🎡 Spin the Wheel',
      spin_again: '🎡 Spin Again',
      spinning: '🎡 Spinning...',
      history: 'History',
      hint: 'Destiny awaits',
      segments: [
        { label: '🎉 Jackpot', desc: '🎊 Lucky day!' },
        { label: '💰 Small Win', desc: '💵 A little treat for you' },
        { label: '😅 One More', desc: '🔄 Fate says: try again' },
        { label: '💔 Punishment', desc: '😭 Accept your fate!' },
        { label: '🎁 Surprise', desc: '🎁 A nice surprise awaits' },
        { label: '😈 Prank', desc: '👻 Time for a prank' },
        { label: '💤 Take a Break', desc: '😴 Time to rest~' },
        { label: '🔥 Lucky Streak', desc: '✨ Good luck is coming' }
      ]
    }
  }
};

// Get translated string by language key
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

// Detect user language from Telegram context
function detectLang(ctx) {
  const code = (ctx.from?.language_code || '').toLowerCase();
  if (code.startsWith('zh')) return 'zh';
  return 'en';
}

// Language preference store
const userPrefs = new Map();
function getUserLang(userId) { return userPrefs.get(userId) || null; }
function setUserLang(userId, lang) { userPrefs.set(userId, lang); }

// Canvas-based icons for wheel segments - colors only (emojis are handled in HTML)
const SEGMENT_COLORS = ['#e74c3c','#f39c12','#3498db','#9b59b6','#2ecc71','#e67e22','#1abc9c','#e94560'];

module.exports = { strings, t, detectLang, getUserLang, setUserLang, SEGMENT_COLORS };
