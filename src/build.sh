#!/bin/bash
cd /home/claude/garba/parts
{ cat 00_head.html; cat 10_core.js 20_geo.js 30_char.js 40_anim.js 50_env_a.js 51_env_b.js 52_env_c.js 60_audio.js 70_vfx.js 80_game.js 90_ui.js; echo '</script></body></html>'; } > ../index.html
cd ..; for f in parts/*.js; do node --check $f 2>&1 | head -5; done
wc -c index.html
