import sys
sys.stdout.reconfigure(encoding="utf-8")
with open("src/utils/result.js","r",encoding="utf-8") as f:
    c = f.read()

# Add invite function before module.exports
c = c.replace(
    "module.exports = { win, lose, draw };",
    "function invite(lang) {\n  return lang === 'zh'\n    ? '\\n\\n\\U0001F3AE \\u6765 @games_lite_bot \\u6311\\u6218\\u6211\\uff01'\n    : '\\n\\n\\U0001F3AE Play at @games_lite_bot!';\n}\n\nmodule.exports = { win, lose, draw };"
)

# Win: add invite before return msg
c = c.replace(
    "Math.floor(Math.random()*6)]);\n    return msg;",
    "Math.floor(Math.random()*6)]);\n    msg += invite(lang);\n    return msg;"
)

# Draw: insert invite inside template literal
c = c.replace(
    "${t.msg}`;\n  }\n};",
    "${t.msg}${invite(lang)}`;\n  }\n};"
)

# Lose: add invite before the last return msg (the one not already modified)
# Find the remaining "return msg;" that's NOT preceded by "msg += invite"
# We can identify it by being followed by "  },\n\n  // Draw message"
import re
# Find the SECOND occurrence of "return msg;"
# After our first replacement, there should be exactly one "return msg;" left (lose function)
# Let's find it and add invite before it
lines = c.split("\n")
for i in range(len(lines)-1, -1, -1):
    if "return msg;" in lines[i] and "invite" not in lines[i-1]:
        lines[i] = "    msg += invite(lang);\n" + lines[i]
        break
c = "\n".join(lines)

with open("src/utils/result.js","w",encoding="utf-8") as f:
    f.write(c)
print("Result.js fixed")
