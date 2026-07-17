// ❓ 猜谜语 - Riddles (Bilingual)
module.exports = {
  id: 'riddle', name: '❓ 猜谜语',
  async startPlay(ctx) {
    const lang = (ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
    const riddles = lang==='zh' ? [
      {q:'什么东西越洗越脏？',a:'水'},
      {q:'什么东西越削越大？',a:'坑'},
      {q:'什么东西你越给它它越渴？',a:'火'},
      {q:'什么东西有头无脚？',a:'针'},
      {q:'什么东西有嘴不说话？',a:'碗'},
      {q:'什么东西有眼睛看不见？',a:'针眼'},
      {q:'什么东西有翅不能飞？',a:'桌子'},
      {q:'什么东西有脚不能走？',a:'桌子'},
      {q:'什么东西越擦越小？',a:'橡皮'},
      {q:'什么东西不洗不脏？',a:'梳子'},
      {q:'什么东西越老越值钱？',a:'古董'},
      {q:'什么东西越晒越湿？',a:'冰'},
      {q:'三个人一起走，其中一个人说我们两个走后面，这是为什么？',a:'因为他们在排队'},
      {q:'什么东西越剪越长？',a:'路'},
      {q:'什么东西有九个头？',a:'九头鸟'},
      {q:'什么东西越搬越重？',a:'井'},
      {q:'什么东西有四个腿不会走？',a:'桌子'},
      {q:'什么东西有耳朵听不见？',a:'茶杯'},
      {q:'什么东西天亮就出门？',a:'太阳'},
      {q:'什么东西越冷越出汗？',a:'暖气片'},
    ] : [
      {q:'What gets wetter the more it dries?',a:'towel'},
      {q:'What has keys but no locks?',a:'piano'},
      {q:'What can travel around the world while staying in a corner?',a:'stamp'},
      {q:'What has a head and a tail but no body?',a:'coin'},
      {q:'What gets sharper the more you use it?',a:'brain'},
      {q:'What has an eye but cannot see?',a:'needle'},
      {q:'What has a ring but no finger?',a:'phone'},
      {q:'What building has the most stories?',a:'library'},
      {q:'What can you break even if you never pick it up?',a:'promise'},
      {q:'What goes up but never comes down?',a:'age'},
      {q:'What is full of holes but still holds water?',a:'sponge'},
      {q:'What can you keep after giving to someone?',a:'your word'},
      {q:'What has many teeth but cant bite?',a:'comb'},
      {q:'What is always in front of you but cant be seen?',a:'future'},
      {q:'What is so fragile that saying its name breaks it?',a:'silence'},
      {q:'What starts with E, ends with E, and has one letter?',a:'envelope'},
      {q:'What belongs to you but others use it more?',a:'name'},
      {q:'What can fill a room but takes no space?',a:'light'},
      {q:'What is seen in the middle of March and April?',a:'the letter R'},
      {q:'What bank never has any money?',a:'river bank'},
    ];
    const r = riddles[Math.floor(Math.random()*riddles.length)];
    await ctx.reply(
      `❓ *${lang==='zh'?'猜谜语':'Riddle'}*\n\n${r.q}\n\n💡 ${lang==='zh'?'答案是...？':'Whats the answer...?'}`,
      {parse_mode:'Markdown',
        reply_markup:{inline_keyboard:[[
          {text:'💡 '+ (lang==='zh'?'看答案':'Show Answer'),callback_data:`game_riddle_answer_${encodeURIComponent(r.a)}`},
          {text:'❓ '+ (lang==='zh'?'换一个':'Another'),callback_data:'game_riddle_new'}
        ]]}
      }
    );
  },
  async handleCallback(ctx, action) {
    if(action.startsWith('answer_')) {
      const a = decodeURIComponent(action.slice(7));
      const lang = (ctx.from?.language_code||'').startsWith('zh')?'zh':'en';
      const msg = lang==='zh' ? `✅ *答案：* ${a}\n\n你猜对了吗？😄` : `✅ *Answer:* ${a}\n\nDid you get it? 😄`;
      await ctx.editMessageText(msg,{parse_mode:'Markdown',
        reply_markup:{inline_keyboard:[[{text:'❓ '+ (lang==='zh'?'下一个谜语':'Next Riddle'),callback_data:'game_riddle_new'}]]}
      });
      return ctx.answerCbQuery(a);
    }
    if(action==='new')return this.startPlay(ctx);
    ctx.answerCbQuery();
  }
};
