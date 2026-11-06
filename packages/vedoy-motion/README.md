# Vedoy Motion — browser animation engine

**Status: private beta. Not published to npm.**

Motion animates HTML and SVG elements using the native Web Animations API. It supports screen-relative positions, CSS keyframes, multi-object timelines and strict VedoyScript commands.

## JavaScript
```js
import { actor, screen, motion } from "@vedoy/motion";
const Sirkelmednavn = actor(document.getElementById("Circle"));
Sirkelmednavn.motion(screen(85, 50))
  .fadein(screen(-15, 50))
  .speed(4)
  .play();
```

Screen coordinates are percentages of viewport width and height. Negative x starts outside the left edge. `speed(4)` means a 1600 ms clip on a speed scale from 1 (slow) to 10 (fast).

## Effects
`fadeIn`, `fadeOut`, `slideToLeft`, `slideToRight`, `slideToTop`, `slideToBottom`, `slideInFromLeft`, `slideInFromRight`, `rollOutToLeft`, `rollOutToRight`, `shrink`, `grow`, `pop`, `blurIn`, `blurOut`, `bounce`, `shake`, `spin`, `pulse`, `float`.

Effects and position can be combined within a single clip. Use `.then()` for a second clip, `.duration(ms)` for exact timing, and `.keyframes([{...},{...}])` to animate arbitrary CSS-animatable properties.

## VedoyScript
```text
Animate Circle.
  From Screen -15 50.
  FadeIn.
  To Screen 85 50.
  Speed 4.
  Play.
```

```js
import { runVedoyScript } from "@vedoy/motion";
runVedoyScript(script, { root: document });
```

Commands must start with uppercase and end with a period. The parser does not use eval or execute arbitrary JavaScript.

## Film-like timelines
```js
import { timeline, motion } from "@vedoy/motion";
const scene = timeline()
  .add(motion("#Circle").fadeIn().slideToRight(), 0)
  .add(motion("#Title").fadeIn().grow(), 320);
await scene.play().finished;
```

## Limitations
- Works with CSS-animatable HTML and SVG properties; Canvas/WebGL objects need separate adapters.
- `prefers-reduced-motion` reduces animation duration to 1 ms.
- The editor stores scene drafts only locally; no public profiles, payments or cloud storage are connected.
- AI-assisted code generation and marketplace require a separately reviewed backend, privacy/security checks, content moderation and licenses.
- Repeat playback cancels the last active animation on the same element.

## Tests
`npm test --workspace=@vedoy/motion`

Developed by Vedoy Studio.