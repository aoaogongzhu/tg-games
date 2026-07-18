import sys
sys.stdout.reconfigure(encoding="utf-8")

# Read i18n.js by lines
with open("src/utils/i18n.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find insertion points (indices of "    ad: {" lines)
insert_indices = []
for i, line in enumerate(lines):
    if line.strip() == "ad: {" or line.strip().startswith("ad:") and "{" in line:
        insert_indices.append(i)

print("Insert points:", insert_indices)

# ZH challenge section
zh_challenge = [
    "    challenge: {\n",
    "      title: '" + chr(0x1F525) + " 竞技挑战',\n",
    "      desc: '烧脑选择题，命运骰子！',\n",
    "      games: [\n",
    '        { id: \'rather\', name: \'' + chr(0x1F914) + " 你选哪个', desc: '两难选择题', mode: '" + chr(0x1F465) + " 多人' },\n",
    '        { id: \'truthdice\', name: \'' + chr(0x1F3B2) + " 真心话骰子', desc: '掷骰决定你的命运', mode: '" + chr(0x1F465) + " 多人' }\n",
    "      ]\n",
    "    },\n",
]

# EN challenge section
en_challenge = [
    "    challenge: {\n",
    "      title: '" + chr(0x1F525) + " Challenge',\n",
    "      desc: 'Tough choices, fate dice!',\n",
    "      games: [\n",
    '        { id: \'rather\', name: \'' + chr(0x1F914) + " Would You Rather', desc: 'Dilemma voting', mode: '" + chr(0x1F465) + " Group' },\n",
    '        { id: \'truthdice\', name: \'' + chr(0x1F3B2) + " Truth Dice', desc: 'Roll your fate', mode: '" + chr(0x1F465) + " Group' }\n",
    "      ]\n",
    "    },\n",
]

# Insert in reverse order (so indices don't shift)
# EN part is second, ZH part is first
en_idx = insert_indices[1]
zh_idx = insert_indices[0]
for i, line in reversed(list(enumerate(en_challenge))):
    lines.insert(en_idx, line)
for i, line in reversed(list(enumerate(zh_challenge))):
    lines.insert(zh_idx, line)

with open("src/utils/i18n.js", "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Challenge sections inserted at lines", zh_idx, "and", en_idx)
