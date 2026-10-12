/*Copyright (c) 2026 MANTHAN VINZUDA

All rights reserved.

This source code is provided for viewing purposes only.
You may not copy, modify, distribute, sublicense, or use
this code or substantial portions of it without permission.*/

/* ============================ 9. VFX – pooled sparks, petals/confetti, rings, player aura ============================ */
function createVFX(S, Qd, tex) {
  const V = {};
  const PET = [0xff8f00, 0xffb300, 0xffc400, 0xff6d00, 0xe91e63, 0xff80ab],
    CONF = [
      0xe53935, 0xffc107, 0x43a047, 0x1e88e5, 0xd81b60, 0xff6f00, 0xffffff,
      0xffd54f,
    ];
  /* --- additive spark/dust points (CPU simulated, fixed pool) --- */
  {
    const N = Qd.spark,
      pos = new Float32Array(N * 3).fill(-999),
      col = new Float32Array(N * 4),
      siz = new Float32Array(N),
      vel = new Float32Array(N * 3),
      life = new Float32Array(N),
      mx = new Float32Array(N),
      grv = new Float32Array(N),
      base = new Float32Array(N * 3);
    const g = track(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aCol", new THREE.BufferAttribute(col, 4));
    g.setAttribute("aSize", new THREE.BufferAttribute(siz, 1));
    const m = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTex: { value: tex }, uPR: { value: 1 } },
        vertexShader:
          "attribute vec4 aCol;attribute float aSize;uniform float uPR;varying vec4 vC;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min(aSize*uPR*60./max(-mv.z,1.),60.*uPR);vC=aCol;}",
        fragmentShader:
          "uniform sampler2D uTex;varying vec4 vC;void main(){float a=texture2D(uTex,gl_PointCoord).a*vC.a;gl_FragColor=vec4(vC.rgb,a);\n#include <encodings_fragment>\n}",
      }),
    );
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    pts.renderOrder = 6;
    S.add(pts);
    let ix = 0,
      lim = N;
    const tc = new THREE.Color();
    V.sparks = {
      mat: m,
      setLim(n) {
        lim = Math.max(10, Math.min(N, n));
      },
      spawn(x, y, z, vx, vy, vz, l, s, hex, gv) {
        const i = (ix = (ix + 1) % lim);
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;
        vel[i * 3] = vx;
        vel[i * 3 + 1] = vy;
        vel[i * 3 + 2] = vz;
        life[i] = mx[i] = l;
        siz[i] = s;
        grv[i] = gv === undefined ? 6 : gv;
        C(hex, tc);
        col[i * 4] = tc.r;
        col[i * 4 + 1] = tc.g;
        col[i * 4 + 2] = tc.b;
        col[i * 4 + 3] = 1;
      },
      update(dt) {
        for (let i = 0; i < N; i++) {
          if (life[i] <= 0) continue;
          life[i] -= dt;
          if (life[i] <= 0) {
            pos[i * 3 + 1] = -999;
            continue;
          }
          vel[i * 3 + 1] -= grv[i] * dt;
          pos[i * 3] += vel[i * 3] * dt;
          pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
          pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
          if (pos[i * 3 + 1] < 0.02 && grv[i] > 0) {
            pos[i * 3 + 1] = 0.02;
            vel[i * 3 + 1] *= -0.3;
            vel[i * 3] *= 0.7;
            vel[i * 3 + 2] *= 0.7;
          }
          col[i * 4 + 3] = Math.min(1, (life[i] / mx[i]) * 1.6);
        }
        g.attributes.position.needsUpdate = true;
        g.attributes.aCol.needsUpdate = true;
        g.attributes.aSize.needsUpdate = true;
      },
    };
  }
  /* --- petals + confetti as one instanced quad pool --- */
  {
    const N = Qd.flake,
      geo = track(new THREE.PlaneGeometry(0.17, 0.11)),
      mt = track(new THREE.MeshBasicMaterial({ side: 2, color: 0xffffff })),
      im = new THREE.InstancedMesh(geo, mt, N),
      d = new THREE.Object3D(),
      tc = new THREE.Color();
    const p = new Float32Array(N * 3),
      v = new Float32Array(N * 3),
      life = new Float32Array(N),
      mx = new Float32Array(N),
      rot = new Float32Array(N * 3),
      spin = new Float32Array(N * 3),
      ph = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      d.scale.set(0, 0, 0);
      d.updateMatrix();
      im.setMatrixAt(i, d.matrix);
      im.setColorAt(i, tc.setHex(0xffffff));
    }
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.frustumCulled = false;
    S.add(im);
    track(im);
    let ix = 0,
      lim = N;
    V.flakes = {
      setLim(n) {
        lim = Math.max(8, Math.min(N, n));
      },
      spawn(x, y, z, vx, vy, vz, l, hex, petal) {
        const i = (ix = (ix + 1) % lim);
        p[i * 3] = x;
        p[i * 3 + 1] = y;
        p[i * 3 + 2] = z;
        v[i * 3] = vx;
        v[i * 3 + 1] = vy;
        v[i * 3 + 2] = vz;
        life[i] = mx[i] = l;
        rot[i * 3] = rnd(0, 6);
        rot[i * 3 + 1] = rnd(0, 6);
        rot[i * 3 + 2] = rnd(0, 6);
        const s = petal ? 3 : 9;
        spin[i * 3] = rnd(-s, s);
        spin[i * 3 + 1] = rnd(-s, s);
        spin[i * 3 + 2] = rnd(-s, s);
        ph[i] = petal ? 1 : 0;
        im.setColorAt(i, C(hex, tc));
        im.instanceColor.needsUpdate = true;
      },
      update(dt, T) {
        for (let i = 0; i < N; i++) {
          if (life[i] <= 0) continue;
          life[i] -= dt;
          if (life[i] <= 0) {
            d.scale.set(0, 0, 0);
            d.updateMatrix();
            im.setMatrixAt(i, d.matrix);
            continue;
          }
          const pet = ph[i] > 0;
          v[i * 3 + 1] -= (pet ? 2.2 : 7) * dt;
          if (v[i * 3 + 1] < (pet ? -1.1 : -3.2))
            v[i * 3 + 1] = pet ? -1.1 : -3.2;
          v[i * 3] *= 1 - dt * 0.8;
          v[i * 3 + 2] *= 1 - dt * 0.8;
          p[i * 3] += (v[i * 3] + (pet ? Math.sin(T * 3 + i) * 0.7 : 0)) * dt;
          p[i * 3 + 1] += v[i * 3 + 1] * dt;
          p[i * 3 + 2] +=
            (v[i * 3 + 2] + (pet ? Math.cos(T * 2.6 + i) * 0.7 : 0)) * dt;
          if (p[i * 3 + 1] < 0.03) {
            p[i * 3 + 1] = 0.03;
            v[i * 3] = v[i * 3 + 1] = v[i * 3 + 2] = 0;
            spin[i * 3] = spin[i * 3 + 1] = spin[i * 3 + 2] = 0;
          }
          d.position.set(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]);
          d.rotation.set(
            (rot[i * 3] += spin[i * 3] * dt),
            (rot[i * 3 + 1] += spin[i * 3 + 1] * dt),
            (rot[i * 3 + 2] += spin[i * 3 + 2] * dt),
          );
          const sc = Math.min(1, life[i] * 1.5);
          d.scale.set(sc, sc, sc);
          d.updateMatrix();
          im.setMatrixAt(i, d.matrix);
        }
        im.instanceMatrix.needsUpdate = true;
      },
    };
  }
  /* --- expanding ground rings (beat pulses, claps, combo bursts) --- */
  {
    const n = 8,
      rg = track(new THREE.RingGeometry(0.92, 1, 56)),
      rings = [];
    for (let i = 0; i < n; i++) {
      const m = track(
          new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: 2,
            color: 0xffffff,
          }),
        ),
        o = new THREE.Mesh(rg, m);
      o.rotation.x = -PI / 2;
      o.visible = false;
      o.position.y = 0.08;
      S.add(o);
      rings.push({ o, t: 0, d: 1, max: 1 });
    }
    let ix = 0;
    V.rings = {
      spawn(x, z, hex, max, dur, y) {
        const r = rings[(ix = (ix + 1) % n)];
        r.o.position.set(x, y || 0.08, z);
        r.o.material.color.copy(C(hex));
        r.t = 0;
        r.d = dur;
        r.max = max;
        r.o.visible = true;
      },
      update(dt) {
        for (const r of rings) {
          if (!r.o.visible) continue;
          r.t += dt;
          const u = r.t / r.d;
          if (u >= 1) {
            r.o.visible = false;
            continue;
          }
          const s = 0.3 + (r.max - 0.3) * (1 - Math.pow(1 - u, 3));
          r.o.scale.set(s, s, 1);
          r.o.material.opacity = 0.8 * (1 - u) * (1 - u);
        }
      },
    };
  }
  /* --- player aura, ground glow, name tag --- */
  {
    const g = new THREE.Group();
    S.add(g);
    V.aura = g;
    const cm = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: 2,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uT: { value: 0 },
          uA: { value: 0 },
          uC: { value: C(0xffc94a) },
        },
        vertexShader:
          "varying vec2 vU;varying float vF;void main(){vU=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vec3 n=normalize(normalMatrix*normal);vF=abs(dot(n,normalize(-mv.xyz)));gl_Position=projectionMatrix*mv;}",
        fragmentShader:
          "uniform float uT,uA;uniform vec3 uC;varying vec2 vU;varying float vF;void main(){float a=uA*pow(1.-vU.y,1.3)*(.55+.45*sin(vU.y*18.-uT*4.))*(.35+.65*pow(1.-vF,.6));gl_FragColor=vec4(uC,a);\n#include <encodings_fragment>\n}",
      }),
    );
    const cyl = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.62, 0.9, 2.9, 24, 1, true)),
      cm,
    );
    cyl.position.y = 1.45;
    cyl.renderOrder = 7;
    g.add(cyl);
    V.auraMat = cm;
    const gl = new THREE.Mesh(
      track(new THREE.CircleGeometry(1.5, 32)),
      track(
        new THREE.MeshBasicMaterial({
          map: tex,
          color: C(0xffc94a),
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
    gl.rotation.x = -PI / 2;
    gl.position.y = 0.07;
    g.add(gl);
    V.groundGlow = gl;
    const tg = new THREE.Mesh(
      track(new THREE.OctahedronGeometry(0.17, 0)),
      track(new THREE.MeshBasicMaterial({ color: C(0xffd54f) })),
    );
    tg.scale.set(0.8, 1.2, 0.8);
    g.add(tg);
    V.marker = tg;
    V.tag = new THREE.Sprite(
      track(
        new THREE.SpriteMaterial({
          transparent: true,
          depthWrite: false,
          depthTest: false,
        }),
      ),
    );
    V.tag.scale.set(2.1, 0.5, 1);
    V.tag.renderOrder = 20;
    g.add(V.tag);
    V.setName = (n) => {
      const c = cvs(256, 64),
        x = c.getContext("2d");
      x.fillStyle = "rgba(30,8,10,.62)";
      x.beginPath();
      x.roundRect ? x.roundRect(4, 8, 248, 48, 24) : x.rect(4, 8, 248, 48);
      x.fill();
      x.strokeStyle = "#ffc94a";
      x.lineWidth = 3;
      x.stroke();
      x.fillStyle = "#ffd54f";
      x.font = "700 30px " + GU.font;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("★ " + n, 128, 33);
      if (V.tag.material.map) V.tag.material.map.dispose();
      V.tag.material.map = new THREE.CanvasTexture(c);
      V.tag.material.map.encoding = THREE.sRGBEncoding;
      V.tag.material.needsUpdate = true;
    };
    V.updAura = (x, z, hs, T, combo, pulse) => {
      g.position.set(x, 0, z);
      const tier =
        combo >= 100
          ? 1
          : combo >= 50
            ? 0.8
            : combo >= 25
              ? 0.55
              : combo >= 10
                ? 0.3
                : 0;
      cm.uniforms.uT.value = T;
      cm.uniforms.uA.value += (tier * 0.7 - cm.uniforms.uA.value) * 0.1;
      cyl.visible = cm.uniforms.uA.value > 0.01;
      const s = 1 + pulse * 0.08;
      cyl.scale.set(s, 1, s);
      V.groundGlow.material.opacity = 0.4 + 0.25 * pulse + 0.3 * tier;
      V.groundGlow.scale.setScalar(1 + tier * 0.4);
      V.marker.position.y = hs * 1.72 + 0.55 + Math.sin(T * 3) * 0.08;
      V.marker.rotation.y = T * 2;
      V.tag.position.y = hs * 1.72 + 0.95;
    };
  }
  /* --- convenience emitters --- */
  V.sparkBurst = (x, y, z, n, hex, sp) => {
    sp = sp || 3;
    for (let k = 0; k < n; k++) {
      const a = rnd(0, TAU),
        u = rnd(0.3, 1);
      V.sparks.spawn(
        x,
        y,
        z,
        Math.cos(a) * sp * u,
        rnd(1, sp * 1.6),
        Math.sin(a) * sp * u,
        rnd(0.5, 1.1),
        rnd(2, 4),
        hex,
        5,
      );
    }
  };
  V.dust = (x, z, n) => {
    for (let k = 0; k < n; k++) {
      const a = rnd(0, TAU);
      V.sparks.spawn(
        x + Math.cos(a) * 0.2,
        0.1,
        z + Math.sin(a) * 0.2,
        Math.cos(a) * 0.6,
        rnd(0.2, 0.7),
        Math.sin(a) * 0.6,
        rnd(0.4, 0.8),
        rnd(3, 5),
        0xb89a6a,
        -0.4,
      );
    }
  };
  V.petalBurst = (x, y, z, n, sp) => {
    sp = sp || 3;
    for (let k = 0; k < n; k++) {
      const a = rnd(0, TAU),
        u = rnd(0.4, 1);
      V.flakes.spawn(
        x,
        y,
        z,
        Math.cos(a) * sp * u,
        rnd(2, 5),
        Math.sin(a) * sp * u,
        rnd(2.5, 4),
        pick(PET),
        true,
      );
    }
  };
  V.confetti = (x, y, z, n, sp) => {
    sp = sp || 5;
    for (let k = 0; k < n; k++) {
      const a = rnd(0, TAU),
        u = rnd(0.3, 1);
      V.flakes.spawn(
        x,
        y,
        z,
        Math.cos(a) * sp * u,
        rnd(4, 9),
        Math.sin(a) * sp * u,
        rnd(2.2, 3.6),
        pick(CONF),
        false,
      );
    }
  };
  V.rain = (cx, cz, rad, n, petal) => {
    for (let k = 0; k < n; k++) {
      const a = rnd(0, TAU),
        r = Math.sqrt(Math.random()) * rad;
      V.flakes.spawn(
        cx + Math.cos(a) * r,
        rnd(9, 16),
        cz + Math.sin(a) * r,
        rnd(-0.5, 0.5),
        rnd(-1, 0),
        rnd(-0.5, 0.5),
        rnd(5, 8),
        petal ? pick(PET) : pick(CONF),
        petal,
      );
    }
  };
  V.update = (dt, T) => {
    V.sparks.update(dt);
    V.flakes.update(dt, T);
    V.rings.update(dt);
  };
  return V;
}
