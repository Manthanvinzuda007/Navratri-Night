/*Copyright (c) 2026 MANTHAN VINZUDA

All rights reserved.

This source code is provided for viewing purposes only.
You may not copy, modify, distribute, sublicense, or use
this code or substantial portions of it without permission.*/

/* ============================ 6c. ENVIRONMENT – festival ground (gate, stalls, seating, lights, skyline) ============================ */
function buildFestival(E, S, Qd, ctx) {
  const { mat, basic, add, inst, glowTex } = E,
    lam = !!Qd.lambert,
    W = CONFIG.world.R,
    dm = mat(GOLD, { r: 0.3, m: 0.9, e: 0x3a2400, ei: 0.7 });
  const rr = rng(1234);
  const glowPts = [],
    glowCol = [],
    gAdd = (x, y, z, hex, k) => {
      glowPts.push(x, y, z);
      const c = C(hex);
      glowCol.push(c.r * (k || 1), c.g * (k || 1), c.b * (k || 1));
    };
  const WARM = [0xffd27a, 0xffb347, 0xffe29a, 0xffc266];
  /* ----- boundary: cloth wall, poles, string lights, bunting ----- */
  {
    const c = cvs(256, 64),
      x = c.getContext("2d");
    x.fillStyle = "#6d0f12";
    x.fillRect(0, 0, 256, 64);
    x.fillStyle = "#ffc94a";
    for (let i = 0; i < 8; i++) {
      x.beginPath();
      x.moveTo(i * 32, 64);
      x.lineTo(i * 32 + 16, 26);
      x.lineTo(i * 32 + 32, 64);
      x.fill();
      x.fillStyle = i % 2 ? "#ffc94a" : "#ff7043";
    }
    x.fillStyle = "#ffc94a";
    x.fillRect(0, 0, 256, 8);
    for (let i = 0; i < 32; i++) {
      x.beginPath();
      x.arc(i * 8 + 4, 16, 2.2, 0, TAU);
      x.fill();
    }
    const t = ctex(c, { srgb: true, rep: [44, 1] }),
      wl = add(
        S,
        new THREE.CylinderGeometry(W + 0.9, W + 0.9, 3.4, 96, 1, true),
        mat(0xffffff, { map: t, side: 2, e: 0x2a0a08, ei: 0.5, r: 0.9 }),
        0,
        1.7,
        0,
      );
    E.wall = wl;
  }
  const npo = 26,
    pole = (i) => {
      const a = (i / npo) * TAU;
      return [Math.cos(a) * (W - 0.4), Math.sin(a) * (W - 0.4)];
    };
  inst(
    new THREE.CylinderGeometry(0.1, 0.14, 8, 6),
    mat(0x6d4c41, { r: 0.8 }),
    npo,
    (i, d) => {
      const p = pole(i);
      d.position.set(p[0], 4, p[1]);
    },
    { sh: 0 },
  );
  inst(new THREE.SphereGeometry(0.28, 8, 6), dm, npo, (i, d) => {
    const p = pole(i);
    d.position.set(p[0], 8.1, p[1]);
  });
  const bulbs = [],
    bn = Math.max(3, Math.round(10 * Qd.bulbs)),
    rn = Math.max(5, Math.round(16 * Qd.bulbs)),
    lines = [];
  for (let i = 0; i < npo; i++) {
    const A = pole(i),
      B = pole(i + 1);
    let prev = null;
    for (let k = 0; k <= bn; k++) {
      const u = k / bn,
        p = [
          lerp(A[0], B[0], u),
          7.7 - Math.sin(PI * u) * 1.0,
          lerp(A[1], B[1], u),
        ];
      if (k > 0 && k < bn) bulbs.push(p);
      if (prev) lines.push(prev[0], prev[1], prev[2], p[0], p[1], p[2]);
      prev = p;
    }
  }
  for (let i = 0; i < npo; i++) {
    const A = pole(i);
    let prev = [0, 10.9, 0];
    for (let k = 1; k <= rn; k++) {
      const u = k / rn,
        p = [A[0] * u, lerp(10.9, 7.9, u) - Math.sin(PI * u) * 1.8, A[1] * u];
      if (k < rn) bulbs.push(p);
      lines.push(prev[0], prev[1], prev[2], p[0], p[1], p[2]);
      prev = p;
    }
  }
  {
    const lg = track(new THREE.BufferGeometry());
    lg.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
    const ln = new THREE.LineSegments(
      lg,
      track(
        new THREE.LineBasicMaterial({
          color: C(0x3a2a1a),
          transparent: true,
          opacity: 0.7,
        }),
      ),
    );
    ln.frustumCulled = false;
    S.add(ln);
  }
  {
    const bc = bulbs.map((b, i) =>
      rr() < 0.72
        ? pick(WARM)
        : pick([0xff4081, 0x40c4ff, 0x69f0ae, 0xffeb3b, 0xff7043]),
    );
    inst(
      new THREE.SphereGeometry(0.13, 6, 4),
      basic(0xffffff),
      bulbs.length,
      (i, d) => {
        d.position.set(bulbs[i][0], bulbs[i][1], bulbs[i][2]);
        return bc[i];
      },
    );
    bulbs.forEach((b, i) => gAdd(b[0], b[1], b[2], bc[i], 0.9));
  }
  {
    const tri = track(new THREE.BufferGeometry());
    tri.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([-0.2, 0, 0, 0.2, 0, 0, 0, -0.42, 0], 3),
    );
    tri.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3),
    );
    tri.setIndex([0, 1, 2]);
    const per = Math.max(4, Math.round(12 * Qd.env)),
      n = npo * per;
    inst(tri, basic(0xffffff, { side: 2 }), n, (i, d) => {
      const s = (i / per) | 0,
        k = i % per,
        A = pole(s),
        B = pole(s + 1),
        u = (k + 0.5) / per,
        x = lerp(A[0], B[0], u),
        z = lerp(A[1], B[1], u);
      d.position.set(x, 7.35 - Math.sin(PI * u) * 1.0, z);
      d.rotation.y = Math.atan2(-x, -z) + PI;
      return PAL[(i * 7) % 9];
    });
  }
  /* ----- entrance gate with Gujarati welcome sign ----- */
  {
    const g = new THREE.Group();
    g.position.set(0, 0, -W + 5);
    S.add(g);
    const red = mat(0xa31515, { r: 0.7 }),
      gl = mat(GOLD, { r: 0.3, m: 0.9, e: 0x3a2400, ei: 0.7 });
    for (const s of [-1, 1]) {
      add(
        g,
        loft(
          [
            [0, 1.5],
            [0.5, 1.3],
            [1.4, 1.05],
            [2.2, 1.15],
            [6, 0.85],
            [9, 0.95],
            [9.6, 1.25],
            [10.2, 1.05],
          ].map((r) => [r[0], r[1], r[1]]),
          14,
        ),
        red,
        s * 9.4,
        0,
        0,
        1,
      );
      add(
        g,
        new THREE.SphereGeometry(1.2, 14, 8, 0, TAU, 0, PI / 2),
        gl,
        s * 9.4,
        10.2,
        0,
      );
      add(g, new THREE.ConeGeometry(0.12, 1.2, 6), gl, s * 9.4, 12, 0);
      add(g, new THREE.SphereGeometry(0.25, 8, 6), gl, s * 9.4, 11.6, 0);
      for (let k = 0; k < 4; k++)
        add(
          g,
          new THREE.TorusGeometry(0.95, 0.07, 5, 14),
          gl,
          s * 9.4,
          2.5 + k * 1.8,
          0,
        ).rotation.x = PI / 2;
    }
    add(g, new THREE.BoxGeometry(21, 1.5, 1.5), red, 0, 11, 0, 1);
    add(g, new THREE.BoxGeometry(21.4, 0.25, 1.8), gl, 0, 11.85, 0);
    add(g, new THREE.BoxGeometry(21.4, 0.25, 1.8), gl, 0, 10.15, 0);
    for (let i = 0; i < 9; i++) {
      add(
        g,
        new THREE.SphereGeometry(0.55, 10, 6, 0, TAU, 0, PI / 2),
        gl,
        -8 + i * 2,
        11.85,
        0,
      );
    }
    const sp = signPlate(
      1024,
      256,
      [
        [GU.welcome + " · " + GU.nav, 0.34, 0.4, "800"],
        ["Navratri Mahotsav  ·  Jai Maa Ambe", 0.14, 0.8, "600"],
      ],
      "#8e0f12",
      "#ffd54f",
    );
    const bn = add(
      g,
      new THREE.PlaneGeometry(16.6, 4.15),
      new THREE.MeshBasicMaterial({ map: sp, side: 2 }),
      0,
      8.4,
      0,
    );
    track(bn.material);
    E.gateSign = sp;
    const cols = [0xff8f00, 0xffc400, 0xff6d00];
    const nf = Math.round(80 * Qd.env),
      leaf = track(new THREE.ConeGeometry(0.12, 0.5, 4));
    leaf.rotateX(PI);
    inst(
      leaf,
      mat(0x2e7d32, { r: 0.8 }),
      Math.round(60 * Qd.env) + 1,
      (i, d) => {
        d.position.set(-8.6 + (i / Math.round(60 * Qd.env)) * 17.2, 10.2, 0.5);
        d.rotation.y = 0;
        return 0xffffff;
      },
      { par: g },
    );
    inst(
      new THREE.IcosahedronGeometry(0.17, 0),
      mat(0xffffff, { r: 0.7 }),
      nf * 2,
      (i, d) => {
        const k = i % nf,
          row = (i / nf) | 0,
          x = -8.6 + (k / nf) * 17.2,
          y = 10.0 - row * 0.35 - Math.sin((PI * k) / nf) * 0.7;
        d.position.set(x, y, 0.9);
        d.scale.set(1, 0.75, 1);
        return pick(cols);
      },
      { par: g },
    );
    for (let i = 0; i < 7; i++) {
      const x = -8 + (i * 16) / 6;
      for (let j = 0; j < 5; j++) {
        const o = add(
          g,
          new THREE.IcosahedronGeometry(0.16, 0),
          mat(pick(cols), { r: 0.7 }),
          x,
          9.6 - j * 0.28,
          0.95,
        );
      }
    }
    for (const s of [-1, 1])
      for (let i = 0; i < 4; i++) {
        gAdd(s * 9.4, 10.9, 0, 0xffc266, 1.3);
      }
    gAdd(0, 11.5, 1, 0xffd27a, 1.6);
    /* red carpet with gold border leading into the grounds */
    const cc = cvs(64, 256),
      x = cc.getContext("2d");
    x.fillStyle = "#b71c1c";
    x.fillRect(0, 0, 64, 256);
    x.fillStyle = "#ffc94a";
    x.fillRect(0, 0, 6, 256);
    x.fillRect(58, 0, 6, 256);
    for (let i = 0; i < 8; i++) {
      x.beginPath();
      x.arc(32, i * 32 + 16, 9, 0, TAU);
      x.fill();
    }
    const cp = add(
      S,
      new THREE.PlaneGeometry(4.2, W - 5 - 36),
      new THREE.MeshBasicMaterial({
        map: ctex(cc, { srgb: true, rep: [1, 5] }),
        transparent: true,
        opacity: 0.95,
      }),
      0,
      0.05,
      -(W - 5 + 36) / 2,
    );
    cp.rotation.x = -PI / 2;
    track(cp.material);
    for (const sx of [-1, 1]) {
      const gr = texMandala(
          256,
          ["#e53935", "#ffc107", "#43a047", "#e91e63"],
          5,
        ),
        m = add(
          S,
          new THREE.CircleGeometry(3.6, 32),
          new THREE.MeshBasicMaterial({ map: gr, transparent: true }),
          sx * 7,
          0.05,
          -W + 12,
        );
      m.rotation.x = -PI / 2;
      track(m.material);
    }
  }
  /* ----- lotus lamps on poles + hanging lanterns ----- */
  {
    const n = Math.round(36 * Qd.env),
      pp = [];
    for (let i = 0; i < n; i++) {
      const a = rr() * TAU,
        r = lerp(38, W - 8, rr());
      pp.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    inst(
      new THREE.CylinderGeometry(0.06, 0.09, 3, 6),
      mat(0x5d4037, { r: 0.8 }),
      n,
      (i, d) => {
        d.position.set(pp[i][0], 1.5, pp[i][1]);
      },
    );
    inst(
      new THREE.CylinderGeometry(0.85, 0.14, 0.8, 8, 1, true),
      basic(0xffffff, { side: 2 }),
      n,
      (i, d) => {
        d.position.set(pp[i][0], 3.3, pp[i][1]);
        return PAL[i % 9];
      },
    );
    pp.forEach((p) => gAdd(p[0], 3.35, p[1], 0xffee58, 1.2));
    const ln = Math.round(30 * Qd.env),
      lp = [];
    for (let i = 0; i < ln; i++) {
      const a = (i / ln) * TAU + 0.1,
        r = 38 + (i % 2) * 3;
      lp.push([Math.cos(a) * r, 5.2 + rr() * 1.4, Math.sin(a) * r]);
    }
    const lc = [0xff5252, 0xffb300, 0xff7043, 0xe91e63, 0xffd54f];
    inst(new THREE.SphereGeometry(0.45, 10, 8), basic(0xffffff), ln, (i, d) => {
      d.position.set(lp[i][0], lp[i][1], lp[i][2]);
      d.scale.set(0.85, 1.15, 0.85);
      return lc[i % 5];
    });
    lp.forEach((p, i) => gAdd(p[0], p[1], p[2], lc[i % 5], 1.8));
    const lg = track(new THREE.BufferGeometry()),
      ls = [];
    lp.forEach((p) => ls.push(p[0], p[1] + 0.5, p[2], p[0], 8.5, p[2]));
    lg.setAttribute("position", new THREE.Float32BufferAttribute(ls, 3));
    S.add(
      new THREE.LineSegments(
        lg,
        track(new THREE.LineBasicMaterial({ color: C(0x2a1c10) })),
      ),
    );
  }
  /* ----- stalls (food + handicrafts) ----- */
  {
    const T = Qd.stalls,
      types = [
        ["ફાફડા જલેબી", "Fafda · Jalebi", "#a53a0f", "#ffe082"],
        ["દાબેલી", "Kutchi Dabeli", "#6a1b4d", "#ffe082"],
        ["મસાલા ચા", "Masala Chai", "#1b5e20", "#fff59d"],
        ["ખમણ ઢોકળા", "Khaman Dhokla", "#e65100", "#fff8e1"],
        ["બાંધણી", "Bandhani Sarees", "#880e4f", "#ffd54f"],
        ["હસ્તકલા", "Handicrafts", "#4a148c", "#ffd54f"],
        ["ઘરેણાં", "Jewellery", "#0d47a1", "#ffd54f"],
        ["ચણિયાચોળી", "Chaniya Choli", "#b71c1c", "#ffd54f"],
        ["કુલ્ફી", "Matka Kulfi", "#006064", "#e0f7fa"],
        ["ડાંડિયા", "Dandiya Sticks", "#bf360c", "#ffe0b2"],
        ["પાણીપુરી", "Pani Puri", "#33691e", "#f0f4c3"],
        ["ઢોકળા", "Fresh Dhokla", "#880e4f", "#fff9c4"],
        ["મીઠાઈ", "Mithai", "#e65100", "#fff3e0"],
        ["રમકડાં", "Toys", "#1a237e", "#ffe082"],
      ];
    const st = [];
    for (let i = 0; i < T; i++) {
      const a = -PI / 2 + 0.42 + ((i + 0.5) / T) * (TAU - 0.84);
      st.push({
        a,
        x: Math.cos(a) * (W - 11),
        z: Math.sin(a) * (W - 11),
        t: types[i % types.length],
        ci: i,
      });
    }
    const loc = (s, lx, ly, lz, sx, sy, sz, d) => {
      const yaw = Math.atan2(-s.x, -s.z);
      const c = Math.cos(yaw),
        n = Math.sin(yaw);
      d.position.set(s.x + c * lx + n * lz, ly, s.z - n * lx + c * lz);
      d.rotation.y = yaw;
      d.scale.set(sx, sy, sz);
    };
    const roofC = [0xe53935, 0xff6f00, 0xfdd835, 0xd81b60, 0x43a047, 0x1e88e5],
      bx = track(new THREE.BoxGeometry(1, 1, 1)),
      wood = mat(0xffffff, { r: 0.85 });
    inst(bx, wood, T, (i, d) => {
      loc(st[i], 0, 0.5, 1.1, 4.4, 1, 1, d);
      return 0x6d4c41;
    });
    inst(bx, wood, T, (i, d) => {
      loc(st[i], 0, 1.7, -1.2, 4.6, 3.4, 0.15, d);
      return 0x4e342e;
    });
    inst(bx, mat(0xffffff, { r: 0.8, e: 0x331100, ei: 0.35 }), T, (i, d) => {
      loc(st[i], 0, 3.5, 0.1, 5.4, 0.2, 3.6, d);
      d.rotation.x = 0.0;
      return roofC[i % 6];
    });
    inst(
      bx,
      mat(0xffffff, { r: 0.8, e: 0x331100, ei: 0.35 }),
      T * 6,
      (i, d) => {
        const s = st[(i / 6) | 0],
          k = i % 6;
        loc(s, -2.2 + k * 0.88, 3.18, 1.85, 0.88, 0.6, 0.1, d);
        return k % 2 ? 0xffffff : roofC[(s.ci + 1) % 6];
      },
    );
    inst(bx, wood, T * 2, (i, d) => {
      const s = st[(i / 2) | 0];
      loc(s, (i % 2 ? 1 : -1) * 2.55, 1.75, 1.85, 0.14, 3.5, 0.14, d);
      return 0xffd54f;
    });
    inst(
      new THREE.SphereGeometry(0.2, 8, 6),
      basic(0xffffff),
      T * 6,
      (i, d) => {
        const s = st[(i / 6) | 0];
        loc(s, -1.9 + (i % 6) * 0.76, 1.28, 1.1, 1, 1, 1, d);
        return pick([0xffb74d, 0xffd54f, 0xff8a65, 0xfff176]);
      },
    );
    inst(
      new THREE.CylinderGeometry(0.28, 0.22, 0.36, 8),
      mat(0xffffff, { r: 0.7 }),
      T * 4,
      (i, d) => {
        const s = st[(i / 4) | 0];
        loc(s, -1.4 + (i % 4) * 0.95, 1.2, 1.15, 1, 1, 1, d);
        return 0x8d4a1a;
      },
    );
    st.forEach((s, i) => {
      const c = Math.cos(Math.atan2(-s.x, -s.z)),
        n = Math.sin(Math.atan2(-s.x, -s.z));
      gAdd(s.x + n * 1.6, 3.0, s.z + c * 1.6, 0xffd27a, 2.2);
      gAdd(
        s.x + n * 1.6 - c * 1.4,
        3.0,
        s.z + c * 1.6 + n * 1.4,
        0xffb347,
        1.6,
      );
      gAdd(
        s.x + n * 1.6 + c * 1.4,
        3.0,
        s.z + c * 1.6 - n * 1.4,
        0xffb347,
        1.6,
      );
      if (i < types.length) {
        const t = s.t,
          sg = signPlate(
            512,
            128,
            [
              [t[0], 0.4, 0.4, "800"],
              [t[1], 0.2, 0.78, "600"],
            ],
            t[2],
            t[3],
          ),
          m = add(
            S,
            new THREE.PlaneGeometry(4, 1),
            new THREE.MeshBasicMaterial({ map: sg, side: 2 }),
            0,
            0,
            0,
          );
        track(m.material);
        const yaw = Math.atan2(-s.x, -s.z);
        m.position.set(s.x + n * 2.15, 3.95, s.z + c * 2.15);
        m.rotation.y = yaw;
      }
    });
    E.stalls = st;
  }
  /* ----- seating, crowd barriers, speakers ----- */
  {
    const n = Math.round(250 * Qd.env),
      sp = [];
    const rows = [46, 48.4, 50.8];
    for (let i = 0; i < n; i++) {
      const r = rows[i % 3],
        cnt = Math.floor(n / 3),
        k = (i / 3) | 0,
        a = -PI / 2 + 0.5 + (k / cnt) * (TAU - 1);
      sp.push([Math.cos(a) * r, Math.sin(a) * r, a]);
    }
    const cg = merge([
      xf(new THREE.BoxGeometry(0.5, 0.07, 0.5), [0, 0.46, 0]),
      xf(new THREE.BoxGeometry(0.5, 0.55, 0.06), [0, 0.78, -0.23]),
      xf(new THREE.BoxGeometry(0.05, 0.46, 0.05), [-0.22, 0.23, 0.2]),
      xf(new THREE.BoxGeometry(0.05, 0.46, 0.05), [0.22, 0.23, 0.2]),
      xf(new THREE.BoxGeometry(0.05, 0.46, 0.05), [-0.22, 0.23, -0.2]),
      xf(new THREE.BoxGeometry(0.05, 0.46, 0.05), [0.22, 0.23, -0.2]),
    ]);
    const cc = [0xb71c1c, 0xffb300, 0x1565c0, 0x2e7d32];
    inst(cg, mat(0xffffff, { r: 0.7 }), n, (i, d) => {
      d.position.set(sp[i][0], 0, sp[i][1]);
      d.rotation.y = Math.atan2(-sp[i][0], -sp[i][1]);
      return cc[((i / 3) | 0) % 4];
    });
    const bp = Math.round((TAU * 33) / 3.2),
      pa = (i) => (i / bp) * TAU,
      ok = (i) =>
        Math.abs(
          Math.atan2(Math.sin(pa(i) + PI / 2), Math.cos(pa(i) + PI / 2)),
        ) > 0.22;
    inst(new THREE.CylinderGeometry(0.045, 0.06, 1, 6), dm, bp, (i, d) => {
      d.position.set(Math.cos(pa(i)) * 33, 0.5, Math.sin(pa(i)) * 33);
      if (!ok(i)) d.scale.set(0, 0, 0);
    });
    inst(new THREE.SphereGeometry(0.09, 6, 4), dm, bp, (i, d) => {
      d.position.set(Math.cos(pa(i)) * 33, 1.04, Math.sin(pa(i)) * 33);
      if (!ok(i)) d.scale.set(0, 0, 0);
    });
    inst(
      new THREE.CylinderGeometry(0.025, 0.025, 1, 4),
      mat(0xc62828, { r: 0.7 }),
      bp,
      (i, d) => {
        const A = pa(i),
          B = pa(i + 1),
          x1 = Math.cos(A) * 33,
          z1 = Math.sin(A) * 33,
          x2 = Math.cos(B) * 33,
          z2 = Math.sin(B) * 33,
          L = Math.hypot(x2 - x1, z2 - z1);
        d.position.set((x1 + x2) / 2, 0.8, (z1 + z2) / 2);
        d.scale.set(1, L, 1);
        d.rotation.z = PI / 2;
        d.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
        if (!ok(i)) d.scale.set(0, 0, 0);
      },
    );
    const sg = merge(
      [0, 1, 2, 3]
        .map((k) =>
          xf(
            new THREE.BoxGeometry(1.3, 0.95, 1.1),
            [0, 0.5 + k * 0.97, 0],
            [0, 0, 0],
          ),
        )
        .concat(
          [0, 1, 2, 3].map((k) =>
            xf(
              new THREE.CylinderGeometry(0.34, 0.34, 0.06, 12),
              [0, 0.5 + k * 0.97, 0.57],
              [PI / 2, 0, 0],
            ),
          ),
        ),
    );
    inst(sg, mat(0x1a1a1f, { r: 0.6, m: 0.3 }), 4, (i, d) => {
      const a = [0.62, 2.5, 3.78, 5.66][i];
      d.position.set(Math.cos(a) * 36, 0, Math.sin(a) * 36);
      d.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a));
    });
  }
  /* ----- skyline: apartment blocks with lit windows + distant Ambaji-style shikhara ----- */
  {
    const c = cvs(128, 256),
      x = c.getContext("2d"),
      e = cvs(128, 256),
      y = e.getContext("2d");
    x.fillStyle = "#1e1a34";
    x.fillRect(0, 0, 128, 256);
    y.fillStyle = "#000";
    y.fillRect(0, 0, 128, 256);
    for (let r = 0; r < 14; r++)
      for (let k = 0; k < 6; k++) {
        const on = rr() < 0.42;
        x.fillStyle = on ? "#ffcf70" : "#0d0b1a";
        x.fillRect(k * 21 + 6, r * 18 + 8, 11, 10);
        if (on) {
          y.fillStyle = rr() < 0.8 ? "#ffb347" : "#ffe9b0";
          y.fillRect(k * 21 + 6, r * 18 + 8, 11, 10);
        }
      }
    const bm = mat(0xffffff, {
        map: ctex(c, { srgb: true }),
        emap: ctex(e, { srgb: true }),
        e: 0xffffff,
        ei: 1,
        r: 1,
      }),
      n = Math.round(36 * Qd.env);
    inst(new THREE.BoxGeometry(1, 1, 1), bm, n, (i, d) => {
      const a = (i / n) * TAU + rr() * 0.1,
        r = lerp(104, 150, rr()),
        w = lerp(14, 28, rr()),
        hh = lerp(18, 48, rr());
      d.position.set(Math.cos(a) * r, hh / 2, Math.sin(a) * r);
      d.scale.set(w, hh, lerp(14, 22, rr()));
      d.rotation.y = -a;
      return 0xffffff;
    });
    const tg = loft(
        [
          [0, 11, 11, 0, 0, 2],
          [7, 10, 10, 0, 0, 2],
          [15, 8, 8, 0, 0, 2],
          [23, 6, 6, 0, 0, 2],
          [30, 3.8, 3.8, 0, 0, 2],
          [36, 1.6, 1.6, 0, 0, 2],
          [39, 0.05, 0.05, 0, 0, 2],
        ],
        16,
      ),
      tm = mat(0xf3e6cf, { r: 0.8, e: 0xff9040, ei: 0.28 });
    const T = add(S, tg, tm, Math.cos(0.35) * 128, 0, Math.sin(0.35) * 128);
    add(
      S,
      new THREE.SphereGeometry(1.2, 8, 6),
      dm,
      T.position.x,
      39.4,
      T.position.z,
    );
    gAdd(T.position.x, 20, T.position.z, 0xffa050, 9);
    gAdd(T.position.x, 38, T.position.z, 0xffd080, 6);
  }
  /* ----- glow halos for every light + floating dust motes ----- */
  {
    const gp = glowPoints(
      new Float32Array(glowPts),
      new Float32Array(glowCol),
      5.5,
      { tex: glowTex, flick: 0.12, amt: 0.8 },
    );
    S.add(gp);
    E.bulbGlow = gp;
    E.upd.push((t) => {
      gp.material.uniforms.uT.value = t;
    });
  }
  {
    const n = Qd.motes,
      p = new Float32Array(n * 3),
      sd = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      p.set([rnd(-60, 60), 0, rnd(-60, 60)], i * 3);
      sd[i] = Math.random();
    }
    const g = track(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1));
    const m = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uT: { value: 0 },
          uTex: { value: glowTex },
          uPR: { value: 1 },
        },
        vertexShader:
          "attribute float aSeed;uniform float uT,uPR;varying float vA;void main(){vec3 p=position;p.y=mod(aSeed*16.+uT*(.25+aSeed*.4),16.);p.x+=sin(uT*.2+aSeed*60.)*3.;p.z+=cos(uT*.17+aSeed*45.)*3.;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min((.9+aSeed*.9)*uPR*60./max(-mv.z,1.)*3.,26.*uPR);vA=(.35+.65*sin(uT*1.3+aSeed*30.)*sin(uT*1.3+aSeed*30.))*smoothstep(0.,2.,p.y)*smoothstep(16.,12.,p.y);}",
        fragmentShader:
          "uniform sampler2D uTex;varying float vA;void main(){float a=texture2D(uTex,gl_PointCoord).a*vA;gl_FragColor=vec4(1.,.78,.4,a*.9);\n#include <encodings_fragment>\n}",
      }),
    );
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    S.add(pts);
    E.motes = pts;
    E.upd.push((t) => {
      m.uniforms.uT.value = t;
    });
  }
  /* ----- per-frame update ----- */
  const _t = new THREE.Vector3(),
    sMats = [
      E.motes && E.motes.material,
      E.smoke && E.smoke.material,
      E.bulbGlow && E.bulbGlow.material,
      E.flames && E.flames.material,
      E.stars && E.stars.material,
    ];
  E.setPR = (pr) => {
    [E.motes, E.smoke, E.bulbGlow, E.flames, E.stars].forEach(
      (o) =>
        o && o.material.uniforms.uPR && (o.material.uniforms.uPR.value = pr),
    );
  };
  E.setTheme = (hex) => {
    E.theme = C(hex);
    E.beams &&
      E.beams.forEach((b, i) =>
        b.material.uniforms.uC.value.copy(
          i % 2 ? E.theme : C(PAL[(i * 2) % 9]),
        ),
      );
    E.lights.colL.forEach((l, i) =>
      l.color.copy(i % 2 ? E.theme : C(PAL[(i * 3 + 1) % 9])),
    );
    E.ringMat.color.copy(C(hex)).lerp(C(0xffc94a), 0.4);
  };
  E.fxScale = 1;
  E.update = (T, dt, pulse, comboF, px, pz, cam) => {
    const L = E.lights;
    E.sky.position.copy(cam);
    for (const f of E.upd) f(T, dt);
    L.stageL.intensity =
      (2.2 +
        Math.sin(T * 23) * 0.1 +
        Math.sin(T * 37) * 0.08 +
        pulse * 0.7 +
        comboF * 1.4) *
      (0.6 + 0.4 * E.fxScale);
    if (E.halo) {
      E.halo.material.opacity = 0.55 + 0.2 * pulse + 0.3 * comboF;
      const s = 11 + pulse * 0.7 + comboF * 3.5;
      E.halo.scale.set(s, s, 1);
      E.rays.rotation.z += dt * 0.12;
      E.rays.material.opacity = 0.4 + 0.25 * comboF + 0.1 * pulse;
    }
    E.ringMat.opacity = 0.12 + 0.16 * pulse + 0.14 * comboF;
    if (E.beams) {
      const nb = E.beams.length;
      E.beams.forEach((b, i) => {
        const a = T * (0.22 + i * 0.035) + (i / nb) * TAU,
          Rt = 7 + 8 * (0.5 + 0.5 * Math.sin(T * 0.31 + i * 1.7));
        _t.set(Math.cos(a) * Rt, 0, Math.sin(a) * Rt);
        b.lookAt(_t);
        const d = Math.hypot(
          b.position.x - _t.x,
          b.position.y,
          b.position.z - _t.z,
        );
        b.scale.set(1, 1, d / 24);
        b.material.uniforms.uO.value =
          (0.16 + 0.22 * pulse + 0.18 * comboF) * E.fxScale;
      });
    }
    L.colL.forEach((l, i) => {
      const a = T * 0.4 * (i % 2 ? -1 : 1) + i * 2.1;
      l.position.set(Math.cos(a) * (14 + i * 3), 6, Math.sin(a) * (14 + i * 3));
      l.intensity = (0.7 + pulse * 1.1 + comboF * 0.6) * E.fxScale;
    });
    L.moon.position.set(px + 30, 60, pz + 25);
    L.moon.target.position.set(px, 0, pz);
    if (E.idol) E.idol.glow && E.idol.glow(T, pulse, comboF);
  };
  return E;
}
