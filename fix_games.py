import sys, os
sys.stdout.reconfigure(encoding="utf-8")

games_to_fix = {
    "western.js": {"start_private_pattern": 'if(ctx.chat.id>0)return ctx.reply(lang==="zh"?', "game_icon": "\U0001f52b", "game_name": "\u897f\u90e8\u5bf9\u51b3", "accept_action": "game_western_accept2_", "cancel_action": "game_western_cancel_", "fire_action": "game_western_fire_", "new_action": "game_western_new"},
    "cardwar.js": {"start_private_pattern": 'if(ctx.chat.id>0)return ctx.reply(lang==="zh"?', "game_icon": "\U0001f0b4", "game_name": "\u62bd\u724c\u5bf9\u51b3", "accept_action": "game_cardwar_accept2_", "cancel_action": "game_cardwar_cancel_", "new_action": "game_cardwar_new"},
    "diceduel.js": {"start_private_pattern": 'if(ctx.chat.id>0)return ctx.reply(lang==="zh"?', "game_icon": "\U0001f3b2", "game_name": "\u53cc\u4eba\u9ab0\u5b50", "accept_action": "game_diceduel_accept2_", "cancel_action": "game_diceduel_cancel_", "new_action": "game_diceduel_new"},
    "roulette.js": {"start_private_pattern": 'if(ctx.chat.id>0)return ctx.reply(lang==="zh"?', "game_icon": "\U0001f4a5", "game_name": "\u4fc4\u7f57\u65af\u8f6e\u76d8", "accept_action": "game_roulette_join_", "cancel_action": "game_roulette_cancel_", "new_action": "game_roulette_new"},
}

for fname, config in games_to_fix.items():
    path = os.path.join("src/games", fname)
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    # Find the line with the private chat pattern
    found = False
    for i, line in enumerate(lines):
        stripped = line.strip()
        if config["start_private_pattern"] in stripped:
            found = True
            icon = config["game_icon"]
            gname = config["game_name"]
            accept = config["accept_action"]
            cancel = config["cancel_action"]
            # Replace the line with the new forwardable challenge code
            lines[i] = f'    if(ctx.chat.id>0){{\n    const cid=v4().slice(0,6);\n    games.set(cid,{{id:cid,chatId:0,challenger:{{id:ctx.from.id,username:ctx.from.username||"Player"}},players:[{{id:ctx.from.id,username:ctx.from.username||"Player"}}],status:"waiting",lang,isOpen:true}});\n    return ctx.reply(\n      (lang==="zh"?`{icon} *${{ctx.from.username||"Player"}}* 发起了{gname}！\\n\\n转发给朋友或发到群里，对方点击接受即可对战！\\n\\n⏰ 60秒有效`:`{icon} *${{ctx.from.username||"Player"}}* challenged you!\\n\\nForward to a friend or group to play!\\n\\n⏰ Valid 60s`),\n      {{parse_mode:"Markdown",reply_markup:{{inline_keyboard:[[{{text:"{icon} "+(lang==="zh"?"接受挑战":"Accept"),callback_data:`{accept}${{cid}}`}}],[{{text:"❌",callback_data:`{cancel}${{cid}}`}}]]}}}}\n    )\n  }}\n'
            # Skip the next few lines (the old multiline reply) - find the closing ) of the reply
            # Look for the semicolon on a line by itself
            skip_start = i + 1
            for j in range(skip_start, min(skip_start + 20, len(lines))):
                if ");" in lines[j] or "})" == lines[j].strip():
                    # Delete lines from i+1 to j
                    del lines[i+1:j+1]
                    break
            break
    
    if not found:
        print(f"{fname}: start_private_pattern not found, trying to add challenge code manually")
    
    # Find cancel handler and add accept2 handler before it (for western, cardwar, diceduel)
    if fname in ["western.js", "cardwar.js", "diceduel.js"]:
        cancel_found = False
        for i, line in enumerate(lines):
            if "if(s==='cancel')" in line.strip():
                cancel_found = True
                # Build accept2 handler
                icon = config["game_icon"]
                accept_handler_code = f"""  if(s==='accept2'){{
    const cg=games.get(id);
    if(!cg||!cg.isOpen)return ctx.answerCbQuery('❌');
    if(ctx.from.id===cg.challenger.id)return ctx.answerCbQuery('❌');
    const ngid=v4().slice(0,6);
    games.set(ngid,{{...cg,id:ngid,chatId:ctx.chat.id,players:[cg.challenger,{{id:ctx.from.id,username:ctx.from.username||'Player'}}],status:'playing'}});
    games.delete(id);
    const gg=games.get(ngid);
    if(!gg)return ctx.answerCbQuery('❌');
"""
                if fname == "western.js":
                    accept_handler_code += f"""    await ctx.editMessageText(gg.lang==='zh'?'{icon} *对决开始！*\\n\\n⏳ 3...':'{icon} *Duel!*\\n\\n⏳ 3...',{{parse_mode:'Markdown'}});
    setTimeout(async()=>{{try{{if(!games.has(ngid))return;await ctx.editMessageText('⏳ 2...');}}catch(e){{}}}},1000);
    setTimeout(async()=>{{try{{if(!games.has(ngid))return;await ctx.editMessageText('⏳ 1...');}}catch(e){{}}}},2000);
    setTimeout(async()=>{{try{{if(!games.has(ngid))return;await ctx.editMessageText(gg.lang==='zh'?'{icon} *开枪！* 先按下按钮的人获胜！':'{icon} *FIRE!* First to press wins!',{{parse_mode:'Markdown',reply_markup:{{inline_keyboard:[[{{text:'{icon} '+(gg.lang==='zh'?'开枪！':'FIRE!'),callback_data:`{config["fire_action"]}${{ngid}}`}}]]}}}});
      gg.fireTime=Date.now()+2000;}}catch(e){{}}}},3000);
    setTimeout(async()=>{{try{{if(!games.has(ngid)||gg.winner)return;await ctx.editMessageText(gg.lang==='zh'?'⏰ 时间到！平局！':'⏰ Time up! Draw!',{{reply_markup:{{inline_keyboard:[[{{text:'{icon} '+(gg.lang==='zh'?'再来一局':'Rematch'),callback_data:'{config["new_action"]}'}}]]}}}});games.delete(ngid);}}catch(e){{}}}},5000);
    return ctx.answerCbQuery('{icon}');
  }}

"""
                elif fname == "cardwar.js":
                    accept_handler_code += f"""    const cards=['🂢','🂣','🂤','🂥','🂦','🂧','🂨','🂩','🂪','🂫','🂭','🂮','🂡'];
    const vals=[2,3,4,5,6,7,8,9,10,11,12,13,14];
    const cc1=cards[Math.floor(Math.random()*13)],cc2=cards[Math.floor(Math.random()*13)];
    const v1=vals[cards.indexOf(cc1)],v2=vals[cards.indexOf(cc2)];
    const r=require('./utils/result');
    let msg;
    if(v1>v2)msg=r.win(gg.lang,{{winner:gg.players[0].username+' {icon}',game:'{icon} '+(gg.lang==='zh'?'抽牌对决':'Card War'),stats:{{[gg.players[0].username]:cc1+'('+v1+')',[gg.players[1].username]:cc2+'('+v2+')'}}}});
    else if(v2>v1)msg=r.win(gg.lang,{{winner:gg.players[1].username+' {icon}',game:'{icon} '+(gg.lang==='zh'?'抽牌对决':'Card War'),stats:{{[gg.players[0].username]:cc1+'('+v1+')',[gg.players[1].username]:cc2+'('+v2+')'}}}});
    else msg=r.draw(gg.lang,{{players:[gg.players[0].username,gg.players[1].username]}});
    await ctx.editMessageText(msg,{{parse_mode:'Markdown',reply_markup:{{inline_keyboard:[[{{text:'{icon} '+(gg.lang==='zh'?'再战一局':'Rematch'),callback_data:'{config["new_action"]}'}}]]}}}});
    games.delete(ngid);
    return ctx.answerCbQuery('{icon}');
  }}

"""
                elif fname == "diceduel.js":
                    accept_handler_code += f"""    const r1a=Math.floor(Math.random()*6)+1,r1b=Math.floor(Math.random()*6)+1,t1=r1a+r1b;
    const r2a=Math.floor(Math.random()*6)+1,r2b=Math.floor(Math.random()*6)+1,t2=r2a+r2b;
    const dice=['⚀','⚁','⚂','⚃','⚄','⚅'];
    const r=require('./utils/result');
    let msg;
    if(t1>t2)msg=r.win(gg.lang,{{winner:gg.players[0].username+' {icon}',game:'{icon} '+(gg.lang==='zh'?'双人骰子':'Dice Duel'),stats:{{[gg.players[0].username]:dice[r1a-1]+dice[r1b-1]+'='+t1,[gg.players[1].username]:dice[r2a-1]+dice[r2b-1]+'='+t2}}}});
    else if(t2>t1)msg=r.win(gg.lang,{{winner:gg.players[1].username+' {icon}',game:'{icon} '+(gg.lang==='zh'?'双人骰子':'Dice Duel'),stats:{{[gg.players[0].username]:dice[r1a-1]+dice[r1b-1]+'='+t1,[gg.players[1].username]:dice[r2a-1]+dice[r2b-1]+'='+t2}}}});
    else msg=r.draw(gg.lang,{{players:[gg.players[0].username,gg.players[1].username]}});
    await ctx.editMessageText(msg,{{parse_mode:'Markdown',reply_markup:{{inline_keyboard:[[{{text:'{icon} '+(gg.lang==='zh'?'再来一局':'Rematch'),callback_data:'{config["new_action"]}'}}]]}}}});
    games.delete(ngid);
    return ctx.answerCbQuery('{icon}');
  }}

"""
                lines.insert(i, accept_handler_code)
                print(f"{fname}: added accept2 handler")
                break
        
        if not cancel_found:
            print(f"{fname}: cancel handler not found")
    
    # Write the modified content back
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(lines)
    print(f"{fname}: saved")

# Fix duel.js separately
duel_path = "src/games/duel.js"
with open(duel_path, "r", encoding="utf-8") as f:
    d = f.read()
d = d.replace("chatId: challenge.chatId", "chatId: ctx.chat.id")
# Add forwarded challenge handler
old = "if (action === 'challenge')"
new = """if (action.startsWith('challenge_')) {
      const challengeId = action.slice(10);
      const challenge = challenges.get(challengeId);
      if (!challenge) return ctx.answerCbQuery('❌', { show_alert: true });
      if (userId === challenge.challenger.id) return ctx.answerCbQuery('不能和自己决斗', { show_alert: true });
      challenges.delete(challengeId);
      const gameId = uuidv4().slice(0, 8);
      const game = {
        id: gameId, chatId: ctx.chat.id, lang: challenge.challenger.lang || lang, turn: 1, status: 'playing', winner: null, log: [],
        players: {
          [challenge.challenger.id]: { id: challenge.challenger.id, username: challenge.challenger.username, hp: 8, action: null, lang: challenge.challenger.lang },
          [userId]: { id: userId, username, hp: 8, action: null, lang: lang }
        },
        order: [challenge.challenger.id, userId]
      };
      games.set(gameId, game);
      const url = process.env.APP_URL + '/duel.html?gameId=' + gameId + '&p1=' + challenge.challenger.id + '&p2=' + userId + '&lang=' + lang;
      try { await ctx.editMessageText((lang === 'zh' ? '⚔️ 决斗开始！' : '⚔️ Duel started!') + ' ' + challenge.challenger.username + ' VS ' + username, { parse_mode: 'Markdown' }); } catch(e) {}
      for (const pid of [challenge.challenger.id, userId]) {
        try {
          const pl = pid === challenge.challenger.id ? (challenge.challenger.lang || lang) : lang;
          await ctx.telegram.sendMessage(pid, lang === 'zh' ? '你的决斗已开始！点击进入战场：' : 'Your duel has started! Click to enter:', {
            reply_markup: { inline_keyboard: [[{ text: '⚔️ ' + (lang === 'zh' ? '进入战场' : 'Enter Battle'), web_app: { url: url + '&lang=' + pl } }]] }
          });
        } catch(e) {}
      }
      return ctx.answerCbQuery('✅');
    }

    if (action === 'challenge')"""
d = d.replace(old, new)
with open(duel_path, "w", encoding="utf-8") as f:
    f.write(d)
print("duel.js: updated")

# Fix rps.js startPlay private chat
rps_path = "src/games/rps.js"
with open(rps_path, "r", encoding="utf-8") as f:
    r = f.read()
# Replace the private chat info with a forwardable challenge
old_rps = "if (ctx.chat.id > 0) {\n      return ctx.reply(`${i18n.t(lang,'rps.title')}\\n\\n${i18n.t(lang,'common.social_tag')}`, {\n        reply_markup: { inline_keyboard: [[{ text: '🆕 ' + i18n.t(lang,'rps.accept'), callback_data: 'game_rps_challenge' }]] }\n      });\n    }"
new_rps = """if (ctx.chat.id > 0) {
      const challengeId = uuidv4().slice(0, 6);
      const g = { id: challengeId, challenger: { id: ctx.from.id, username: ctx.from.username || 'Player', lang }, chatId: 0, status: 'waiting', isOpen: true };
      games.set(challengeId, g);
      return ctx.reply(
        (lang === 'zh' ? `🪨 *${ctx.from.username || 'Player'}* 发起了猜拳挑战！\\n\\n转发给朋友或发到群里，对方点击接受即可对战！\\n\\n⏰ 60秒有效` : `🪨 *${ctx.from.username || 'Player'}* challenged you to RPS!\\n\\nForward to a friend or group to play!\\n\\n⏰ Valid 60s`),
        { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: '🪨 ' + (lang === 'zh' ? '接受挑战' : 'Accept'), callback_data: 'game_rps_challenge_' + challengeId }], [{ text: '❌', callback_data: 'game_rps_cancel_' + challengeId }]] } }
      );
    }"""
r = r.replace(old_rps, new_rps)

# Add handler for forwarded challenge in rps
old_accept = "if (action.startsWith('accept_'))"
new_accept = """if (action.startsWith('challenge_')) {
      const chId = action.slice(10);
      const ch = games.get(chId);
      if (!ch || !ch.isOpen) return ctx.answerCbQuery('❌', { show_alert: true });
      if (userId === ch.challenger.id) return ctx.answerCbQuery('不能和自己玩', { show_alert: true });
      const oppLang = i18n.getUserLang(userId) || i18n.detectLang(ctx);
      ch.opponent = { id: userId, username, lang: oppLang };
      ch.state = {}; ch.scores = {}; ch.round = 1; ch.status = 'playing';
      ch.state[ch.challenger.id] = null; ch.state[userId] = null;
      ch.scores[ch.challenger.id] = 0; ch.scores[userId] = 0;
      await ctx.editMessageText('🪨 ' + ch.challenger.username + ' VS ' + username);
      // This game is in the current chat (forwarded)
      ch.chatId = ctx.chat.id;
      for (const p of [ch.challenger, ch.opponent]) {
        const pLang = p.lang || lang;
        try { await ctx.telegram.sendMessage(p.id, '出拳！', {
          reply_markup: { inline_keyboard: [[
            { text: '🪨 石头', callback_data: 'game_rps_move_' + ch.id + '_' + p.id + '_rock' },
            { text: '📄 布', callback_data: 'game_rps_move_' + ch.id + '_' + p.id + '_paper' },
            { text: '✂️ 剪刀', callback_data: 'game_rps_move_' + ch.id + '_' + p.id + '_scissors' }
          ]]}
        }); } catch(e) {}
      }
      return ctx.answerCbQuery('✅');
    }

    if (action.startsWith('accept_'))"""
r = r.replace(old_accept, new_accept)
with open(rps_path, "w", encoding="utf-8") as f:
    f.write(r)
print("rps.js: updated")

print("\\n=== ALL DONE ===")
