import sys
sys.stdout.reconfigure(encoding="utf-8")

with open("src/utils/i18n.js","r",encoding="utf-8") as f:
    c = f.read()

# The ZH card section with party content (line 43) needs key change: card: -> party:
old = '    card: {\n      title: \uD83C\uDFAA \u6D3E\u5BF9\u793E\u4EA4'
new = '    party: {\n      title: \uD83C\uDFAA \u6D3E\u5BF9\u793E\u4EA4'
c = c.replace(old, new)

# The EN card section (line 97) needs full replacement
old_en = '''    card: {
      title: '\U0001F0CF Card Games',
      desc: 'Battle at the table!',
      games: [
        { id: 'blackjack', name: '\U0001F0CF Blackjack', desc: 'Beat the dealer at 21', mode: '\U0001F464 Solo' },
        { id: 'rps', name: '\U0001FAA8 RPS King', desc: 'Best of 3 Rock Paper Scissors', mode: '\U0001F46B 2P' },
        { id: 'cardwar', name: '\U0001F0B4 Card War', desc: 'Draw cards, higher wins', mode: '\U0001F46B 2P' },
        { id: 'slot', name: '\U0001F3B0 Slot Machine', desc: 'Pull the lever!', mode: '\U0001F464 Solo' }
      ]
    },'''

new_en = '''    party: {
      title: '\U0001F3AA Party Games',
      desc: 'Classic party games with friends!',
      games: [
        { id: 'truth', name: '\U0001F4AC Truth or Dare', desc: 'The classic party game', mode: '\U0001F465 Group' },
        { id: 'wheel', name: '\U0001F3A1 Wheel of Fate', desc: 'Spin your destiny', mode: '\U0001F464 Solo' }
      ]
    },'''

if old_en in c:
    c = c.replace(old_en, new_en)
    print("EN card section replaced")
else:
    print("EN card section NOT FOUND")

with open("src/utils/i18n.js","w",encoding="utf-8") as f:
    f.write(c)
print("Done")
