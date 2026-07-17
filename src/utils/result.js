// 🏆 Achievement Result Helper — 胜利成就感特效
module.exports = {
  // Generate a dramatic win result message
  win(lang, { winner, game, score, stats, isRecord }) {
    const t = lang === 'zh' ? {
      titles: ['🔥 惊天大胜', '💥 碾压全场', '🌟 无人能敌', '👑 加冕为王', '⚡ 势不可挡', '🏆 冠军降临', '🎊 完美胜利', '⭐ 闪耀全场'],
      records: ['🏅 新纪录！', '📈 个人最佳！', '🔥 你燃爆了！', '⭐ 巅峰表现！', '💫 传奇诞生！'],
      winner: '👏 恭喜',
      score: '📊 最终成绩',
      detail: '🏅 详细数据',
      again: '🔄 再来一局',
      statsLabel: '📊 数据统计',
      streak: '🔥 连胜'
    } : {
      titles: ['🔥 Epic Victory', '💥 Total Domination', '🌟 Unstoppable', '👑 Crowned King', '⚡ Legendary', '🏆 Champion', '🎊 Perfect Win', '⭐ Shining Star'],
      records: ['🏅 New Record!', '📈 Personal Best!', '🔥 You Rock!', '⭐ Peak Performance!', '💫 Legend Born!'],
      winner: '👏 Congratulations',
      score: '📊 Final Score',
      detail: '🏅 Stats',
      again: '🔄 Play Again',
      statsLabel: '📊 Statistics',
      streak: '🔥 Win Streak'
    };
    const title = t.titles[Math.floor(Math.random() * t.titles.length)];
    const record = isRecord ? '\n' + t.records[Math.floor(Math.random() * t.records.length)] : '';
    let msg = `🏆 **${title}** 🏆\n\n`;
    msg += `${t.winner} **${winner}**！${record}\n\n`;
    if (game) msg += `🎮 ${game}\n`;
    if (score !== undefined) msg += `${t.score}: **${score}**\n`;
    if (stats) {
      msg += `\n${t.statsLabel}:\n`;
      Object.entries(stats).forEach(([k, v]) => { msg += `  • ${k}: **${v}**\n`; });
    }
    msg += '\n' + (['🔥','💪','🎉','✨','🌟','⭐'][Math.floor(Math.random()*6)]);
    return msg;
  },

  // Lose message (still encouraging)
  lose(lang, { winner, score, stats, closeCall }) {
    const t = lang === 'zh' ? {
      titles: ['💪 下次一定', '😅 差一点点', '🔥 继续加油', '🌟 虽败犹荣', '🎯 再来一次'],
      encourage: ['下次一定能赢！', '已经很棒了！', '继续努力！', '运气下次会更好！']
    } : {
      titles: ['💪 Next Time', '😅 So Close', '🔥 Keep Going', '🌟 Good Effort', '🎯 Try Again'],
      encourage: ['You will get it next time!', 'Great effort!', 'Keep trying!', 'Luck will turn!']
    };
    let msg = `${t.titles[Math.floor(Math.random() * t.titles.length)]}\n\n`;
    if (winner) msg += `${winner} ${t.encourage[Math.floor(Math.random() * t.encourage.length)]}\n`;
    if (score !== undefined) msg += `📊 ${lang === 'zh' ? '得分' : 'Score'}: **${score}**\n`;
    if (stats) {
      Object.entries(stats).forEach(([k, v]) => { msg += `  • ${k}: **${v}**\n`; });
    }
    return msg;
  },

  // Draw message
  draw(lang, { players }) {
    const t = lang === 'zh' ? {
      title: '🤝 旗鼓相当',
      msg: '不相上下！再来一局决胜！'
    } : {
      title: '🤝 Well Matched',
      msg: 'A tie! Play another round to decide!'
    };
    return `🤝 **${t.title}** 🤝\n\n${players ? players.join(' VS ') + '\n' : ''}${t.msg}`;
  }
};
