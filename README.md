# 🪔 Navratri Garba — Jai Maa Momai

### An immersive Gujarati Navratri Garba rhythm game built with Three.js + React

**Navratri Garba — Jai Maa Momai** is a browser-based 3D Garba experience inspired by the energy, colors, music, traditions, and spirit of Gujarati Navratri.

Dance, clap to the rhythm, build combos, unlock traditional characters and costumes, progress through the nine Navratri nights, and experience a living festival environment directly in your browser.

> **જય માં મોમાઈ 🙏**

---

## ✨ Features

### 💃 Garba Gameplay

- Interactive 3D Garba experience
- Rhythm-based clapping system
- Be Taali and Teen Taali patterns
- Smooth character animation
- Player movement and turning
- Multiple Garba companions
- Crowd dancers with varied animation timing
- Combo and score system
- Perfect / Great / Good / Miss timing feedback

### 🥁 Rhythm System

The game uses beat-synchronized gameplay to make every clap feel connected to the music.

| Result | Timing |
|---|---:|
| 🟡 Perfect | ~60 ms |
| 🟢 Great | ~110 ms |
| 🔵 Good | ~160 ms |
| 🔴 Miss | Outside timing window |

Successful rhythm hits can trigger:

- Score increases
- Combo progression
- Visual effects
- Crowd reactions
- Beat feedback
- Celebration effects

---

## 🌙 Nine Nights of Navratri

Progress through all nine traditional Navratri nights.

| Night | Devi |
|---|---|
| 1 | 🌸 Shailputri |
| 2 | 🔥 Brahmacharini |
| 3 | 🌙 Chandraghanta |
| 4 | 🌺 Kushmanda |
| 5 | 🪷 Skandamata |
| 6 | ⚔️ Katyayani |
| 7 | 🌑 Kalaratri |
| 8 | 🤍 Mahagauri |
| 9 | 👑 Siddhidatri |

Each night can progressively change the rhythm experience, difficulty, BPM, atmosphere, and festival energy.

---

## 🎮 Game Modes

### 🪔 Free Garba

Relaxed Garba experience where you can enjoy the festival without pressure.

### 🎵 Rhythm Challenge

Focus on accurate rhythm timing, combos, score, and performance.

### 🔥 Endless Garba

Keep dancing as the challenge increases.

### 🌙 Festival Night

Progress through the Navratri journey and unlock new content.

### 🥢 Dandiya Raas

A dedicated Dandiya-inspired rhythm experience.

---

## 👯 Garba Companions

Choose how you want to experience the festival:

- 🪔 Solo Garba
- 💕 Couple
- 👯 With Friends

Each mode can influence the crowd and scoring experience.

---

## 👗 Characters & Customization

The game includes traditional-inspired Gujarati festival characters.

### Female

- Chaniya Choli
- Dupatta
- Traditional accessories
- Decorative hairstyles
- Bangles and jewelry
- Mojdi-style footwear

### Male

- Kediyu-inspired outfit
- Traditional clothing
- Pagdi/turban styles
- Mojdi
- Festival accessories
- Dandiya equipment

Characters use procedural geometry and materials to keep the game lightweight while maintaining a detailed 3D appearance.

---

## 🎨 Festival Environment

The world is designed around a colorful Gujarati Navratri atmosphere.

The environment includes:

- 🛕 Festival stage
- 🪔 Diyas
- 🌸 Rangoli / Mandala elements
- 🎊 Toran decorations
- ✨ Decorative lights
- 🌃 Night environment
- 👯 Festival crowd
- 🎵 Stage and music atmosphere
- 🌟 Particle effects
- 🏮 Traditional decorative elements

The goal is to make the player feel like they are participating in an actual Navratri celebration.

---

## 🎥 Camera Modes

Multiple camera perspectives are available:

- 🎥 Follow
- 🎬 Cinema
- 🛰️ Aerial
- 🤳 Selfie
- 🏛️ Stage

Use different cameras to experience the festival from different perspectives.

---

## ✨ Visual Effects

The game contains a custom lightweight VFX system featuring effects such as:

- Beat particles
- Sparks
- Glow effects
- Celebration effects
- Confetti
- Festival particles
- Rhythm feedback
- Combo effects
- Atmospheric effects

VFX intensity is adapted according to the selected quality level.

---

## 🎵 Audio

The game includes a flexible audio system.

### Optional Music

You can provide your own Garba music:

```text
assets/garba.mp3
```

If no music file is provided, the game uses its built-in synthesized dhol/dholak-style fallback.

Audio systems include:

- 🎵 Music
- 🥁 Dhol / Dholak
- 👏 Clap feedback
- 👯 Crowd ambience
- 🔊 SFX
- 🎮 UI sounds

Music and gameplay are designed around rhythm synchronization.

---

# 🎮 Controls

## Desktop

| Input | Action |
|---|---|
| `W` / `↑` | Move forward |
| `S` / `↓` | Move backward |
| `A` / `←` | Move left |
| `D` / `→` | Move right |
| `Q` | Turn left |
| `E` | Turn right |
| `Space` | Clap |
| `C` | Clap |
| `Mouse Click` | Clap |
| `V` | Change camera |
| `P` | Pause |
| `Esc` | Pause |

---

## 📱 Mobile

Touch controls are supported.

- 🕹️ Virtual joystick → Movement
- 👏 CLAP button → Rhythm action
- Touch-friendly menus
- Responsive interface
- Mobile-safe layout

---

# ⚙️ Graphics Quality

The game includes four quality presets:

```text
LOW
MEDIUM
HIGH
ULTRA
```

Quality settings can control rendering complexity such as:

- Resolution
- Crowd density
- Shadows
- Particles
- VFX
- Rendering quality
- Animation complexity

The game also supports adaptive resolution so visual quality can automatically decrease when FPS drops.

### Recommended

**Desktop / High-end device**

```text
ULTRA
```

**Mid-range device**

```text
HIGH
```

**Mobile / Lower-end device**

```text
MEDIUM
```

---

# 💾 Save & Progression

Player progression is stored locally in the browser.

Saved data includes things such as:

- XP
- Level
- High scores
- Best combo
- Perfect hits
- Total games
- Unlocked nights
- Unlocked characters
- Unlocked costumes
- Settings
- Stars / progression

Save data uses browser `localStorage`.

No external account is required.

---

# 🧱 Project Architecture

The project is organized into multiple source modules.

```text
Navratri_Garba_Ultimate/
│
├── index.html
├── README.md
│
├── assets/
│   └── garba.mp3
│
└── src/
    ├── 00_head.html
    ├── 10_core.js
    ├── 20_geo.js
    ├── 30_char.js
    ├── 40_anim.js
    ├── 50_env_a.js
    ├── 51_env_b.js
    ├── 52_env_c.js
    ├── 60_audio.js
    ├── 70_vfx.js
    ├── 80_game.js
    ├── 90_ui.js
    └── build.sh
```

---

# 🧩 Technology Stack

### Core

- HTML5
- CSS3
- JavaScript
- React
- Three.js
- WebGL

### Rendering

Three.js is used for:

- 3D rendering
- Geometry
- Materials
- Lighting
- Cameras
- Characters
- Environment
- Particles

### UI

React is used for:

- Menus
- Settings
- Game selection
- Character selection
- Customization
- HUD
- Progression screens

### Storage

Browser `localStorage` is used for local progression and settings.

---

# 🚀 Getting Started

## Requirements

A modern browser is recommended.

Supported browsers include:

- Google Chrome
- Microsoft Edge
- Safari
- Other modern WebGL-capable browsers

---

## ▶️ Run the Game

For best results, run the project through a local web server.

For example:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

---

# 🎵 Adding Your Own Garba Music

Place your music file here:

```text
assets/garba.mp3
```

Example:

```text
Navratri_Garba_Ultimate/
│
├── index.html
│
└── assets/
    └── garba.mp3
```

If the file is unavailable, the built-in audio fallback can still be used.

---

# 🔨 Rebuilding the Project

The source files are separated into modules for easier development.

After modifying the source files, use:

```bash
src/build.sh
```

This rebuilds the main:

```text
index.html
```

from the source sections.

---

# 📈 Performance

Performance is an important part of the project.

The game uses techniques such as:

- Procedural geometry
- Reusable materials
- Object disposal
- Quality presets
- Adaptive resolution
- Crowd scaling
- Lightweight effects
- Animation optimization

The goal is to provide a rich festival environment while maintaining a smooth gameplay experience.

---

# 🌐 Deployment

The game is designed as a browser-based experience and can be hosted on static hosting platforms.

Examples:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Any standard static web server

No traditional backend server is required for the core gameplay.

---

# 📱 Responsive Design

The interface supports:

- 🖥️ Desktop
- 💻 Laptop
- 📱 Mobile
- 📲 Tablet

The UI includes:

- Responsive menus
- Touch controls
- Mobile-friendly buttons
- Adaptive layouts
- Full-screen gameplay

---

# 🏆 Project Goals

The goals of **Navratri Garba — Jai Maa Momai** are:

1. Celebrate Gujarati Garba culture through an interactive experience.
2. Combine traditional festival elements with modern browser technology.
3. Create an enjoyable rhythm-based gameplay system.
4. Make the experience accessible directly from a browser.
5. Support desktop and mobile players.
6. Maintain good performance while providing rich visuals.
7. Create an immersive digital Navratri festival experience.

---

# 🛠️ Development Philosophy

The project combines:

```text
Gujarati Culture
       +
Garba Dance
       +
Rhythm Gameplay
       +
3D Rendering
       +
Interactive Crowd
       +
Audio & VFX
       +
Mobile Support
```

The objective is not simply to create a 3D scene, but to create an interactive digital Gujarati Navratri experience.

---

# 🔐 Privacy

The game does not require an account for its core functionality.

Gameplay progression and settings are stored locally in the browser.

No backend database is required for normal gameplay.

---

# 🤝 Contributing

Ideas, suggestions, bug reports, and improvements are welcome.

Before making major changes:

1. Understand the existing architecture.
2. Keep the game playable.
3. Avoid unnecessary dependencies.
4. Preserve mobile support.
5. Consider performance implications.
6. Keep the Gujarati cultural theme respectful.

---

# 🐛 Bug Reports

When reporting a bug, include:

- Browser
- Device
- Operating system
- Quality setting
- Game mode
- Steps to reproduce
- Console error, if available
- Screenshot/video if possible

---

# 📜 License

The license for this project should reflect the author's intended usage and distribution rights.

If you want to keep the source publicly visible while restricting copying, modification, or redistribution, use an appropriate proprietary/custom license rather than assuming a standard open-source license provides those restrictions.

---

# 👨‍💻 Author

## **Manthan Vinzuda**

**Creator & Developer of Navratri Garba — Jai Maa Momai**

This entire project was **designed, developed, and created by Manthan Vinzuda**.

From the concept and gameplay systems to the 3D environment, Garba experience, characters, animations, rhythm mechanics, UI, VFX, audio systems, progression, and overall game experience — **this project was created by me as an independent project.**

> **Built with ❤️ by Manthan Vinzuda**

---

# 🪔 Jai Maa Momai

### **જય માં મોમાઈ 🙏**

**Navratri Garba — Jai Maa Momai**

*Celebrate the culture. Feel the rhythm. Dance the Garba.*

---

⭐ **If you like this project, consider giving the repository a star on GitHub.**