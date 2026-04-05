import re

# Remove war mode from physics.js
with open('src/physics.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove if-else blocks for war mode
# Pattern: if (currentMode === 'war') { X } else { Y }  ->  Y }
content = re.sub(
    r'if \(currentMode === [\'"]war["\']\) \{ [^}]+ \} else \{ ',
    '{ ',
    content
)

# Simple one-liner war checks - remove the entire statement
content = re.sub(
    r'\s*if \(currentMode === [\'"]war["\']\) \{ [^}]+ \}\s*',
    ' ',
    content
)

# Remove war mode comments and variables
content = re.sub(r'// War mode[^\n]*\n', '', content)
content = re.sub(r'let warTeamSpawns = \[\];?\n', '', content)

with open('src/physics.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Same for bot.js
with open('src/bot.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'if \(currentMode === [\'"]war["\']\) \{ [^}]+ \} else \{ ',
    '{ ',
    content
)
content = re.sub(
    r'\s*if \(currentMode === [\'"]war["\']\) \{ [^}]+ \}\s*',
    ' ',
    content
)

with open('src/bot.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("War mode removed from physics.js and bot.js")
