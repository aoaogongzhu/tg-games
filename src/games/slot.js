// 🎰 老虎机 - Slot Machine (Solo)
const { v4 } = require('uuid');
const result = require('../utils/result');
const games = new Map();

module.exports = {
  id: 'slot', name: '🎰 老虎机',
  async startPlay(ctx) {
    const lang = (ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
    const msg = lang==='zh'?'🎰 *老虎机*\n\n拉动拉杆，三个图案相同即中奖！\n🍒🍒🍒 = 大奖  🍋🍋🍋 = 小奖\n💎💎💎 = 头奖  🎰🎰🎰 = 超级大奖\n\n试试你的运气！':'🎰 *Slot Machine*\n\nPull the lever! Match 3 to win!\n🍒🍒🍒 = Win  🍋🍋🍋 = Small\n💎💎💎 = Jackpot  🎰🎰🎰 = Mega';
    const id = v4().slice(0,6);
    games.set(id,{id,coins:10,lang});
    await ctx.reply(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🎰 '+ (lang==='zh'?'拉杆':'Pull'),callback_data:`game_slot_spin_${id}`}]]}});
  },
  async handleCallback(ctx, action) {
    if(action.startsWith('spin_')){
      const id=action.split('_')[1];const g=games.get(id);if(!g)return ctx.answerCbQuery('❌');
      const slots=['🍒','🍋','💎','🎰','⭐','🔔'];const a=slots[Math.floor(Math.random()*6)],b=slots[Math.floor(Math.random()*6)],c=slots[Math.floor(Math.random()*6)];
      let win=0,msg='';
      if(a===b&&b===c){if(a==='💎'){win=50;msg=g.lang==='zh'?'💎💎💎 头奖！50金币！':'💎💎💎 Jackpot! 50 coins!';}else if(a==='🎰'){win=100;msg=g.lang==='zh'?'🎰🎰🎰 超级大奖！100金币！':'🎰🎰🎰 Mega Jackpot! 100 coins!';}else{win=10;msg=g.lang==='zh'?`${a}${a}${a} 中奖！+10金币`:`${a}${a}${a} Win! +10 coins`;}}
      else if(a===b||b===c||a===c){win=2;msg=g.lang==='zh'?'接近了！+2金币':'Close! +2 coins';}
      else{msg=g.lang==='zh'?'没中，再试一次！':'No luck, try again!';}
      g.coins+=win;
      const stats=g.lang==='zh'?{['金币']:g.coins,['本次']:win>0?'+'+win:'0'}:{Coins:g.coins,Win:win>0?'+'+win:'0'};
      const spinStr=`${a} | ${b} | ${c}`;
      await ctx.editMessageText(
        (g.lang==='zh'?`🎰 *老虎机*\n\n╔══════════╗\n║  ${spinStr}  ║\n╚══════════╝\n\n${msg}`:`🎰 *Slot Machine*\n\n╔══════════╗\n║  ${spinStr}  ║\n╚══════════╝\n\n${msg}`),
        {parse_mode:'Markdown',reply_markup:{inline_keyboard:[[
          {text:'🎰 '+ (g.lang==='zh'?'再拉一次':'Spin Again'),callback_data:`game_slot_spin_${id}`},
          {text:'🏆 '+ (g.lang==='zh'?'结算':'Cash Out'),callback_data:`game_slot_cash_${id}`}
        ]]}}
      );
      return ctx.answerCbQuery(msg);
    }
    if(action.startsWith('cash_')){
      const id=action.split('_')[1];const g=games.get(id);if(!g)return ctx.answerCbQuery('❌');
      const isRecord=g.coins>=50;
      const msg=result.win(g.lang,{winner:ctx.from.username||'Player',game:'🎰 '+(g.lang==='zh'?'老虎机':'Slot Machine'),score:g.coins,isRecord,stats:{[g.lang==='zh'?'最终金币':'Final Coins']:g.coins}});
      await ctx.editMessageText(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🎰 '+ (g.lang==='zh'?'再玩一局':'Play Again'),callback_data:'game_slot_new'}]]}});
      games.delete(id);
      return ctx.answerCbQuery('🏆');
    }
    if(action==='new')return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};
