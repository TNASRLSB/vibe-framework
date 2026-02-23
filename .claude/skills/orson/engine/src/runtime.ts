// Orson v6 Animation Runtime
// Exported as a JS string that Claude embeds inline in video HTML.
// Provides: easing functions, scene management, animation processing, __setFrame(n).
// Functions: A() eased anim, SP() spring physics, N() Perlin noise, D() SVG draw,
//            P() particle system, R() seeded random, S() text splitter.
// Auto-start: scenes without explicit `start` get computed from frames + XFADE.

/**
 * Returns the animation runtime JS as a string.
 * Claude includes this inside a <script> tag in every video HTML.
 *
 * Contract:
 * - Each scene is a div.scene with sequential IDs (scene-0, scene-1, ...)
 * - Animated elements use data-el="sN-eM" attributes
 * - The `scenes` array and `anims` object are defined BEFORE the runtime
 * - scenes: [{ id, frames }] — `start` is optional (auto-computed from frames + XFADE)
 * - scenes: [{ id, start, frames }] — explicit start still works (backward compatible)
 * - anims: { 'scene-N': [A(), SP(), N(), D(), ...] }
 * - Crossfade overlap is controlled by XFADE (in frames)
 * - Optional: xfades[] array for per-transition overlap, FPS for spring solver
 */
export function getAnimationRuntime(): string {
  return RUNTIME_JS;
}

const RUNTIME_JS = `(function() {
  'use strict';

  // ─── Easing functions ──────────────────────────
  var ease = {
    linear: function(t) { return t; },
    outCubic: function(t) { return (--t)*t*t+1; },
    outQuart: function(t) { return 1-(--t)*t*t*t; },
    outQuad: function(t) { return t*(2-t); },
    inOutCubic: function(t) { return t<0.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1; },
    inOutQuad: function(t) { return t<0.5?2*t*t:-1+(4-2*t)*t; },
    outBack: function(t) { var c=1.70158; return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2); },
    inBack: function(t) { var c=1.70158; return (c+1)*t*t*t-c*t*t; },
    outExpo: function(t) { return t===1?1:1-Math.pow(2,-10*t); },
    inExpo: function(t) { return t===0?0:Math.pow(2,10*(t-1)); },
    outSine: function(t) { return Math.sin(t*Math.PI/2); },
    inSine: function(t) { return 1-Math.cos(t*Math.PI/2); },
    inOutSine: function(t) { return -(Math.cos(Math.PI*t)-1)/2; },
    outElastic: function(t) { if(t===0||t===1)return t; return Math.pow(2,-10*t)*Math.sin((t-0.1)*5*Math.PI)+1; },
    outBounce: function(t) {
      if(t<1/2.75)return 7.5625*t*t;
      if(t<2/2.75){t-=1.5/2.75;return 7.5625*t*t+0.75;}
      if(t<2.5/2.75){t-=2.25/2.75;return 7.5625*t*t+0.9375;}
      t-=2.625/2.75;return 7.5625*t*t+0.984375;
    },
    snap: function(t) { var c=0.1; return t<c?0:1-Math.pow(1-(t-c)/(1-c),3); },
  };

  // ─── Animation helper (defined globally for scene scripts) ─
  // A(selector, property, startOffset, duration, from, to, easingName)
  window.A = function(sel, prop, offset, dur, from, to, e) {
    return { sel: sel, prop: prop, offset: offset, dur: dur, from: from, to: to, ease: ease[e || 'outCubic'] };
  };

  // ─── R() — Deterministic seeded random ────────────────────
  // R(seed) → [0, 1) — same seed always produces same value
  window.R = function(seed) {
    var x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  // ─── Perlin noise 2D ─────────────────────────────────────
  var __perm = (function() {
    var p = [];
    for (var i = 0; i < 256; i++) p[i] = i;
    // Fisher-Yates with fixed seed for determinism
    for (var i = 255; i > 0; i--) {
      var j = Math.floor((Math.sin(i * 127.1 + 311.7) * 43758.5453 % 1 + 1) % 1 * (i + 1));
      var tmp = p[i]; p[i] = p[j]; p[j] = tmp;
    }
    var perm = new Array(512);
    for (var i = 0; i < 512; i++) perm[i] = p[i & 255];
    return perm;
  })();

  function __fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function __grad2(hash, x, y) {
    var h = hash & 3;
    return (h === 0 ? x + y : h === 1 ? -x + y : h === 2 ? x - y : -x - y);
  }
  function __noise2D(x, y) {
    var xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
    var xf = x - Math.floor(x), yf = y - Math.floor(y);
    var u = __fade(xf), v = __fade(yf);
    var aa = __perm[__perm[xi] + yi], ab = __perm[__perm[xi] + yi + 1];
    var ba = __perm[__perm[xi + 1] + yi], bb = __perm[__perm[xi + 1] + yi + 1];
    var x1 = lerp(__grad2(aa, xf, yf), __grad2(ba, xf - 1, yf), u);
    var x2 = lerp(__grad2(ab, xf, yf - 1), __grad2(bb, xf - 1, yf - 1), u);
    return lerp(x1, x2, v);
  }

  function __hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  // ─── N() — Noise-driven animation ────────────────────────
  // N(selector, property, seed, speed, amplitude, centerValue)
  // Applies continuous organic movement via Perlin noise
  window.N = function(sel, prop, seed, speed, amp, center) {
    return { sel: sel, prop: prop, seed: seed, speed: speed,
             amp: amp, center: center, noise: true };
  };

  // ─── SP() — Spring physics animation ─────────────────────
  // SP(selector, property, startOffset, from, to, config)
  // config: { k: stiffness, c: damping, m: mass }
  // Presets: snappy {k:200,c:26,m:1}, bouncy {k:120,c:14,m:0.4},
  //          heavy {k:80,c:8,m:2}, elastic {k:150,c:6,m:0.5}
  window.SP = function(sel, prop, offset, from, to, cfg) {
    var k = (cfg && cfg.k) || 100, c = (cfg && cfg.c) || 10, m = (cfg && cfg.m) || 1;
    return { sel: sel, prop: prop, offset: offset, from: from, to: to,
             spring: true, k: k, c: c, m: m };
  };

  function applySpring(el, anim, localFrame) {
    var f = localFrame - anim.offset;
    if (f <= 0) {
      setProp(el, anim.prop, anim.from);
      return;
    }
    // Euler integration of damped harmonic oscillator
    var fps = (typeof FPS !== 'undefined') ? FPS : 30;
    var dt = 1 / fps, pos = 0, vel = 0;
    var maxF = Math.min(f, 600); // clamp to prevent infinite loops on low damping
    for (var i = 0; i < maxF; i++) {
      var springForce = -anim.k * (pos - 1);
      var dampForce = -anim.c * vel;
      vel += (springForce + dampForce) / anim.m * dt;
      pos += vel * dt;
    }
    var v = anim.from + (anim.to - anim.from) * pos;
    setProp(el, anim.prop, v);
  }

  // ─── D() — SVG path draw animation ───────────────────────
  // D(selector, startOffset, duration, from, to, easingName)
  // Animates strokeDashoffset on SVG path elements
  window.D = function(sel, offset, dur, from, to, e) {
    return { sel: sel, offset: offset, dur: dur, from: from, to: to,
             ease: ease[e || 'outCubic'], draw: true };
  };

  function applyDraw(el, anim, localFrame) {
    var f = localFrame - anim.offset;
    if (!el._pathLen) {
      el._pathLen = el.getTotalLength ? el.getTotalLength() : 0;
      if (el._pathLen > 0) {
        el.style.strokeDasharray = el._pathLen;
      }
    }
    if (el._pathLen <= 0) return;
    var t;
    if (f <= 0) t = 0;
    else if (f >= anim.dur) t = 1;
    else t = anim.ease(f / anim.dur);
    var progress = lerp(anim.from, anim.to, t);
    el.style.strokeDashoffset = el._pathLen * (1 - progress);
  }

  // ─── P() — Particle system ─────────────────────────────────
  // P(containerSelector, count, config)
  // config: { sizeRange: [2,6], color: '#fff', driftSpeed: 0.015, driftAmp: 20 }
  // Creates particles in container and animates them via noise
  var __particles = [];
  window.P = function(containerSel, count, cfg) {
    cfg = cfg || {};
    var sMin = (cfg.sizeRange && cfg.sizeRange[0]) || 2;
    var sMax = (cfg.sizeRange && cfg.sizeRange[1]) || 6;
    var color = cfg.color || 'rgba(255,255,255,0.3)';
    var container = document.querySelector(containerSel);
    if (!container) return;
    var w = container.offsetWidth || 1920, h = container.offsetHeight || 1080;
    var particles = [];
    for (var i = 0; i < count; i++) {
      var size = sMin + R(i * 100 + 3) * (sMax - sMin);
      var opacity = 0.1 + R(i * 100 + 4) * 0.3;
      var el = document.createElement('div');
      el.style.cssText = 'position:absolute;border-radius:50%;pointer-events:none;' +
        'width:' + size + 'px;height:' + size + 'px;background:' + color + ';opacity:' + opacity;
      container.appendChild(el);
      particles.push({
        el: el,
        baseX: R(i * 100 + 1) * w,
        baseY: R(i * 100 + 2) * h,
        baseO: opacity,
        seedX: i * 7.13,
        seedY: i * 11.37,
        seedO: i * 3.91,
        speed: (cfg.driftSpeed || 0.015),
        amp: (cfg.driftAmp || 20)
      });
    }
    __particles.push(particles);
  };

  function __updateParticles(frame) {
    for (var g = 0; g < __particles.length; g++) {
      var group = __particles[g];
      for (var i = 0; i < group.length; i++) {
        var p = group[i];
        var dx = __noise2D(frame * p.speed + p.seedX, p.seedX) * p.amp;
        var dy = __noise2D(p.seedY, frame * p.speed + p.seedY) * p.amp;
        var dopc = __noise2D(frame * 0.03 + p.seedO, p.seedO) * 0.15;
        p.el.style.transform = 'translate(' + (p.baseX + dx) + 'px,' + (p.baseY + dy) + 'px)';
        p.el.style.opacity = Math.max(0, p.baseO + dopc);
      }
    }
  }

  // ─── setProp — shared property setter ─────────────────────
  function setProp(el, prop, v) {
    switch (prop) {
      case 'opacity': el._o = v; break;
      case 'x': el._x = v; break;
      case 'y': el._y = v; break;
      case 'scale': el._s = v; break;
      case 'scaleX': el._sx = v; break;
      case 'scaleY': el._sy = v; break;
      case 'blur': el._blur = v; break;
      case 'rotate': el._rot = v; break;
      case 'brightness': el._bright = v; break;
      case 'clipRight': el._clipR = v; break;
      case 'clipLeft': el._clipL = v; break;
      case 'clipTop': el._clipT = v; break;
      case 'clipBottom': el._clipB = v; break;
    }
  }

  // ─── Style application ─────────────────────────
  function lerp(a, b, t) { return a + (b - a) * t; }

  function applyAnim(el, anim, localFrame) {
    var f = localFrame - anim.offset;
    var t;
    if (f <= 0) t = 0;
    else if (f >= anim.dur) t = 1;
    else t = anim.ease(f / anim.dur);
    setProp(el, anim.prop, lerp(anim.from, anim.to, t));
  }

  function flushStyle(el) {
    el.style.opacity = el._o;
    var tf = '';
    if (el._x !== undefined && el._x !== 0) tf += 'translateX(' + el._x + 'px) ';
    if (el._y !== undefined && el._y !== 0) tf += 'translateY(' + el._y + 'px) ';
    if (el._s !== undefined && el._s !== 1) tf += 'scale(' + el._s + ') ';
    if (el._sx !== undefined && el._sx !== 1) tf += 'scaleX(' + el._sx + ') ';
    if (el._sy !== undefined && el._sy !== 1) tf += 'scaleY(' + el._sy + ') ';
    if (el._rot !== undefined && el._rot !== 0) tf += 'rotate(' + el._rot + 'deg) ';
    el.style.transform = tf || 'none';
    var filters = [];
    if (el._blur !== undefined && el._blur > 0) filters.push('blur(' + el._blur + 'px)');
    if (el._bright !== undefined && el._bright !== 1) filters.push('brightness(' + el._bright + ')');
    el.style.filter = filters.length ? filters.join(' ') : '';
    if (el._clipR !== undefined || el._clipL !== undefined || el._clipT !== undefined || el._clipB !== undefined) {
      var t = (el._clipT || 0) + '%', r = (el._clipR || 0) + '%', b = (el._clipB || 0) + '%', l = (el._clipL || 0) + '%';
      el.style.clipPath = 'inset(' + t + ' ' + r + ' ' + b + ' ' + l + ')';
    }
  }

  // ─── Auto-start calculation (UPG-5) ────────────
  // If scenes[0].start is undefined, compute start frames automatically
  // from durations and XFADE. Backward compatible: explicit start values are preserved.
  if (scenes.length > 0 && scenes[0].start === undefined) {
    scenes[0].start = 0;
    var xf = (typeof XFADE !== 'undefined') ? XFADE : 0;
    for (var i = 1; i < scenes.length; i++) {
      var perXfade = (typeof xfades !== 'undefined' && xfades[i - 1] !== undefined) ? xfades[i - 1] : xf;
      scenes[i].start = scenes[i - 1].start + scenes[i - 1].frames - perXfade;
    }
  }

  // ─── Cache DOM elements ────────────────────────
  var sceneEls = {};
  var animEls = {};
  for (var i = 0; i < scenes.length; i++) {
    var sc = scenes[i];
    sceneEls[sc.id] = document.getElementById(sc.id);
    var scAnims = anims[sc.id] || [];
    animEls[sc.id] = [];
    for (var j = 0; j < scAnims.length; j++) {
      animEls[sc.id].push(sceneEls[sc.id].querySelector(scAnims[j].sel));
    }
  }

  // ─── __setFrame ────────────────────────────────
  window.__setFrame = function(n) {
    for (var i = 0; i < scenes.length; i++) {
      var sc = scenes[i];
      var scEnd = sc.start + sc.frames;
      var scEl = sceneEls[sc.id];
      var isActive = n >= sc.start && n < scEnd;
      var nextSc = scenes[i + 1];
      var isInXfade = nextSc && n >= nextSc.start && n < scEnd;

      if (!isActive && !isInXfade) { scEl.style.display = 'none'; continue; }
      scEl.style.display = 'flex';

      // Crossfade opacity
      var sceneOpacity = 1;
      if (nextSc && n >= nextSc.start) {
        sceneOpacity = 1 - Math.min(1, (n - nextSc.start) / XFADE);
      }
      if (i > 0) {
        var prevSc = scenes[i - 1];
        if (n < prevSc.start + prevSc.frames && n >= sc.start) {
          sceneOpacity = Math.min(1, (n - sc.start) / XFADE);
        }
      }
      scEl.style.opacity = sceneOpacity;

      // Apply element animations
      var localFrame = n - sc.start;
      var scAnims = anims[sc.id] || [];
      var els = animEls[sc.id];
      // Reset all animated elements to defaults before applying animations.
      // _o defaults to 1 (visible): elements with opacity animations will be
      // overwritten by applyAnim (e.g. fade-in starts at from=0). Elements WITHOUT
      // opacity animations (camera wrappers, structural containers) stay visible.
      // Previously _o=0 caused camera wrappers to be invisible when they only had
      // scale/position animations.
      for (var j = 0; j < scAnims.length; j++) {
        var el = els[j]; if (!el) continue;
        el._o = 1; el._x = 0; el._y = 0; el._s = 1; el._sx = 1; el._sy = 1;
        el._blur = 0; el._rot = 0; el._bright = 1;
        el._clipR = undefined; el._clipL = undefined; el._clipT = undefined; el._clipB = undefined;
      }
      for (var j = 0; j < scAnims.length; j++) {
        var el = els[j]; if (!el) continue;
        var anim = scAnims[j];
        if (anim.noise) {
          var so = __hashStr(anim.seed);
          var v = anim.center + __noise2D(n * anim.speed + so * 0.001, so * 0.001) * anim.amp;
          switch (anim.prop) {
            case 'opacity': el._o = v; break;
            case 'x': el._x += v; break;
            case 'y': el._y += v; break;
            case 'scale': el._s = v; break;
            case 'rotate': el._rot += v; break;
          }
        } else if (anim.spring) {
          applySpring(el, anim, localFrame);
        } else if (anim.draw) {
          applyDraw(el, anim, localFrame);
        } else {
          applyAnim(el, anim, localFrame);
        }
      }
      var flushed = new Set();
      for (var j = 0; j < scAnims.length; j++) {
        var el = els[j]; if (!el || flushed.has(el)) continue;
        flushStyle(el); flushed.add(el);
      }
    }
    // Update particle systems
    if (__particles.length > 0) __updateParticles(n);
  };

  // ─── Text splitter (kinetic typography) ───────
  // S(element, mode) — splits text into word ('w') or character ('c') spans
  // Each span gets data-el="originalId-w0", "originalId-w1", etc.
  window.S = function(el, mode) {
    var text = el.textContent;
    var parts = mode === 'w' ? text.split(/\\s+/) : text.split('');
    var id = el.getAttribute('data-el');
    el.innerHTML = parts.map(function(p, i) {
      return '<span data-el="' + id + '-' + mode + i + '" style="display:inline-block">' +
        (mode === 'w' && i > 0 ? '&nbsp;' : '') + p + '</span>';
    }).join('');
  };

  window.__setFrame(0);
  window.__frameRendererReady = true;
})();`;
