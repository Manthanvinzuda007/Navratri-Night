/*Copyright (c) 2026 MANTHAN VINZUDA

All rights reserved.

This source code is provided for viewing purposes only.
You may not copy, modify, distribute, sublicense, or use
this code or substantial portions of it without permission.*/

/* ============================ 7. AUDIO – procedural Garba soundscape (+ optional real music) ============================ */
function createAudio(ac, vols) {
  const A = {
    ac,
    musicOn: false,
    clapVol: 0.25,
    nextSlot: null,
    bar: -1,
    dead: false,
    src: [],
  };
  if (!ac)
    return Object.assign(A, {
      sched() {},
      clap() {},
      cheer() {},
      bell() {},
      ui: { click() {}, hover() {}, start() {}, level() {}, tick() {} },
      setVol() {},
      loadMusic() {
        return Promise.resolve(false);
      },
      amb() {},
      stop() {},
      lat: () => 0,
    });
  const mk = (v) => {
    const g = ac.createGain();
    g.gain.value = v;
    return g;
  };
  const master = mk(1),
    comp = ac.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.ratio.value = 4;
  comp.attack.value = 0.004;
  comp.release.value = 0.2;
  master.connect(comp);
  comp.connect(ac.destination);
  const busM = mk(0.7),
    busS = mk(0.9),
    busA = mk(0.35),
    busP = mk(0.8);
  busM.connect(master);
  busS.connect(master);
  busA.connect(master);
  busP.connect(master);
  A.busM = busM;
  const nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate),
    nd = nb.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const lat = () => (ac.baseLatency || 0) + (ac.outputLatency || 0);
  A.lat = lat;
  const nz = (t, dur, fq, q, type, g, bus, atk) => {
    const s = ac.createBufferSource(),
      f = ac.createBiquadFilter(),
      o = ac.createGain();
    s.buffer = nb;
    s.loop = dur > 1;
    f.type = type || "bandpass";
    f.frequency.value = fq;
    f.Q.value = q || 1;
    atk = atk || 0.002;
    o.gain.setValueAtTime(0, t);
    o.gain.linearRampToValueAtTime(g, t + atk);
    o.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f);
    f.connect(o);
    o.connect(bus || busS);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.05);
  };
  const tn = (t, f1, f2, dur, type, g, bus, atk) => {
    const o = ac.createOscillator(),
      e = ac.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    atk = atk || 0.002;
    e.gain.setValueAtTime(0, t);
    e.gain.linearRampToValueAtTime(g, t + atk);
    e.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(e);
    e.connect(bus || busS);
    o.start(t);
    o.stop(t + dur + 0.05);
  };
  /* percussion voices */
  const dholBass = (t, v) => {
      tn(t, 150, 52, 0.28, "sine", v * 0.95, busP);
      nz(t, 0.05, 180, 0.7, "lowpass", v * 0.5, busP);
    },
    dholTak = (t, v) => {
      nz(t, 0.06, 3400, 1.4, "bandpass", v * 0.55, busP);
      tn(t, 420, 300, 0.07, "triangle", v * 0.3, busP);
    },
    dholak = (t, v) => {
      tn(t, 330, 190, 0.14, "sine", v * 0.6, busP);
      nz(t, 0.04, 1800, 1, "bandpass", v * 0.25, busP);
    },
    manjira = (t, v) => {
      [5600, 8100, 11200].forEach((f, i) =>
        tn(t, f, f * 0.99, 0.09, "square", (v * 0.022) / (i + 1), busP),
      );
      nz(t, 0.05, 9000, 2, "highpass", v * 0.08, busP);
    },
    handClap = (t, v) => {
      nz(t, 0.07, 1500, 0.9, "bandpass", v, busS);
      nz(t + 0.012, 0.05, 2300, 1.2, "bandpass", v * 0.7, busS);
    };
  /* harmonium-like voice + drone */
  const D4 = 293.66,
    deg = [0, 2, 4, 7, 9, 12, 14, 16],
    PH = [
      [
        [0, 4, 2],
        [2, 3, 1],
        [3, 2, 1],
        [4, 4, 2],
        [6, 2, 2],
      ],
      [
        [0, 5, 2],
        [2, 4, 1],
        [3, 3, 1],
        [4, 2, 2],
        [6, 0, 2],
      ],
      [
        [0, 2, 1],
        [1, 3, 1],
        [2, 4, 2],
        [4, 5, 2],
        [6, 4, 2],
      ],
      [
        [0, 4, 3],
        [3, 2, 1],
        [4, 3, 2],
        [6, 0, 2],
      ],
    ];
  const harm = (t, f, dur, g) => {
    const o1 = ac.createOscillator(),
      o2 = ac.createOscillator(),
      fl = ac.createBiquadFilter(),
      e = ac.createGain(),
      lf = ac.createOscillator(),
      lg = ac.createGain();
    o1.type = "sawtooth";
    o2.type = "square";
    o1.frequency.value = f;
    o2.frequency.value = f * 1.004;
    fl.type = "lowpass";
    fl.frequency.value = 2100;
    fl.Q.value = 0.7;
    lf.frequency.value = 5.2;
    lg.gain.value = f * 0.006;
    lf.connect(lg);
    lg.connect(o1.frequency);
    e.gain.setValueAtTime(0, t);
    e.gain.linearRampToValueAtTime(g, t + 0.03);
    e.gain.setValueAtTime(g, t + dur * 0.7);
    e.gain.exponentialRampToValueAtTime(0.0008, t + dur + 0.1);
    o1.connect(fl);
    o2.connect(fl);
    fl.connect(e);
    e.connect(busM);
    [o1, o2, lf].forEach((o) => {
      o.start(t);
      o.stop(t + dur + 0.2);
    });
  };
  let drone = null;
  const startDrone = () => {
    if (drone || A.musicOn) return;
    const fl = ac.createBiquadFilter(),
      g = ac.createGain();
    fl.type = "lowpass";
    fl.frequency.value = 650;
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.05, ac.currentTime + 3);
    const os = [D4 / 2, D4 * 0.75, D4].map((f, i) => {
      const o = ac.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f * (1 + (i - 1) * 0.002);
      o.connect(fl);
      o.start();
      return o;
    });
    fl.connect(g);
    g.connect(busM);
    drone = { os, g };
  };
  let ambN = null;
  const startAmb = () => {
    if (ambN) return;
    const s = ac.createBufferSource(),
      f = ac.createBiquadFilter(),
      f2 = ac.createBiquadFilter(),
      g = ac.createGain();
    s.buffer = nb;
    s.loop = true;
    f.type = "bandpass";
    f.frequency.value = 520;
    f.Q.value = 0.45;
    f2.type = "lowpass";
    f2.frequency.value = 1400;
    g.gain.value = 0.16;
    s.connect(f);
    f.connect(f2);
    f2.connect(g);
    g.connect(busA);
    s.start();
    ambN = s;
  };
  /* slot scheduler: eighth-note grid, sample accurate against AudioContext time */
  A.sched = (beatPos, bpm, getPat, gain) => {
    if (A.dead || ac.state != "running") return;
    startDrone();
    startAmb();
    const spb = 60 / bpm,
      look = 0.14;
    if (
      A.nextSlot === null ||
      A.nextSlot / 2 < beatPos - 1 ||
      A.nextSlot / 2 > beatPos + 2
    )
      A.nextSlot = Math.ceil(beatPos * 2);
    while (A.nextSlot / 2 < beatPos + look / spb) {
      const k = A.nextSlot,
        m = ((k % 8) + 8) % 8,
        bar = Math.floor(k / 8),
        t = Math.max(ac.currentTime + (k / 2 - beatPos) * spb, ac.currentTime),
        pat = getPat(bar),
        dg = A.musicOn ? 0.32 : 1,
        v = (gain || 1) * dg;
      if (m == 0 || m == 4) dholBass(t, v * (m == 0 ? 1 : 0.85));
      if (m == 6) dholBass(t, v * 0.8);
      if (m == 3) dholBass(t, v * 0.35);
      if (m == 2 || m == 6) dholTak(t, v * 0.8);
      else if (m == 1 || m == 5 || m == 7) dholTak(t, v * 0.28);
      if (m == 3 || m == 7) dholak(t, v * 0.8);
      if (m == 0 || m == 4) dholak(t, v * 0.4);
      if (m & 1) manjira(t, v * 0.7);
      if (m == 0) manjira(t, v);
      if (pat && pat.s[m] == 1) handClap(t, A.clapVol * (A.musicOn ? 0.7 : 1));
      if (m == 0 && !A.musicOn) {
        const ph = PH[bar & 3];
        for (const n of ph) {
          harm(
            t + (n[0] * spb) / 2,
            D4 * Math.pow(2, deg[n[1]] / 12),
            ((n[2] * spb) / 2) * 0.92,
            0.05,
          );
        }
      }
      A.nextSlot++;
    }
  };
  A.clap = (g) => {
    const t = ac.currentTime;
    if (g == 2) {
      handClap(t, 0.55);
      tn(t, 1300, 900, 0.06, "sine", 0.08);
    } else if (g == 1) {
      handClap(t, 0.4);
    } else if (g == 3) {
      handClap(t, 0.28);
    } else {
      tn(t, 140, 70, 0.12, "sawtooth", 0.14);
      nz(t, 0.06, 500, 1, "lowpass", 0.12);
    }
  };
  A.cheer = (k) => {
    const t = ac.currentTime,
      d = 1 + k * 0.8;
    [650, 1100, 1800].forEach((f, i) =>
      nz(t + i * 0.03, d, f, 1.3, "bandpass", 0.07 + k * 0.06, busA, 0.25),
    );
    for (let i = 0; i < 3; i++)
      tn(
        t + 0.1 * i,
        520 + i * 60,
        760 + i * 80,
        d * 0.7,
        "sawtooth",
        0.012,
        busA,
        0.3,
      );
  };
  A.bell = (f) => {
    const t = ac.currentTime;
    f = f || 880;
    [1, 2.76, 5.4, 8.9].forEach((m, i) =>
      tn(
        t,
        f * m,
        f * m * 0.998,
        1.9 / (i + 1),
        "sine",
        0.1 / (i + 1),
        busS,
        0.003,
      ),
    );
  };
  A.ui = {
    click() {
      tn(ac.currentTime, 900, 1500, 0.07, "sine", 0.12);
    },
    hover() {
      tn(ac.currentTime, 1700, 1800, 0.025, "sine", 0.03);
    },
    tick() {
      tn(ac.currentTime, 1200, 1200, 0.03, "square", 0.03);
    },
    start() {
      const t = ac.currentTime;
      A.bell(660);
      setTimeout(() => A.bell(990), 160);
      nz(t, 0.5, 1200, 0.5, "bandpass", 0.1, busS, 0.2);
    },
    level() {
      [659, 784, 988, 1318].forEach((f, i) =>
        setTimeout(() => A.bell(f), i * 140),
      );
    },
  };
  A.amb = (dt, intensity) => {
    if (Math.random() < dt * 0.12 * (0.4 + intensity)) {
      const t = ac.currentTime;
      nz(t, 0.9, rnd(700, 1500), 1.2, "bandpass", 0.04, busA, 0.2);
    }
  };
  A.setVol = (m, s, mute) => {
    busM.gain.value = m;
    busS.gain.value = s;
    busP.gain.value = s * 0.9;
    busA.gain.value = s * 0.4;
    master.gain.value = mute ? 0 : 1;
  };
  A.loadMusic = (url, bpm, startAt) =>
    fetch(url)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
      .then((b) => ac.decodeAudioData(b))
      .then((bf) => {
        if (A.dead) return false;
        const s = ac.createBufferSource();
        s.buffer = bf;
        s.loop = true;
        s.connect(busM);
        s.start(Math.max(ac.currentTime, startAt()));
        A.src.push(s);
        A.musicOn = true;
        if (drone) {
          drone.g.gain.value = 0;
        }
        return true;
      })
      .catch(() => false);
  A.stop = () => {
    A.dead = true;
    try {
      A.src.forEach((s) => s.stop());
      ambN && ambN.stop();
      drone && drone.os.forEach((o) => o.stop());
    } catch (e) {}
    [busM, busS, busA, busP, master, comp].forEach((n) => {
      try {
        n.disconnect();
      } catch (e) {}
    });
  };
  return A;
}
