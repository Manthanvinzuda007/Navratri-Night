/*Copyright (c) 2026 MANTHAN VINZUDA

All rights reserved.

This source code is provided for viewing purposes only.
You may not copy, modify, distribute, sublicense, or use
this code or substantial portions of it without permission.*/

/* ============================ 6b. ENVIRONMENT – mandap, Maa Ambe, garbo, stage lights ============================ */
function buildStage(E, S, Qd, ctx) {
  const { mat, basic, add, inst, glowTex } = E,
    lam = !!Qd.lambert,
    st = new THREE.Group();
  S.add(st);
  E.stage = st;
  const dummy = new THREE.Object3D();
  const gold = (o) =>
    mat(GOLD, Object.assign({ r: 0.3, m: 0.9, e: 0x3a2400, ei: 0.7 }, o || {}));
  const dm = gold();
  /* platform */
  add(
    st,
    new THREE.CylinderGeometry(7.3, 7.6, 0.26, 8),
    mat(0x7a1010, { r: 0.9 }),
    0,
    0.13,
    0,
    1,
  ).receiveShadow = true;
  add(
    st,
    new THREE.CylinderGeometry(6.5, 7, 0.62, 8),
    mat(0xb71c1c, { r: 0.85 }),
    0,
    0.57,
    0,
    1,
  ).receiveShadow = true;
  {
    const t = texMandala(
        512,
        ["#ffc107", "#e53935", "#fff8e1", "#ff6f00", "#d81b60"],
        6,
      ),
      m = add(
        st,
        new THREE.CircleGeometry(6.1, 48),
        new THREE.MeshBasicMaterial({
          map: t,
          transparent: true,
          opacity: 0.92,
        }),
        0,
        0.885,
        0,
      );
    track(m.material);
    m.rotation.x = -PI / 2;
  }
  {
    const t = add(st, new THREE.TorusGeometry(6.55, 0.09, 6, 8), dm, 0, 0.9, 0);
    t.rotation.set(PI / 2, 0, PI / 8);
    const t2 = add(
      st,
      new THREE.TorusGeometry(6.98, 0.07, 6, 8),
      dm,
      0,
      0.44,
      0,
    );
    t2.rotation.set(PI / 2, 0, PI / 8);
  }
  /* eight carved pillars */
  const PR = 5.45,
    pa = (k) => (k / 8) * TAU + TAU / 16;
  inst(
    new THREE.CylinderGeometry(0.19, 0.24, 5.1, 12),
    mat(0xc62828, { r: 0.7 }),
    8,
    (i, d) => {
      d.position.set(Math.cos(pa(i)) * PR, 3.4, Math.sin(pa(i)) * PR);
      return 0xffffff;
    },
    { sh: 1 },
  );
  inst(
    loft(
      [
        [0, 0.4],
        [0.12, 0.36],
        [0.2, 0.26],
        [0.34, 0.3],
        [0.42, 0.22],
      ].map((r) => [r[0], r[1], r[1]]),
      12,
    ),
    dm,
    8,
    (i, d) => {
      d.position.set(Math.cos(pa(i)) * PR, 0.9, Math.sin(pa(i)) * PR);
    },
  );
  inst(
    loft(
      [
        [0, 0.2],
        [0.2, 0.3],
        [0.34, 0.36],
        [0.48, 0.4],
        [0.52, 0.32],
      ].map((r) => [r[0], r[1], r[1]]),
      12,
    ),
    dm,
    8,
    (i, d) => {
      d.position.set(Math.cos(pa(i)) * PR, 5.5, Math.sin(pa(i)) * PR);
    },
  );
  inst(new THREE.TorusGeometry(0.215, 0.03, 5, 12), dm, 8 * 5, (i, d) => {
    const k = i % 8,
      j = (i / 8) | 0;
    d.position.set(Math.cos(pa(k)) * PR, 1.8 + j * 0.7, Math.sin(pa(k)) * PR);
    d.rotation.x = PI / 2;
  });
  /* scalloped canopy roof */
  {
    const rs = 16,
      g = new THREE.ConeGeometry(7.7, 2.9, rs, 3, true),
      p = g.attributes.position,
      cs = [],
      cc = [0xd32f2f, 0xffc107, 0xff6f00, 0xc2185b].map((h) => C(h)),
      t = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const col = i % (rs + 1);
      const c = cc[col % 4];
      cs.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(cs, 3));
    add(
      st,
      g,
      mat(0xffffff, { vc: true, side: 2, e: 0x2a0800, ei: 0.8, r: 0.8 }),
      0,
      7.75,
      0,
      1,
    );
  }
  {
    const tri = track(new THREE.BufferGeometry());
    tri.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [-0.42, 0, 0, 0.42, 0, 0, 0, -0.8, 0],
        3,
      ),
    );
    tri.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3),
    );
    tri.setIndex([0, 1, 2]);
    const cc = [0xe53935, 0xffc107, 0xff6f00, 0xd81b60, 0x43a047];
    inst(tri, mat(0xffffff, { side: 2, r: 0.8 }), 40, (i, d) => {
      const a = (i / 40) * TAU;
      d.position.set(Math.cos(a) * 7.62, 6.32, Math.sin(a) * 7.62);
      d.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)) + PI;
      return cc[i % 5];
    });
  }
  add(
    st,
    new THREE.SphereGeometry(0.95, 18, 10, 0, TAU, 0, PI / 2),
    dm,
    0,
    9.05,
    0,
  );
  add(st, new THREE.CylinderGeometry(0.1, 0.14, 0.5, 8), dm, 0, 10.1, 0);
  add(st, new THREE.SphereGeometry(0.2, 10, 8), dm, 0, 10.45, 0);
  add(st, new THREE.ConeGeometry(0.1, 0.55, 8), dm, 0, 10.9, 0);
  inst(
    new THREE.SphereGeometry(0.44, 12, 8, 0, TAU, 0, PI / 2),
    dm,
    4,
    (i, d) => {
      const a = (i / 4) * TAU + TAU / 8;
      d.position.set(Math.cos(a) * PR * 1.0, 6.05, Math.sin(a) * PR * 1.0);
    },
  );
  inst(new THREE.ConeGeometry(0.07, 0.5, 6), dm, 4, (i, d) => {
    const a = (i / 4) * TAU + TAU / 8;
    d.position.set(Math.cos(a) * PR, 6.75, Math.sin(a) * PR);
  });
  /* Gujarati toran arches between pillars + hanging mango-leaf torans */
  inst(new THREE.TorusGeometry(2.04, 0.075, 6, 22, PI), dm, 8, (i, d) => {
    const a = (i / 8) * TAU,
      r = PR * Math.cos(PI / 8);
    d.position.set(Math.cos(a) * r, 5.35, Math.sin(a) * r);
    d.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a));
  });
  {
    const leaf = track(new THREE.ConeGeometry(0.07, 0.34, 4));
    leaf.rotateX(PI);
    const n = Math.round(60 * Math.max(0.5, Qd.env));
    inst(leaf, mat(0x2e7d32, { r: 0.8 }), n * 1, (i, d) => {
      const k = i % 8,
        j = (i / 8) | 0,
        a = (k / 8) * TAU,
        r = PR * Math.cos(PI / 8),
        u = (j + 0.5) / Math.ceil(n / 8),
        th = PI * u;
      d.position.set(
        Math.cos(a) * r - Math.sin(a) * -Math.cos(th) * 2.04 * -1,
        0,
        0,
      );
      const tx = -Math.sin(a),
        tz = Math.cos(a),
        off = Math.cos(th) * 2.04;
      d.position.set(
        Math.cos(a) * r + tx * off,
        5.35 + Math.sin(th) * 2.04 - 0.16,
        Math.sin(a) * r + tz * off,
      );
      return 0xffffff;
    });
  }
  /* marigold garlands (instanced flowers) */
  {
    const fl = Math.round(Qd.env * 16),
      vert = Math.round(Qd.env * 6),
      tot = 8 * fl * 2 + 32 * vert + 44;
    const cols = [0xff8f00, 0xffb300, 0xffc400, 0xff6d00, 0xffa000];
    let fi = 0;
    const pts = [];
    for (let k = 0; k < 8; k++) {
      const A = pa(k),
        B = pa(k + 1),
        x1 = Math.cos(A) * PR,
        z1 = Math.sin(A) * PR,
        x2 = Math.cos(B) * PR,
        z2 = Math.sin(B) * PR;
      for (let r = 0; r < 2; r++)
        for (let i = 0; i < fl; i++) {
          const u = (i + 0.5) / fl;
          pts.push([
            lerp(x1, x2, u),
            5.9 - Math.sin(PI * u) * (0.9 + r * 0.6),
            lerp(z1, z2, u),
          ]);
        }
    }
    for (let k = 0; k < 32; k++) {
      const a = (k / 32) * TAU;
      for (let i = 0; i < vert; i++)
        pts.push([Math.cos(a) * 7.55, 6.2 - i * 0.27, Math.sin(a) * 7.55]);
    }
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * TAU;
      pts.push([
        Math.cos(a) * 1.95,
        1.62 + Math.sin(i * 1.7) * 0.05,
        Math.sin(a) * 1.95,
      ]);
    }
    inst(
      new THREE.IcosahedronGeometry(0.15, 0),
      mat(0xffffff, { r: 0.75 }),
      pts.length,
      (i, d) => {
        const p = pts[i];
        d.position.set(p[0], p[1], p[2]);
        d.scale.set(1, 0.75, 1);
        d.rotation.set(rnd(0, 3), rnd(0, 3), rnd(0, 3));
        return i % 9 == 0 ? 0x43a047 : pick(cols);
      },
    );
  }
  /* swinging brass bells */
  {
    const bg = loft(
        [
          [0.2, 0.012],
          [0.17, 0.07],
          [0.08, 0.13],
          [-0.03, 0.17],
          [-0.11, 0.185],
        ].map((r) => [r[0], r[1], r[1]]),
        10,
      ),
      bn = Qd.env > 0.6 ? 36 : 20,
      B = inst(
        bg,
        mat(GOLD, { r: 0.25, m: 0.95, side: 2, e: 0x2a1c00, ei: 0.6 }),
        bn,
        (i, d) => {
          const a = (i / bn) * TAU;
          d.position.set(Math.cos(a) * 7.2, 5.9, Math.sin(a) * 7.2);
        },
      );
    E.upd.push((t) => {
      for (let i = 0; i < bn; i++) {
        const a = (i / bn) * TAU;
        dummy.position.set(Math.cos(a) * 7.2, 6.1, Math.sin(a) * 7.2);
        dummy.rotation.set(0, 0, 0);
        dummy.rotation.z = Math.sin(t * 2.4 + i * 1.3) * 0.16;
        dummy.rotation.x = Math.cos(t * 2.1 + i) * 0.12;
        dummy.updateMatrix();
        dummy.matrix.multiply(_m.makeTranslation(0, -0.3, 0));
        B.setMatrixAt(i, dummy.matrix);
      }
      B.instanceMatrix.needsUpdate = true;
    });
  }
  /* diyas + flames */
  {
    const dp = [];
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * TAU;
      dp.push([Math.cos(a) * 6.15, 0.9, Math.sin(a) * 6.15]);
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU + 0.1;
      dp.push([Math.cos(a) * 7.1, 0.3, Math.sin(a) * 7.1]);
    }
    const rn = Math.round(24 * Qd.env);
    for (let i = 0; i < rn; i++) {
      const a = (i / rn) * TAU;
      dp.push([Math.cos(a) * 10.75, 0.04, Math.sin(a) * 10.75]);
    }
    E.diyaPts = dp;
    inst(
      new THREE.SphereGeometry(0.17, 10, 6, 0, TAU, PI / 2, PI / 2),
      mat(0xb5532a, { r: 0.9, side: 2 }),
      dp.length,
      (i, d) => {
        d.position.set(dp[i][0], dp[i][1] + 0.12, dp[i][2]);
        return 0xffffff;
      },
    );
    const gp = new Float32Array(dp.length * 3),
      gc = new Float32Array(dp.length * 3),
      cc = C(0xffa040);
    dp.forEach((p, i) => {
      gp.set([p[0], p[1] + 0.2, p[2]], i * 3);
      gc.set([cc.r * 1.2, cc.g * 1.1, cc.b], i * 3);
    });
    const fl = glowPoints(gp, gc, 6, { tex: glowTex, flick: 0.5 });
    S.add(fl);
    E.upd.push((t) => {
      fl.material.uniforms.uT.value = t;
    });
    E.flames = fl;
    inst(
      new THREE.SphereGeometry(0.045, 5, 4),
      basic(0xfff2b0),
      dp.length,
      (i, d) => {
        d.position.set(dp[i][0], dp[i][1] + 0.2, dp[i][2]);
        d.scale.set(1, 1.8, 1);
      },
    );
  }
  /* ---------- back panel + halo ---------- */
  {
    const c = cvs(512),
      x = c.getContext("2d"),
      g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#5a0a0a");
    g.addColorStop(1, "#a01515");
    x.fillStyle = g;
    x.fillRect(0, 0, 512, 512);
    const mt = texMandala(
      480,
      ["#ffc107", "#ffe082", "#ff6f00", "#fff8e1"],
      6,
    ).image;
    x.globalAlpha = 0.55;
    x.drawImage(mt, 16, 40, 480, 480);
    x.globalAlpha = 1;
    x.strokeStyle = "#ffc107";
    x.lineWidth = 10;
    x.strokeRect(8, 8, 496, 496);
    const pm = add(
      st,
      new THREE.PlaneGeometry(7.6, 6.2),
      new THREE.MeshBasicMaterial({ map: ctex(c, { srgb: true }), side: 2 }),
      0,
      4.05,
      -3.4,
    );
    track(pm.material);
    for (const s of [-1, 1])
      add(st, new THREE.BoxGeometry(0.22, 6.4, 0.22), dm, s * 3.9, 4.05, -3.4);
    add(st, new THREE.BoxGeometry(8, 0.25, 0.25), dm, 0, 7.25, -3.4);
    add(st, new THREE.BoxGeometry(8, 0.25, 0.25), dm, 0, 0.95, -3.4);
  }
  {
    const c = cvs(256),
      x = c.getContext("2d");
    x.translate(128, 128);
    for (let i = 0; i < 40; i++) {
      x.rotate(TAU / 40);
      const g = x.createLinearGradient(0, 0, 0, -128);
      g.addColorStop(0, "rgba(255,230,160,.0)");
      g.addColorStop(0.3, "rgba(255,214,120,.5)");
      g.addColorStop(1, "rgba(255,190,80,0)");
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(-5, 0);
      x.lineTo(0, -128);
      x.lineTo(5, 0);
      x.fill();
    }
    const rays = new THREE.Mesh(
      track(new THREE.PlaneGeometry(9, 9)),
      basic(0xffffff, {
        map: ctex(c, { srgb: true }),
        add: true,
        side: 2,
        tr: true,
        op: 0.55,
      }),
    );
    rays.position.set(0, 4.35, -0.6);
    st.add(rays);
    E.rays = rays;
    const hl = new THREE.Sprite(
      track(
        new THREE.SpriteMaterial({
          map: glowTex,
          color: C(0xffa940),
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: 0.75,
        }),
      ),
    );
    hl.scale.set(11, 11, 1);
    hl.position.set(0, 4.2, -0.4);
    st.add(hl);
    E.halo = hl;
    add(st, new THREE.TorusGeometry(2.25, 0.07, 6, 40), dm, 0, 4.25, -0.7);
  }
  /* ---------- pedestal, lion, Maa Ambe ---------- */
  add(
    st,
    new THREE.CylinderGeometry(2.0, 2.2, 0.3, 20),
    mat(0xffd54f, { r: 0.4, m: 0.6, e: 0x332200 }),
    0,
    1.05,
    0,
    1,
  );
  add(
    st,
    new THREE.CylinderGeometry(1.6, 1.9, 0.35, 20),
    mat(0xb71c1c, { r: 0.8 }),
    0,
    1.37,
    0,
    1,
  );
  add(st, new THREE.CylinderGeometry(1.5, 1.5, 0.1, 20), dm, 0, 1.58, 0);
  inst(
    new THREE.SphereGeometry(0.34, 8, 6),
    mat(0xffffff, { r: 0.7 }),
    22,
    (i, d) => {
      const a = (i / 22) * TAU;
      d.position.set(Math.cos(a) * 1.78, 1.28, Math.sin(a) * 1.78);
      d.scale.set(0.9, 0.4, 1.6);
      d.rotation.y = -a + PI / 2;
      return i % 2 ? 0xff6f91 : 0xffffff;
    },
  );
  {
    const L = new THREE.Group(),
      gm = mat(0xd48a2a, { r: 0.7 }),
      mane = mat(0x7a3f12, { r: 0.9 });
    L.position.set(0, 1.62, 1.25);
    L.scale.setScalar(0.82);
    st.add(L);
    const ellm = (rx, ry, rz, x, y, z, m) => {
      const o = add(L, new THREE.SphereGeometry(1, 12, 8), m || gm, x, y, z, 1);
      o.scale.set(rx, ry, rz);
      return o;
    };
    ellm(0.7, 0.42, 0.42, 0, 0.62, -0.1);
    ellm(0.45, 0.4, 0.38, 0, 0.68, 0.55);
    ellm(0.4, 0.36, 0.34, 0, 0.78, 0.95);
    ellm(0.3, 0.22, 0.3, 0, 0.7, 1.25, gm);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU,
        o = add(
          L,
          new THREE.ConeGeometry(0.12, 0.45, 5),
          mane,
          Math.sin(a) * 0.42,
          0.82 + Math.cos(a) * 0.42,
          0.86,
          0,
        );
      o.rotation.set(0, 0, -a + PI);
      o.rotation.x = -0.5;
    }
    for (const sx of [-1, 1]) {
      for (const z of [0.55, -0.5]) {
        const lg = add(
          L,
          new THREE.CylinderGeometry(0.1, 0.08, 0.5, 6),
          gm,
          sx * 0.28,
          0.25,
          z,
        );
      }
      add(
        L,
        new THREE.SphereGeometry(0.04, 5, 4),
        basic(0x120a05),
        sx * 0.12,
        0.92,
        1.18,
      );
      add(L, new THREE.ConeGeometry(0.06, 0.12, 4), gm, sx * 0.2, 1.1, 0.84);
    }
    add(
      L,
      new THREE.SphereGeometry(0.05, 5, 4),
      basic(0x120a05),
      0,
      0.74,
      1.52,
    );
    const tail = add(
      L,
      new THREE.CylinderGeometry(0.04, 0.025, 0.8, 5),
      gm,
      0,
      0.5,
      -0.95,
    );
    tail.rotation.x = 1.0;
    add(L, new THREE.SphereGeometry(0.09, 6, 5), mane, 0, 0.82, -1.28);
  }
  if (ctx && ctx.makeIdol) {
    const idol = ctx.makeIdol();
    idol.root.position.set(0, 1.62, -0.35);
    idol.root.scale.multiplyScalar(1.5);
    st.add(idol.root);
    E.idol = idol;
  }
  /* ---------- garbo (perforated clay pot with diya) ---------- */
  {
    const c = cvs(256),
      x = c.getContext("2d"),
      e = cvs(256),
      y = e.getContext("2d");
    x.fillStyle = "#a8522a";
    x.fillRect(0, 0, 256, 256);
    y.fillStyle = "#000";
    y.fillRect(0, 0, 256, 256);
    for (let r = 0; r < 256; r += 64) {
      x.fillStyle = "#ffd54f";
      x.fillRect(0, r + 4, 256, 5);
      x.fillStyle = "#fff8e1";
      for (let i = 0; i < 32; i++) {
        x.beginPath();
        x.moveTo(i * 8, r + 14);
        x.lineTo(i * 8 + 4, r + 24);
        x.lineTo(i * 8 + 8, r + 14);
        x.fill();
      }
      for (let i = 0; i < 16; i++) {
        for (const [ox, oy] of [[0, 0]]) {
          const px = i * 16 + 8 + ((r / 64) % 2) * 8,
            py = r + 44;
          y.fillStyle = "#fff";
          y.beginPath();
          y.arc(px, py, 4.2, 0, TAU);
          y.fill();
          y.beginPath();
          y.arc(px, py + 10, 3.4, 0, TAU);
          y.fill();
          x.fillStyle = "#3a1a0a";
          x.beginPath();
          x.arc(px, py, 4.4, 0, TAU);
          x.fill();
        }
      }
    }
    const gm = mat(0xffffff, {
        map: ctex(c, { srgb: true, rep: [2, 1] }),
        emap: ctex(e, { srgb: true, rep: [2, 1] }),
        e: 0xffa030,
        ei: 2.6,
        r: 0.75,
      }),
      gg = new THREE.Group();
    gg.position.set(0, 0.9, 3.95);
    st.add(gg);
    add(
      gg,
      loft(
        [
          [0.0, 0.26],
          [0.1, 0.38],
          [0.4, 0.58],
          [0.8, 0.56],
          [1.05, 0.34],
          [1.15, 0.3],
          [1.2, 0.36],
        ].map((r) => [r[0], r[1], r[1]]),
        20,
        { ur: 2, vf: false },
      ),
      gm,
      0,
      0.25,
      0,
    );
    add(
      gg,
      new THREE.CylinderGeometry(0.35, 0.5, 0.25, 14),
      mat(0x6d3a1a, { r: 0.9 }),
      0,
      0.12,
      0,
    );
    add(
      gg,
      new THREE.TorusGeometry(0.33, 0.03, 5, 16),
      dm,
      0,
      1.5,
      0,
    ).rotation.x = PI / 2;
    add(
      gg,
      new THREE.SphereGeometry(0.17, 8, 6),
      mat(0x6d4c2a, { r: 0.8 }),
      0,
      1.62,
      0,
    );
    const dy = add(
      gg,
      new THREE.SphereGeometry(0.2, 10, 6, 0, TAU, PI / 2, PI / 2),
      mat(0xb5532a, { r: 0.9, side: 2 }),
      0,
      1.9,
      0,
    );
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU,
        lf = add(
          gg,
          new THREE.ConeGeometry(0.07, 0.38, 4),
          mat(0x2e7d32, { r: 0.7 }),
          Math.cos(a) * 0.3,
          1.46,
          Math.sin(a) * 0.3,
        );
      lf.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
    }
    const gl = glowPoints(
      new Float32Array([0, 2.08, 0, 0, 0.9, 0]),
      new Float32Array([1.4, 0.8, 0.3, 0.7, 0.35, 0.12]),
      18,
      { tex: glowTex, flick: 0.35 },
    );
    gg.add(gl);
    E.upd.push((t) => {
      gl.material.uniforms.uT.value = t;
    });
    E.garbo = gg;
  }
  /* ---------- stage truss, spot cans, swept volumetric beams ---------- */
  {
    const tr = add(
      st,
      new THREE.TorusGeometry(10.5, 0.13, 6, 56),
      mat(0x2a2a30, { r: 0.4, m: 0.8 }),
      0,
      13,
      0,
    );
    tr.rotation.x = PI / 2;
    inst(
      new THREE.CylinderGeometry(0.1, 0.1, 13, 6),
      mat(0x2a2a30, { r: 0.4, m: 0.8 }),
      4,
      (i, d) => {
        const a = (i / 4) * TAU + TAU / 8;
        d.position.set(Math.cos(a) * 10.5, 6.5, Math.sin(a) * 10.5);
      },
    );
    const nb = Qd.fx > 0.6 ? 8 : 4,
      beams = [];
    const bgeo = track(new THREE.ConeGeometry(2.0, 24, 16, 1, true));
    bgeo.translate(0, -12, 0);
    bgeo.rotateX(-PI / 2);
    for (let i = 0; i < nb; i++) {
      const a = (i / nb) * TAU,
        m = track(
          new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            side: 2,
            blending: THREE.AdditiveBlending,
            uniforms: { uC: { value: C(PAL[i % 9]) }, uO: { value: 0.3 } },
            vertexShader:
              "varying float vY;varying float vF;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vY=position.z/24.;vec3 n=normalize(normalMatrix*normal);vF=abs(dot(n,normalize(-mv.xyz)));gl_Position=projectionMatrix*mv;}",
            fragmentShader:
              "uniform vec3 uC;uniform float uO;varying float vY;varying float vF;void main(){float a=uO*pow(vF,1.4)*(1.-vY)*smoothstep(0.,.05,vY);gl_FragColor=vec4(uC,a);\n#include <encodings_fragment>\n}",
          }),
        ),
        b = new THREE.Mesh(bgeo, m);
      b.position.set(Math.cos(a) * 10.5, 12.7, Math.sin(a) * 10.5);
      b.frustumCulled = false;
      st.add(b);
      beams.push(b);
      add(
        st,
        new THREE.CylinderGeometry(0.22, 0.3, 0.55, 8),
        mat(0x151518, { r: 0.5, m: 0.7 }),
        Math.cos(a) * 10.5,
        12.6,
        Math.sin(a) * 10.5,
      );
    }
    E.beams = beams;
  }
  /* ---------- dhol drummers ---------- */
  E.drummers = [];
  if (ctx && ctx.makeDrummer) {
    for (let k = 0; k < 4; k++) {
      const a = k * 1.57 + 0.8,
        dm2 = ctx.makeDrummer(k);
      dm2.root.position.set(Math.cos(a) * 3.7, 0.9, Math.sin(a) * 3.7);
      dm2.yaw = Math.atan2(-Math.cos(a), -Math.sin(a));
      st.add(dm2.root);
      E.drummers.push(dm2);
    }
  }
  /* incense */
  {
    const n = Math.round(36 * Math.max(0.4, Qd.fx)),
      p = new Float32Array(n * 3),
      sd = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const k = i % 4,
        a = k * 1.57 + 0.3;
      p.set(
        [
          Math.cos(a) * 5.4 + rnd(-0.1, 0.1),
          0.95,
          Math.sin(a) * 5.4 + rnd(-0.1, 0.1),
        ],
        i * 3,
      );
      sd[i] = Math.random();
    }
    const g = track(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1));
    const m = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uT: { value: 0 },
          uTex: { value: glowTex },
          uPR: { value: 1 },
        },
        vertexShader:
          "attribute float aSeed;uniform float uT,uPR;varying float vA;void main(){float ph=fract(uT*.06+aSeed);vec3 p=position;p.y+=ph*7.;p.x+=sin(uT*.6+aSeed*20.+ph*5.)*ph*1.4;p.z+=cos(uT*.5+aSeed*17.+ph*4.)*ph*1.4;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min((1.6+ph*5.)*uPR*60./max(-mv.z,1.)*3.,70.*uPR);vA=(1.-ph)*smoothstep(0.,.1,ph)*.16;}",
        fragmentShader:
          "uniform sampler2D uTex;varying float vA;void main(){float a=texture2D(uTex,gl_PointCoord).a*vA;gl_FragColor=vec4(.78,.74,.8,a);\n#include <encodings_fragment>\n}",
      }),
    );
    const p2 = new THREE.Points(g, m);
    p2.frustumCulled = false;
    S.add(p2);
    E.smoke = p2;
    E.upd.push((t) => {
      m.uniforms.uT.value = t;
    });
  }
  return E;
}
