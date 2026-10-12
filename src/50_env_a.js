/*Copyright (c) 2026 MANTHAN VINZUDA

All rights reserved.

This source code is provided for viewing purposes only.
You may not copy, modify, distribute, sublicense, or use
this code or substantial portions of it without permission.*/

/* ============================ 6. ENVIRONMENT – infrastructure, sky, lights ============================ */
function glowPoints(pos, col, size, o) {
  o = o || {};
  const n = pos.length / 3,
    g = track(new THREE.BufferGeometry()),
    sd = new Float32Array(n);
  for (let i = 0; i < n; i++) sd[i] = Math.random();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aCol", new THREE.BufferAttribute(col, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1));
  const m = track(
    new THREE.ShaderMaterial({
      uniforms: {
        uT: { value: 0 },
        uSize: { value: size },
        uPR: { value: 1 },
        uTex: { value: o.tex },
        uFlick: { value: o.flick || 0 },
        uAmt: { value: o.amt || 1 },
      },
      vertexShader:
        "attribute vec3 aCol;attribute float aSeed;uniform float uT,uSize,uPR,uFlick;varying vec3 vC;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;float f=1.-uFlick+uFlick*(.55+.45*sin(uT*(8.+aSeed*6.)+aSeed*40.));gl_PointSize=min(uSize*uPR*60./max(-mv.z,1.),90.*uPR);vC=aCol;vA=f;}",
      fragmentShader:
        "uniform sampler2D uTex;uniform float uAmt;varying vec3 vC;varying float vA;void main(){float a=texture2D(uTex,gl_PointCoord).a*uAmt*vA;gl_FragColor=vec4(vC,a);\n#include <encodings_fragment>\n}",
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  const p = new THREE.Points(g, m);
  p.frustumCulled = false;
  p.renderOrder = 5;
  return p;
}
function envMap(R) {
  try {
    const pm = new THREE.PMREMGenerator(R),
      sc = new THREE.Scene(),
      g = new THREE.SphereGeometry(50, 24, 16),
      cs = [],
      p = g.attributes.position,
      t = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) / 50;
      C(y > 0.15 ? 0x1a2250 : y > -0.1 ? 0x7a4528 : 0x1c1209, t);
      const k = y > 0.15 ? 1 : y > -0.1 ? 1.2 : 0.6;
      cs.push(t.r * k, t.g * k, t.b * k);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(cs, 3));
    sc.add(
      new THREE.Mesh(
        g,
        new THREE.MeshBasicMaterial({ vertexColors: true, side: 1 }),
      ),
    );
    [
      [30, 6, 10, 0xffb060, 5],
      [-25, 5, 20, 0xff8040, 5],
      [10, 8, -30, 0xffd080, 6],
      [-5, 30, 5, 0x8090ff, 7],
    ].forEach(([x, y, z, c, r]) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(r, 8, 6),
        new THREE.MeshBasicMaterial({ color: C(c) }),
      );
      m.position.set(x, y, z);
      sc.add(m);
    });
    const rt = pm.fromScene(sc, 0.04);
    pm.dispose();
    g.dispose();
    return track(rt.texture);
  } catch (e) {
    return null;
  }
}
function buildEnvironment(S, Qd, R, ctx) {
  const lam = !!Qd.lambert,
    glowTex = texGlow(),
    E = { glowTex, upd: [], theme: C(0xffb347), sh: null };
  const mat = (hex, o) => {
    o = o || {};
    const p = { color: C(hex) };
    if (o.e !== undefined) {
      p.emissive = C(o.e);
      p.emissiveIntensity = o.ei || 1;
    }
    if (o.side) p.side = o.side;
    if (o.map) p.map = o.map;
    if (o.vc) p.vertexColors = true;
    if (o.emap) {
      p.emissiveMap = o.emap;
    }
    if (o.tr) {
      p.transparent = true;
      p.opacity = o.op;
    }
    if (!lam) {
      p.roughness = o.r === undefined ? 0.7 : o.r;
      p.metalness = o.m || 0;
    }
    return track(
      lam
        ? new THREE.MeshLambertMaterial(p)
        : new THREE.MeshStandardMaterial(p),
    );
  };
  const basic = (hex, o) => {
    o = o || {};
    const p = { color: C(hex) };
    if (o.side) p.side = o.side;
    if (o.map) p.map = o.map;
    if (o.tr) {
      p.transparent = true;
      p.opacity = o.op;
    }
    if (o.add) {
      p.blending = THREE.AdditiveBlending;
      p.depthWrite = false;
      p.transparent = true;
    }
    if (o.fog === false) p.fog = false;
    return track(new THREE.MeshBasicMaterial(p));
  };
  const add = (par, geo, m, x, y, z, sh) => {
    track(geo);
    const o = new THREE.Mesh(geo, m);
    o.position.set(x || 0, y || 0, z || 0);
    if (sh) {
      o.castShadow = !!Qd.shadow;
    }
    par.add(o);
    return o;
  };
  const inst = (geo, m, n, fn, o) => {
    o = o || {};
    track(geo);
    const im = new THREE.InstancedMesh(geo, m, n),
      d = new THREE.Object3D(),
      c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      d.position.set(0, 0, 0);
      d.rotation.set(0, 0, 0);
      d.scale.set(1, 1, 1);
      const k = fn(i, d);
      d.updateMatrix();
      im.setMatrixAt(i, d.matrix);
      if (k !== undefined && k !== null) im.setColorAt(i, C(k, c));
    }
    im.frustumCulled = false;
    im.castShadow = !!(o.sh && Qd.shadow);
    (o.par || S).add(im);
    track(im);
    return im;
  };
  Object.assign(E, { mat, basic, add, inst });
  const W = CONFIG.world.R;
  /* ----- image based lighting ----- */
  if (!lam && Qd.env >= 0.75) {
    S.environment = envMap(R);
  }
  /* ----- lights ----- */
  S.background = C(0x050614);
  S.fog = new THREE.FogExp2(C(0x0b0b24), 0.0072);
  const hemi = new THREE.HemisphereLight(
    C(0x5b60b8),
    C(0x40281a),
    lam ? 1.1 : 0.62,
  );
  S.add(hemi);
  const moon = new THREE.DirectionalLight(C(0xa9b8ff), lam ? 0.5 : 0.62);
  moon.position.set(30, 60, 25);
  S.add(moon);
  S.add(moon.target);
  E.moon = moon;
  if (Qd.shadow) {
    moon.castShadow = true;
    moon.shadow.mapSize.set(Qd.shadow, Qd.shadow);
    const c = moon.shadow.camera;
    c.left = c.bottom = -24;
    c.right = c.top = 24;
    c.near = 10;
    c.far = 140;
    moon.shadow.bias = -0.0008;
    moon.shadow.normalBias = 0.04;
  }
  const rims = [];
  for (let i = 0; i < (Qd.detail >= 2 ? 2 : 1); i++) {
    const r = new THREE.DirectionalLight(C(i ? 0xff5fa8 : 0xff9d4d), 0.55);
    r.position.set(i ? 40 : -40, 18, i ? -30 : -40);
    S.add(r);
    rims.push(r);
  }
  const stageL = new THREE.PointLight(C(0xffa347), 2.4, 46, 1.6);
  stageL.position.set(0, 5, 2.5);
  S.add(stageL);
  E.stageL = stageL;
  const colL = [];
  for (let i = 0; i < Qd.lights; i++) {
    const l = new THREE.PointLight(C(PAL[(i * 3) % 9]), 1.2, 40, 1.6);
    S.add(l);
    colL.push(l);
  }
  E.lights = { hemi, moon, rims, stageL, colL };
  /* ----- sky dome, stars, moon, clouds ----- */
  const sky = new THREE.Mesh(
    track(new THREE.SphereGeometry(480, 24, 14)),
    track(
      new THREE.ShaderMaterial({
        side: 1,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTop: { value: C(0x03040f) },
          uMid: { value: C(0x14173f) },
          uHor: { value: C(0x6a3226) },
        },
        vertexShader:
          "varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
        fragmentShader:
          "uniform vec3 uTop,uMid,uHor;varying vec3 vP;void main(){float h=clamp(vP.y,0.,1.);vec3 c=mix(uHor,uMid,smoothstep(0.,.22,h));c=mix(c,uTop,smoothstep(.15,.85,h));c+=vec3(.5,.22,.1)*pow(1.-h,6.)*.35;gl_FragColor=vec4(c,1.);\n#include <encodings_fragment>\n}",
      }),
    ),
  );
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  S.add(sky);
  E.sky = sky;
  {
    const n = Math.round(700 * Math.max(0.4, Qd.env)),
      p = new Float32Array(n * 3),
      c = new Float32Array(n * 3),
      t = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const u = Math.random() * TAU,
        v = Math.pow(Math.random(), 0.7) * 1.35 + 0.05,
        r = 440;
      p.set(
        [
          Math.cos(u) * Math.cos(v) * r,
          Math.sin(v) * r,
          Math.sin(u) * Math.cos(v) * r,
        ],
        i * 3,
      );
      C(pick([0xffffff, 0xfff1d0, 0xcfe0ff, 0xffe0e0]), t).toArray(c, i * 3);
    }
    const st = glowPoints(p, c, rnd(1.2, 1.4) * 0.8, {
      tex: glowTex,
      flick: 0.55,
      amt: 0.9,
    });
    st.material.uniforms.uSize.value = 2.2;
    st.renderOrder = -9;
    st.material.depthTest = false;
    S.add(st);
    E.stars = st;
    E.upd.push((t) => {
      st.material.uniforms.uT.value = t;
    });
  }
  {
    const c = cvs(128),
      x = c.getContext("2d");
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 60);
    g.addColorStop(0, "#fffbe8");
    g.addColorStop(0.85, "#f1e7c4");
    g.addColorStop(1, "rgba(240,230,190,0)");
    x.fillStyle = g;
    x.beginPath();
    x.arc(64, 64, 60, 0, TAU);
    x.fill();
    x.fillStyle = "rgba(180,170,140,.28)";
    [
      [48, 50, 11],
      [78, 70, 15],
      [70, 40, 7],
      [44, 84, 9],
      [86, 44, 6],
    ].forEach(([a, b, r]) => {
      x.beginPath();
      x.arc(a, b, r, 0, TAU);
      x.fill();
    });
    const ms = new THREE.Sprite(
        track(
          new THREE.SpriteMaterial({
            map: ctex(c, { srgb: true }),
            fog: false,
            depthWrite: false,
          }),
        ),
      ),
      mg = new THREE.Sprite(
        track(
          new THREE.SpriteMaterial({
            map: glowTex,
            color: C(0xb0c0ff),
            fog: false,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.55,
          }),
        ),
      );
    ms.scale.set(46, 46, 1);
    mg.scale.set(190, 190, 1);
    const mp = new THREE.Vector3(-210, 230, -300);
    ms.position.copy(mp);
    mg.position.copy(mp);
    ms.renderOrder = -8;
    mg.renderOrder = -9;
    S.add(ms, mg);
  }
  if (Qd.env >= 0.75) {
    const c = cvs(256, 96),
      x = c.getContext("2d");
    for (let i = 0; i < 26; i++) {
      const g = x.createRadialGradient(0, 0, 0, 0, 0, 50);
      x.save();
      x.translate(rnd(40, 216), rnd(30, 66));
      x.scale(rnd(1.2, 2.2), rnd(0.4, 0.8));
      g.addColorStop(0, "rgba(40,46,100,.5)");
      g.addColorStop(1, "rgba(40,46,100,0)");
      x.fillStyle = g;
      x.fillRect(-60, -60, 120, 120);
      x.restore();
    }
    const ct = ctex(c, { srgb: true }),
      grp = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const sp = new THREE.Sprite(
        track(
          new THREE.SpriteMaterial({
            map: ct,
            fog: false,
            depthWrite: false,
            transparent: true,
            opacity: rnd(0.5, 0.9),
          }),
        ),
      );
      const a = (i / 9) * TAU + rnd(-0.2, 0.2);
      sp.position.set(Math.cos(a) * 380, rnd(70, 150), Math.sin(a) * 380);
      sp.scale.set(rnd(180, 260), rnd(50, 80), 1);
      sp.renderOrder = -7;
      grp.add(sp);
    }
    S.add(grp);
    E.upd.push((t) => {
      grp.rotation.y = t * 0.002;
    });
  }
  /* ----- ground ----- */
  const gt = texGround(),
    gnd = add(
      S,
      new THREE.CircleGeometry(430, 56),
      mat(0xffffff, { map: gt, r: 1 }),
      0,
      0,
      0,
    );
  gnd.rotation.x = -PI / 2;
  gnd.receiveShadow = true;
  {
    const t = texMandala(
        512,
        [
          "#e53935",
          "#ffc107",
          "#e91e63",
          "#43a047",
          "#1e88e5",
          "#fb8c00",
          "#8e24aa",
        ],
        7,
      ),
      m = add(
        S,
        new THREE.CircleGeometry(10.9, 64),
        new THREE.MeshBasicMaterial({
          map: t,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
        }),
        0,
        0.04,
        0,
      );
    m.rotation.x = -PI / 2;
    track(m.material);
    E.rangoli = m;
  }
  /* glowing dance-ring guides that pulse on the beat */
  E.ringMat = track(
    new THREE.MeshBasicMaterial({
      color: C(0xffc94a),
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  for (
    let r = 0, Rr = CONFIG.world.ringStart;
    r < 8;
    r++, Rr += CONFIG.world.ringStep
  ) {
    const m = add(
      S,
      new THREE.RingGeometry(Rr - 0.07, Rr + 0.07, 96),
      E.ringMat,
      0,
      0.06,
      0,
    );
    m.rotation.x = -PI / 2;
  }
  return E;
}
