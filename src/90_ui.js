/*Copyright (c) 2026 MANTHAN VINZUDA

All rights reserved.

This source code is provided for viewing purposes only.
You may not copy, modify, distribute, sublicense, or use
this code or substantial portions of it without permission.*/

/* ============================ 12. UI – React menu, HUD, results, settings ============================ */
const CAMS = ["🎥 Follow", "🎬 Cinema", "🛰️ Aerial", "🤳 Selfie", "🏛️ Stage"];
function Rangoli() {
  const rings = [];
  for (let r = 0; r < 5; r++) {
    const n = 10 + r * 4,
      R = 470 - r * 80;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * 360;
      rings.push(
        h("ellipse", {
          key: r + "-" + k,
          cx: R * 0.8,
          cy: 0,
          rx: R * 0.16,
          ry: R * 0.07,
          transform: `rotate(${a})`,
          fill: ["#ffc94a", "#ff6f00", "#e91e63", "#ffe29a", "#ff8f00"][r],
        }),
      );
    }
  }
  return h(
    "svg",
    { className: "rng", viewBox: "-500 -500 1000 1000" },
    h("g", null, rings),
  );
}
function Diyas() {
  const a = [];
  for (let i = 0; i < 16; i++)
    a.push(
      h("div", {
        key: i,
        className: "diya",
        style: {
          left: 3 + i * 6.2 + "%",
          animationDelay: (i % 5) * 0.13 + "s",
          transform: "scale(" + (0.8 + (i % 3) * 0.2) + ")",
        },
      }),
    );
  return h("div", { className: "diyas" }, a);
}
const Sw = ({ c, sel, lock, lvl, on }) =>
  h(
    "div",
    {
      className: "sw" + (sel ? " sel" : "") + (lock ? " lock" : ""),
      onClick: on,
      title: c.n + (lock ? " – unlocks at level " + lvl : ""),
    },
    [c.c1, c.c2, c.c3].map((x, i) =>
      h("i", {
        key: i,
        style: { background: "#" + x.toString(16).padStart(6, "0") },
      }),
    ),
    lock && h("em", null, "🔒 " + lvl),
  );
function Settings({ save, onClose, onApply, q, setQ }) {
  const S = save.set,
    [, f] = useState(0),
    up = (p) => {
      Object.assign(S, p);
      writeSave(save);
      f((x) => x + 1);
      onApply && onApply();
    };
  return h(
    "div",
    { className: "ov", onPointerDown: (e) => e.stopPropagation() },
    h(
      "div",
      { className: "panel modal" },
      h("h3", null, "Settings", h("span", null, "સેટિંગ્સ")),
      h(
        "div",
        { className: "stat" },
        "Music",
        h("input", {
          type: "range",
          min: 0,
          max: 1,
          step: 0.05,
          value: S.music,
          style: { width: "55%" },
          onChange: (e) => up({ music: +e.target.value }),
        }),
      ),
      h(
        "div",
        { className: "stat" },
        "Sound effects",
        h("input", {
          type: "range",
          min: 0,
          max: 1,
          step: 0.05,
          value: S.sfx,
          style: { width: "55%" },
          onChange: (e) => up({ sfx: +e.target.value }),
        }),
      ),
      h(
        "div",
        { className: "stat" },
        "Haptic feedback",
        h("input", {
          type: "checkbox",
          checked: S.haptics,
          onChange: (e) => up({ haptics: e.target.checked }),
        }),
      ),
      h(
        "div",
        { className: "stat" },
        "Smart adaptive quality",
        h("input", {
          type: "checkbox",
          checked: S.auto,
          onChange: (e) => up({ auto: e.target.checked }),
        }),
      ),
      h(
        "div",
        { className: "stat" },
        "Show FPS",
        h("input", {
          type: "checkbox",
          checked: S.fps,
          onChange: (e) => up({ fps: e.target.checked }),
        }),
      ),
      h(
        "div",
        { style: { margin: "10px 0 4px", fontSize: 13, opacity: 0.8 } },
        "Graphics quality (applies on next start)",
      ),
      h(
        "div",
        { className: "row" },
        QUALITY.map((x, k) =>
          h(
            "button",
            {
              key: k,
              className: "btn sm" + (q == k ? " sel" : ""),
              onClick: () => {
                setQ(k);
                up({ q: k });
              },
            },
            x.name,
          ),
        ),
      ),
      h(
        "div",
        { style: { textAlign: "right", marginTop: 12 } },
        h("button", { className: "btn", onClick: onClose }, "Done"),
      ),
    ),
  );
}
function App() {
  const sv = useRef(null);
  if (!sv.current) sv.current = loadSave();
  const save = sv.current,
    [, setTick] = useState(0),
    force = () => setTick((t) => t + 1),
    commit = () => {
      writeSave(save);
      force();
    };
  const [scr, setScr] = useState("menu"),
    [cfg, setCfg] = useState(null),
    [res, setRes] = useState(null),
    [loading, setLoading] = useState(false),
    [err, setErr] = useState(null),
    [runId, setRunId] = useState(0);
  const [gm, setGm] = useState("rhythm"),
    [mode, setMode] = useState("garba"),
    [night, setNight] = useState(0),
    [female, setFemale] = useState(true),
    [showSet, setShowSet] = useState(false),
    [showHow, setShowHow] = useState(false);
  const [q, setQ] = useState(() =>
    save.set.q >= 0
      ? save.set.q
      : innerWidth < 800 || /Android|iPhone|iPad/i.test(navigator.userAgent)
        ? 1
        : (navigator.hardwareConcurrency || 4) >= 8
          ? 3
          : 2,
  );
  const [hud, setHud] = useState({
      score: 0,
      combo: 0,
      meter: 0,
      msg: "",
      inRing: false,
      phase: "intro",
    }),
    [paused, setPaused] = useState(false),
    [muted, setMuted] = useState(false),
    [ci, setCi] = useState(0);
  const camR = useRef(0),
    mount = useRef(),
    pausedR = useRef(false),
    mutedR = useRef(false),
    joy = useRef({ x: 0, y: 0 }),
    ring = useRef(),
    dot = useRef(),
    knob = useRef(),
    lane = useRef(),
    flash = useRef(),
    fps = useRef(),
    api = useRef({}),
    acR = useRef(null),
    uiA = useRef(null);
  const touch = matchMedia("(pointer:coarse)").matches,
    lvl = levelOf(save.xp),
    g = female ? "f" : "m";
  const initAudio = () => {
    try {
      if (!acR.current)
        acR.current = new (window.AudioContext || window.webkitAudioContext)();
      if (acR.current.state != "running") acR.current.resume();
      if (!uiA.current) {
        uiA.current = createAudio(acR.current);
        uiA.current.setVol(save.set.music, save.set.sfx, false);
      }
    } catch (e) {}
  };
  const sfx = (k) => {
    const a = uiA.current;
    if (a && a.ui && a.ui[k])
      try {
        a.ui[k]();
      } catch (e) {}
  };
  const cycleCam = () => {
    camR.current = (camR.current + 1) % CAMS.length;
    setCi(camR.current);
  };
  const togglePause = () => {
      const p = !pausedR.current;
      pausedR.current = p;
      setPaused(p);
    },
    toggleMute = () => {
      mutedR.current = !mutedR.current;
      setMuted(mutedR.current);
      api.current.applySettings && api.current.applySettings();
    };
  useEffect(() => {
    if (scr !== "play" || !cfg) return;
    let gm_ = null,
      dead = false;
    setLoading(true);
    setErr(null);
    setHud({
      score: 0,
      combo: 0,
      meter: 0,
      msg: "",
      inRing: false,
      phase: "intro",
    });
    pausedR.current = false;
    setPaused(false);
    camR.current = 0;
    setCi(0);
    const t = setTimeout(() => {
      try {
        gm_ = createGame(mount.current, {
          q: cfg.q,
          gm: cfg.gm,
          mode: cfg.mode,
          night: cfg.night,
          female: cfg.female,
          save,
          set: save.set,
          ac: acR.current,
          cam: camR,
          cycleCam,
          hud: setHud,
          paused: pausedR,
          muted: mutedR,
          joy,
          ring,
          dot,
          lane,
          flash,
          fps,
          vib: null,
          onEnd: (r) => {
            if (!dead) finishRun(r);
          },
          onPauseKey: togglePause,
          onMuteKey: toggleMute,
          onHidden: () => {
            pausedR.current = true;
            setPaused(true);
          },
          onAdapt: () => {},
        });
        api.current = gm_;
      } catch (e) {
        console.error(e);
        setErr(String((e && e.stack) || e));
      }
      setLoading(false);
    }, 90);
    return () => {
      dead = true;
      clearTimeout(t);
      if (gm_)
        try {
          gm_.dispose();
        } catch (e) {
          console.error(e);
        }
      api.current = {};
    };
  }, [scr, runId]);
  const start = (over) => {
    initAudio();
    sfx("start");
    setRes(null);
    setCfg(Object.assign({ q, gm, mode, night, female }, over || {}));
    setRunId((r) => r + 1);
    setScr("play");
  };
  function finishRun(r) {
    const lv0 = levelOf(save.xp),
      key = r.gm + (r.gm == "festival" ? r.night : ""),
      xp = Math.round(r.score / 14 + r.perfect * 2 + r.stars * 40 + r.maxCombo);
    save.xp += xp;
    save.games++;
    save.perfects += r.perfect;
    save.hits += r.perfect + r.great + r.good;
    save.notes += r.notes;
    const nb = r.score > (save.best[key] || 0);
    if (nb) save.best[key] = r.score;
    if (r.maxCombo > save.bestCombo) save.bestCombo = r.maxCombo;
    if (r.gm == "high") {
      save.board.push({ s: r.score, d: new Date().toLocaleDateString() });
      save.board.sort((a, b) => b.s - a.s);
      save.board = save.board.slice(0, 5);
    }
    if (r.gm == "festival" && r.stars >= 1) {
      save.stars[r.night] = Math.max(save.stars[r.night] || 0, r.stars);
      save.nights = Math.max(save.nights, Math.min(9, r.night + 2));
    }
    const lv1 = levelOf(save.xp),
      un = [];
    ["f", "m"].forEach((k) => {
      COSTUMES[k].forEach((c) => {
        if (c.lvl > lv0 && c.lvl <= lv1)
          un.push((k == "f" ? "Chaniya Choli: " : "Kediyu: ") + c.n);
      });
      CHARS[k].forEach((c) => {
        if (c.lvl > lv0 && c.lvl <= lv1) un.push("Dancer: " + c.n);
      });
    });
    writeSave(save);
    setRes(Object.assign({}, r, { xp, lv0, lv1, un, nb }));
    force();
    if (lv1 > lv0) sfx("level");
  }
  const jv = (e) => {
    const b = e.currentTarget.getBoundingClientRect(),
      dx = e.clientX - b.left - b.width / 2,
      dy = e.clientY - b.top - b.height / 2,
      m = Math.min(1, Math.hypot(dx, dy) / (b.width / 2)),
      a = Math.atan2(dy, dx);
    joy.current.x = Math.cos(a) * m;
    joy.current.y = Math.sin(a) * m;
    knob.current.style.transform = `translate(${joy.current.x * 40}px,${joy.current.y * 40}px)`;
  };
  const jend = () => {
    joy.current.x = joy.current.y = 0;
    if (knob.current) knob.current.style.transform = "";
  };
  /* ================= MENU ================= */
  if (scr === "menu") {
    const key = gm + (gm == "festival" ? night : ""),
      M = MODES[gm],
      cl = COSTUMES[g],
      ch = CHARS[g],
      acc = save.notes ? Math.round((save.hits / save.notes) * 100) : 0,
      lp = (xp) =>
        Math.round(((xp - xpFor(lvl)) / (xpFor(lvl + 1) - xpFor(lvl))) * 100);
    const pick_ = (fn) => () => {
      sfx("click");
      fn();
    };
    return h(
      "div",
      { className: "menu", onPointerDown: initAudio },
      h("div", { className: "toran" }),
      h(Rangoli),
      h(Diyas),
      h(
        "div",
        { className: "wrap" },
        h(
          "div",
          { className: "title" },
          h("div", { className: "gu" }, GU.title),
          h("div", { className: "en" }, "Navratri Garba"),
        ),
        h(
          "div",
          {
            style: {
              textAlign: "center",
              fontFamily: GU.font,
              color: "#ffe29a",
              opacity: 0.9,
              marginBottom: 4,
            },
          },
          GU.welcome + " · " + GU.nav,
        ),
        h(
          "div",
          { className: "grid" },
          h(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 14 } },
            h(
              "div",
              { className: "panel" },
              h("h3", null, "Game Mode", h("span", null, "ગેમ મોડ")),
              h(
                "div",
                { className: "row" },
                Object.keys(MODES).map((k) =>
                  h(
                    "button",
                    {
                      key: k,
                      className: "card" + (gm == k ? " sel" : ""),
                      onClick: pick_(() => setGm(k)),
                      onPointerEnter: () => sfx("hover"),
                    },
                    h("b", null, MODES[k].n),
                    h("span", { className: "gu" }, MODES[k].gu),
                  ),
                ),
              ),
              h(
                "div",
                { style: { fontSize: 13, opacity: 0.85, marginTop: 10 } },
                M.d,
              ),
            ),
            gm == "festival" &&
              h(
                "div",
                { className: "panel" },
                h(
                  "h3",
                  null,
                  "Nine Nights of Navratri",
                  h("span", null, "નવ રાત્રિ"),
                ),
                h(
                  "div",
                  { className: "row" },
                  NIGHTS.map((n, i) =>
                    h(
                      "button",
                      {
                        key: i,
                        className:
                          "night" +
                          (night == i ? " sel" : "") +
                          (i >= save.nights ? " lock" : ""),
                        disabled: false,
                        onClick: () => {
                          if (i < save.nights) {
                            sfx("click");
                            setNight(i);
                          }
                        },
                      },
                      h("div", {
                        className: "dot",
                        style: {
                          background: "#" + n.c.toString(16).padStart(6, "0"),
                        },
                      }),
                      h("b", null, i + 1 + ". " + n.n),
                      h("span", null, n.gu),
                      h(
                        "div",
                        { style: { fontSize: 12, marginTop: 2 } },
                        i >= save.nights
                          ? "🔒"
                          : "★".repeat(save.stars[i] || 0) +
                              "☆".repeat(3 - (save.stars[i] || 0)),
                      ),
                    ),
                  ),
                ),
              ),
            h(
              "div",
              { className: "panel" },
              h("h3", null, "Dance Style", h("span", null, "નૃત્ય શૈલી")),
              h(
                "div",
                { className: "row" },
                Object.keys(COMPANION).map((k) =>
                  h(
                    "button",
                    {
                      key: k,
                      className: "card" + (mode == k ? " sel" : ""),
                      onClick: pick_(() => setMode(k)),
                    },
                    h("b", null, COMPANION[k].i + " " + COMPANION[k].n),
                    h("span", { className: "gu" }, COMPANION[k].gu),
                    h(
                      "small",
                      null,
                      k == "garba"
                        ? "Join the ring of dancers"
                        : k == "couple"
                          ? "Dance with a partner · x1.5 score"
                          : "Four friends join you · x1.3 score",
                    ),
                  ),
                ),
              ),
            ),
            h(
              "div",
              { className: "panel" },
              h("h3", null, "Your Dancer", h("span", null, "તમારો નૃત્યકાર")),
              h(
                "div",
                { className: "row", style: { marginBottom: 8 } },
                h(
                  "button",
                  {
                    className: "card" + (female ? " sel" : ""),
                    onClick: pick_(() => setFemale(true)),
                  },
                  h("b", null, "👩 Female"),
                  h("small", null, "Chaniya Choli, Dupatta & jewellery"),
                ),
                h(
                  "button",
                  {
                    className: "card" + (!female ? " sel" : ""),
                    onClick: pick_(() => setFemale(false)),
                  },
                  h("b", null, "👨 Male"),
                  h("small", null, "Kediyu, Chorno & Pagdi"),
                ),
              ),
              h(
                "div",
                { className: "row" },
                ch.map((c, i) => {
                  const lock = c.lvl > lvl;
                  return h(
                    "button",
                    {
                      key: i,
                      className:
                        "card" +
                        (save.char[g] == i ? " sel" : "") +
                        (lock ? " lock" : ""),
                      onClick: () => {
                        if (!lock) {
                          sfx("click");
                          save.char[g] = i;
                          commit();
                        }
                      },
                    },
                    h("b", null, c.n),
                    h(
                      "small",
                      null,
                      (g == "f"
                        ? [
                            "Long braid (choti)",
                            "Bun with gajra",
                            "Flowing ponytail",
                          ]
                        : [
                            "Feta turban & moustache",
                            "Short hair",
                            "Topi cap & moustache",
                          ])[c.hs],
                    ),
                    lock && h("span", { className: "lk" }, "🔒 Lv " + c.lvl),
                  );
                }),
              ),
              h(
                "div",
                { style: { marginTop: 8, fontSize: 12, opacity: 0.8 } },
                "Costume: " + cl[save.costume[g]].n,
              ),
              h(
                "div",
                null,
                cl.map((c, i) =>
                  h(Sw, {
                    key: i,
                    c,
                    sel: save.costume[g] == i,
                    lock: c.lvl > lvl,
                    lvl: c.lvl,
                    on: () => {
                      if (c.lvl <= lvl) {
                        sfx("click");
                        save.costume[g] = i;
                        commit();
                      }
                    },
                  }),
                ),
              ),
            ),
            h(
              "div",
              { className: "panel" },
              h("h3", null, "Graphics", h("span", null, "ગ્રાફિક્સ")),
              h(
                "div",
                { className: "row" },
                QUALITY.map((x, k) =>
                  h(
                    "button",
                    {
                      key: k,
                      className: "btn sm" + (q == k ? " sel" : ""),
                      onClick: pick_(() => {
                        setQ(k);
                        save.set.q = k;
                        commit();
                      }),
                    },
                    x.name,
                  ),
                ),
                h(
                  "button",
                  {
                    className: "btn sm",
                    onClick: pick_(() => setShowSet(true)),
                  },
                  "⚙ Settings",
                ),
              ),
            ),
          ),
          h(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 14 } },
            h(
              "div",
              { className: "panel", style: { textAlign: "center" } },
              h(
                "button",
                { className: "btn big", onClick: () => start() },
                "▶  Play · ગરબા રમીએ",
              ),
              h(
                "div",
                { style: { fontSize: 12, opacity: 0.75, marginTop: 6 } },
                M.n +
                  (gm == "festival"
                    ? " · Night " + (night + 1) + " " + NIGHTS[night].n
                    : "") +
                  " · " +
                  COMPANION[mode].n,
              ),
            ),
            h(
              "div",
              { className: "panel" },
              h("h3", null, "Profile", h("span", null, "પ્રોફાઇલ")),
              h(
                "div",
                { style: { display: "flex", alignItems: "baseline", gap: 10 } },
                h("span", { className: "big-n" }, "Level " + lvl),
                h(
                  "span",
                  { style: { fontSize: 12, opacity: 0.7 } },
                  save.xp + " XP",
                ),
              ),
              h(
                "div",
                { className: "bar", style: { margin: "6px 0 10px" } },
                h("div", { style: { width: lp(save.xp) + "%" } }),
              ),
              h(
                "div",
                { className: "stat" },
                "Best score (" + M.n + ")",
                h("b", null, (save.best[key] || 0).toLocaleString()),
              ),
              h(
                "div",
                { className: "stat" },
                "Best combo",
                h("b", null, save.bestCombo),
              ),
              h(
                "div",
                { className: "stat" },
                "Lifetime accuracy",
                h("b", null, acc + "%"),
              ),
              h(
                "div",
                { className: "stat" },
                "Perfect hits",
                h("b", null, save.perfects),
              ),
              h(
                "div",
                { className: "stat" },
                "Games played",
                h("b", null, save.games),
              ),
              h(
                "div",
                { style: { fontSize: 11.5, opacity: 0.7, marginTop: 8 } },
                "Level up to unlock new costumes and dancers. Complete Festival nights with ★ to open the next night.",
              ),
            ),
            gm == "high" &&
              h(
                "div",
                { className: "panel" },
                h("h3", null, "Leaderboard", h("span", null, "લીડરબોર્ડ")),
                save.board.length
                  ? save.board.map((b, i) =>
                      h(
                        "div",
                        { className: "stat", key: i },
                        i + 1 + ". " + b.d,
                        h("b", null, b.s.toLocaleString()),
                      ),
                    )
                  : h(
                      "div",
                      { style: { fontSize: 13, opacity: 0.7 } },
                      "No scores yet – be the first!",
                    ),
              ),
            h(
              "div",
              { className: "panel" },
              h(
                "h3",
                {
                  onClick: () => setShowHow(!showHow),
                  style: { cursor: "pointer" },
                },
                "How to play ",
                showHow ? "▾" : "▸",
              ),
              showHow &&
                h(
                  "div",
                  { style: { fontSize: 12.5, lineHeight: 1.55, opacity: 0.9 } },
                  "Clap on the golden beats shown in the beat lane (C / Space / CLAP button). Rest on steps and twirl on ↻. Pattern changes: Teen Taali (3 claps), Be Taali (2 claps) and Dandiya Raas (quick claps with sticks). Hit Perfect/Great/Good to build combo – 10, 25, 50 and 100 trigger celebrations. Move with WASD / arrows or the joystick; stand on a glowing ring to circle with the dancers. Drag to orbit, wheel to zoom, V cycles cameras, P pauses.",
                ),
              !showHow &&
                h(
                  "div",
                  { style: { fontSize: 12.5, opacity: 0.8 } },
                  "WASD move · drag orbit · V camera · C / Space clap · P pause",
                ),
            ),
          ),
        ),
        h(
          "div",
          {
            style: {
              textAlign: "center",
              marginTop: 18,
              fontSize: 11,
              opacity: 0.5,
            },
          },
          "Jai Maa Ambe · Navratri Mahotsav",
        ),
        h("div", { style: { height: 70 } }),
      ),
      showSet &&
        h(Settings, { save, q, setQ, onClose: () => setShowSet(false) }),
    );
  }
  /* ================= PLAY ================= */
  const bx = {
      top: "calc(var(--sai-t) + 10px)",
      left: "calc(var(--sai-l) + 10px)",
    },
    timeTxt = hud.timed
      ? Math.floor(hud.time / 60) +
        ":" +
        String(Math.floor(hud.time % 60)).padStart(2, "0")
      : "",
    pr = hud.phase === "intro";
  return h(
    "div",
    null,
    h("div", { ref: mount, id: "c" }),
    h("div", {
      ref: flash,
      className: "hud",
      style: { inset: 0, background: "#fff", opacity: 0, zIndex: 3 },
    }),
    h(
      "div",
      { className: "hud", style: Object.assign({}, bx, { zIndex: 4 }) },
      h(
        "div",
        { className: "hud-card" },
        h(
          "b",
          { style: { fontSize: 22 } },
          "Score " + (hud.score || 0).toLocaleString(),
        ),
        h(
          "div",
          {
            className: "big-n",
            style: {
              fontSize: hud.combo >= 10 ? 26 : 18,
              transition: "font-size .1s",
            },
          },
          "Combo x" + (hud.combo || 0),
        ),
        h(
          "div",
          { style: { fontSize: 12, opacity: 0.85 } },
          (hud.acc !== undefined ? "Accuracy " + hud.acc + "%  ·  " : "") +
            (hud.tag || ""),
        ),
        hud.maxLives > 0 &&
          h(
            "div",
            { style: { fontSize: 18, letterSpacing: 2 } },
            Array.from({ length: hud.maxLives }, (_, i) =>
              i < hud.lives ? "🪔" : "·",
            ).join(" "),
          ),
      ),
    ),
    h(
      "div",
      {
        className: "hud hud-mid",
        style: {
          top: "calc(var(--sai-t) + 10px)",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 4,
        },
      },
      h(
        "div",
        { className: "hud-card", style: { padding: "4px 12px", fontSize: 12 } },
        hud.timed &&
          h(
            "span",
            { className: "pill", style: { fontSize: 15, fontWeight: 700 } },
            "⏱ " + timeTxt,
          ),
        h("span", { className: "pill" }, "♪ " + (hud.bpm || "") + " BPM"),
        h(
          "div",
          { style: { marginTop: 2 } },
          h("b", null, hud.pat || ""),
          h(
            "span",
            { style: { fontFamily: GU.font, marginLeft: 6, color: "#ffe29a" } },
            hud.patGu || "",
          ),
        ),
      ),
    ),
    h(
      "div",
      {
        className: "hud",
        style: {
          top: "calc(var(--sai-t) + 6px)",
          right: "calc(var(--sai-r) + 6px)",
          pointerEvents: "auto",
          zIndex: 5,
          textAlign: "right",
          maxWidth: "46vw",
        },
      },
      h(
        "button",
        { className: "btn sm", onClick: togglePause },
        paused ? "▶" : "⏸",
      ),
      h(
        "button",
        { className: "btn sm", onClick: toggleMute },
        muted ? "🔇" : "🔊",
      ),
      h("button", { className: "btn sm", onClick: cycleCam }, CAMS[ci]),
      h(
        "button",
        { className: "btn sm", onClick: () => setScr("menu") },
        "Menu",
      ),
    ),
    save.set.fps &&
      h("div", {
        ref: fps,
        className: "hud",
        style: {
          bottom: "calc(var(--sai-b) + 4px)",
          left: "calc(var(--sai-l) + 6px)",
          fontSize: 11,
          opacity: 0.7,
          zIndex: 4,
        },
      }),
    hud.msg &&
      h(
        "div",
        { key: hud.msgId, className: "msg " + (hud.msgK || "") },
        hud.msg,
      ),
    hud.banner &&
      h("div", { key: "b" + hud.bannerId, className: "banner" }, hud.banner),
    hud.cd > 0 && h("div", { key: "cd" + hud.cd, className: "cd" }, hud.cd),
    pr &&
      !loading &&
      h(
        "div",
        {
          className: "hud",
          style: {
            left: 0,
            right: 0,
            bottom: "18%",
            textAlign: "center",
            zIndex: 4,
            animation: "pop 6s both",
          },
        },
        h(
          "div",
          { className: "title" },
          h(
            "div",
            { className: "gu", style: { fontSize: "clamp(30px,7vw,64px)" } },
            GU.title,
          ),
          h(
            "div",
            { style: { fontSize: 13, opacity: 0.85, letterSpacing: ".2em" } },
            "NAVRATRI GARBA · TAP OR PRESS SPACE TO SKIP",
          ),
        ),
      ),
    h(
      "div",
      {
        className: "hud",
        style: {
          bottom: "calc(var(--sai-b) + 128px)",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 4,
        },
      },
      h(
        "div",
        { ref: lane, className: "lane" },
        [0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
          h("span", { key: i, className: "ld step" }),
        ),
      ),
    ),
    h(
      "div",
      {
        className: "hud",
        style: {
          bottom: "calc(var(--sai-b) + 30px)",
          left: "50%",
          width: 90,
          height: 90,
          marginLeft: -45,
          zIndex: 4,
        },
      },
      h("div", {
        ref: ring,
        style: {
          position: "absolute",
          inset: 20,
          border: "3px solid #ffd54f",
          borderRadius: "50%",
        },
      }),
      h("div", {
        ref: dot,
        style: {
          position: "absolute",
          inset: 20,
          border: "3px solid #fff",
          borderRadius: "50%",
          background: "rgba(255,64,129,.5)",
        },
      }),
    ),
    h(
      "div",
      {
        className: "hud",
        style: {
          bottom: "calc(var(--sai-b) + 12px)",
          left: "50%",
          width: "min(240px,40vw)",
          marginLeft: "calc(min(240px,40vw)/-2)",
          zIndex: 4,
        },
      },
      h(
        "div",
        { className: "bar" },
        h("div", {
          style: {
            width: (hud.meter || 0) + "%",
            background: hud.fever
              ? "linear-gradient(90deg,#ffd54f,#ff4081,#fff)"
              : undefined,
          },
        }),
      ),
    ),
    h(
      "div",
      {
        className: "hud",
        style: {
          bottom: "calc(var(--sai-b) + 1px)",
          width: "100%",
          textAlign: "center",
          fontSize: 10,
          opacity: 0.8,
          zIndex: 4,
        },
      },
      hud.fever ? "GARBA FEVER x2" : "Garba Meter",
    ),
    h(
      "div",
      {
        className: "hud",
        style: {
          bottom: "calc(var(--sai-b) + 26px)",
          right: "calc(var(--sai-r) + 18px)",
          pointerEvents: "auto",
          zIndex: 5,
        },
      },
      h(
        "button",
        {
          className: "clapbtn",
          onPointerDown: (e) => {
            e.preventDefault();
            api.current.clap && api.current.clap();
          },
        },
        "CLAP",
      ),
    ),
    touch &&
      h(
        "div",
        {
          className: "hud joy",
          style: {
            bottom: "calc(var(--sai-b) + 26px)",
            left: "calc(var(--sai-l) + 18px)",
            width: 110,
            height: 110,
            zIndex: 5,
          },
          onPointerDown: (e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            jv(e);
          },
          onPointerMove: (e) => {
            if (e.buttons) jv(e);
          },
          onPointerUp: jend,
          onPointerCancel: jend,
        },
        h("div", {
          ref: knob,
          style: {
            position: "absolute",
            left: 35,
            top: 35,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,213,79,.85)",
            boxShadow: "0 0 14px rgba(255,201,74,.7)",
          },
        }),
      ),
    paused &&
      !showSet &&
      h(
        "div",
        { className: "ov" },
        h(
          "div",
          { className: "panel modal", style: { textAlign: "center" } },
          h("div", { className: "grade", style: { fontSize: 40 } }, "Paused"),
          h(
            "div",
            { style: { marginTop: 10 } },
            h(
              "button",
              {
                className: "btn big",
                onClick: () => {
                  sfx("click");
                  togglePause();
                },
              },
              "Resume",
            ),
          ),
          h(
            "div",
            null,
            h(
              "button",
              { className: "btn", onClick: () => setShowSet(true) },
              "⚙ Settings",
            ),
            h(
              "button",
              {
                className: "btn",
                onClick: () => {
                  setRunId((r) => r + 1);
                  setRes(null);
                },
              },
              "↻ Restart",
            ),
            h(
              "button",
              { className: "btn", onClick: () => setScr("menu") },
              "Menu",
            ),
          ),
        ),
      ),
    showSet &&
      h(Settings, {
        save,
        q,
        setQ,
        onClose: () => setShowSet(false),
        onApply: () => api.current.applySettings && api.current.applySettings(),
      }),
    res &&
      h(
        "div",
        { className: "ov" },
        h(
          "div",
          { className: "panel modal", style: { textAlign: "center" } },
          h(
            "h3",
            null,
            res.why == "fail"
              ? "The blessings have run out"
              : res.gm == "festival"
                ? "Night " + (res.night + 1) + " · " + NIGHTS[res.night].n
                : "Results",
            h("span", null, "પરિણામ"),
          ),
          h("div", { className: "grade" }, res.grade),
          h(
            "div",
            null,
            [0, 1, 2].map((i) =>
              h(
                "span",
                { key: i, className: "star" + (i < res.stars ? " on" : "") },
                "★",
              ),
            ),
          ),
          h(
            "div",
            { className: "big-n", style: { margin: "8px 0" } },
            res.score.toLocaleString() + (res.nb ? "  🏆 New best!" : ""),
          ),
          h(
            "div",
            { style: { textAlign: "left" } },
            h(
              "div",
              { className: "stat" },
              "Accuracy",
              h("b", null, res.acc.toFixed(1) + "%"),
            ),
            h(
              "div",
              { className: "stat" },
              "Perfect / Great / Good",
              h("b", null, res.perfect + " / " + res.great + " / " + res.good),
            ),
            h("div", { className: "stat" }, "Misses", h("b", null, res.miss)),
            h(
              "div",
              { className: "stat" },
              "Best combo",
              h("b", null, res.maxCombo),
            ),
            h(
              "div",
              { className: "stat" },
              "XP earned",
              h("b", null, "+" + res.xp),
            ),
          ),
          res.lv1 > res.lv0 &&
            h(
              "div",
              {
                style: { margin: "10px 0", color: "#ffe29a", fontWeight: 700 },
              },
              "🎉 Level " + res.lv1 + "!",
              res.un.map((u, i) =>
                h(
                  "div",
                  { key: i, style: { fontSize: 12, fontWeight: 400 } },
                  "Unlocked – " + u,
                ),
              ),
            ),
          res.gm == "festival" &&
            res.stars >= 1 &&
            res.night < 8 &&
            h(
              "div",
              { style: { fontSize: 12, margin: "6px 0", color: "#b9f6ca" } },
              "Night " + (res.night + 2) + " unlocked!",
            ),
          h(
            "div",
            { style: { marginTop: 8 } },
            res.gm == "festival" &&
              res.stars >= 1 &&
              res.night < 8 &&
              h(
                "button",
                {
                  className: "btn big",
                  onClick: () => {
                    setNight(res.night + 1);
                    setCfg((c) =>
                      Object.assign({}, c, { night: res.night + 1 }),
                    );
                    setRes(null);
                    setRunId((r) => r + 1);
                  },
                },
                "Next Night ▶",
              ),
            h(
              "button",
              {
                className:
                  "btn" +
                  (res.gm == "festival" && res.stars >= 1 && res.night < 8
                    ? ""
                    : " big"),
                onClick: () => {
                  setRes(null);
                  setRunId((r) => r + 1);
                },
              },
              "Play Again",
            ),
            h(
              "button",
              { className: "btn", onClick: () => setScr("menu") },
              "Menu",
            ),
          ),
        ),
      ),
    loading &&
      h(
        "div",
        { className: "loading" },
        h("div", { className: "spin" }),
        h(
          "div",
          { style: { fontFamily: GU.font, fontSize: 22, color: "#ffe29a" } },
          GU.welcome,
        ),
        h(
          "div",
          { style: { opacity: 0.8, fontSize: 13 } },
          "Preparing the Garba ground…",
        ),
      ),
    err &&
      h(
        "div",
        { className: "ov", style: { zIndex: 40 } },
        h(
          "div",
          { className: "panel modal" },
          h("h3", null, "Something went wrong"),
          h(
            "pre",
            {
              style: {
                whiteSpace: "pre-wrap",
                fontSize: 11,
                maxHeight: "40vh",
                overflow: "auto",
                userSelect: "text",
              },
            },
            err,
          ),
          h(
            "button",
            {
              className: "btn",
              onClick: () => {
                setErr(null);
                setScr("menu");
              },
            },
            "Back to menu",
          ),
        ),
      ),
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(h(App));
