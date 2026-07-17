// 🃏 21点 - Blackjack (Bilingual, single player vs dealer)
const CARD = ['🂡','🂢','🂣','🂤','🂥','🂦','🂧','🂨','🂩','🂪','🂫','🂭','🂮'];
const CARD_N = [11,2,3,4,5,6,7,8,9,10,10,10,10];
const SUITS = ['♠','♥','♦','♣'];
const games = new Map();

function draw(){return{value:CARD_N[Math.floor(Math.random()*13)],suit:SUITS[Math.floor(Math.random()*4)],face:CARD[Math.floor(Math.random()*13)]}}
function handSum(h){let s=h.reduce((a,c)=>a+c.value,0);let aces=h.filter(c=>c.value===11).length;while(s>21&&aces>0){s-=10;aces--}return s}
function handStr(h){return h.map(c=>c.face).join(' ')+' = '+handSum(h)}

module.exports = {
  id: 'blackjack', name: '🃏 21点',
  async startPlay(ctx) {
    const lang = (ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
    const { v4: uuidv4 } = require('uuid');
    const gameId = uuidv4().slice(0,6);
    const player = [draw(),draw()];
    const dealer = [draw(),draw()];
    games.set(gameId,{id:gameId,player,dealer,lang});

    const ps = handSum(player);
    if(ps===21){
      const msg = lang==='zh' ? `🃏 *21点 - 黑杰克！*\n\n你：${handStr(player)}\n庄家：${handStr(dealer)}\n\n🎉 恭喜你直接赢了！` : `🃏 *Blackjack!*\n\nYou: ${handStr(player)}\nDealer: ${handStr(dealer)}\n\n🎉 You win!`;
      await ctx.reply(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🃏 '+ (lang==='zh'?'再来一局':'Play Again'),callback_data:'game_blackjack_new'}]]}});
      games.delete(gameId);
      return;
    }

    await ctx.reply(
      (lang==='zh'?`🃏 *21点*\n\n你的手牌：${handStr(player)}\n庄家明牌：${dealer[0].face}\n\n要牌还是停牌？`:`🃏 *Blackjack*\n\nYour hand: ${handStr(player)}\nDealer shows: ${dealer[0].face}\n\nHit or Stand?`),
      {parse_mode:'Markdown',
        reply_markup:{inline_keyboard:[[
          {text:'➕ '+ (lang==='zh'?'要牌':'Hit'),callback_data:`game_blackjack_hit_${gameId}`},
          {text:'⏸️ '+ (lang==='zh'?'停牌':'Stand'),callback_data:`game_blackjack_stand_${gameId}`},
        ]]}
      }
    );
  },
  async handleCallback(ctx, action) {
    if(action==='new')return this.startPlay(ctx);
    if(action.startsWith('hit_')||action.startsWith('stand_')){
      const isHit = action.startsWith('hit_');
      const gameId = action.split('_').slice(isHit?1:1).join('_');
      const g = games.get(gameId);
      if(!g)return ctx.answerCbQuery('❌');
      const lang = g.lang;

      if(isHit){
        g.player.push(draw());
        const ps = handSum(g.player);
        if(ps>21){
          const msg = lang==='zh' ? `💥 *爆牌！*\n\n你的手牌：${handStr(g.player)}\n\n😅 超过21点，你输了！` : `💥 *Bust!*\n\nYour hand: ${handStr(g.player)}\n\n😅 Over 21, you lose!`;
          await ctx.editMessageText(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🃏 '+ (lang==='zh'?'再来一局':'Play Again'),callback_data:'game_blackjack_new'}]]}});
          games.delete(gameId);
          return ctx.answerCbQuery('💥');
        }else if(ps===21){
          // Auto stand
          action = 'stand_'+gameId;
          // Fall through to stand handling
        }else{
          await ctx.editMessageText(
            (lang==='zh'?`🃏 *21点*\n\n你的手牌：${handStr(g.player)}\n庄家明牌：${g.dealer[0].face}\n\n继续要牌还是停牌？`:`🃏 *Blackjack*\n\nYour hand: ${handStr(g.player)}\nDealer shows: ${g.dealer[0].face}\n\nHit or Stand?`),
            {parse_mode:'Markdown',reply_markup:{inline_keyboard:[[
              {text:'➕ '+ (lang==='zh'?'要牌':'Hit'),callback_data:`game_blackjack_hit_${gameId}`},
              {text:'⏸️ '+ (lang==='zh'?'停牌':'Stand'),callback_data:`game_blackjack_stand_${gameId}`},
            ]]}}
          );
          return ctx.answerCbQuery('➕');
        }
      }

      if(!isHit||handSum(g.player)===21){
        // Dealer plays
        while(handSum(g.dealer)<17)g.dealer.push(draw());
        const ps = handSum(g.player), ds = handSum(g.dealer);
        let result = '';
        if(ds>21)result = lang==='zh'?'🎉 庄家爆牌，你赢了！':'🎉 Dealer busts, you win!';
        else if(ps>ds)result = lang==='zh'?'🎉 你赢了！':'🎉 You win!';
        else if(ps===ds)result = lang==='zh'?'😐 平局！':'😐 Push!';
        else result = lang==='zh'?'😅 庄家赢了...':'😅 Dealer wins...';
        const msg = lang==='zh'?
          `🃏 *21点 - 结果*\n\n你：${handStr(g.player)}\n庄家：${handStr(g.dealer)}\n\n${result}`:
          `🃏 *Blackjack - Result*\n\nYou: ${handStr(g.player)}\nDealer: ${handStr(g.dealer)}\n\n${result}`;
        await ctx.editMessageText(msg,{parse_mode:'Markdown',reply_markup:{inline_keyboard:[[{text:'🃏 '+ (lang==='zh'?'再来一局':'Play Again'),callback_data:'game_blackjack_new'}]]}});
        games.delete(gameId);
        return ctx.answerCbQuery(result.includes('🎉')?'🎉':'😅');
      }
    }
    ctx.answerCbQuery();
  }
};
