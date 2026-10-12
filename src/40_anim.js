/*Copyright (c) 2026 MANTHAN VINZUDA

All rights reserved.

This source code is provided for viewing purposes only.
You may not copy, modify, distribute, sublicense, or use
this code or substantial portions of it without permission.*/

/* ============================ 5. ANIMATION – Garba choreography + cloth/hair secondary motion ============================ */
let _u = 0;
function clapU(pat, sp) {
  const m = ((sp % 8) + 8) % 8,
    c = pat.claps;
  let p = c[c.length - 1] - 8,
    n = c[0];
  for (let i = 0; i < c.length; i++) {
    if (c[i] <= m) {
      p = c[i];
      n = i + 1 < c.length ? c[i + 1] : c[0] + 8;
    }
  }
  _u = (m - p) / (n - p);
}
const _armSet = (B, s, th, ph, el, wr) => {
  const S = s > 0 ? "L" : "R";
  B["arm" + S].rotation.set(th, 0, s * ph);
  B["fore" + S].rotation.set(el, 0, 0);
  B["hand" + S].rotation.set(wr, 0, 0);
};
/* FS: {T,dt,beat,bpm,pat,energy,fever,dand}  pl: {x,z,yaw,vx,vz}   ch: per-dancer style + dynamic (clap,cel) */
function poseChar(B, ch, FS, pl) {
  const f = ch.g == "f",
    b = FS.beat + ch.ph,
    fr = fract(b),
    bi = ((Math.floor(b) % 4) + 4) % 4,
    I = ch.int * (0.85 + 0.3 * FS.energy) * (FS.fever ? 1.12 : 1),
    sw = Math.sin(PI * b),
    bobN = Math.abs(sw),
    dip = 1 - bobN;
  const tw = bi == 3 ? fr : 0,
    twS = sstep(tw),
    twV = bi == 3 ? 6 * fr * (1 - fr) : 0,
    up = bi == 3 ? Math.sin(PI * fr) : 0,
    flare = clamp((TAU * twV * FS.bpm) / 60 / 14, 0, 1.1);
  const wk = clamp(Math.abs(pl.vz || 0) / 2.2, 0, 1),
    sideW = clamp(Math.abs(pl.vx || 0) / 0.8, 0, 1) * (1 - wk),
    dirX = (pl.vx || 0) > 0 ? 1 : -1;
  if (wk > 0.01) ch.wp += (pl.vz || 0) * FS.dt * 2.6;
  const wp = ch.wp,
    cel = ch.cel || 0,
    pc = ch.clap || 0;
  clapU(FS.pat, b * 2);
  const u = _u,
    open = Math.pow(Math.sin(PI * u), 0.8),
    bar = Math.floor(b / 4);
  B.root.rotation.y = pl.yaw + twS * TAU * ch.hand;
  /* --- pelvis / spine / shoulders --- */
  const hipY =
    0.95 -
    0.05 * I * dip * (1 - wk) +
    up * 0.045 +
    cel * Math.abs(Math.sin(FS.T * 9)) * 0.12;
  B.hips.position.y = hipY;
  B.hips.rotation.set(
    0.07 * wk,
    sw * 0.22 * ch.hipA * (1 - wk * 0.7),
    sw * 0.06 * ch.hipA,
  );
  B.spine.rotation.set(-0.03 * dip * I, -sw * 0.14 * ch.hipA, -sw * 0.04);
  B.chest.rotation.set(
    -0.04 * dip * I + 0.04 * wk,
    sw * 0.13 * ch.shA,
    sw * 0.02,
  );
  B.clavL.rotation.z = 0.05 * ch.shA * sw + 0.02;
  B.clavR.rotation.z = -(-0.05 * ch.shA * sw + 0.02);
  B.neck.rotation.set(
    -0.03,
    Math.sin(PI * b * 0.5) * 0.22 * ch.hdA * (1 - twS),
    0,
  );
  B.head.rotation.set(0.05 * dip * I, 0, sw * 0.07 * ch.hdA);
  /* --- arms: choreography style per dancer --- */
  const sty = FS.dand ? 3 : ch.sty;
  for (const s of [1, -1]) {
    let th,
      ph,
      el,
      wr = 0;
    if (sty == 0) {
      th = lerp(-1.15, -0.55, open);
      ph = lerp(0.1, 1, open);
      el = lerp(-1.3, -0.7, open);
    } else if (sty == 1) {
      th = lerp(-2.35, -1.2, open);
      ph = lerp(0.1, 1.5, open);
      el = lerp(-0.35, -0.5, open);
    } else if (sty == 2) {
      const lead = s * ch.hand * (bar & 1 ? -1 : 1) > 0;
      th = lerp(-1.15, lead ? -2 : -0.4, open);
      ph = lerp(0.1, lead ? 0.8 : 0.7, open);
      el = lerp(-1.3, lead ? -1 : -0.8, open);
      wr = open * 0.5 * Math.sin(PI * b * 2 + s);
    } else {
      const lo = s > 0 == ((bar & 1) == 0);
      th = lerp(-1.05, -0.45, open) + (lo ? -0.18 : 0);
      ph = lerp(0.15, 0.55, open);
      el = lerp(-1.1, -0.55, open);
      wr = FS.dand ? 0.9 : 0;
    }
    const cl = Math.max(1 - open, pc);
    if (pc > 0) {
      th = lerp(th, -1.15, pc);
      ph = lerp(ph, 0.1, pc);
      el = lerp(el, -1.3, pc);
    }
    th = lerp(th, -2.7, up);
    ph = lerp(ph, 0.55, up);
    el = lerp(el, -0.25, up);
    if (cel > 0) {
      const wv = Math.sin(FS.T * 10 + s) * 0.3;
      th = lerp(th, -2.9 + wv, cel);
      ph = lerp(ph, 0.6, cel);
      el = lerp(el, -0.3, cel);
    }
    if (wk > 0.01) {
      const sg = Math.sin(wp + (s > 0 ? 0 : PI)) * 0.55;
      th = lerp(th, sg * (ch.g == "f" ? 0.8 : 1), wk);
      ph = lerp(ph, 0.12, wk);
      el = lerp(el, -0.35 - 0.2 * Math.max(0, sg), wk);
    }
    _armSet(B, s, th, ph, el, wr);
  }
  /* --- legs: alternating step-tap, side-step for ring movement, walk cycle when travelling --- */
  const evenB = (Math.floor(b) & 1) == 0;
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R",
      lift = s > 0 == evenB ? Math.sin(PI * fr) : 0;
    let tx = -0.42 * lift * I * (1 - 0.35 * sideW) + 0.12 * dip,
      kn = 0.85 * lift * I + 0.28 * dip * I,
      lat = dirX * 0.32 * sideW * lift,
      fx = 0.5 * lift;
    if (wk > 0.01) {
      const ph2 = wp + (s > 0 ? 0 : PI);
      tx = lerp(tx, Math.sin(ph2) * 0.7, wk);
      kn = lerp(kn, 0.15 + 0.75 * Math.max(0, Math.sin(ph2 + 0.9)), wk);
      fx = lerp(fx, 0.3 * Math.sin(ph2 + 1.2), wk);
    }
    if (cel > 0) {
      tx = lerp(tx, -0.2 * Math.sin(FS.T * 9 + s), cel);
      kn = lerp(kn, 0.5 + 0.3 * Math.sin(FS.T * 9 + s), cel);
    }
    B["thigh" + S].rotation.set(tx, 0, lat + s * 0.05);
    B["shin" + S].rotation.set(kn, 0, 0);
    B["foot" + S].rotation.set(fx - 0.1 * dip, 0, 0);
  }
  /* --- secondary motion: skirt flare, dupatta/sash and hair lag, jewellery --- */
  const cl = ch.cloth * I;
  if (f) {
    B.skirt.scale.set(
      1 + 0.5 * flare + 0.035 * bobN * cl,
      1 - 0.05 * flare,
      1 + 0.5 * flare + 0.035 * bobN * cl,
    );
    B.skirt.rotation.set(
      -0.03 * sw,
      -sw * 0.12 * ch.hipA,
      -sw * 0.07 * cl + 0.0,
    );
  } else {
    B.skirt.scale.set(1 + 0.22 * flare, 1, 1 + 0.22 * flare);
    B.skirt.rotation.set(-0.02 * sw, -sw * 0.1, -sw * 0.05);
  }
  B.duA.rotation.set(
    0.14 + 0.18 * bobN * cl + 0.25 * wk,
    0,
    f ? -0.07 * sw * cl + 0.85 * flare : -0.05 * sw + 0.5 * flare,
  );
  B.duB.rotation.set(
    0.25 * Math.sin(PI * b - 1.2) * cl + 0.1,
    0,
    0.1 * Math.sin(PI * b - 1.4) * cl + 0.5 * flare,
  );
  B.duC.rotation.set(0.35 * Math.sin(PI * b - 2.2) * cl + 0.1, 0, 0.6 * flare);
  B.hairA.rotation.set(
    0.1 * dip * I + 0.05 + 0.25 * wk,
    0,
    -sw * 0.16 * ch.cloth + 0.9 * flare,
  );
  B.hairB.rotation.set(
    0.2 * Math.sin(PI * b - 1.6) * ch.cloth,
    0,
    -sw * 0.22 * ch.cloth + 0.9 * flare,
  );
  const hd = ch.dang;
  if (hd) {
    for (const d of hd) {
      d.o.rotation.z =
        Math.sin(PI * b - 0.8 + d.ph) * 0.5 * I * d.k * 2 + sw * 0.2;
      d.o.rotation.x = Math.sin(PI * b * 2 - 0.5) * 0.25 * d.k;
    }
  }
}
/* dhol drummer on the mandap */
function poseDrummer(B, ch, FS, pl) {
  const b = FS.beat * 2 + ch.ph * 4,
    a = Math.sin(PI * b),
    bob = Math.abs(Math.sin(PI * FS.beat));
  B.root.rotation.y = pl.yaw;
  B.hips.position.y = 0.95 - 0.05 * (1 - bob);
  B.hips.rotation.set(0, Math.sin(PI * FS.beat) * 0.12, 0);
  B.spine.rotation.set(0.05, 0, Math.sin(PI * FS.beat) * 0.05);
  B.chest.rotation.set(0.04, Math.sin(PI * FS.beat) * -0.1, 0);
  B.neck.rotation.set(0, Math.sin(PI * FS.beat * 0.5) * 0.25, 0);
  B.head.rotation.set(0.06, 0, Math.sin(PI * FS.beat) * 0.08);
  B.clavL.rotation.z = 0.04;
  B.clavR.rotation.z = -0.04;
  _armSet(
    B,
    -1,
    -0.75 + 0.38 * Math.max(0, a),
    0.3,
    -1.45 + 0.55 * Math.max(0, a),
    0.2,
  );
  _armSet(B, 1, -0.8, 0.35, -1.2 + 0.2 * Math.sin(PI * (b + 0.5)), -0.1);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    B["thigh" + S].rotation.set(-0.08 + 0.1 * (1 - bob), 0, s * 0.07);
    B["shin" + S].rotation.set(0.2 + 0.2 * (1 - bob), 0, 0);
    B["foot" + S].rotation.set(-0.1, 0, 0);
  }
  B.skirt.scale.set(1.04, 1, 1.04);
  B.skirt.rotation.set(0, 0, 0);
  B.duA.rotation.set(0.2 + 0.15 * bob, 0, 0.1);
  B.duB.rotation.set(0.2 * Math.sin(PI * FS.beat - 1), 0, 0.1);
  B.duC.rotation.set(0, 0, 0);
  B.hairA.rotation.set(0.1, 0, 0);
  B.hairB.rotation.set(0, 0, 0);
}
