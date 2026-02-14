// Frame renderer generator
// Produces a self-contained JavaScript module that gets injected into the browser page.
// The generated JS knows the entire timeline and can render any frame via window.__setFrame(n).

import type { EasingId } from './interpolate.js';
import { easings } from './interpolate.js';
import type { AnimatableProperty } from './interpolate.js';

// ─── Timeline Types (input to the renderer) ─────────────────

export interface RendererTimeline {
  totalFrames: number;
  fps: number;
  scenes: RendererScene[];
  /** Composition mode: 'stack' (position:absolute overlay) or 'scroll' (vertical flow) */
  composition?: 'stack' | 'scroll';
  /** Viewport height in px (used for scroll positioning) */
  viewportHeight?: number;
}

export interface RendererScene {
  id: string;
  startFrame: number;
  endFrame: number;
  elements: RendererElement[];
  transition?: {
    type: string;
    startFrame: number;
    endFrame: number;
    outgoing: RendererFrameAnimation[];  // applied to this scene (exiting)
    incoming: RendererFrameAnimation[];  // applied to next scene (entering)
  };
}

export interface RendererElement {
  domSelector: string;           // CSS selector to target in browser
  animations: RendererFrameAnimation[];
  /** Text split mode for per-word/per-char stagger animations */
  textSplit?: 'word' | 'char';
  /** Stagger delay in frames between split elements */
  staggerFrames?: number;
}

export interface RendererFrameAnimation {
  property: AnimatableProperty;
  startFrame: number;
  endFrame: number;
  values: number[];              // [from, to] or [v0, v1, v2, ...]
  keyframes?: number[];          // [0, 0.5, 1] normalized progress points
  easing: EasingId;
}

// ─── Generate the injectable JS ─────────────────────────────

/**
 * Generate a self-contained JavaScript string that implements window.__setFrame(n).
 * This JS is injected into the browser page and drives all animations frame-by-frame.
 */
export function generateFrameRendererJS(timeline: RendererTimeline): string {
  const timelineJSON = JSON.stringify(timeline);

  // Serialize easing functions as source code
  const easingSrc = generateEasingSource();

  return `(function() {
  'use strict';

  var timeline = ${timelineJSON};

  // ─── Easing functions ──────────────────────────────────
${easingSrc}

  // ─── Interpolation ─────────────────────────────────────

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function interpolateMulti(progress, keyframes, values, easingFn) {
    // Find segment
    var seg = 0;
    for (var i = 1; i < keyframes.length; i++) {
      if (progress >= keyframes[i]) seg = i;
      else break;
    }
    seg = Math.min(seg, keyframes.length - 2);

    var kStart = keyframes[seg];
    var kEnd = keyframes[seg + 1];
    var segLen = kEnd - kStart;
    if (segLen <= 0) return values[seg + 1];

    var segProgress = Math.max(0, Math.min(1, (progress - kStart) / segLen));
    var t = easingFn(segProgress);
    return lerp(values[seg], values[seg + 1], t);
  }

  // ─── Style application ─────────────────────────────────

  function applyStyles(el, style) {
    el.style.opacity = style.opacity;

    var tf = '';
    if (style.xPercent !== undefined) tf += ' translateX(' + style.xPercent + '%)';
    if (style.x !== undefined) tf += ' translateX(' + style.x + 'px)';
    if (style.yPercent !== undefined) tf += ' translateY(' + style.yPercent + '%)';
    if (style.y !== undefined) tf += ' translateY(' + style.y + 'px)';
    if (style.scale !== undefined) tf += ' scale(' + style.scale + ')';
    if (style.scaleX !== undefined) tf += ' scaleX(' + style.scaleX + ')';
    if (style.scaleY !== undefined) tf += ' scaleY(' + style.scaleY + ')';
    if (style.rotate !== undefined) tf += ' rotate(' + style.rotate + 'deg)';
    if (style.rotateX !== undefined) tf += ' rotateX(' + style.rotateX + 'deg)';
    if (style.rotateY !== undefined) tf += ' rotateY(' + style.rotateY + 'deg)';
    if (style.skewX !== undefined) tf += ' skewX(' + style.skewX + 'deg)';
    if (style.skewY !== undefined) tf += ' skewY(' + style.skewY + 'deg)';
    el.style.transform = tf.trim() || 'none';

    var fl = '';
    if (style.blur !== undefined) fl += ' blur(' + style.blur + 'px)';
    if (style.brightness !== undefined) fl += ' brightness(' + style.brightness + ')';
    if (style.hueRotate !== undefined) fl += ' hue-rotate(' + style.hueRotate + 'deg)';
    el.style.filter = fl.trim() || '';

    // Clip-path: inset
    if (style.clipTop !== undefined || style.clipRight !== undefined || style.clipBottom !== undefined || style.clipLeft !== undefined) {
      el.style.clipPath = 'inset(' +
        (style.clipTop || 0) + '% ' +
        (style.clipRight || 0) + '% ' +
        (style.clipBottom || 0) + '% ' +
        (style.clipLeft || 0) + '%)';
    }

    // Clip-path: circle
    if (style.clipCircle !== undefined) {
      el.style.clipPath = 'circle(' + style.clipCircle + '% at 50% 50%)';
    }

    // Special CSS properties
    if (style.letterSpacing !== undefined) {
      el.style.letterSpacing = style.letterSpacing + 'em';
    }
    if (style.maxWidthPercent !== undefined) {
      el.style.maxWidth = style.maxWidthPercent + '%';
    }
    if (style.backgroundSizeX !== undefined) {
      el.style.backgroundSize = style.backgroundSizeX + '% 100%';
    }
  }

  // ─── Compute animation value ───────────────────────────

  function computeAnimValue(anim, frame) {
    var easingFn = _easings[anim.easing] || _easings.linear;

    // Before animation: use initial value
    if (frame < anim.startFrame) {
      return anim.values[0];
    }
    // After animation: use final value
    if (frame >= anim.endFrame) {
      return anim.values[anim.values.length - 1];
    }

    var duration = anim.endFrame - anim.startFrame;
    if (duration <= 0) return anim.values[anim.values.length - 1];

    var progress = (frame - anim.startFrame) / duration;

    if (anim.keyframes && anim.keyframes.length > 0) {
      return interpolateMulti(progress, anim.keyframes, anim.values, easingFn);
    }

    // Simple two-point interpolation
    var t = easingFn(Math.max(0, Math.min(1, progress)));
    return lerp(anim.values[0], anim.values[1], t);
  }

  // ─── Compute element style at frame N ──────────────────

  function computeStyle(element, frame) {
    var style = { opacity: 1 };

    for (var i = 0; i < element.animations.length; i++) {
      var anim = element.animations[i];
      var value = computeAnimValue(anim, frame);
      style[anim.property] = value;
    }

    return style;
  }

  // ─── Main: render frame N ──────────────────────────────

  var isScrollMode = timeline.composition === 'scroll';
  var vpHeight = timeline.viewportHeight || 1920;

  window.__setFrame = function(n) {
    // Scroll mode: scene-based scroll positioning
    // Park viewport on current scene; only scroll during transitions
    if (isScrollMode) {
      var sceneIdx = 0;
      for (var s = 0; s < timeline.scenes.length; s++) {
        if (n >= timeline.scenes[s].startFrame) sceneIdx = s;
      }

      var scrollTarget = sceneIdx * vpHeight;
      var curScene = timeline.scenes[sceneIdx];

      // Smooth scroll during explicit transitions to next scene
      if (curScene.transition && n >= curScene.transition.startFrame && sceneIdx < timeline.scenes.length - 1) {
        var tLen = curScene.transition.endFrame - curScene.transition.startFrame;
        if (tLen > 0) {
          var tP = Math.min(1, (n - curScene.transition.startFrame) / tLen);
          tP = tP * tP * (3 - 2 * tP); // smoothstep
          scrollTarget += Math.round(tP * vpHeight);
        }
      }
      // Implicit brief scroll for hard cuts (no explicit transition)
      else if (!curScene.transition && sceneIdx < timeline.scenes.length - 1) {
        var implicitFrames = Math.min(18, Math.max(6, Math.round((curScene.endFrame - curScene.startFrame) * 0.06)));
        var scrollZoneStart = curScene.endFrame - implicitFrames;
        if (n >= scrollZoneStart) {
          var iP = (n - scrollZoneStart) / implicitFrames;
          iP = iP * iP * (3 - 2 * iP); // smoothstep
          scrollTarget += Math.round(iP * vpHeight);
        }
      }

      // Use transform instead of scrollTo — works regardless of body overflow setting
      document.body.style.transform = 'translateY(' + (-scrollTarget) + 'px)';
    }

    for (var si = 0; si < timeline.scenes.length; si++) {
      var scene = timeline.scenes[si];
      var sceneEl = document.getElementById(scene.id);
      if (!sceneEl) continue;

      // Determine if scene is active
      var isActive = n >= scene.startFrame && n <= scene.endFrame;

      // Check if scene is in transition overlap with next scene
      var isInTransition = scene.transition && n >= scene.transition.startFrame && n <= scene.transition.endFrame;

      // Also check if this scene is being transitioned INTO (previous scene's transition)
      var prevScene = si > 0 ? timeline.scenes[si - 1] : null;
      var isBeingTransitionedIn = prevScene && prevScene.transition &&
        n >= prevScene.transition.startFrame && n <= prevScene.transition.endFrame;

      var shouldShow = isActive || isBeingTransitionedIn;

      if (isScrollMode) {
        // Scroll mode: scenes are always in flow, control opacity instead of display
        sceneEl.style.opacity = shouldShow ? '1' : '0.0';
      } else {
        // Stack mode: toggle display
        sceneEl.style.display = shouldShow ? 'grid' : 'none';
        if (!shouldShow) continue;
      }

      if (!shouldShow) {
        // In scroll mode, skip element animations for non-active scenes
        continue;
      }

      // Reset scene container styles (transitions may have modified them)
      sceneEl.style.opacity = '1';
      sceneEl.style.transform = 'none';
      sceneEl.style.filter = '';
      sceneEl.style.clipPath = '';

      // Apply outgoing transition to this scene (if it's exiting)
      if (isInTransition && scene.transition.outgoing) {
        var sceneStyle = { opacity: 1 };
        for (var ti = 0; ti < scene.transition.outgoing.length; ti++) {
          var tAnim = scene.transition.outgoing[ti];
          sceneStyle[tAnim.property] = computeAnimValue(tAnim, n);
        }
        applyStyles(sceneEl, sceneStyle);
      }

      // Apply incoming transition to this scene (if it's entering)
      if (isBeingTransitionedIn && prevScene.transition.incoming) {
        var inStyle = { opacity: 1 };
        for (var ii = 0; ii < prevScene.transition.incoming.length; ii++) {
          var iAnim = prevScene.transition.incoming[ii];
          inStyle[iAnim.property] = computeAnimValue(iAnim, n);
        }
        applyStyles(sceneEl, inStyle);
      }

      // Element animations
      for (var ei = 0; ei < scene.elements.length; ei++) {
        var element = scene.elements[ei];
        var el = sceneEl.querySelector(element.domSelector);
        if (!el) continue;

        // Text split: apply staggered animations to each word/char span
        if (element.textSplit) {
          var splitSelector = element.textSplit === 'word' ? '.w' : '.ch';
          var splitEls = el.querySelectorAll(splitSelector);
          var staggerF = element.staggerFrames || 3;
          for (var wi = 0; wi < splitEls.length; wi++) {
            // Offset each split element by stagger * index
            var offsetFrame = n - (wi * staggerF);
            var splitStyle = computeStyle(element, offsetFrame);
            applyStyles(splitEls[wi], splitStyle);
          }
          // Keep parent visible
          el.style.opacity = '1';
        } else {
          var elStyle = computeStyle(element, n);
          applyStyles(el, elStyle);
        }
      }
    }
  };

  // Signal ready
  window.__frameRendererReady = true;
})();`;
}

// ─── Easing source generation ────────────────────────────────

function generateEasingSource(): string {
  // Generate JavaScript source for all easing functions
  // These are inlined so the rendered page has zero dependencies
  return `  var _easings = {
    linear: function(t) { return t; },
    easeInQuad: function(t) { return t * t; },
    easeOutQuad: function(t) { return t * (2 - t); },
    easeInOutQuad: function(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; },
    easeInCubic: function(t) { return t*t*t; },
    easeOutCubic: function(t) { return (--t)*t*t+1; },
    easeInOutCubic: function(t) { return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; },
    easeInQuart: function(t) { return t*t*t*t; },
    easeOutQuart: function(t) { return 1-(--t)*t*t*t; },
    easeInOutQuart: function(t) { return t<0.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t; },
    easeInBack: function(t) { var c=1.70158; return (c+1)*t*t*t-c*t*t; },
    easeOutBack: function(t) { var c=1.70158; return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2); },
    easeInOutBack: function(t) { var c=1.70158*1.525; return t<0.5?(Math.pow(2*t,2)*((c+1)*2*t-c))/2:(Math.pow(2*t-2,2)*((c+1)*(t*2-2)+c)+2)/2; },
    easeOutElastic: function(t) { if(t===0||t===1)return t; return Math.pow(2,-10*t)*Math.sin((t-0.1)*5*Math.PI)+1; },
    easeInElastic: function(t) { if(t===0||t===1)return t; return -Math.pow(2,10*(t-1))*Math.sin((t-1.1)*5*Math.PI); },
    easeOutBounce: function(t) { if(t<1/2.75)return 7.5625*t*t; if(t<2/2.75){t-=1.5/2.75;return 7.5625*t*t+0.75;} if(t<2.5/2.75){t-=2.25/2.75;return 7.5625*t*t+0.9375;} t-=2.625/2.75;return 7.5625*t*t+0.984375; },
    easeInBounce: function(t) { return 1-_easings.easeOutBounce(1-t); },
    easeOutExpo: function(t) { return t===1?1:1-Math.pow(2,-10*t); },
    easeInExpo: function(t) { return t===0?0:Math.pow(2,10*(t-1)); },
    easeInSine: function(t) { return 1-Math.cos((t*Math.PI)/2); },
    easeOutSine: function(t) { return Math.sin((t*Math.PI)/2); },
    easeInOutSine: function(t) { return -(Math.cos(Math.PI*t)-1)/2; },
    snap: function(t) { var c=0.1; return t<c?0:1-Math.pow(1-(t-c)/(1-c),3); }
  };`;
}
