#!/bin/bash
# Hook: PreToolUse voor Edit/Write
# Doel: Herinner Claude aan de workflow (soft check)

# Lees input van stdin
INPUT=$(cat)

# Log voor debugging (optioneel)
# echo "$INPUT" >> "$CLAUDE_PROJECT_DIR/.claude/hooks/hook-log.txt"

# Output reminder context
cat << 'EOF'
{
  "additionalContext": "WORKFLOW CHECK: Heb je Fase 1 (docs citeren) en Fase 2 (plan + approval) doorlopen? Zie CLAUDE.md voor de verplichte workflow."
}
EOF

# Exit 0 = toestaan (maar met reminder)
# Exit 2 = blokkeren (te streng voor nu)
exit 0
