// Orson v5 Animation Runtime
// Exported as a JS string that Claude embeds inline in video HTML.
// Provides: easing functions, scene management, animation processing, __setFrame(n).
// ~90 lines of self-contained JS — zero dependencies.

/**
 * Returns the animation runtime JS as a string.
 * Claude includes this inside a <script> tag in every video HTML.
 *
 * Contract:
 * - Each scene is a div.scene with sequential IDs (scene-0, scene-1, ...)
 * - Animated elements use data-el="sN-eM" attributes
 * - The `scenes` array and `anims` object are defined BEFORE the runtime
 * - scenes: [{ id, start, frames }]
 * - anims: { 'scene-N': [A(sel, prop, offset, dur, from, to, easingName), ...] }
 * - Crossfade overlap is controlled by XFADE (in frames)
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

  // ─── Style application ─────────────────────────
  function lerp(a, b, t) { return a + (b - a) * t; }

  function applyAnim(el, anim, localFrame) {
    var f = localFrame - anim.offset;
    var t;
    if (f <= 0) t = 0;
    else if (f >= anim.dur) t = 1;
    else t = anim.ease(f / anim.dur);
    var v = lerp(anim.from, anim.to, t);
    switch (anim.prop) {
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
        applyAnim(el, scAnims[j], localFrame);
      }
      var flushed = new Set();
      for (var j = 0; j < scAnims.length; j++) {
        var el = els[j]; if (!el || flushed.has(el)) continue;
        flushStyle(el); flushed.add(el);
      }
    }
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
