/*Copyright (c) 2026 MANTHAN VINZUDA

All rights reserved.

This source code is provided for viewing purposes only.
You may not copy, modify, distribute, sublicense, or use
this code or substantial portions of it without permission.*/

/* ============================ 8/10/11. GAME – rhythm engine, cameras, loop, performance, cleanup ============================ */
function createGame(mount, o) {
  REG = [];
  const reg = REG,
    mobile = innerWidth < 800 || /Mobi|Android/i.test(navigator.userAgent),
    Qd = Object.assign({}, QUALITY[o.q], { lambert: o.q == 0 }),
    W = CONFIG.world.R,
    SAVE = o.save,
    SET = o.set;
  const g1 = o.female ? "f" : "m",
    K = COMPANION[o.mode].k,
    M0 = MODES[o.gm],
    NIGHT = o.gm == "festival" ? NIGHTS[o.night] : null;
  const M = NIGHT
    ? Object.assign({}, M0, {
        dur: NIGHT.dur,
        bpm: () => NIGHT.bpm,
        pat: (b) => NIGHT.pat[(b >> 2) % NIGHT.pat.length],
      })
    : M0;
  /* ---------- renderer ---------- */
  const R = new THREE.WebGLRenderer({
    antialias: Qd.aa,
    powerPreference: "high-performance",
  });
  R.outputEncoding = THREE.sRGBEncoding;
  if (o.q > 0) {
    R.toneMapping = THREE.ACESFilmicToneMapping;
    R.toneMappingExposure = 1.18;
  }
  let pr = Math.min(devicePixelRatio || 1, Qd.pr);
  R.setPixelRatio(pr);
  R.setSize(innerWidth, innerHeight);
  if (Qd.shadow) {
    R.shadowMap.enabled = true;
    R.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  mount.appendChild(R.domElement);
  const S = new THREE.Scene(),
    cam = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 1200);
  cam.position.set(0, 34, 66);
  /* ---------- characters ---------- */
  const lib = createMatLib(Qd),
    partsBy = { f: buildParts("f", Qd.detail), m: buildParts("m", Qd.detail) },
    heroParts =
      Qd.detail == 2
        ? partsBy
        : { f: buildParts("f", 2), m: buildParts("m", 2) };
  [partsBy, heroParts].forEach((b) =>
    ["f", "m"].forEach((k) => b[k].forEach((p) => track(p.geo))),
  );
  const FS = {
      T: 0,
      dt: 0.016,
      beat: 0,
      bpm: 120,
      pat: PATTERNS[0],
      energy: 0.3,
      fever: false,
      dand: false,
    },
    pl = { x: 0, z: 0, yaw: 0, vx: 0, vz: 0 },
    place = (ch, T) => {
      const a = ch.a0 + ch.w * T,
        c = Math.cos(a),
        s = Math.sin(a);
      pl.x = c * ch.R;
      pl.z = s * ch.R;
      pl.yaw = Math.atan2(-c, -s);
      pl.vx = ch.dir * 0.9;
      pl.vz = 0;
      return pl;
    };
  function makeIdol() {
    const sp = Object.assign(randSpec("f", rng(42)), {
        skin: 0xe9b27a,
        hair: 0x0a0605,
        hs: 1,
        c1: 0xb71c1c,
        c2: 0xffc107,
        c3: 0xff6f00,
        t: 0xffd54f,
        sx: 1,
        sy: 1,
        ph: 0,
        int: 1,
        sty: 0,
        hand: 1,
        hipA: 1,
        shA: 1,
        hdA: 1,
        cloth: 1,
        red: 0xc2185b,
        flower: 0xffb300,
      }),
      hr = buildHero(sp, heroParts.f, lib, Qd),
      B = hr.B,
      gm = hr.M.trim,
      sk = hr.M.skin;
    B.skirt.scale.set(1.1, 1, 1.1);
    _armSet(B, 1, -0.25, 0.6, -0.9, 0.1);
    _armSet(B, -1, -0.25, 0.6, -0.9, 0.1);
    B.head.rotation.z = 0.04;
    const A = (i) => {
      const s = i < 3 ? 1 : -1,
        j = i % 3,
        dir = [
          [0.5, 0.9, 0.15],
          [0.95, 0.4, 0.1],
          [0.8, -0.3, 0.15],
        ][j],
        d = [s * dir[0], dir[1], dir[2]],
        f = [s * 0.17, 0.25, -0.05],
        len = 0.52,
        e = [
          f[0] + (d[0] * len) / Math.hypot(...d),
          f[1] + (d[1] * len) / Math.hypot(...d),
          f[2] + (d[2] * len) / Math.hypot(...d),
        ];
      const m = new THREE.Mesh(
        track(capDir(0.04, len - 0.08, f, d, 10, 0.033)),
        sk,
      );
      B.chest.add(m);
      const hd = new THREE.Mesh(
        track(new THREE.SphereGeometry(0.042, 8, 6)),
        sk,
      );
      hd.position.set(...e);
      B.chest.add(hd);
      const br = new THREE.Mesh(
        track(new THREE.TorusGeometry(0.04, 0.008, 5, 12)),
        gm,
      );
      br.position.set(e[0] - d[0] * 0.04, e[1] - d[1] * 0.04, e[2]);
      B.chest.add(br);
      const it = new THREE.Group();
      it.position.set(...e);
      B.chest.add(it);
      const gold = gm;
      if (i == 0) {
        const sh = new THREE.Mesh(
          track(new THREE.CylinderGeometry(0.012, 0.012, 0.8, 6)),
          gold,
        );
        sh.position.y = 0.2;
        it.add(sh);
        [0, -0.07, 0.07].forEach((x, k) => {
          const p = new THREE.Mesh(
            track(new THREE.ConeGeometry(0.018, k ? 0.18 : 0.26, 5)),
            gold,
          );
          p.position.set(x, 0.64 + (k ? 0 : 0.05), 0);
          it.add(p);
        });
      } else if (i == 1) {
        const ch = new THREE.Mesh(
          track(new THREE.TorusGeometry(0.14, 0.016, 6, 20)),
          gold,
        );
        ch.position.y = 0.1;
        it.add(ch);
        hr.chakra = ch;
      } else if (i == 2) {
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * TAU,
            p = new THREE.Mesh(
              track(new THREE.ConeGeometry(0.05, 0.16, 5)),
              plainMat(lib.lam, { color: C(0xff6f91) }, 0.6, 0),
            );
          p.position.set(Math.cos(a) * 0.07, 0.1, Math.sin(a) * 0.07);
          p.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
          it.add(p);
        }
      } else if (i == 3) {
        const sw = new THREE.Mesh(
          track(new THREE.BoxGeometry(0.045, 0.62, 0.01)),
          plainMat(lib.lam, { color: C(0xdde3ea) }, 0.2, 0.9),
        );
        sw.position.y = 0.36;
        it.add(sw);
        const hl = new THREE.Mesh(
          track(new THREE.BoxGeometry(0.14, 0.025, 0.03)),
          gold,
        );
        it.add(hl);
      } else if (i == 4) {
        const mc = new THREE.Mesh(
          track(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6)),
          gold,
        );
        mc.position.y = 0.2;
        it.add(mc);
        const bl = new THREE.Mesh(
          track(new THREE.SphereGeometry(0.09, 8, 6)),
          gold,
        );
        bl.position.y = 0.5;
        it.add(bl);
      } else {
        const cs = new THREE.Mesh(
          track(new THREE.SphereGeometry(0.09, 8, 6)),
          plainMat(lib.lam, { color: C(0xf6efe0) }, 0.3, 0),
        );
        cs.scale.set(1, 1.3, 0.8);
        cs.position.y = 0.1;
        it.add(cs);
      }
    };
    for (let i = 0; i < 6; i++) A(i);
    const cr = new THREE.Mesh(
      track(
        loft(
          [
            [0.2, 0.1, 0.1],
            [0.28, 0.115, 0.115],
            [0.38, 0.085, 0.085],
            [0.5, 0.04, 0.04],
            [0.58, 0.002, 0.002],
          ],
          14,
          {
            rip: (a, y) => 0.1 * Math.sin(a * 8) * clamp((y - 0.2) / 0.3, 0, 1),
          },
        ),
      ),
      gm,
    );
    B.head.add(cr);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU,
        jw = new THREE.Mesh(
          track(new THREE.SphereGeometry(0.012, 5, 4)),
          plainMat(
            lib.lam,
            { color: C(0xe53935), emissive: C(0xaa1111) },
            0.3,
            0,
          ),
        );
      jw.position.set(Math.cos(a) * 0.115, 0.27, Math.sin(a) * 0.115);
      B.head.add(jw);
    }
    const gl = new THREE.Mesh(
      track(new THREE.CircleGeometry(0.2, 20)),
      track(
        new THREE.MeshBasicMaterial({
          map: E.glowTex,
          color: C(0xffd070),
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: 2,
        }),
      ),
    );
    gl.position.set(0, 0.14, 0.1);
    B.head.add(gl);
    return {
      root: hr.root,
      glow(T, pulse, cf) {
        if (hr.chakra) hr.chakra.rotation.z = T * 3;
        gl.material.opacity = 0.4 + 0.3 * pulse + 0.3 * cf;
      },
    };
  }
  function makeDrummer(k) {
    const sp = randSpec("m", rng(300 + k));
    sp.c1 = [0xd32f2f, 0x1565c0, 0x2e7d32, 0xff6f00][k];
    sp.c2 = 0xf3e9d2;
    sp.c3 = [0xffb300, 0xe53935, 0xfdd835, 0x1565c0][k];
    sp.hs = k % 3 == 2 ? 2 : 1;
    sp.st = true;
    sp.ph = 0;
    sp.sx = 1;
    sp.sy = 1;
    const hr = buildHero(sp, heroParts.m, lib, Qd);
    addDhol(hr, lib);
    hr.ch.ph = k * 0.03;
    return { root: hr.root, B: hr.B, ch: hr.ch, yaw: 0 };
  }
  /* ---------- environment ---------- */
  const E = buildEnvironment(S, Qd, R, {});
  buildStage(E, S, Qd, { makeIdol, makeDrummer });
  buildFestival(E, S, Qd, {});
  E.setPR(pr);
  if (NIGHT) E.setTheme(NIGHT.c);
  SIGNS.forEach((t) => t.redraw());
  if (document.fonts && document.fonts.ready)
    document.fonts.ready
      .then(() => SIGNS.forEach((t) => t.redraw()))
      .catch(() => {});
  /* ---------- ring layout, crowd, heroes ---------- */
  const rings = [];
  for (let k = 0; k < 8; k++) {
    const Rr = CONFIG.world.ringStart + k * CONFIG.world.ringStep,
      d = k % 2 ? -1 : 1;
    rings.push({ R: Rr, w: (d * 0.9) / Rr, dir: d });
  }
  const Nn = Qd.crowd,
    chars = [];
  for (let r = 0; chars.length < Nn && r < 8; r++) {
    const c = Math.floor((TAU * rings[r].R) / 1.15);
    for (let j = 0; j < c && chars.length < Nn; j++) {
      const g = Math.random() < 0.5 ? "f" : "m",
        s = randSpec(g);
      s.grps = grpsOf(s);
      s.R = rings[r].R;
      s.a0 = (j / c) * TAU + rnd(-0.03, 0.03);
      s.dir = rings[r].dir;
      s.w = rings[r].w;
      chars.push(s);
    }
  }
  const crowd = createCrowd(S, chars, partsBy, lib, Qd);
  const heroes = [];
  const mkHero = (spec) => {
    const hr = buildHero(spec, heroParts[spec.g], lib, Qd);
    hr.ch.dang = hr.dang;
    hr.ch.wp = 0;
    hr.ch.clap = 0;
    hr.ch.cel = 0;
    hr.pos = { x: 0, z: 0, px: 0, pz: 0, vx: 0, vz: 0, yaw: 0 };
    S.add(hr.root);
    heroes.push(hr);
    return hr;
  };
  const pSpec = specFromPlayer(g1, SAVE),
    player = mkHero(pSpec),
    comps = [];
  for (let i = 0; i < K; i++) {
    const g = K == 1 ? (g1 == "f" ? "m" : "f") : i % 2 ? "m" : "f",
      sp = randSpec(g);
    sp.ph = i * 0.012;
    sp.sty = i % 4;
    sp.int = 1;
    comps.push(mkHero(sp));
  }
  const V = createVFX(S, Qd, E.glowTex);
  V.setName(CHARS[g1][SAVE.char[g1]].n);
  V.sparks.mat.uniforms.uPR.value = pr;
  /* ---------- audio ---------- */
  const A = createAudio(o.ac, SET);
  const applyVol = () =>
    A.setVol(SET.music, SET.sfx, o.muted.current || o.paused.current);
  applyVol();
  /* ---------- rhythm state ---------- */
  const INTRO = o.quick ? 1.5 : 6.2;
  let T = 0,
    beat = 0,
    lastAc = null,
    curBar = 0,
    phase = "intro",
    introT = 0,
    playT = 0,
    score = 0,
    combo = 0,
    maxCombo = 0,
    meter = 0,
    fever = 0,
    lives = M.lives,
    lifeCool = 0,
    msg = "",
    msgT = 0,
    msgK = "",
    msgId = 0,
    banner = "",
    bannerT = 0,
    bannerId = 0,
    kick = 0,
    shake = 0,
    hudT = 0,
    frame = 0,
    raf,
    dead = false,
    ended = false,
    endT = 0,
    idleT = 0;
  const st = { perfect: 0, great: 0, good: 0, miss: 0, pts: 0, notes: 0 };
  const bpmFor = (b) =>
      A.musicOn
        ? CONFIG.music.bpm
        : Math.round(M.bpm ? M.bpm(Math.max(0, b - startBar)) : 120),
    patFor = (b) => PATTERNS[M.pat ? M.pat(Math.max(0, b - startBar)) : 0];
  let bpm = 100,
    startBeat = 0,
    startBar = 0;
  bpm = M.bpm ? M.bpm(0) : 120;
  if (A.musicOn) bpm = CONFIG.music.bpm;
  startBeat = Math.ceil((INTRO * bpm) / 60 / 4) * 4;
  startBar = startBeat / 4;
  bpm = bpmFor(0);
  let pat = patFor(0);
  const WIN = CONFIG.windows,
    win = () => ({
      p: WIN.perfect * M.win,
      g: WIN.great * M.win,
      d: WIN.good * M.win,
    }),
    consumed = new Int32Array(64).fill(-9999);
  let jk = startBeat * 2;
  const fx = () => (FS.fever ? 1 : 0);
  const lane = o.lane;
  let laneCur = -1,
    lanePat = null;
  /* ---------- camera state ---------- */
  let px = 0,
    pz = 9,
    pyaw = PI,
    ppx = px,
    ppz = pz,
    pvx = 0,
    pvz = 0,
    inRing = false,
    yaw = 0,
    pitch = 0.45,
    dist = 8,
    shot = null,
    glanceT = 30;
  const keys = {},
    camPos = new THREE.Vector3(0, 34, 66),
    camLook = new THREE.Vector3(0, 3, 0),
    _v1 = new THREE.Vector3(),
    _v2 = new THREE.Vector3();
  const vib = (n) => {
    if (SET.haptics && navigator.vibrate)
      try {
        navigator.vibrate(n);
      } catch (e) {}
  };
  const sayMsg = (t, k) => {
    msg = t;
    msgK = k;
    msgT = 0.75;
    msgId++;
  };
  const flash = (c, a) => {
    const f = o.flash && o.flash.current;
    if (f) {
      f.style.background = c;
      f.style.opacity = a;
    }
    flashA = a;
  };
  let flashA = 0;
  const startShot = (type, dur) => {
    shot = { type, t: 0, dur, a0: Math.atan2(pz, px) };
  };
  /* ---------- judging ---------- */
  function hit(g, bd) {
    combo++;
    if (combo > maxCombo) maxCombo = combo;
    const base = g == 3 ? 100 : g == 2 ? 75 : 50,
      mult = 1 + Math.min(Math.floor(combo / 10), 8) * 0.25;
    score += Math.round(
      base * mult * COMPANION[o.mode].mul * (fever > 0 ? 2 : 1),
    );
    st[g == 3 ? "perfect" : g == 2 ? "great" : "good"]++;
    st.pts += g == 3 ? 1 : g == 2 ? 0.8 : 0.5;
    st.notes++;
    meter = Math.min(100, meter + (inRing ? [0, 4, 6, 8][g] : 2));
    if (meter >= 100 && fever <= 0 && phase == "play") {
      fever = 10;
      sayMsg("GARBA FEVER!", "fever");
      banner = "GARBA FEVER x2";
      bannerT = 2;
      bannerId++;
      E.fxScale = 1;
      V.rings.spawn(0, 0, 0xff4081, 30, 1.4);
      A.cheer(0.6);
    }
    const hy = player.spec.sy * 1.25;
    kick = g == 3 ? 1 : 0.5;
    if (g == 3) {
      V.sparkBurst(px, hy, pz, 12, 0xffd54f, 2.6);
      V.rings.spawn(px, pz, 0xffd54f, 2.6, 0.5);
      vib(12);
    } else V.sparkBurst(px, hy, pz, 5, 0xfff0b0, 1.6);
    sayMsg(
      g == 3
        ? "PERFECT!" + ["", "❤️", "🎉"][K == 0 ? 0 : K == 1 ? 1 : 2]
        : g == 2
          ? "Great!"
          : "Good",
      "p" + g,
    );
    if (lives > 0 && combo % 20 == 0 && lives < M.lives) {
      lives++;
    }
    if (combo == 10 || combo == 25 || combo == 50 || combo % 100 == 0)
      milestone(combo);
    if (combo > 0 && combo % 5 == 0 && combo < 10) {
      V.petalBurst(px, 1.5, pz, 6, 2);
    }
  }
  function miss(auto) {
    if (M.auto || !auto) {
      if (combo >= 10) A.clap(0);
    }
    combo = 0;
    st.miss++;
    st.notes++;
    meter = Math.max(0, meter - 10);
    sayMsg("Miss", "m");
    kick = 0;
    shake = 0;
    vib(28);
    flash("#c62828", 0.18);
    if (lives > 0 && lifeCool <= 0) {
      lives--;
      lifeCool = 0.5;
      if (lives <= 0) finish("fail");
    }
  }
  function milestone(c) {
    const tier = c >= 100 ? 4 : c >= 50 ? 3 : c >= 25 ? 2 : 1,
      names = ["", "", "", "", ""];
    if (tier == 1) {
      V.sparkBurst(px, 1.5, pz, 24, 0xffd54f, 3.2);
      V.petalBurst(px, 1.6, pz, 18, 3);
      V.rings.spawn(px, pz, 0xff9800, 4, 0.7);
      banner = "COMBO " + c;
      A.bell(784);
      vib([15, 30, 15]);
    } else if (tier == 2) {
      V.sparkBurst(px, 1.5, pz, 50, 0xffd54f, 4.5);
      V.petalBurst(px, 2, pz, 30, 4);
      V.rain(px, pz, 6, 24, true);
      V.rings.spawn(px, pz, 0xffd54f, 9, 1);
      V.rings.spawn(0, 0, 0xff9800, 30, 1.4);
      banner = "COMBO " + c + " · વાહ!";
      A.bell(988);
      A.cheer(0.5);
      flash("#ffd54f", 0.25);
      E.stageL.intensity += 3;
      vib([20, 40, 20, 40, 20]);
    } else if (tier == 3) {
      V.confetti(-4, 5, 0, 60, 6);
      V.confetti(4, 5, 0, 60, 6);
      V.confetti(px, 2, pz, 50, 5);
      V.rain(px, pz, 10, 40, true);
      V.sparkBurst(px, 1.5, pz, 70, 0xffffff, 5.5);
      V.rings.spawn(px, pz, 0xffffff, 12, 1.2);
      V.rings.spawn(0, 0, 0xff4081, 40, 1.6);
      banner = "COMBO " + c + " · જય માઁ અંબે!";
      A.bell(1175);
      A.cheer(0.9);
      flash("#fff3c4", 0.35);
      startShot("celebrate", 3.4);
      player.ch.cel = 1;
      vib([30, 50, 30, 50, 60]);
    } else {
      V.rain(0, 0, 30, Math.round(160 * Qd.fx), true);
      V.rain(0, 0, 26, Math.round(100 * Qd.fx), false);
      V.confetti(-5, 6, 0, 90, 7);
      V.confetti(5, 6, 0, 90, 7);
      V.sparkBurst(0, 5, 0, 80, 0xffd54f, 7);
      for (let k = 0; k < 3; k++)
        V.rings.spawn(
          0,
          0,
          [0xffd54f, 0xff4081, 0xffffff][k],
          30 + k * 8,
          1.4 + k * 0.3,
        );
      banner = "JAI MAA AMBE!  ·  " + c;
      A.bell(1319);
      A.cheer(1);
      flash("#ffe9a0", 0.5);
      startShot("celebrate", 4.2);
      player.ch.cel = 1;
      E.stageL.intensity += 5;
      vib([40, 60, 40, 60, 40, 60, 80]);
    }
    bannerT = 2.4;
    bannerId++;
  }
  function clap() {
    if (o.paused.current || dead) return;
    player.ch.clap = 1;
    idleT = 0;
    if (phase == "intro") {
      startBeat = Math.min(startBeat, Math.ceil((beat + 2) / 4) * 4);
      startBar = startBeat / 4;
      jk = startBeat * 2;
      A.clap(1);
      return;
    }
    if (phase == "end") {
      A.clap(1);
      return;
    }
    const w = win(),
      spb = 60 / bpm,
      bj = beat - (A.lat() * bpm) / 60,
      sp = bj * 2;
    let best = null,
      bd = 1e9;
    for (let k = Math.floor(sp) - 1; k <= Math.floor(sp) + 2; k++) {
      const pt = patFor(Math.floor(k / 8));
      if (pt.s[((k % 8) + 8) % 8] == 1) {
        const d = (Math.abs(sp - k) * spb) / 2;
        if (d < bd) {
          bd = d;
          best = k;
        }
      }
    }
    if (best !== null && bd <= w.d) {
      if (consumed[best & 63] === best) {
        A.clap(3);
        return;
      }
      consumed[best & 63] = best;
      const g = bd <= w.p ? 3 : bd <= w.g ? 2 : 1;
      A.clap(g == 3 ? 2 : 1);
      hit(g, bd);
    } else {
      if (M.auto) {
        A.clap(0);
        miss(false);
      } else {
        A.clap(1);
        combo = Math.max(0, combo);
      }
    }
  }
  /* ---------- finish / results ---------- */
  function finish(why) {
    if (ended) return;
    ended = true;
    phase = "end";
    endT = 0;
    const acc = st.notes ? (st.pts / st.notes) * 100 : 0,
      grade =
        acc >= 95
          ? "S"
          : acc >= 88
            ? "A"
            : acc >= 75
              ? "B"
              : acc >= 60
                ? "C"
                : "D",
      stars = acc >= 92 ? 3 : acc >= 80 ? 2 : acc >= 60 ? 1 : 0;
    const res = {
      why,
      score,
      acc,
      grade,
      stars,
      perfect: st.perfect,
      great: st.great,
      good: st.good,
      miss: st.miss,
      maxCombo,
      time: playT,
      gm: o.gm,
      night: o.night,
      mode: o.mode,
      notes: st.notes,
    };
    A.cheer(why == "fail" ? 0.3 : 0.9);
    if (why != "fail") {
      V.confetti(0, 6, 0, 100, 7);
      V.rain(0, 0, 22, Math.round(80 * Qd.fx), true);
      startShot("celebrate", 4);
    }
    setTimeout(() => {
      if (!dead) o.onEnd(res);
    }, 1600);
  }
  /* ---------- input ---------- */
  const kd = (e) => {
      if (e.target && /INPUT|SELECT/.test(e.target.tagName)) return;
      keys[e.code] = 1;
      if (e.code == "KeyV" && !e.repeat) o.cycleCam();
      if ((e.code == "KeyC" || e.code == "Space") && !e.repeat) {
        e.preventDefault();
        clap();
      }
      if ((e.code == "KeyP" || e.code == "Escape") && !e.repeat)
        o.onPauseKey && o.onPauseKey();
      if (e.code == "KeyM" && !e.repeat) o.onMuteKey && o.onMuteKey();
      if (e.code.startsWith("Arrow")) e.preventDefault();
    },
    ku = (e) => (keys[e.code] = 0);
  addEventListener("keydown", kd);
  addEventListener("keyup", ku);
  const el = R.domElement;
  let dr = null;
  const pd = (e) => {
      dr = [e.clientX, e.clientY];
      try {
        el.setPointerCapture(e.pointerId);
      } catch (_) {}
    },
    pm = (e) => {
      if (!dr) return;
      yaw -= (e.clientX - dr[0]) * 0.006;
      pitch = clamp(pitch + (e.clientY - dr[1]) * 0.005, 0.1, 1.3);
      dr = [e.clientX, e.clientY];
    },
    pu = () => (dr = null),
    wh = (e) => {
      e.preventDefault();
      dist = clamp(dist + e.deltaY * 0.01, 4, 20);
    };
  el.addEventListener("pointerdown", pd);
  el.addEventListener("pointermove", pm);
  el.addEventListener("pointerup", pu);
  el.addEventListener("pointercancel", pu);
  el.addEventListener("wheel", wh, { passive: false });
  const rs = () => {
    R.setSize(innerWidth, innerHeight);
    cam.aspect = innerWidth / innerHeight;
    cam.updateProjectionMatrix();
  };
  addEventListener("resize", rs);
  addEventListener("orientationchange", rs);
  const vis = () => {
    if (document.hidden && o.onHidden) o.onHidden();
  };
  document.addEventListener("visibilitychange", vis);
  /* ---------- performance governor ---------- */
  let fAcc = 0,
    fN = 0,
    adapt = 0,
    lastAdapt = 0,
    fpsT = 0,
    fpsN = 0;
  const baseCrowd = chars.length;
  function applyAdapt(l) {
    if (l == 1) {
      pr = Math.max(0.75, pr * 0.8);
      R.setPixelRatio(pr);
      E.setPR(pr);
      V.sparks.mat.uniforms.uPR.value = pr;
    } else if (l == 2) {
      E.lights.moon.castShadow = false;
      pr = Math.max(0.75, pr * 0.9);
      R.setPixelRatio(pr);
      E.setPR(pr);
    } else if (l == 3) {
      crowd.setActive(Math.floor(baseCrowd * 0.7));
    } else if (l == 4) {
      V.sparks.setLim(Qd.spark * 0.5);
      V.flakes.setLim(Qd.flake * 0.5);
      E.fxScale = 0.6;
      E.motes.visible = false;
    } else if (l == 5) {
      crowd.setActive(Math.floor(baseCrowd * 0.45));
      E.fxScale = 0.25;
      E.lights.colL.forEach((l) => (l.visible = false));
      E.beams && E.beams.forEach((b, i) => (b.visible = i % 2 == 0));
      pr = Math.max(0.7, pr * 0.9);
      R.setPixelRatio(pr);
      E.setPR(pr);
    }
    if (o.onAdapt) o.onAdapt(l);
  }
  function perf(raw) {
    fAcc += raw;
    fN++;
    if (fN >= 45) {
      const avg = fAcc / fN;
      fAcc = 0;
      fN = 0;
      if (SET.auto && avg > 0.026 && adapt < 5 && T - lastAdapt > 1.2) {
        adapt++;
        lastAdapt = T;
        applyAdapt(adapt);
      }
    }
    fpsT += raw;
    fpsN++;
    if (fpsT > 0.5) {
      if (o.fps && o.fps.current)
        o.fps.current.textContent =
          Math.round(fpsN / fpsT) +
          " fps · " +
          (adapt ? "auto-" + adapt : QUALITY[o.q].name);
      fpsT = 0;
      fpsN = 0;
    }
  }
  crowd.setActive(chars.length);
  if (o.ac) {
    A.loadMusic(
      CONFIG.music.url,
      CONFIG.music.bpm,
      () =>
        o.ac.currentTime + (((Math.floor(beat / 4) + 2) * 4 - beat) * 60) / bpm,
    );
  }
  /* ---------- camera ---------- */
  const tgtP = new THREE.Vector3(),
    tgtL = new THREE.Vector3();
  function updateCamera(dt) {
    const mode = o.cam.current,
      ty = 1.35 * player.spec.sy;
    let fovT = 58 - kick * 4 + Math.min(combo, 20) * 0.25,
      k = 1 - Math.exp(-dt * (phase == "intro" ? 6 : 7)),
      kl = k;
    if (phase == "intro") {
      const u = sstep(clamp(introT / INTRO, 0, 1)),
        a = lerp(-PI / 2, PI / 2, u),
        r = lerp(62, 16.2, u),
        hh = lerp(30, 4.7, u);
      tgtP.set(
        Math.cos(a) * r + px * u,
        hh,
        Math.sin(a) * r * 1 + (u > 0.7 ? (pz - 9) * u : 0),
      );
      tgtL.set(lerp(0, px, u * u), lerp(5, ty, u * u), lerp(0, pz, u * u));
      fovT = lerp(50, 58, u);
      k = 1;
      kl = 1;
      if (introT / INTRO < 0.02) {
        camPos.copy(tgtP);
        camLook.copy(tgtL);
      }
    } else if (shot && shot.type == "celebrate") {
      shot.t += dt;
      const u = shot.t / shot.dur,
        a = shot.a0 + u * PI * 0.9 + PI * 0.5,
        r = lerp(7, 5, u);
      tgtP.set(px + Math.cos(a) * r, lerp(1.4, 2.8, u), pz + Math.sin(a) * r);
      tgtL.set(px, ty + 0.2, pz);
      fovT = 54;
      if (u >= 1) shot = null;
    } else if (shot && shot.type == "stage") {
      shot.t += dt;
      const u = shot.t / shot.dur,
        L = Math.hypot(px, pz) || 1;
      tgtP.set(
        px + (px / L) * (12 - u * 3),
        5.2 + u,
        pz + (pz / L) * (12 - u * 3),
      );
      tgtL.set(px * 0.2, 3.2, pz * 0.2);
      fovT = 52;
      if (u >= 1) shot = null;
    } else if (mode == 1) {
      const ct = T * 0.15,
        cd = 9 + 4 * Math.sin(ct * 0.7);
      tgtP.set(
        px + Math.sin(ct) * cd,
        2.5 + 2.2 * Math.sin(ct * 1.9) + Math.abs(Math.sin(ct * 0.5)) * 3,
        pz + Math.cos(ct) * cd,
      );
      tgtL.set(px, ty, pz);
    } else if (mode == 2) {
      tgtP.set(px * 0.8, 34, pz * 0.8 + 16);
      tgtL.set(px, ty, pz);
    } else if (mode == 3) {
      tgtP.set(px + Math.sin(pyaw) * 3.4, 1.7, pz + Math.cos(pyaw) * 3.4);
      tgtL.set(px, ty, pz);
    } else if (mode == 4) {
      const L = Math.hypot(px, pz) || 1;
      tgtP.set(px + (px / L) * 10, 4.8, pz + (pz / L) * 10);
      tgtL.set(px * 0.25, 2.6, pz * 0.25);
      fovT = 54;
    } else {
      tgtP.set(
        px + Math.sin(yaw) * Math.cos(pitch) * dist,
        ty + Math.sin(pitch) * dist,
        pz + Math.cos(yaw) * Math.cos(pitch) * dist,
      );
      tgtL.set(px, ty, pz);
    }
    if (phase != "intro" && !shot && M.dur == 0 && o.gm == "free") {
      glanceT -= dt;
      if (idleT > 2 && glanceT <= 0) {
        startShot("stage", 5.5);
        glanceT = 45;
      }
    }
    if (phase == "intro" && introT / INTRO < 0.02) {
    } else {
      camPos.lerp(tgtP, k);
      camLook.lerp(tgtL, kl);
    }
    if (combo >= 5 && phase != "intro") {
      const sh =
        Math.exp(-fract(beat) * 6) * 0.04 * Math.min(combo / 25, 1.5) + shake;
      camPos.x += rnd(-sh, sh);
      camPos.y += rnd(-sh, sh);
    }
    if (camPos.y < 0.7) camPos.y = 0.7;
    cam.position.copy(camPos);
    cam.lookAt(camLook);
    if (Math.abs(cam.fov - fovT) > 0.02) {
      cam.fov += (fovT - cam.fov) * Math.min(1, dt * 8);
      cam.updateProjectionMatrix();
    }
  }
  /* ---------- main update ---------- */
  const compV = [];
  for (let i = 0; i < K; i++) compV.push({ x: 0, z: 0, s: i == 0 });
  function update(dt, raw) {
    T += dt;
    FS.T = T;
    FS.dt = dt;
    /* beat clock: follows the audio clock when available so music and gameplay never drift */
    let dB = dt;
    if (o.ac && o.ac.state == "running") {
      const n = o.ac.currentTime;
      dB = lastAc === null ? dt : Math.min(Math.max(n - lastAc, 0), 0.1);
      lastAc = n;
    }
    beat += (dB * bpm) / 60;
    const nb = Math.floor(beat / 4);
    if (nb !== curBar) {
      curBar = nb;
      bpm = bpmFor(nb);
      pat = patFor(nb);
      if (!A.musicOn && nb >= startBar && M.bpm && Math.abs(bpm - FS.bpm) > 0)
        A.nextSlot = null;
    }
    FS.beat = beat;
    FS.bpm = bpm;
    FS.pat = pat;
    FS.fever = fever > 0;
    FS.dand = pat.id == 2;
    if (phase == "intro") {
      introT += dt;
      if (beat >= startBeat) {
        phase = "play";
        playT = 0;
        jk = startBeat * 2;
        sayMsg("જય માઁ અંબે!", "p3");
        V.rings.spawn(0, 0, 0xffd54f, 34, 1.6);
        A.cheer(0.6);
      }
    } else if (phase == "play") {
      playT += dt;
      if (M.dur > 0 && playT >= M.dur) finish("complete");
    }
    if (phase == "end") endT += dt;
    /* auto-miss for claps that were never made */
    if (phase == "play" && M.auto) {
      const w = win(),
        spb = 60 / bpm,
        sp = (beat - (A.lat() * bpm) / 60) * 2;
      while (jk < Math.floor(sp) && ((sp - jk) * spb) / 2 > w.d) {
        const pt = patFor(Math.floor(jk / 8));
        if (pt.s[((jk % 8) + 8) % 8] == 1 && consumed[jk & 63] !== jk)
          miss(true);
        jk++;
      }
    } else if (phase == "play") {
      const sp = beat * 2;
      while (jk < Math.floor(sp) - 2) jk++;
    }
    A.clapVol = o.gm == "free" ? 0.4 : 0.22;
    A.sched(beat, bpm, patFor, 1);
    A.amb(dt, FS.energy);
    if (fever > 0) {
      fever -= dt;
      meter = Math.max(0, fever * 10);
      if (fever <= 0) {
        meter = 0;
      }
    } else meter = Math.max(0, meter - (inRing ? 0.8 : 3) * dt);
    lifeCool -= dt;
    /* player movement */
    const jy = o.joy.current;
    let ix =
        (keys.KeyD || keys.ArrowRight ? 1 : 0) -
        (keys.KeyA || keys.ArrowLeft ? 1 : 0) +
        jy.x,
      iz =
        (keys.KeyW || keys.ArrowUp ? 1 : 0) -
        (keys.KeyS || keys.ArrowDown ? 1 : 0) -
        jy.y;
    const l = Math.hypot(ix, iz);
    if (l > 1) {
      ix /= l;
      iz /= l;
    }
    const cl = Math.hypot(px - cam.position.x, pz - cam.position.z) || 1,
      fx2 = (px - cam.position.x) / cl,
      fz = (pz - cam.position.z) / cl,
      mx = fx2 * iz - fz * ix,
      mz = fz * iz + fx2 * ix;
    if (l > 0.1) idleT = 0;
    else idleT += dt;
    if (phase != "intro" || true) {
      px += mx * 5 * dt;
      pz += mz * 5 * dt;
    }
    let r = Math.hypot(px, pz),
      best = 1e9,
      ri = 0;
    for (let k = 0; k < rings.length; k++) {
      const dd = Math.abs(r - rings[k].R);
      if (dd < best) {
        best = dd;
        ri = k;
      }
    }
    const hitR = best < 1.1;
    inRing = K ? true : hitR;
    if (hitR && !K) {
      const a = Math.atan2(pz, px) + rings[ri].w * dt;
      px = Math.cos(a) * r;
      pz = Math.sin(a) * r;
    }
    r = Math.hypot(px, pz);
    if (r < 7.4) {
      px *= 7.4 / r;
      pz *= 7.4 / r;
    } else if (r > W - 6) {
      px *= (W - 6) / r;
      pz *= (W - 6) / r;
    }
    if (l > 0.1) pyaw = Math.atan2(mx, mz);
    else if (K == 1)
      pyaw = Math.atan2(
        (comps[0].pos.x || px) - px,
        (comps[0].pos.z || pz) - pz,
      );
    else if (K) pyaw = T * 1.2;
    else if (inRing) pyaw = Math.atan2(-px, -pz);
    const vk = Math.min(1, dt * 10),
      ivx = (px - ppx) / Math.max(dt, 0.001),
      ivz = (pz - ppz) / Math.max(dt, 0.001);
    pvx += (ivx - pvx) * vk;
    pvz += (ivz - pvz) * vk;
    ppx = px;
    ppz = pz;
    const sy = Math.sin(pyaw),
      cy = Math.cos(pyaw);
    /* heroes */
    player.ch.clap = Math.max(0, player.ch.clap - dt * 4);
    player.ch.cel = Math.max(0, player.ch.cel - dt * 0.4);
    player.root.position.set(px, 0, pz);
    pl.yaw = pyaw;
    pl.vz = pvx * sy + pvz * cy;
    pl.vx = pvx * cy - pvz * sy;
    player.sticks.forEach((s) => (s.visible = FS.dand));
    poseChar(player.B, player.ch, FS, pl);
    for (let i = 0; i < K; i++) {
      const c = comps[i],
        a = T * (K == 1 ? 0.7 : 0.9) + (i / K) * TAU,
        rr = K == 1 ? 1.6 : 2.3,
        qx = px + Math.cos(a) * rr,
        qz = pz + Math.sin(a) * rr,
        s = 1 - Math.exp(-dt * 7),
        p = c.pos;
      if (p.s === undefined) {
        p.x = qx;
        p.z = qz;
        p.s = 1;
      }
      const ox = p.x,
        oz = p.z;
      p.x += (qx - p.x) * s;
      p.z += (qz - p.z) * s;
      const vx = (p.x - ox) / Math.max(dt, 0.001),
        vz = (p.z - oz) / Math.max(dt, 0.001),
        yw = Math.atan2(px - p.x, pz - p.z);
      c.root.position.set(p.x, 0, p.z);
      pl.yaw = yw;
      pl.vz = vx * Math.sin(yw) + vz * Math.cos(yw);
      pl.vx = vx * Math.cos(yw) - vz * Math.sin(yw);
      c.ch.cel = player.ch.cel;
      c.sticks.forEach((s) => (s.visible = FS.dand));
      poseChar(c.B, c.ch, FS, pl);
    }
    FS.energy = clamp(0.35 + combo / 60 + (fever > 0 ? 0.25 : 0), 0.3, 1.2);
    crowd.update(FS, cam.position, place, frame, FS.dand);
    for (const dm of E.drummers) {
      pl.yaw = dm.yaw;
      poseDrummer(dm.B, dm.ch, FS, pl);
    }
    /* beat-driven visual events */
    const pulse = Math.exp(-fract(beat) * 6),
      cf = clamp(combo / 50, 0, 1) + (fever > 0 ? 0.4 : 0);
    const bi = Math.floor(beat);
    if (bi !== FS.lastBi) {
      FS.lastBi = bi;
      if (bi % 4 == 0 && phase != "intro")
        V.rings.spawn(
          0,
          0,
          E.theme
            ? "#" + E.theme.clone().convertLinearToSRGB().getHexString()
            : 0xffc94a,
          28,
          1.5,
        );
      if (pl.vz !== undefined && Math.abs(pvx) + Math.abs(pvz) > 0.5)
        V.dust(px, pz, 2);
      if (combo >= 10 && Math.random() < 0.5)
        V.sparks.spawn(
          rnd(-2, 2) + px,
          0.2,
          rnd(-2, 2) + pz,
          0,
          rnd(1, 2.5),
          0,
          1.2,
          3,
          0xffd54f,
          -0.2,
        );
    }
    E.update(T, dt, pulse, cf, px, pz, camPos);
    V.update(dt, T);
    V.updAura(px, pz, player.spec.sy, T, combo, pulse);
    if (combo >= 25 && Math.random() < dt * (combo >= 100 ? 30 : 8) * Qd.fx)
      V.flakes.spawn(
        px + rnd(-4, 4),
        9,
        pz + rnd(-4, 4),
        0,
        -0.5,
        0,
        6,
        pick([0xff8f00, 0xffb300, 0xe91e63]),
        true,
      );
    if (!(frame % 2) && Math.random() < dt * 20 * Qd.fx && E.drummers.length)
      V.sparks.spawn(
        rnd(-1, 1),
        6,
        rnd(-1, 1),
        rnd(-0.5, 0.5),
        rnd(0.2, 1),
        rnd(-0.5, 0.5),
        1.8,
        2.5,
        0xffb347,
        -0.1,
      );
    kick = Math.max(0, kick - dt * 3);
    shake = Math.max(0, shake - dt * 0.2);
    msgT -= dt;
    bannerT -= dt;
    if (flashA > 0) {
      flashA = Math.max(0, flashA - dt * 2.4);
      const f = o.flash && o.flash.current;
      if (f) f.style.opacity = flashA;
    }
    updateCamera(dt);
    /* HUD: ring pulse, lane, 10 Hz state */
    const fr = fract(beat);
    o.ring.current.style.transform = "scale(" + (1 + (1 - fr) * 1.3) + ")";
    o.dot.current.style.transform = "scale(" + (fr < 0.15 ? 1.25 : 1) + ")";
    const slot = Math.floor(beat * 2) & 7;
    if (lane && lane.current && (slot !== laneCur || pat !== lanePat)) {
      const cs = lane.current.children;
      for (let i = 0; i < 8 && i < cs.length; i++)
        cs[i].className =
          "ld " +
          (pat.s[i] == 1 ? "clap" : pat.s[i] == 2 ? "twirl" : "step") +
          (i == slot ? " on" : "");
      laneCur = slot;
      lanePat = pat;
    }
    hudT += dt;
    if (hudT > 0.1) {
      hudT = 0;
      const acc = st.notes ? (st.pts / st.notes) * 100 : 100,
        left = M.dur > 0 ? Math.max(0, M.dur - playT) : playT,
        cd = phase == "intro" ? Math.max(0, Math.ceil(startBeat - beat)) : 0;
      o.hud({
        score,
        combo,
        meter,
        msg: msgT > 0 ? msg : "",
        msgK,
        msgId,
        inRing,
        bt: Math.floor(beat) % 4,
        phase,
        cd: cd > 0 && cd <= 3 ? cd : 0,
        time: left,
        timed: M.dur > 0,
        lives,
        maxLives: M.lives,
        bpm,
        pat: pat.n,
        patGu: pat.gu,
        acc: Math.round(acc),
        fever: fever > 0,
        banner: bannerT > 0 ? banner : "",
        bannerId,
        tag:
          K == 1
            ? "💕 Dancing with your partner"
            : K
              ? "👯 Dancing with your friends"
              : inRing
                ? "✅ In the ring"
                : "Join a ring!",
        perfect: st.perfect,
        maxCombo,
      });
    }
  }
  /* ---------- loop ---------- */
  const clock = new THREE.Clock();
  let wasPaused = false;
  function loop() {
    if (dead) return;
    raf = requestAnimationFrame(loop);
    const raw = clock.getDelta(),
      dt = Math.min(raw, 0.05);
    if (o.paused.current) {
      if (!wasPaused) {
        wasPaused = true;
        lastAc = null;
        applyVol();
      }
      R.render(S, cam);
      return;
    }
    if (wasPaused) {
      wasPaused = false;
      lastAc = null;
      applyVol();
    } else if ((frame & 31) == 0) applyVol();
    perf(raw);
    frame++;
    update(dt, raw);
    R.render(S, cam);
  }
  loop();
  /* ---------- public API + cleanup ---------- */
  return {
    clap,
    applySettings() {
      applyVol();
    },
    skip() {
      if (phase == "intro") clap();
    },
    dispose() {
      dead = true;
      cancelAnimationFrame(raf);
      removeEventListener("keydown", kd);
      removeEventListener("keyup", ku);
      removeEventListener("resize", rs);
      removeEventListener("orientationchange", rs);
      document.removeEventListener("visibilitychange", vis);
      el.removeEventListener("pointerdown", pd);
      el.removeEventListener("pointermove", pm);
      el.removeEventListener("pointerup", pu);
      el.removeEventListener("pointercancel", pu);
      el.removeEventListener("wheel", wh);
      A.stop();
      crowd.dispose();
      heroes.forEach(disposeHero);
      try {
        E.lights.moon.shadow &&
          E.lights.moon.shadow.map &&
          E.lights.moon.shadow.map.dispose();
      } catch (e) {}
      S.traverse((ob) => {
        if (ob.geometry && ob.geometry.dispose) ob.geometry.dispose();
        const m = ob.material;
        if (m) {
          (Array.isArray(m) ? m : [m]).forEach((x) => {
            if (x.map && x.map.dispose) x.map.dispose();
            x.dispose && x.dispose();
          });
        }
      });
      reg.forEach((x) => {
        try {
          x && x.dispose && x.dispose();
        } catch (e) {}
      });
      reg.length = 0;
      REG = null;
      SIGNS.length = 0;
      if (S.environment) {
        S.environment.dispose && S.environment.dispose();
      }
      R.dispose();
      try {
        R.forceContextLoss();
      } catch (e) {}
      el.remove();
    },
  };
}
