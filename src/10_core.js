/*Copyright (c) 2026 MANTHAN VINZUDA

All rights reserved.

This source code is provided for viewing purposes only.
You may not copy, modify, distribute, sublicense, or use
this code or substantial portions of it without permission.*/

"use strict";
/* =====================================================================
   NAVRATRI GARBA – JAI MAA AMBE  (single-file WebGL game)
   Sections: 1 Config · 2 Progression · 3 Textures · 4 Characters ·
   5 Animation · 6 Environment · 7 Audio · 8 Rhythm · 9 VFX · 10 Camera ·
   11 Game loop/Performance/Cleanup · 12 UI/Input
   ===================================================================== */
const h = React.createElement,
  { useState, useEffect, useRef, useCallback } = React;
const TAU = Math.PI * 2,
  PI = Math.PI;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v),
  lerp = (a, b, t) => a + (b - a) * t,
  sstep = (t) => t * t * (3 - 2 * t),
  fract = (v) => v - Math.floor(v);
const rnd = (a, b) => a + Math.random() * (b - a),
  pick = (a) => a[(Math.random() * a.length) | 0];
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* colour management: all hex colours are authored in sRGB and converted to linear for the sRGB-output pipeline */
const C = (hex, t) =>
  (t || new THREE.Color()).setHex(hex).convertSRGBToLinear();
const PAL = [
  0xe53935, 0xff6f00, 0xd81b60, 0xfdd835, 0x43a047, 0x1e88e5, 0x8e24aa,
  0x00acc1, 0xff4081,
];
const SKINS = [0xf1c9a0, 0xe3b384, 0xd2a070, 0xc08a5a, 0xa36b3f, 0x7d4e2d];
const HAIRS = [0x120b07, 0x1d120b, 0x2b1a10, 0x3a2415, 0x0b0705];
const GOLD = 0xffc94a,
  SILVER = 0xd8dde6;
const GU = {
  title: "જય માઁ અંબે",
  welcome: "સ્વાગતમ્",
  nav: "નવરાત્રી મહોત્સવ",
  garba: "ગરબા",
  font: "'Noto Sans Gujarati','Shruti','Nirmala UI','Gujarati Sangam MN',sans-serif",
};
let REG = null;
const track = (o) => {
  if (REG) REG.push(o);
  return o;
}; /* disposable registry of the running game */

/* ============================ 1. CONFIGURATION ============================ */
const CONFIG = {
  /* optional real music: drop an mp3 at assets/garba.mp3 and set its tempo. Beat gameplay stays on the internal clock, music is beat-aligned at start. */
  music: { url: "assets/garba.mp3", bpm: 120 },
  windows: {
    perfect: 0.06,
    great: 0.11,
    good: 0.16,
  } /* seconds either side of the beat */,
  world: { R: 78, ringStart: 11, ringStep: 2.7 },
  patCycle: 8 /* eighth-note slots per bar */,
};
const QUALITY = [
  {
    name: "LOW",
    pr: 1,
    crowd: 90,
    shadow: 0,
    spark: 140,
    flake: 36,
    lights: 1,
    motes: 60,
    bulbs: 0.4,
    detail: 0,
    aa: false,
    env: 0.5,
    fx: 0.4,
    stalls: 6,
    rate: 1 / 2,
  },
  {
    name: "MEDIUM",
    pr: 1.25,
    crowd: 170,
    shadow: 0,
    spark: 300,
    flake: 80,
    lights: 2,
    motes: 120,
    bulbs: 0.7,
    detail: 1,
    aa: false,
    env: 0.75,
    fx: 0.7,
    stalls: 10,
    rate: 1 / 2,
  },
  {
    name: "HIGH",
    pr: 1.75,
    crowd: 330,
    shadow: 1024,
    spark: 600,
    flake: 160,
    lights: 2,
    motes: 220,
    bulbs: 1,
    detail: 2,
    aa: true,
    env: 1,
    fx: 1,
    stalls: 14,
    rate: 1,
  },
  {
    name: "ULTRA",
    pr: 2,
    crowd: 520,
    shadow: 2048,
    spark: 900,
    flake: 260,
    lights: 3,
    motes: 320,
    bulbs: 1,
    detail: 2,
    aa: true,
    env: 1,
    fx: 1,
    stalls: 14,
    rate: 1,
  },
];
/* Garba clap patterns on an 8-slot (eighth-note) bar: 1=clap, 2=twirl, 0=step */
const PATTERNS = [
  { id: 0, n: "Teen Taali", gu: "ત્રણ તાળી", s: [1, 0, 1, 0, 1, 0, 2, 0] },
  { id: 1, n: "Be Taali", gu: "બે તાળી", s: [1, 0, 0, 0, 1, 0, 2, 0] },
  { id: 2, n: "Dandiya Raas", gu: "ડાંડિયા રાસ", s: [1, 1, 1, 0, 1, 1, 2, 0] },
];
PATTERNS.forEach((p) => {
  p.claps = [];
  p.s.forEach((v, i) => {
    if (v == 1) p.claps.push(i);
  });
});
const NIGHTS = [
  {
    n: "Shailputri",
    gu: "શૈલપુત્રી",
    c: 0xff9800,
    bpm: 100,
    dur: 48,
    pat: [0],
  },
  {
    n: "Brahmacharini",
    gu: "બ્રહ્મચારિણી",
    c: 0xeceff1,
    bpm: 104,
    dur: 50,
    pat: [0, 0, 1],
  },
  {
    n: "Chandraghanta",
    gu: "ચંદ્રઘંટા",
    c: 0xe53935,
    bpm: 108,
    dur: 52,
    pat: [0, 1],
  },
  {
    n: "Kushmanda",
    gu: "કૂષ્માંડા",
    c: 0x1e88e5,
    bpm: 112,
    dur: 54,
    pat: [0, 1, 0, 2],
  },
  {
    n: "Skandamata",
    gu: "સ્કંદમાતા",
    c: 0xfdd835,
    bpm: 116,
    dur: 56,
    pat: [1, 0, 2],
  },
  {
    n: "Katyayani",
    gu: "કાત્યાયની",
    c: 0x43a047,
    bpm: 120,
    dur: 58,
    pat: [0, 2, 1, 2],
  },
  {
    n: "Kalaratri",
    gu: "કાલરાત્રિ",
    c: 0x7e57c2,
    bpm: 126,
    dur: 60,
    pat: [2, 0, 2, 1],
  },
  {
    n: "Mahagauri",
    gu: "મહાગૌરી",
    c: 0xec407a,
    bpm: 132,
    dur: 64,
    pat: [1, 2, 2, 0],
  },
  {
    n: "Siddhidatri",
    gu: "સિદ્ધિદાત્રી",
    c: 0xffd54f,
    bpm: 138,
    dur: 70,
    pat: [2, 1, 2, 2],
  },
];
/* game modes. pat(bar)→pattern id, bpm(bar)→tempo (both evaluated at bar lines) */
const MODES = {
  free: {
    n: "Free Garba",
    gu: "મુક્ત ગરબા",
    d: "Dance freely and soak in the festival. No fail, wide timing.",
    dur: 0,
    auto: false,
    win: 1.5,
    lives: 0,
    bpm: () => 120,
    pat: (b) => ((b >> 3) & 1 ? 1 : 0),
  },
  rhythm: {
    n: "Rhythm Challenge",
    gu: "રિધમ ચેલેન્જ",
    d: "90 seconds. Hit every clap, build your combo, earn a grade.",
    dur: 90,
    auto: true,
    win: 1,
    lives: 0,
    bpm: () => 120,
    pat: (b) =>
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 2, 2, 2, 2, 0, 0, 1, 1, 0, 0, 2, 2, 2, 2][
        b % 24
      ],
  },
  endless: {
    n: "Endless Garba",
    gu: "અનંત ગરબા",
    d: "Tempo and patterns keep climbing. Five blessings. How long can you last?",
    dur: 0,
    auto: true,
    win: 1,
    lives: 5,
    bpm: (b) => Math.min(170, 100 + (b >> 2) * 3),
    pat: (b) => {
      const t = b >> 3;
      return t == 0 ? 0 : t == 1 ? b & 1 : [0, 1, 2][(b * 7 + 3) % 3];
    },
  },
  festival: {
    n: "Festival Night",
    gu: "ફેસ્ટિવલ નાઇટ",
    d: "Nine nights of Navratri. Earn stars to open the next night.",
    dur: 50,
    auto: true,
    win: 1,
    lives: 0,
    bpm: null,
    pat: null,
  },
  high: {
    n: "High Score",
    gu: "હાઇ સ્કોર",
    d: "120 second sprint with a rising tempo. Chase the leaderboard.",
    dur: 120,
    auto: true,
    win: 1,
    lives: 0,
    bpm: (b) => Math.min(150, 110 + b),
    pat: (b) => (b % 12 < 4 ? 0 : b % 12 < 8 ? 2 : 1),
  },
};
const COMPANION = {
  garba: { n: "Solo Garba", gu: "એકલ ગરબા", k: 0, mul: 1, i: "🪔" },
  couple: { n: "Couple", gu: "જોડી", k: 1, mul: 1.5, i: "💕" },
  friends: { n: "With Friends", gu: "મિત્રો સાથે", k: 4, mul: 1.3, i: "👯" },
};
/* costumes: c1 skirt/kediyu, c2 choli/chorno, c3 dupatta/pagdi+sash, t trim, lvl unlock level */
const COSTUMES = {
  f: [
    {
      n: "Lal Chaniya",
      c1: 0xd32f2f,
      c2: 0xffb300,
      c3: 0x2e7d32,
      t: GOLD,
      lvl: 1,
    },
    {
      n: "Mor Neel",
      c1: 0x1976d2,
      c2: 0xe91e63,
      c3: 0xffb300,
      t: GOLD,
      lvl: 1,
    },
    { n: "Kesar", c1: 0xff6f00, c2: 0x6a1b9a, c3: 0xd81b60, t: GOLD, lvl: 2 },
    { n: "Haryali", c1: 0x2e7d32, c2: 0xfdd835, c3: 0xd32f2f, t: GOLD, lvl: 4 },
    {
      n: "Bandhani Rani",
      c1: 0xd81b60,
      c2: 0x00897b,
      c3: 0xffc107,
      t: SILVER,
      lvl: 6,
    },
    {
      n: "Maharani",
      c1: 0x6a1b9a,
      c2: 0xffd54f,
      c3: 0xe53935,
      t: 0xffe082,
      lvl: 8,
    },
  ],
  m: [
    {
      n: "Shwet Kediyu",
      c1: 0xf3e9d2,
      c2: 0xefe6d0,
      c3: 0xd32f2f,
      t: GOLD,
      lvl: 1,
    },
    {
      n: "Neel Kediyu",
      c1: 0x1565c0,
      c2: 0xf5efe0,
      c3: 0xff6f00,
      t: GOLD,
      lvl: 1,
    },
    {
      n: "Lal Kediyu",
      c1: 0xd32f2f,
      c2: 0xf3e9d2,
      c3: 0xfdd835,
      t: GOLD,
      lvl: 2,
    },
    { n: "Haryali", c1: 0x2e7d32, c2: 0xf5efe0, c3: 0xc2185b, t: GOLD, lvl: 4 },
    { n: "Jamli", c1: 0x6a1b9a, c2: 0xf3e9d2, c3: 0xffb300, t: SILVER, lvl: 6 },
    {
      n: "Kesari",
      c1: 0xff6f00,
      c2: 0xfff8e1,
      c3: 0x1565c0,
      t: 0xffe082,
      lvl: 8,
    },
  ],
};
/* dancers: hs hair style (f: 0 braid,1 bun,2 long ponytail | m: 0 short hair,1 feta,2 topi), st moustache, h height, w width */
const CHARS = {
  f: [
    { n: "Meera", skin: 0xe3b384, hair: 0x120b07, hs: 0, h: 1, w: 1, lvl: 1 },
    {
      n: "Kavya",
      skin: 0xc08a5a,
      hair: 0x1d120b,
      hs: 1,
      h: 1.03,
      w: 0.95,
      lvl: 3,
    },
    {
      n: "Riya",
      skin: 0xf1c9a0,
      hair: 0x2b1a10,
      hs: 2,
      h: 0.97,
      w: 1.04,
      lvl: 6,
    },
  ],
  m: [
    {
      n: "Arjun",
      skin: 0xd2a070,
      hair: 0x120b07,
      hs: 1,
      st: 1,
      h: 1,
      w: 1,
      lvl: 1,
    },
    {
      n: "Dev",
      skin: 0xa36b3f,
      hair: 0x0b0705,
      hs: 0,
      st: 0,
      h: 1.04,
      w: 1.06,
      lvl: 3,
    },
    {
      n: "Harsh",
      skin: 0xe3b384,
      hair: 0x1d120b,
      hs: 2,
      st: 1,
      h: 0.98,
      w: 0.96,
      lvl: 6,
    },
  ],
};

/* ============================ 2. PROGRESSION (localStorage) ============================ */
const SAVE_KEY = "garba_jai_maa_ambe_v2";
const defSave = () => ({
  best: {},
  bestCombo: 0,
  perfects: 0,
  hits: 0,
  notes: 0,
  xp: 0,
  games: 0,
  costume: { f: 0, m: 0 },
  char: { f: 0, m: 0 },
  nights: 1,
  stars: {},
  board: [],
  set: { music: 0.7, sfx: 0.9, haptics: true, auto: true, fps: false, q: -1 },
});
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}"),
      d = defSave();
    return Object.assign(d, s, {
      set: Object.assign(d.set, s.set || {}),
      costume: Object.assign(d.costume, s.costume || {}),
      char: Object.assign(d.char, s.char || {}),
    });
  } catch (e) {
    return defSave();
  }
}
function writeSave(s) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch (e) {}
}
const xpFor = (l) => Math.round(120 * (l - 1) * (l - 1)),
  levelOf = (xp) => {
    let l = 1;
    while (xp >= xpFor(l + 1)) l++;
    return l;
  };

/* ============================ 3. PROCEDURAL TEXTURES ============================ */
const cvs = (w, hh) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = hh || w;
  return c;
};
function ctex(cv, o) {
  o = o || {};
  const t = new THREE.CanvasTexture(cv);
  if (o.srgb) t.encoding = THREE.sRGBEncoding;
  if (o.rep) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(o.rep[0], o.rep[1]);
  }
  t.anisotropy = o.an || 4;
  return track(t);
}
function texGlow() {
  const c = cvs(64),
    x = c.getContext("2d"),
    g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(255,255,255,.75)");
  g.addColorStop(0.5, "rgba(255,255,255,.18)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return ctex(c, { srgb: true, an: 1 });
}
function texGround() {
  const c = cvs(512),
    x = c.getContext("2d");
  x.fillStyle = "#8a6b47";
  x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) {
    const r = rnd(14, 60),
      g = x.createRadialGradient(0, 0, 0, 0, 0, r),
      v = rnd(-22, 22);
    x.save();
    x.translate(rnd(0, 512), rnd(0, 512));
    g.addColorStop(
      0,
      `rgba(${v > 0 ? 160 : 60},${v > 0 ? 128 : 46},${v > 0 ? 86 : 30},.22)`,
    );
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(-r, -r, 2 * r, 2 * r);
    x.restore();
  }
  for (let i = 0; i < 14000; i++) {
    const v = (60 + Math.random() * 120) | 0;
    x.fillStyle = `rgba(${v + 30},${v + 10},${v - 20},${rnd(0.1, 0.35)})`;
    x.fillRect(Math.random() * 512, Math.random() * 512, rnd(1, 3), rnd(1, 2));
  }
  return ctex(c, { srgb: true, rep: [46, 46], an: 8 });
}
/* rangoli / mandala: radial-symmetric flower pattern */
function texMandala(S, pal, rings) {
  const c = cvs(S),
    x = c.getContext("2d"),
    m = S / 2;
  x.translate(m, m);
  x.clearRect(-m, -m, S, S);
  const R = rings || 7;
  for (let r = 0; r < R; r++) {
    const n = 8 + r * 4,
      rr = m * (0.93 - r * (0.82 / R)),
      col = pal[r % pal.length],
      col2 = pal[(r + 2) % pal.length];
    for (let k = 0; k < n; k++) {
      x.save();
      x.rotate((k / n) * TAU);
      x.fillStyle = col;
      x.beginPath();
      x.ellipse(rr * 0.78, 0, rr * 0.17, rr * 0.075, 0, 0, TAU);
      x.fill();
      x.fillStyle = col2;
      x.beginPath();
      x.arc(rr * 0.99, 0, rr * 0.032, 0, TAU);
      x.fill();
      x.fillStyle = "#fff8e1";
      x.beginPath();
      x.arc(rr * 0.78, 0, rr * 0.026, 0, TAU);
      x.fill();
      x.restore();
    }
    x.strokeStyle = "rgba(255,248,225,.85)";
    x.lineWidth = S / 160;
    x.beginPath();
    x.arc(0, 0, rr * 0.58, 0, TAU);
    x.stroke();
  }
  x.fillStyle = pal[0];
  x.beginPath();
  x.arc(0, 0, m * 0.07, 0, TAU);
  x.fill();
  x.fillStyle = "#fff8e1";
  x.beginPath();
  x.arc(0, 0, m * 0.03, 0, TAU);
  x.fill();
  return ctex(c, { srgb: true, an: 8 });
}
/* fabric packs: R = shade, G = embroidery mask (takes the trim colour), mr: G rough, B metal (mirror-work) */
function fabricPack(kind) {
  const W = kind == "ghagra" ? 512 : 256,
    H = kind == "dupatta" ? 512 : kind == "ghagra" ? 512 : 256,
    px = cvs(W, H),
    mr = cvs(W, H),
    x = px.getContext("2d"),
    m = mr.getContext("2d");
  const base = kind == "plain" ? 236 : kind == "dupatta" ? 238 : 228;
  x.fillStyle = `rgb(${base},0,0)`;
  x.fillRect(0, 0, W, H);
  m.fillStyle = "rgb(0,205,0)";
  m.fillRect(0, 0, W, H);
  for (let i = 0; i < (W * H) / 20; i++) {
    const v = (base - 34 + Math.random() * 44) | 0;
    x.fillStyle = `rgb(${v},0,0)`;
    x.fillRect(
      Math.random() * W,
      Math.random() * H,
      Math.random() < 0.5 ? 3 : 1,
      Math.random() < 0.5 ? 1 : 3,
    );
  } /* weave */
  const gold = "rgb(255,255,0)",
    thread = "rgb(150,0,0)";
  const dot = (px_, py, r, mirror) => {
    x.fillStyle = gold;
    x.beginPath();
    x.arc(px_, py, r, 0, TAU);
    x.fill();
    m.fillStyle = "rgb(0,170,0)";
    m.beginPath();
    m.arc(px_, py, r, 0, TAU);
    m.fill();
    if (mirror) {
      x.fillStyle = "rgb(255,60,0)";
      x.beginPath();
      x.arc(px_, py, r * 0.62, 0, TAU);
      x.fill();
      m.fillStyle = "rgb(0,28,255)";
      m.beginPath();
      m.arc(px_, py, r * 0.62, 0, TAU);
      m.fill();
    }
  };
  const flower = (cx, cy, R, n) => {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU;
      x.save();
      x.translate(cx, cy);
      x.rotate(a);
      x.strokeStyle = gold;
      x.lineWidth = 2.4;
      x.beginPath();
      x.ellipse(R * 0.55, 0, R * 0.42, R * 0.17, 0, 0, TAU);
      x.stroke();
      x.fillStyle = gold;
      x.beginPath();
      x.arc(R * 1.02, 0, R * 0.08, 0, TAU);
      x.fill();
      x.restore();
    }
    dot(cx, cy, R * 0.2, true);
    x.strokeStyle = gold;
    x.lineWidth = 2;
    x.beginPath();
    x.arc(cx, cy, R * 0.34, 0, TAU);
    x.stroke();
  };
  if (kind == "ghagra") {
    x.fillStyle = "rgb(150,0,0)";
    x.fillRect(0, 0, W, H * 0.065);
    for (let i = 0; i < 32; i++)
      dot((i * W) / 32 + 8, H * 0.032, 2.2); /* waist band */
    for (let i = 0; i < 8; i++) {
      x.fillStyle = thread;
      x.fillRect((i * W) / 8, H * 0.065, 1.5, H * 0.7);
    } /* panel seams */
    for (let i = 0; i < 4; i++) {
      flower(W / 8 + (i * W) / 4, H * 0.27, 34, 8);
      flower((i * W) / 4, H * 0.27, 34, 8);
    }
    for (let i = 0; i < 8; i++) {
      flower(W / 16 + (i * W) / 8, H * 0.5, 19, 6);
    }
    for (let i = 0; i < 16; i++)
      for (let j = 0; j < 3; j++) {
        if ((i + j) % 2)
          dot(W / 32 + (i * W) / 16, H * (0.37 + j * 0.045), 2.4, j == 1);
      }
    x.fillStyle = "rgb(255,0,0)";
    x.fillRect(0, H * 0.72, W, H * 0.28);
    m.fillStyle = "rgb(0,150,0)";
    m.fillRect(0, H * 0.72, W, H * 0.28); /* hem border: lighter */
    x.fillStyle = gold;
    x.fillRect(0, H * 0.735, W, H * 0.022);
    x.fillRect(0, H * 0.94, W, H * 0.03);
    for (let i = 0; i < 32; i++) {
      x.beginPath();
      x.moveTo((i * W) / 32, H * 0.76);
      x.lineTo((i * W) / 32 + W / 64, H * 0.84);
      x.lineTo((i * W) / 32 + W / 32, H * 0.76);
      x.closePath();
      x.fill();
    }
    for (let i = 0; i < 16; i++) {
      dot(W / 32 + (i * W) / 16, H * 0.885, 8, true);
    }
    for (let i = 0; i < 32; i++) {
      dot((i * W) / 32 + 8, H * 0.955, 2.6);
    }
  } else if (kind == "choli") {
    x.fillStyle = gold;
    x.fillRect(0, H * 0.04, W, H * 0.03);
    x.fillRect(0, H * 0.94, W, H * 0.03);
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        const cx = W / 8 + (i * W) / 4 + ((j % 2) * W) / 8,
          cy = H * (0.17 + j * 0.2);
        dot(cx, cy, 9, true);
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * TAU;
          dot(cx + Math.cos(a) * 17, cy + Math.sin(a) * 17, 2.6);
        }
      }
  } else if (kind == "dupatta") {
    x.fillStyle = gold;
    x.fillRect(0, 0, W * 0.09, H);
    x.fillRect(W * 0.91, 0, W * 0.09, H);
    x.fillRect(0, 0, W, H * 0.03);
    x.fillRect(0, H * 0.97, W, H * 0.03);
    for (let i = 0; i < 22; i++) {
      dot(W * 0.045, (i * H) / 22 + 10, 5, i % 2 == 0);
      dot(W * 0.955, (i * H) / 22 + 10, 5, i % 2 == 0);
    }
    for (let j = 0; j < 9; j++)
      for (let i = 0; i < 4; i++)
        dot(
          W * 0.2 + i * W * 0.2 + (j % 2) * W * 0.1,
          H * (0.07 + j * 0.105),
          3.2,
          (i + j) % 3 == 0,
        );
  }
  return { pack: ctex(px, { an: 8 }), mr: ctex(mr, { an: 4 }) };
}
/* sign plate (Gujarati + English) for gate and stalls; redraws when web fonts arrive */
function signPlate(w, hh, lines, bg, fg, border) {
  const c = cvs(w, hh),
    t = ctex(c, { srgb: true, an: 4 });
  const draw = () => {
    const x = c.getContext("2d");
    x.clearRect(0, 0, w, hh);
    x.fillStyle = bg;
    x.fillRect(0, 0, w, hh);
    x.strokeStyle = border || fg;
    x.lineWidth = hh * 0.045;
    x.strokeRect(hh * 0.04, hh * 0.04, w - hh * 0.08, hh * 0.92);
    x.strokeStyle = fg;
    x.globalAlpha = 0.55;
    x.lineWidth = 2;
    x.strokeRect(hh * 0.11, hh * 0.11, w - hh * 0.22, hh * 0.78);
    x.globalAlpha = 1;
    x.fillStyle = fg;
    x.textAlign = "center";
    x.textBaseline = "middle";
    lines.forEach(([txt, sz, y, fnt], i) => {
      x.font = `${fnt || "700"} ${sz * hh}px ${GU.font}`;
      x.fillText(txt, w / 2, y * hh);
    });
    t.needsUpdate = true;
  };
  draw();
  t.redraw = draw;
  SIGNS.push(t);
  return t;
}
const SIGNS = [];
