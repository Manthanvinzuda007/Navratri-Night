/*Copyright (c) 2026 MANTHAN VINZUDA

All rights reserved.

This source code is provided for viewing purposes only.
You may not copy, modify, distribute, sublicense, or use
this code or substantial portions of it without permission.*/

/* ============================ 4. CHARACTERS – geometry library ============================ */
const _m = new THREE.Matrix4(),
  _q = new THREE.Quaternion(),
  _e = new THREE.Euler(),
  _v = new THREE.Vector3(),
  _s = new THREE.Vector3(),
  UP = new THREE.Vector3(0, 1, 0);
function xf(g, p, r, s) {
  _e.set(r ? r[0] : 0, r ? r[1] : 0, r ? r[2] : 0);
  _q.setFromEuler(_e);
  _m.compose(
    _v.set(p ? p[0] : 0, p ? p[1] : 0, p ? p[2] : 0),
    _q,
    _s.set(s ? s[0] : 1, s ? s[1] : 1, s ? s[2] : 1),
  );
  g.applyMatrix4(_m);
  return g;
}
/* loft: rings=[y,rx,rz,ox,oz,squareness]; winding auto-detected so rings may run up or down */
function loft(rings, seg, o) {
  o = o || {};
  const R = rings.length,
    pos = [],
    uv = [],
    idx = [];
  for (let j = 0; j < R; j++) {
    const r = rings[j],
      y = r[0],
      rx = r[1],
      rz = r[2] === undefined ? r[1] : r[2],
      ox = r[3] || 0,
      oz = r[4] || 0,
      sq = r[5] || 0;
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * TAU,
        c = Math.cos(a),
        s = Math.sin(a);
      let x = c,
        z = s;
      if (sq) {
        const k =
          1 /
          Math.pow(
            Math.pow(Math.abs(c), 2 + sq) + Math.pow(Math.abs(s), 2 + sq),
            1 / (2 + sq),
          );
        x = c * k;
        z = s * k;
      }
      const rr = 1 + (o.rip ? o.rip(a, y, j) : 0);
      pos.push(ox + x * rx * rr, y, oz + z * rz * rr);
      uv.push((i / seg) * (o.ur || 1), o.vf ? 1 - j / (R - 1) : j / (R - 1));
    }
  }
  const flip = rings[R - 1][0] < rings[0][0];
  for (let j = 0; j < R - 1; j++)
    for (let i = 0; i < seg; i++) {
      const a = j * (seg + 1) + i,
        b = a + seg + 1;
      if (flip) idx.push(a, a + 1, b, b, a + 1, b + 1);
      else idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const n = g.attributes.normal;
  for (let j = 0; j < R; j++) {
    const a = j * (seg + 1),
      b = a + seg,
      x = n.getX(a) + n.getX(b),
      y = n.getY(a) + n.getY(b),
      z = n.getZ(a) + n.getZ(b),
      l = Math.hypot(x, y, z) || 1;
    n.setXYZ(a, x / l, y / l, z / l);
    n.setXYZ(b, x / l, y / l, z / l);
  }
  return g;
}
function mirrorX(g) {
  const p = g.attributes.position,
    n = g.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    p.setX(i, -p.getX(i));
    n.setX(i, -n.getX(i));
  }
  const ix = g.index.array;
  for (let i = 0; i < ix.length; i += 3) {
    const t = ix[i];
    ix[i] = ix[i + 2];
    ix[i + 2] = t;
  }
  return g;
}
function merge(list) {
  let nv = 0,
    ni = 0;
  const hasC = list.some((g) => g.attributes.color);
  for (const g of list) {
    nv += g.attributes.position.count;
    ni += g.index.count;
  }
  const P = new Float32Array(nv * 3),
    N = new Float32Array(nv * 3),
    U = new Float32Array(nv * 2),
    Cc = hasC ? new Float32Array(nv * 3).fill(1) : null,
    I = nv < 65535 ? new Uint16Array(ni) : new Uint32Array(ni);
  let vo = 0,
    io = 0;
  for (const g of list) {
    const c = g.attributes.position.count;
    P.set(g.attributes.position.array, vo * 3);
    N.set(g.attributes.normal.array, vo * 3);
    if (g.attributes.uv) U.set(g.attributes.uv.array, vo * 2);
    if (g.attributes.color) Cc.set(g.attributes.color.array, vo * 3);
    const ix = g.index.array;
    for (let i = 0; i < ix.length; i++) I[io + i] = ix[i] + vo;
    vo += c;
    io += ix.length;
    g.dispose();
  }
  const r = new THREE.BufferGeometry();
  r.setAttribute("position", new THREE.BufferAttribute(P, 3));
  r.setAttribute("normal", new THREE.BufferAttribute(N, 3));
  r.setAttribute("uv", new THREE.BufferAttribute(U, 2));
  if (hasC) r.setAttribute("color", new THREE.BufferAttribute(Cc, 3));
  r.setIndex(new THREE.BufferAttribute(I, 1));
  return r;
}
/* cheap baked ambient occlusion in vertex colours: darker on downward-facing surfaces */
function ao(g, k) {
  k = k || 0.28;
  const n = g.attributes.normal,
    c = new Float32Array(n.count * 3);
  for (let i = 0; i < n.count; i++) {
    const v = 1 - k * (0.5 - 0.5 * n.getY(i));
    c[i * 3] = c[i * 3 + 1] = c[i * 3 + 2] = v;
  }
  g.setAttribute("color", new THREE.BufferAttribute(c, 3));
  return g;
}
const ell = (rx, ry, rz, p, seg, r) =>
  xf(
    new THREE.SphereGeometry(1, seg || 8, Math.max(4, (seg || 8) >> 1)),
    p,
    r,
    [rx, ry, rz],
  );
const band = (y, rx, rz, t, ox, oz, seg) =>
  xf(
    new THREE.TorusGeometry(1, t / ((rx + rz) / 2), 5, seg || 20),
    [ox || 0, y, oz || 0],
    [PI / 2, 0, 0],
    [rx, rz, (rx + rz) / 2],
  ); /* flat ring around a limb/torso */
function capsule(r, len, seg, r2) {
  r2 = r2 || r;
  return loft(
    [
      [-r, 0.001],
      [-0.866 * r, 0.5 * r],
      [-0.5 * r, 0.866 * r],
      [0, r],
      [len, r2],
      [len + 0.5 * r2, 0.866 * r2],
      [len + 0.866 * r2, 0.5 * r2],
      [len + r2, 0.001],
    ],
    seg,
  );
}
function capDir(r, len, from, dir, seg, r2) {
  const g = capsule(r, len, seg, r2),
    d = _v.set(dir[0], dir[1], dir[2]).normalize();
  _q.setFromUnitVectors(UP, d);
  _m.compose(_s.set(from[0], from[1], from[2]), _q, new THREE.Vector3(1, 1, 1));
  g.applyMatrix4(_m);
  return g;
}
const limb = (rings, seg) =>
  loft(
    rings.map((r) => [
      r[0],
      r[1],
      r[2] === undefined ? r[1] : r[2],
      r[3],
      r[4],
    ]),
    seg,
  );
function planeStrip(w, len, nz, curve) {
  const g = new THREE.PlaneGeometry(w, len, 3, 6);
  g.translate(0, -len / 2, 0);
  if (curve) {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, curve(p.getX(i), p.getY(i)));
    g.computeVertexNormals();
  }
  return g;
}
/* a hand hanging at the wrist, LEFT hand (palm faces −x, thumb forward +z) */
function handGeo(D, seg) {
  const L = [
    loft(
      [
        [0.012, 0.02, 0.03],
        [-0.02, 0.016, 0.036],
        [-0.07, 0.014, 0.034],
        [-0.088, 0.011, 0.026],
        [-0.094, 0.004, 0.012],
      ],
      seg,
    ),
  ];
  if (D >= 1) {
    const zs = [0.022, 0.0075, -0.007, -0.021],
      l1 = [0.04, 0.044, 0.041, 0.032],
      sg = D > 1 ? 8 : 6;
    for (let i = 0; i < 4; i++) {
      const a1 = -0.1 - i * 0.02,
        a2 = -0.55 - i * 0.06,
        d1 = [Math.sin(a1), -Math.cos(a1), 0],
        d2 = [Math.sin(a2), -Math.cos(a2), 0],
        r = 0.0088 - 0.0006 * i,
        f = [-0.003, -0.088, zs[i]],
        e = [f[0] + d1[0] * l1[i], f[1] + d1[1] * l1[i], f[2]],
        l2 = l1[i] * 0.82;
      L.push(
        capDir(r, l1[i] - r * 0.3, f, d1, sg, r * 0.92),
        capDir(r * 0.9, l2 - r * 0.9, e, d2, sg, r * 0.7),
      );
    }
    L.push(
      capDir(0.0095, 0.026, [-0.012, -0.03, 0.028], [-0.35, -0.55, 0.75], sg),
      capDir(
        0.0085,
        0.022,
        [-0.03, -0.06, 0.054],
        [-0.55, -0.7, 0.45],
        sg,
        0.0065,
      ),
    );
  } else {
    L.push(
      loft(
        [
          [-0.086, 0.011, 0.027, 0, 0],
          [-0.12, 0.01, 0.026, -0.006, 0],
          [-0.15, 0.007, 0.019, -0.014, 0],
          [-0.166, 0.003, 0.01, -0.02, 0],
        ],
        seg,
      ),
      capDir(0.011, 0.02, [-0.012, -0.03, 0.028], [-0.35, -0.55, 0.75], seg),
    );
  }
  return merge(L);
}
/* foot: sole at y=-.045, heel behind ankle, toes toward +z. mojdi=true gives curled pointed shoe */
function footGeo(D, seg, moj) {
  const o = 0.024,
    R = moj
      ? [
          [-0.07, 0.02, 0.02, 0, o],
          [-0.035, 0.036, 0.035, 0, o],
          [0.03, 0.043, 0.042, 0, o],
          [0.1, 0.044, 0.036, 0, o + 0.002],
          [0.17, 0.04, 0.03, 0, o + 0.004],
          [0.225, 0.026, 0.02, 0, o - 0.002],
          [0.268, 0.012, 0.012, 0, o - 0.014],
          [0.285, 0.004, 0.004, 0, o - 0.026],
        ]
      : [
          [-0.07, 0.018, 0.02, 0, o],
          [-0.035, 0.034, 0.034, 0, o],
          [0.03, 0.04, 0.04, 0, o],
          [0.1, 0.042, 0.03, 0, o + 0.004],
          [0.17, 0.04, 0.02, 0, o + 0.01],
          [0.215, 0.026, 0.012, 0, o + 0.012],
          [0.232, 0.006, 0.006, 0, o + 0.012],
        ];
  const g = xf(loft(R, seg), [0, 0, 0], [PI / 2, 0, 0]),
    L = [g];
  if (!moj && D >= 1)
    for (let i = 0; i < 5; i++)
      L.push(
        ell(
          0.011 - i * 0.001,
          0.009,
          0.012,
          [(2 - i) * 0.0155, -0.034, 0.222 - Math.abs(i - 1.2) * 0.004],
          6,
        ),
      );
  return merge(L);
}
function headGeo(m, seg) {
  const w = (m ? 1.06 : 1) * 1.13,
    jaw = m ? 1.08 : 1;
  return loft(
    [
      [-0.082, 0.012, 0.02, 0, 0.04],
      [-0.066, 0.034 * jaw, 0.045, 0, 0.034],
      [-0.04, 0.062 * jaw, 0.07, 0, 0.02],
      [-0.005, 0.077 * w, 0.089, 0, 0.006],
      [0.05, 0.084 * w, 0.096, 0, 0],
      [0.11, 0.086 * w, 0.098, 0, -0.002],
      [0.17, 0.078 * w, 0.09, 0, -0.006],
      [0.215, 0.052 * w, 0.066, 0, -0.01],
      [0.24, 0.018, 0.022, 0, -0.012],
      [0.246, 0.002, 0.002, 0, -0.012],
    ],
    seg,
  );
}
function hairCap(m, seg) {
  const w = (m ? 1.06 : 1) * 1.13;
  return loft(
    [
      [0.07, 0.088 * w, 0.095, 0, -0.012],
      [0.11, 0.092 * w, 0.1, 0, -0.014],
      [0.17, 0.086 * w, 0.096, 0, -0.016],
      [0.215, 0.062 * w, 0.075, 0, -0.018],
      [0.245, 0.026, 0.034, 0, -0.02],
      [0.256, 0.002, 0.002, 0, -0.02],
    ],
    seg,
  );
}

/* ---- part library. Each part: {bone,mat,geo,grp}. Left side authored at +x, right side mirrored. ---- */
function buildParts(g, D, spec) {
  spec = spec || {};
  const F = g == "f",
    out = [],
    S = [6, 8, 12][D],
    S2 = [8, 12, 18][D];
  const P = (bone, mat, geo, grp, skin) => {
    if (skin) ao(geo);
    out.push({ bone, mat, geo, grp: grp || (F ? "F" : "M") });
  };
  const LR = (bone, mat, geo, grp, skin) => {
    P(bone + "L", mat, geo, grp, skin);
    P(bone + "R", mat, mirrorX(geo.clone()), grp, skin);
  };
  const sk = (a, b) => {}; /* placeholder to keep sections aligned */
  /* ---------- neck + head (shared) ---------- */
  P(
    "neck",
    "skin",
    limb(
      [
        [-0.05, 0.056],
        [0.04, 0.05],
        [0.095, 0.048],
      ],
      S,
    ),
    null,
    1,
  );
  {
    const L = [headGeo(!F, S2)];
    L.push(ell(0.016, 0.02, 0.017, [0, 0.058, 0.103], 6)); /* nose */
    L.push(
      ell(0.013, 0.035, 0.03, [0.083, 0.078, -0.006], 6, [0, 0, -0.1]),
      ell(0.013, 0.035, 0.03, [-0.083, 0.078, -0.006], 6, [0, 0, 0.1]),
    ); /* ears */
    P("head", "skin", merge(L), null, 1);
    const E = [];
    for (const s of [1, -1]) {
      E.push(ell(0.0105, 0.0105, 0.006, [s * 0.038, 0.098, 0.082], 7));
      E.push(
        xf(
          new THREE.BoxGeometry(0.036, 0.0065, 0.01),
          [s * 0.04, 0.128, 0.086],
          [0, -s * 0.35, -s * 0.12],
        ),
      );
    }
    if (D >= 1)
      E.push(
        xf(
          new THREE.BoxGeometry(0.03, 0.003, 0.012),
          [0.036, 0.108, 0.088],
          [0, -0.35, 0],
        ),
        xf(
          new THREE.BoxGeometry(0.03, 0.003, 0.012),
          [-0.036, 0.108, 0.088],
          [0, 0.35, 0],
        ),
      );
    P("head", "dark", merge(E), null);
    if (D >= 1)
      P(
        "head",
        "white",
        merge([
          ell(0.0185, 0.0125, 0.008, [0.038, 0.098, 0.078], 7),
          ell(0.0185, 0.0125, 0.008, [-0.038, 0.098, 0.078], 7),
        ]),
        null,
      );
    P(
      "head",
      "red",
      merge([
        ell(0.032, 0.0095, 0.011, [0, 0.018, 0.087], 6),
        ell(0.026, 0.0085, 0.01, [0, 0.006, 0.085], 6),
      ]),
      null,
    );
  }
  /* ---------- hands, arms ---------- */
  const hg = handGeo(D, S);
  LR("hand", "skin", hg, null, 1);
  P(
    "handL",
    "stick",
    merge([
      xf(new THREE.CylinderGeometry(0.012, 0.012, 0.4, 6), [0, -0.06, 0]),
      xf(new THREE.SphereGeometry(0.015, 5, 4), [0, 0.14, 0]),
      xf(new THREE.SphereGeometry(0.015, 5, 4), [0, -0.26, 0]),
    ]),
    "ST",
  );
  P(
    "handR",
    "stick",
    merge([
      xf(new THREE.CylinderGeometry(0.012, 0.012, 0.4, 6), [0, -0.06, 0]),
      xf(new THREE.SphereGeometry(0.015, 5, 4), [0, 0.14, 0]),
      xf(new THREE.SphereGeometry(0.015, 5, 4), [0, -0.26, 0]),
    ]),
    "ST",
  );
  if (F) {
    LR(
      "arm",
      "skin",
      limb(
        [
          [0.03, 0.04],
          [-0.05, 0.05],
          [-0.15, 0.044],
          [-0.27, 0.037],
          [-0.295, 0.032],
        ],
        S,
      ),
      null,
      1,
    );
    LR(
      "arm",
      "choli",
      limb(
        [
          [0.04, 0.056],
          [-0.01, 0.058],
          [-0.08, 0.053],
        ],
        S,
      ),
      null,
    );
    LR("arm", "trim", band(-0.12, 0.047, 0.047, 0.007, 0, 0, S2), null);
    LR(
      "fore",
      "skin",
      limb(
        [
          [0.01, 0.034],
          [-0.08, 0.036],
          [-0.18, 0.03],
          [-0.25, 0.024],
          [-0.275, 0.022],
        ],
        S,
      ),
      null,
      1,
    );
    {
      const B = [];
      for (let i = 0; i < 5; i++)
        B.push(
          band(
            -0.2 - i * 0.0105,
            0.03 - i * 0.0004,
            0.03 - i * 0.0004,
            0.0042,
            0,
            0,
            S2,
          ),
        );
      LR("fore", "trim", merge(B), null);
      const R = [];
      for (let i = 0; i < 4; i++)
        R.push(band(-0.165 + i * 0.0105, 0.032, 0.032, 0.0045, 0, 0, S2));
      LR("fore", "red", merge(R), null);
    }
    /* torso */
    P(
      "spine",
      "skin",
      limb(
        [
          [-0.08, 0.15, 0.108],
          [-0.0, 0.128, 0.096],
          [0.07, 0.13, 0.098],
          [0.165, 0.139, 0.103],
        ],
        S2,
      ),
      null,
      1,
    );
    P(
      "spine",
      "trim",
      merge([
        band(-0.01, 0.134, 0.1, 0.013, 0, 0, S2),
        band(-0.036, 0.138, 0.103, 0.006, 0, 0, S2),
        ell(0.012, 0.016, 0.008, [0.0, -0.03, 0.104], 6),
        ell(0.01, 0.02, 0.006, [0.05, -0.06, 0.1], 5),
        ell(0.01, 0.02, 0.006, [-0.05, -0.06, 0.1], 5),
      ]),
      null,
    );
    P(
      "chest",
      "skin",
      limb(
        [
          [-0.02, 0.14, 0.102],
          [0.05, 0.15, 0.12, 0, 0.012],
          [0.12, 0.157, 0.132, 0, 0.02],
          [0.19, 0.158, 0.108],
          [0.25, 0.165, 0.088],
          [0.285, 0.07, 0.06],
          [0.315, 0.052, 0.05],
        ],
        S2,
      ),
      null,
      1,
    );
    P(
      "chest",
      "choli",
      limb(
        [
          [0.022, 0.152, 0.12],
          [0.07, 0.16, 0.136, 0, 0.014],
          [0.125, 0.168, 0.148, 0, 0.022],
          [0.185, 0.17, 0.122],
          [0.238, 0.17, 0.098],
        ],
        S2,
      ),
      null,
    );
    P(
      "chest",
      "trim",
      merge([
        band(0.024, 0.153, 0.121, 0.006, 0, 0, S2),
        band(0.238, 0.171, 0.099, 0.006, 0, 0, S2),
        band(0.275, 0.088, 0.074, 0.0055, 0, 0.01, S2),
        ell(0.014, 0.018, 0.01, [0, 0.2, 0.123], 6),
      ]),
      null,
    );
    /* legs under the ghagra */
    LR(
      "shin",
      "skin",
      limb(
        [
          [0.0, 0.058],
          [-0.2, 0.04],
          [-0.36, 0.03],
          [-0.425, 0.026],
        ],
        S,
      ),
      null,
      1,
    );
    LR(
      "thigh",
      "skin",
      limb(
        [
          [0.04, 0.098],
          [-0.2, 0.08],
          [-0.45, 0.058],
        ],
        S,
      ),
      null,
      1,
    );
    LR("foot", "skin", footGeo(D, S, false), null, 1);
    {
      const A = [
        band(0.002, 0.031, 0.031, 0.0045, 0, 0, S2),
        band(-0.012, 0.031, 0.031, 0.0045, 0, 0, S2),
      ];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        A.push(
          ell(
            0.0065,
            0.0065,
            0.0065,
            [Math.cos(a) * 0.034, -0.024, Math.sin(a) * 0.034],
            4,
          ),
        );
      }
      LR("foot", "trim", merge(A), null);
    }
    /* ghagra */
    const rip = (a, y) =>
      0.028 * Math.sin(a * 16) * clamp((0.1 - y) / 0.8, 0, 1);
    P(
      "skirt",
      "ghagra",
      loft(
        [
          [0.07, 0.128, 0.1],
          [0, 0.165, 0.125],
          [-0.18, 0.255, 0.215],
          [-0.45, 0.4, 0.36],
          [-0.65, 0.505, 0.46],
          [-0.79, 0.585, 0.545],
        ],
        S2 * 2,
        { ur: 3, vf: true, rip },
      ),
      null,
    );
    P(
      "skirt",
      "trim",
      loft(
        [
          [-0.7, 0.538, 0.488],
          [-0.79, 0.59, 0.55],
        ].map((r) => r),
        S2 * 2,
        { rip },
      ),
      null,
    );
    /* dupatta (drapes from the left shoulder down the back) */
    const cur = (x, y) => 0.02 * Math.sin(x * 22 + y * 6);
    P("duA", "dupatta", xf(planeStrip(0.3, 0.38, 0, cur), [0, 0, 0]), null);
    P("duB", "dupatta", planeStrip(0.3, 0.36, 0, cur), null);
    P("duC", "dupatta", planeStrip(0.3, 0.34, 0, cur), null);
    /* jewellery on the head */
    P(
      "head",
      "trim",
      merge([
        ell(0.011, 0.011, 0.011, [0.083, 0.036, 0], 5),
        ell(0.011, 0.011, 0.011, [-0.083, 0.036, 0], 5),
        ell(0.009, 0.009, 0.009, [0, 0.205, 0.083], 5),
        xf(
          new THREE.BoxGeometry(0.004, 0.045, 0.003),
          [0, 0.225, 0.062],
          [-0.2, 0, 0],
        ),
        band(0.0, 0.012, 0.012, 0.0025, 0.02, 0.1, 8),
      ]),
      null,
    );
    P("head", "red", ell(0.0075, 0.0075, 0.004, [0, 0.138, 0.096], 5), null);
    /* hair: cap + 3 styles */
    P("head", "hair", hairCap(false, S2), null);
    P(
      "head",
      "hair",
      merge([
        xf(new THREE.BoxGeometry(0.004, 0.01, 0.1), [0, 0.226, 0.0]),
        loft(
          [
            [0.08, 0.09, 0.04, 0, -0.07],
            [0.0, 0.08, 0.03, 0, -0.075],
            [-0.06, 0.04, 0.02, 0, -0.07],
          ],
          S,
        ),
      ]),
      "Fh0",
    ); /* nape + parting */
    {
      const B = [],
        B2 = [];
      for (let i = 0; i < 8; i++) {
        B.push(
          ell(
            0.034 - i * 0.0014,
            0.034,
            0.026 - i * 0.0008,
            [i % 2 ? 0.006 : -0.006, -0.03 * i - 0.02, 0],
            7,
          ),
        );
        B2.push(
          ell(
            0.025 - i * 0.0015,
            0.034,
            0.02,
            [i % 2 ? 0.005 : -0.005, -0.03 * i - 0.02, 0],
            7,
          ),
        );
      }
      P("hairA", "hair", merge(B), "Fh0");
      P(
        "hairB",
        "hair",
        merge(
          B2.concat([
            xf(
              new THREE.ConeGeometry(0.018, 0.07, 6),
              [0, -0.27, 0],
              [PI, 0, 0],
            ),
          ]),
        ),
        "Fh0",
      );
      P(
        "hairB",
        "trim",
        merge([
          ell(0.012, 0.012, 0.012, [0, -0.245, 0], 5),
          xf(new THREE.CylinderGeometry(0.004, 0.004, 0.05, 4), [0, -0.31, 0]),
        ]),
        "Fh0",
      );
      P(
        "hairB",
        "red",
        xf(new THREE.ConeGeometry(0.02, 0.07, 6), [0, -0.31, 0], [PI, 0, 0]),
        "Fh0",
      );
    }
    P(
      "head",
      "hair",
      merge([
        ell(0.065, 0.06, 0.06, [0, 0.205, -0.085], 9),
        loft(
          [
            [0.1, 0.075, 0.04, 0, -0.075],
            [0.0, 0.06, 0.03, 0, -0.07],
            [-0.03, 0.03, 0.02, 0, -0.06],
          ],
          S,
        ),
      ]),
      "Fh1",
    ); /* high bun */
    {
      const FL = [];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        FL.push(
          ell(
            0.014,
            0.014,
            0.014,
            [
              Math.cos(a) * 0.065,
              0.205 + Math.sin(a) * 0.06 * 0.0,
              -0.085 + Math.sin(a) * 0.065,
            ],
            5,
          ),
        );
      }
      P("head", "flower", merge(FL), "Fh1");
    }
    P(
      "hairA",
      "hair",
      merge([
        loft(
          [
            [0.0, 0.06, 0.025],
            [-0.1, 0.075, 0.03],
            [-0.22, 0.07, 0.028],
            [-0.2, 0.0, 0.0],
          ],
          S,
        ),
        ell(0.07, 0.02, 0.03, [0, 0.02, 0.0], 6),
      ]),
      "Fh2",
    );
    P(
      "hairB",
      "hair",
      loft(
        [
          [0.0, 0.07, 0.028],
          [-0.15, 0.064, 0.026],
          [-0.28, 0.04, 0.02],
          [-0.34, 0.001, 0.001],
        ],
        S,
      ),
      "Fh2",
    );
    P(
      "head",
      "hair",
      loft(
        [
          [0.1, 0.092, 0.1, 0, -0.012],
          [0.0, 0.09, 0.075, 0, -0.075],
          [-0.06, 0.07, 0.03, 0, -0.08],
        ],
        S,
      ),
      "Fh2",
    );
    P("head", "red", ell(0.0075, 0.0075, 0.004, [0, 0.138, 0.096], 5), null);
  } else {
    LR(
      "arm",
      "choli",
      limb(
        [
          [0.045, 0.064],
          [-0.1, 0.058],
          [-0.28, 0.05],
          [-0.3, 0.046],
        ],
        S,
      ),
      null,
    );
    LR(
      "fore",
      "choli",
      limb(
        [
          [0.0, 0.05],
          [-0.12, 0.048],
          [-0.22, 0.042],
          [-0.258, 0.04],
        ],
        S,
      ),
      null,
    );
    LR(
      "fore",
      "trim",
      merge([
        band(-0.235, 0.043, 0.043, 0.006, 0, 0, S2),
        band(-0.222, 0.044, 0.044, 0.0035, 0, 0, S2),
      ]),
      null,
    );
    P(
      "spine",
      "choli",
      limb(
        [
          [-0.08, 0.165, 0.12],
          [0, 0.15, 0.112],
          [0.08, 0.152, 0.114],
          [0.165, 0.163, 0.12],
        ],
        S2,
      ),
      null,
    );
    P(
      "chest",
      "choli",
      limb(
        [
          [0, 0.163, 0.12],
          [0.07, 0.19, 0.13],
          [0.15, 0.205, 0.14],
          [0.22, 0.21, 0.125],
          [0.268, 0.185, 0.1],
          [0.292, 0.1, 0.075],
        ],
        S2,
      ),
      null,
    );
    P(
      "chest",
      "skin",
      limb(
        [
          [0.2, 0.1, 0.09],
          [0.285, 0.08, 0.06],
          [0.32, 0.052, 0.05],
        ],
        S2,
      ),
      null,
      1,
    );
    P(
      "chest",
      "trim",
      merge([
        band(0.285, 0.095, 0.078, 0.007, 0, 0.004, S2),
        xf(new THREE.BoxGeometry(0.012, 0.3, 0.008), [0, 0.12, 0.142]),
        ell(0.009, 0.009, 0.006, [0, 0.22, 0.135], 5),
        ell(0.009, 0.009, 0.006, [0, 0.15, 0.145], 5),
        ell(0.009, 0.009, 0.006, [0, 0.08, 0.15], 5),
        ell(0.009, 0.009, 0.006, [0, 0.01, 0.14], 5),
        band(0.255, 0.1, 0.08, 0.0045, 0, 0.02, S2),
      ]),
      null,
    );
    P(
      "hips",
      "dupatta",
      merge([
        loft(
          [
            [0.035, 0.172, 0.13],
            [-0.035, 0.174, 0.132],
          ],
          S2,
        ),
        ell(0.04, 0.04, 0.03, [0.12, 0, 0.11], 6),
      ]),
      null,
    ); /* patka sash */
    P(
      "duA",
      "dupatta",
      planeStrip(0.1, 0.34, 0, (x, y) => 0.015 * Math.sin(y * 14)),
      null,
    );
    P(
      "duB",
      "dupatta",
      planeStrip(0.1, 0.3, 0, (x, y) => 0.015 * Math.sin(y * 14)),
      null,
    );
    P(
      "skirt",
      "choli",
      loft(
        [
          [0.1, 0.172, 0.126],
          [0, 0.2, 0.15],
          [-0.12, 0.255, 0.2],
          [-0.26, 0.34, 0.28],
        ],
        S2 * 2,
        {
          ur: 2,
          vf: true,
          rip: (a, y) => 0.03 * Math.sin(a * 12) * clamp((0.1 - y) / 0.3, 0, 1),
        },
      ),
      null,
    );
    P(
      "skirt",
      "trim",
      loft(
        [
          [-0.235, 0.328, 0.27],
          [-0.265, 0.343, 0.283],
        ],
        S2 * 2,
      ),
      null,
    );
    LR(
      "thigh",
      "plain",
      limb(
        [
          [0.04, 0.112],
          [-0.1, 0.106],
          [-0.25, 0.093],
          [-0.45, 0.074],
        ],
        S,
      ),
      null,
    );
    LR(
      "shin",
      "plain",
      loft(
        [
          [0.0, 0.074],
          [-0.1, 0.066],
          [-0.2, 0.062],
          [-0.3, 0.06],
          [-0.4, 0.056],
        ],
        S,
        { rip: (a, y) => 0.1 * Math.sin(-y * 70) * clamp(-y / 0.3, 0, 1) },
      ),
      null,
    );
    LR(
      "shin",
      "skin",
      limb(
        [
          [-0.37, 0.046],
          [-0.425, 0.034],
        ],
        S,
      ),
      null,
      1,
    );
    LR("foot", "shoe", footGeo(D, S, true), null);
    LR(
      "foot",
      "trim",
      merge([
        band(0.0, 0.034, 0.034, 0.004, 0, 0, S2),
        xf(
          new THREE.BoxGeometry(0.05, 0.004, 0.1),
          [0, 0.0, 0.12],
          [0, 0, 0],
        ).translate(0, -0.012, 0),
      ]),
      null,
    );
    P(
      "head",
      "trim",
      merge([
        ell(0.009, 0.009, 0.009, [0.083, 0.036, 0], 5),
        ell(0.009, 0.009, 0.009, [-0.083, 0.036, 0], 5),
        band(0.288, 0.075, 0.062, 0.004, 0, 0.04, S2),
      ]),
      null,
    );
    P(
      "head",
      "red",
      merge([xf(new THREE.BoxGeometry(0.006, 0.034, 0.004), [0, 0.15, 0.097])]),
      null,
    );
    P(
      "head",
      "dark",
      merge([
        xf(
          new THREE.BoxGeometry(0.06, 0.011, 0.012),
          [0, 0.036, 0.098],
          [0, 0, 0],
          [1, 1, 1],
        ),
        xf(
          new THREE.BoxGeometry(0.03, 0.01, 0.01),
          [0.03, 0.034, 0.095],
          [0, 0, -0.3],
        ),
        xf(
          new THREE.BoxGeometry(0.03, 0.01, 0.01),
          [-0.03, 0.034, 0.095],
          [0, 0, 0.3],
        ),
      ]),
      "Mst",
    );
    P("head", "hair", hairCap(true, S2), "Mh0");
    /* feta / pagdi: wound turban */
    P(
      "head",
      "pagdi",
      loft(
        [
          [0.07, 0.1, 0.108, 0, -0.01],
          [0.12, 0.118, 0.126, 0, -0.01],
          [0.17, 0.125, 0.134, 0, -0.01],
          [0.22, 0.105, 0.115, 0, -0.012],
          [0.27, 0.06, 0.07, 0, -0.012],
          [0.29, 0.02, 0.024, 0, -0.012],
          [0.295, 0.002, 0.002, 0, -0.012],
        ],
        S2,
        { ur: 3, rip: (a, y) => 0.045 * Math.sin(a * 3 + y * 40) },
      ),
      "Mh1",
    );
    P(
      "head",
      "trim",
      merge([
        band(0.145, 0.112, 0.122, 0.006, 0, -0.005, S2),
        ell(0.016, 0.03, 0.012, [0, 0.16, 0.126], 5),
        xf(
          new THREE.ConeGeometry(0.012, 0.07, 5),
          [0, 0.24, 0.12],
          [-0.4, 0, 0],
        ),
      ]),
      "Mh1",
    );
    P(
      "head",
      "hair",
      merge([
        loft(
          [
            [0.07, 0.088, 0.096, 0, -0.012],
            [0.1, 0.09, 0.1, 0, -0.014],
          ],
          S,
        ),
      ]),
      "Mh1",
    );
    P(
      "hairA",
      "pagdi",
      planeStrip(0.14, 0.34, 0, (x, y) => 0.02 * Math.sin(y * 18)),
      "Mh1",
    );
    P(
      "hairA",
      "trim",
      merge([xf(new THREE.BoxGeometry(0.15, 0.01, 0.006), [0, -0.33, 0])]),
      "Mh1",
    );
    /* topi cap */
    P(
      "head",
      "choli",
      loft(
        [
          [0.11, 0.098, 0.108, 0, -0.01],
          [0.15, 0.104, 0.114, 0, -0.01],
          [0.2, 0.09, 0.098, 0, -0.012],
          [0.235, 0.05, 0.06, 0, -0.012],
          [0.246, 0.002, 0.002, 0, -0.012],
        ],
        S2,
        { ur: 2 },
      ),
      "Mh2",
    );
    P(
      "head",
      "trim",
      merge([
        band(0.118, 0.099, 0.109, 0.007, 0, -0.01, S2),
        band(0.2, 0.09, 0.098, 0.003, 0, -0.012, S2),
      ]),
      "Mh2",
    );
    P(
      "head",
      "hair",
      loft(
        [
          [0.07, 0.088, 0.096, 0, -0.012],
          [0.11, 0.092, 0.1, 0, -0.014],
        ],
        S,
      ),
      "Mh2",
    );
  }
  return out;
}
