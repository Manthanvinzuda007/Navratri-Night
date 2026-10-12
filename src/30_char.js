/*Copyright (c) 2026 MANTHAN VINZUDA

All rights reserved.

This source code is provided for viewing purposes only.
You may not copy, modify, distribute, sublicense, or use
this code or substantial portions of it without permission.*/

/* ============================ 4b. CHARACTERS – skeleton, materials, hero + instanced crowd ============================ */
const BONES = [
  ["root", null, 0, 0, 0],
  ["hips", "root", 0, 0.95, 0],
  ["spine", "hips", 0, 0.05, 0],
  ["chest", "spine", 0, 0.16, 0],
  ["neck", "chest", 0, 0.3, 0],
  ["head", "neck", 0, 0.09, 0],
  ["hairA", "head", 0, 0.13, -0.07],
  ["hairB", "hairA", 0, -0.22, 0],
  ["earL", "head", 0.083, 0.04, 0],
  ["earR", "head", -0.083, 0.04, 0],
  ["clavL", "chest", 0.05, 0.27, 0],
  ["armL", "clavL", 0.13, 0, 0],
  ["foreL", "armL", 0, -0.29, 0],
  ["handL", "foreL", 0, -0.26, 0],
  ["clavR", "chest", -0.05, 0.27, 0],
  ["armR", "clavR", -0.13, 0, 0],
  ["foreR", "armR", 0, -0.29, 0],
  ["handR", "foreR", 0, -0.26, 0],
  ["thighL", "hips", 0.095, -0.03, 0],
  ["shinL", "thighL", 0, -0.45, 0],
  ["footL", "shinL", 0, -0.425, 0],
  ["thighR", "hips", -0.095, -0.03, 0],
  ["shinR", "thighR", 0, -0.45, 0],
  ["footR", "shinR", 0, -0.425, 0],
  ["skirt", "hips", 0, 0.02, 0],
  ["duA", "chest", 0.14, 0.27, -0.14],
  ["duB", "duA", 0, -0.36, 0],
  ["duC", "duB", 0, -0.34, 0],
  ["pend", "chest", 0, 0.27, 0.1],
];
function buildSkeleton(g) {
  const b = {};
  BONES.forEach(([n, p, x, y, z]) => {
    const o = new THREE.Object3D();
    o.name = n;
    o.position.set(x, y, z);
    b[n] = o;
    if (p) b[p].add(o);
  });
  if (g == "m") {
    b.chest.remove(b.duA);
    b.hips.add(b.duA);
    b.duA.position.set(0.125, -0.01, 0.1);
  }
  b.list = BONES.map((r) => b[r[0]]);
  return b;
}
/* ---- materials ---- */
function fabricMat(pk, inst, lam, dbl) {
  const o = { map: pk.pack, side: dbl ? 2 : 0 };
  if (!lam) {
    o.roughness = 1;
    o.metalness = 1;
    o.roughnessMap = pk.mr;
    o.metalnessMap = pk.mr;
  }
  const m = lam
      ? new THREE.MeshLambertMaterial(o)
      : new THREE.MeshStandardMaterial(o),
    u = {
      uTint: { value: new THREE.Color(1, 1, 1) },
      uTrim: { value: new THREE.Color(1, 0.8, 0.3) },
    };
  m.userData.u = u;
  m.onBeforeCompile = (s) => {
    s.uniforms.uTint = u.uTint;
    s.uniforms.uTrim = u.uTrim;
    s.vertexShader = s.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\n" +
          (inst
            ? "attribute vec3 aTint;attribute vec3 aTrim;"
            : "uniform vec3 uTint;uniform vec3 uTrim;") +
          "\nvarying vec3 vTint;varying vec3 vTrim;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n" +
          (inst ? "vTint=aTint;vTrim=aTrim;" : "vTint=uTint;vTrim=uTrim;"),
      );
    s.fragmentShader = s.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vTint;varying vec3 vTrim;",
      )
      .replace(
        "#include <map_fragment>",
        "#ifdef USE_MAP\n vec4 pk=texture2D(map,vUv);diffuseColor.rgb=mix(vTint*pk.r,vTrim*(.55+.55*pk.r),pk.g);\n#endif",
      );
  };
  m.customProgramCacheKey = () => "fab" + (inst ? "I" : "H");
  return track(m);
}
function plainMat(lam, o, rough, metal) {
  if (!lam) {
    o.roughness = rough;
    o.metalness = metal;
  }
  return track(
    lam ? new THREE.MeshLambertMaterial(o) : new THREE.MeshStandardMaterial(o),
  );
}
function createMatLib(Qd) {
  const lam = !!Qd.lambert,
    packs = {
      ghagra: fabricPack("ghagra"),
      choli: fabricPack("choli"),
      dupatta: fabricPack("dupatta"),
      plain: fabricPack("plain"),
    };
  const mats = (inst, col) => ({
    skin: plainMat(
      lam,
      { vertexColors: true, color: C(col ? col.skin : 0xffffff) },
      0.58,
      0,
    ),
    hair: plainMat(lam, { color: C(col ? col.hair : 0xffffff) }, 0.42, 0),
    trim: plainMat(lam, { color: C(col ? col.t : 0xffffff) }, 0.28, 0.95),
    dark: plainMat(lam, { color: C(0x14100d) }, 0.55, 0),
    white: plainMat(lam, { color: C(0xf3eee6) }, 0.3, 0),
    red: plainMat(lam, { color: C(col ? col.red : 0xffffff) }, 0.4, 0),
    flower: plainMat(lam, { color: C(col ? col.flower : 0xffffff) }, 0.7, 0),
    shoe: plainMat(lam, { color: C(col ? col.shoe : 0xffffff) }, 0.55, 0.1),
    stick: plainMat(lam, { color: C(col ? col.stick : 0xffffff) }, 0.5, 0.2),
    ghagra: fabricMat(packs.ghagra, inst, lam, true),
    choli: fabricMat(packs.choli, inst, lam, true),
    dupatta: fabricMat(packs.dupatta, inst, lam, true),
    plain: fabricMat(packs.plain, inst, lam, true),
    pagdi: fabricMat(packs.plain, inst, lam, true),
  });
  return { lam, packs, make: mats, inst: mats(true, null) };
}
/* ---- appearance ---- */
function randSpec(g, R) {
  R = R || Math.random;
  const f = g == "f",
    pk = (a) => a[(R() * a.length) | 0];
  let c1,
    c2,
    c3,
    t = R() < 0.8 ? GOLD : SILVER;
  if (R() < 0.45) {
    const c = pk(COSTUMES[g]);
    c1 = c.c1;
    c2 = c.c2;
    c3 = c.c3;
    t = c.t;
  } else {
    const a = PAL.slice().sort(() => R() - 0.5);
    c1 = f ? a[0] : pk([0xf3e9d2, 0xf5efe0, a[0], a[1]]);
    c2 = f ? a[1] : pk([0xf3e9d2, 0xefe6d0, 0xfff8e1]);
    c3 = a[2];
    if (!f && R() < 0.5) {
      c2 = a[3];
    }
  }
  return {
    g,
    skin: pk(SKINS),
    hair: pk(HAIRS),
    hs: (R() * 3) | 0,
    st: !f && R() < 0.5,
    c1,
    c2,
    c3,
    t,
    red: f ? pk([0xb3202f, 0xc2185b, 0x9c1c2a, 0xd32f2f]) : 0x8a4a3a,
    flower: pk([0xfff6dd, 0xffb300, 0xffffff, 0xff8f00]),
    shoe: pk([0x6b4423, 0x8b5a2b, 0x3b2a1a, 0x7a4a2b]),
    stick: pk(PAL),
    sx: 0.92 + R() * 0.16,
    sy: (f ? 0.95 : 1) * (0.94 + R() * 0.12),
    ph: (R() - 0.5) * 0.07 + (R() < 0.08 ? 0.12 : 0),
    int: 0.75 + R() * 0.45,
    sty: (R() * 4) | 0,
    hand: R() < 0.5 ? 1 : -1,
    hipA: 0.7 + R() * 0.6,
    shA: 0.6 + R() * 0.8,
    hdA: 0.5 + R() * 1,
    cloth: 0.8 + R() * 0.45,
    wp: R() * TAU,
  };
}
function specFromPlayer(g, save) {
  const cs = COSTUMES[g][save.costume[g]] || COSTUMES[g][0],
    cd = CHARS[g][save.char[g]] || CHARS[g][0],
    s = randSpec(g, rng(777 + (g == "f" ? 1 : 2)));
  return Object.assign(s, {
    skin: cd.skin,
    hair: cd.hair,
    hs: cd.hs,
    st: !!cd.st,
    c1: cs.c1,
    c2: cs.c2,
    c3: cs.c3,
    t: cs.t,
    sx: cd.w,
    sy: (g == "f" ? 0.95 : 1) * cd.h,
    ph: 0,
    int: 1,
    sty: 0,
    hipA: 1,
    shA: 1,
    hdA: 1,
    cloth: 1,
    hand: 1,
    red: g == "f" ? 0xc2185b : 0x8a4a3a,
    flower: 0xfff6dd,
  });
}
const grpsOf = (s) =>
  s.g == "f"
    ? ["F", "Fh" + s.hs, "ST"]
    : ["M", "Mh" + s.hs, "ST"].concat(s.st ? ["Mst"] : []);
function fabTints(s, f) {
  return f
    ? { ghagra: s.c1, choli: s.c2, dupatta: s.c3, plain: s.c2, pagdi: s.c3 }
    : { choli: s.c1, plain: s.c2, dupatta: s.c3, pagdi: s.c3, ghagra: s.c1 };
}
/* ---- hero (fully articulated, own materials, dangling jewellery) ---- */
function buildHero(spec, parts, lib, Qd) {
  const f = spec.g == "f",
    B = buildSkeleton(spec.g),
    M = lib.make(false, {
      skin: spec.skin,
      hair: spec.hair,
      t: spec.t,
      red: spec.red,
      flower: spec.flower,
      shoe: spec.shoe,
      stick: spec.stick,
    }),
    tn = fabTints(spec, f),
    trim = C(spec.t);
  for (const k in tn) {
    M[k].userData.u.uTint.value.copy(C(tn[k]));
    M[k].userData.u.uTrim.value.copy(trim);
  }
  const grp = new Set(grpsOf(spec)),
    sticks = [];
  for (const p of parts) {
    if (!grp.has(p.grp)) continue;
    const m = new THREE.Mesh(p.geo, M[p.mat]);
    m.castShadow = !!Qd.shadow && p.mat != "trim";
    m.frustumCulled = false;
    B[p.bone].add(m);
    if (p.grp == "ST") {
      m.visible = false;
      sticks.push(m);
    }
  }
  const dang = [];
  if (f) {
    for (const s of [1, -1]) {
      const m = new THREE.Mesh(
        merge([
          ell(0.008, 0.008, 0.008, [0, -0.012, 0], 5),
          xf(
            new THREE.ConeGeometry(0.012, 0.03, 6),
            [0, -0.035, 0],
            [PI, 0, 0],
          ),
          ell(0.005, 0.005, 0.005, [0, -0.054, 0], 4),
        ]),
        M.trim,
      );
      B[s > 0 ? "earL" : "earR"].add(m);
      dang.push({ o: m, ph: s, k: 1 });
    }
    const pm = new THREE.Mesh(
      merge([
        ell(0.014, 0.022, 0.009, [0, -0.05, 0.02], 6),
        xf(new THREE.CylinderGeometry(0.003, 0.003, 0.07, 4), [0, -0.02, 0.02]),
      ]),
      M.trim,
    );
    B.pend.add(pm);
    dang.push({ o: pm, ph: 0, k: 0.5 });
  }
  B.root.scale.set(spec.sx, spec.sy, spec.sx);
  const hero = {
    B,
    M,
    root: B.root,
    spec,
    sticks,
    dang,
    ch: Object.assign({}, spec),
  };
  return hero;
}
/* dhol (barrel drum) for stage drummers */
function addDhol(hero, lib) {
  const B = hero.B,
    wood = plainMat(lib.lam, { color: C(0x7a3f18) }, 0.5, 0),
    skin = plainMat(lib.lam, { color: C(0xefe4cc), side: 2 }, 0.8, 0),
    rope = plainMat(lib.lam, { color: C(0xd32f2f) }, 0.6, 0);
  const drum = new THREE.Group(),
    bar = xf(
      loft(
        [
          [-0.3, 0.15],
          [-0.2, 0.18],
          [0, 0.2],
          [0.2, 0.18],
          [0.3, 0.15],
        ].map((r) => [r[0], r[1], r[1]]),
        14,
      ),
      [0, 0, 0],
      [0, 0, PI / 2],
    );
  drum.add(new THREE.Mesh(bar, wood));
  for (const s of [-1, 1]) {
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.155, 14), skin);
    d.rotation.y = (s * PI) / 2;
    d.position.x = s * 0.305;
    drum.add(d);
  }
  for (let i = -4; i <= 4; i++) {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(
        0.17 + 0.025 * (1 - Math.abs(i) / 5),
        0.006,
        4,
        12,
      ),
      rope,
    );
    r.rotation.y = PI / 2;
    r.position.x = i * 0.065;
    drum.add(r);
  }
  drum.position.set(0, -0.12, 0.23);
  B.hips.add(drum);
  const st = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.42, 5),
    plainMat(lib.lam, { color: C(0xe0b060) }, 0.4, 0),
  );
  st.position.set(0, -0.1, 0);
  B.handR.add(st);
  const str = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 0.015), rope);
  str.position.set(0, 0.2, 0.12);
  str.rotation.z = -0.5;
  B.chest.add(str);
  hero.drum = drum;
  hero.stick = st;
}
function disposeHero(h) {
  h.root.parent && h.root.parent.remove(h.root);
}
/* ---- instanced crowd ---- */
function createCrowd(scene, chars, partsBy, lib, Qd) {
  const protos = { f: buildSkeleton("f"), m: buildSkeleton("m") },
    meshes = [],
    links = chars.map(() => []),
    tmpC = new THREE.Color(),
    cols = ["skin", "hair", "trim", "red", "flower", "shoe", "stick"];
  const castSkip = /hand|foot|fore|hair|ear|duC|pend/;
  for (const g of ["f", "m"])
    for (const p of partsBy[g]) {
      const mem = [];
      chars.forEach((c, i) => {
        if (c.g == g && c.grps.indexOf(p.grp) >= 0) mem.push(i);
      });
      if (!mem.length) continue;
      const mat = lib.inst[p.mat],
        im = new THREE.InstancedMesh(p.geo, mat, mem.length);
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.frustumCulled = false;
      const fab = mat.userData && mat.userData.u;
      if (fab) {
        const at = new Float32Array(mem.length * 3),
          ar = new Float32Array(mem.length * 3);
        mem.forEach((ci, k) => {
          const c = chars[ci],
            tn = fabTints(c, g == "f")[p.mat];
          C(tn, tmpC).toArray(at, k * 3);
          C(c.t, tmpC).toArray(ar, k * 3);
        });
        p.geo.setAttribute("aTint", new THREE.InstancedBufferAttribute(at, 3));
        p.geo.setAttribute("aTrim", new THREE.InstancedBufferAttribute(ar, 3));
      } else
        mem.forEach((ci, k) => {
          const c = chars[ci];
          let hx = 0xffffff;
          if (cols.indexOf(p.mat) >= 0) {
            hx =
              p.mat == "skin"
                ? c.skin
                : p.mat == "hair"
                  ? c.hair
                  : p.mat == "trim"
                    ? c.t
                    : p.mat == "red"
                      ? c.red
                      : p.mat == "flower"
                        ? c.flower
                        : p.mat == "shoe"
                          ? c.shoe
                          : c.stick;
          }
          im.setColorAt(k, C(hx, tmpC));
        });
      im.castShadow =
        !!Qd.shadow &&
        p.mat != "trim" &&
        !castSkip.test(p.bone) &&
        ["skin", "ghagra", "choli", "plain", "pagdi", "dupatta"].indexOf(
          p.mat,
        ) >= 0;
      im.visible = true;
      scene.add(im);
      track(im);
      const rec = {
        im,
        bone: protos[g][p.bone],
        mem,
        stick: p.grp == "ST",
        arr: im.instanceMatrix.array,
      };
      meshes.push(rec);
      mem.forEach((ci, k) => links[ci].push([rec, k * 16]));
    }
  const crowd = {
    protos,
    meshes,
    N: chars.length,
    active: chars.length,
    setActive(n) {
      crowd.active = Math.min(n, chars.length);
      for (const r of meshes) {
        let c = 0;
        while (c < r.mem.length && r.mem[c] < crowd.active) c++;
        r.im.count = c;
      }
    },
    update(FS, cam, place, frame, dand) {
      const A = crowd.active;
      for (const r of meshes) if (r.stick) r.im.visible = dand;
      for (let i = 0; i < A; i++) {
        const ch = chars[i],
          P = protos[ch.g],
          pl = place(ch, FS.T);
        if ((frame + i) & 1 && ch.far) {
          continue;
        }
        const dx = pl.x - cam.x,
          dz = pl.z - cam.z;
        ch.far = dx * dx + dz * dz > 2400;
        P.root.position.set(pl.x, 0, pl.z);
        P.root.rotation.y = pl.yaw;
        P.root.scale.set(ch.sx, ch.sy, ch.sx);
        poseChar(P, ch, FS, pl);
        P.root.updateMatrixWorld(true);
        const L = links[i];
        for (let k = 0; k < L.length; k++) {
          const r = L[k][0];
          if (r.stick && !dand) continue;
          const e = r.bone.matrixWorld.elements,
            a = r.arr,
            o = L[k][1];
          for (let q = 0; q < 16; q++) a[o + q] = e[q];
        }
      }
      for (const r of meshes)
        if (!r.stick || dand) r.im.instanceMatrix.needsUpdate = true;
    },
    dispose() {
      meshes.forEach((r) => {
        scene.remove(r.im);
        r.im.dispose();
      });
    },
  };
  return crowd;
}
