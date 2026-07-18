// 🎲 真心话骰子 - Truth Dice
const { v4 } = require("uuid");
const games = new Map();

const TRUTHS_ZH = ["你最近一次撒谎是什么时候？","你最怕什么？","你做过最尴尬的事？","你偷偷喜欢过谁？","你手机里最不想让人看到的App？","你小时候最丢脸的事？","你上一次哭是因为什么？","你最不想让别人知道的秘密？","如果你能改变过去的一件事，是什么？","你最近失眠的原因是什么？"];
const TRUTHS_EN = ["When did you last lie?","What are you most afraid of?","Most embarrassing moment?","Who do you have a crush on?","Most secret app on your phone?","Most shameful childhood memory?","When did you last cry?","What secret do you hide?","One thing you would change about your past?","Why can't you sleep lately?"];

const DARES_ZH = ["模仿一个动物叫声发群里","发你最丑的自拍","用唱歌的语气说话","做10个俯卧撑","把你最后一张照片发群里","用屁股写名字","给你最近联系人发晚安","倒立或劈叉","连续发10个表情包","学一个明星的口头禅"];
const DARES_EN = ["Make an animal sound","Send your worst selfie","Sing your last message","Do 10 pushups","Share last photo","Write name with your butt","Text goodnight to last contact","Try a handstand","Send 10 stickers","Imitate a celebrity"];

const CHALLENGES_ZH = ["一分钟内说出10个水果名","闭眼单脚站立30秒","倒着说出你的名字","用左手写完一句话","屏住呼吸30秒","一分钟内说出5种动物","原地转5圈后走直线","连续说10个不重复的英文单词","用嘴叼笔写字","模仿一个广告台词"];
const CHALLENGES_EN = ["Name 10 fruits in 30s","Stand on one foot 30s","Say your name backwards","Write with your left hand","Hold breath 30s","Name 5 animals in 30s","Spin 5 times walk straight","Say 10 different English words","Write with pen in mouth","Act out a commercial"];

const DICE = ["","⚀","⚁","⚂","⚃","⚄","⚅"];

module.exports = {
  id: "truthdice", name: "🎲 真心话骰子",
  async startPlay(ctx) {
    const lang=(ctx.from?.language_code||"").startsWith("zh")?"zh":"en";
    if(ctx.chat.id>0)return ctx.reply(lang==="zh"?"🎲 *真心话骰子*\n\n把Bot拉进群和朋友一起玩！":"🎲 *Truth Dice*\n\nAdd bot to a group to play!",{parse_mode:"Markdown"});
    const id=v4().slice(0,6);
    games.set(id,{id,chatId:ctx.chat.id,players:[],lang});
    await ctx.reply(lang==="zh"?"🎲 *真心话骰子*\n\n掷骰子决定命运！\n\n1-真心话 2-大冒险 3-真心话\n4-挑战 5-真心话 6-自由选择\n\n点击掷骰！":"🎲 *Truth Dice*\n\nRoll the dice to decide your fate!\n\n1-Truth 2-Dare 3-Truth\n4-Challenge 5-Truth 6-Free\n\nTap to roll!",{parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🎲 "+(lang==="zh"?"掷骰子":"Roll Dice"),callback_data:`game_truthdice_roll_${id}`}],[{text:"👤 "+(lang==="zh"?"换一个人":"Next Player"),callback_data:`game_truthdice_next_${id}`}]]}});
  },
  async handleCallback(ctx,action){
    const parts=action.split("_");const s=parts[0];const rest=parts.slice(1).join("_");
    const un=ctx.from.username||ctx.from.first_name||"Player";
    if(s==="roll"){
      const g=games.get(rest);if(!g)return ctx.answerCbQuery("❌");
      const result=Math.floor(Math.random()*6)+1;
      const die=DICE[result];
      let prompt="",title="";
      if(g.lang==="zh"){
        if(result<=2||result===5){title="💬 真心话";prompt=TRUTHS_ZH[Math.floor(Math.random()*TRUTHS_ZH.length)];}
        else if(result===2){title="🤪 大冒险";prompt=DARES_ZH[Math.floor(Math.random()*DARES_ZH.length)];}
        else if(result===4){title="🔥 挑战";prompt=CHALLENGES_ZH[Math.floor(Math.random()*CHALLENGES_ZH.length)];}
        else{title="🎯 自由选择";prompt="真心话、大冒险或挑战，你自己选！";}
      }else{
        if(result<=2||result===5){title="💬 Truth";prompt=TRUTHS_EN[Math.floor(Math.random()*TRUTHS_EN.length)];}
        else if(result===2){title="🤪 Dare";prompt=DARES_EN[Math.floor(Math.random()*DARES_EN.length)];}
        else if(result===4){title="🔥 Challenge";prompt=CHALLENGES_EN[Math.floor(Math.random()*CHALLENGES_EN.length)];}
        else{title="🎯 Free Choice";prompt="Truth, Dare or Challenge - you choose!";}
      }
      await ctx.editMessageText(g.lang==="zh"?`🎲 *${un}* 掷出了 ${die} ${result}点！\n\n**${title}**\n${prompt}`:`🎲 *${un}* rolled ${die} (${result})!\n\n**${title}**\n${prompt}`,{parse_mode:"Markdown",reply_markup:{inline_keyboard:[[{text:"🎲 "+(g.lang==="zh"?"再掷一次":"Roll Again"),callback_data:`game_truthdice_roll_${g.id}`}],[{text:"👤 "+(g.lang==="zh"?"换一个人":"Next"),callback_data:`game_truthdice_next_${g.id}`}]]}});
      return ctx.answerCbQuery(die);
    }
    if(s==="next"){return this.startPlay(ctx);}
    ctx.answerCbQuery();
  }
};
