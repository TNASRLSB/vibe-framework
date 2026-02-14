// Frame-addressed interpolation engine
// Core primitive: interpolate(frame, inputRange, outputRange, options?)
// Everything in the v3 pipeline builds on this.

// ─── Animatable Properties ──────────────────────────────────

export type AnimatableProperty =
  | 'opacity'          // 0-1
  | 'x'                // translateX in px
  | 'y'                // translateY in px
  | 'xPercent'         // translateX in %
  | 'yPercent'         // translateY in %
  | 'scale'            // uniform scale
  | 'scaleX'           // x-axis scale
  | 'scaleY'           // y-axis scale
  | 'rotate'           // degrees
  | 'rotateX'          // degrees (3D)
  | 'rotateY'          // degrees (3D)
  | 'skewX'            // degrees
  | 'skewY'            // degrees
  | 'blur'             // px
  | 'brightness'       // 0-2
  | 'hueRotate'        // degrees
  | 'clipTop'          // clip-path inset top %
  | 'clipRight'        // clip-path inset right %
  | 'clipBottom'       // clip-path inset bottom %
  | 'clipLeft'         // clip-path inset left %
  | 'clipCircle'       // clip-path circle radius %
  | 'letterSpacing'    // em
  | 'maxWidthPercent'  // %
  | 'backgroundSizeX'; // %

// ─── Easing Functions ────────────────────────────────────────

export type EasingFn = (t: number) => number;

export const easings: Record<string, EasingFn> = {
  linear: (t) => t,

  // Quad
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  // Cubic
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Quart
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,

  // Back (overshoot)
  easeInBack: (t) => {
    const c = 1.70158;
    return (c + 1) * t * t * t - c * t * t;
  },
  easeOutBack: (t) => {
    const c = 1.70158;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t) => {
    const c = 1.70158 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2;
  },

  // Elastic
  easeOutElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
  },
  easeInElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
  },

  // Bounce
  easeOutBounce: (t) => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) { t -= 1.5 / 2.75; return 7.5625 * t * t + 0.75; }
    if (t < 2.5 / 2.75) { t -= 2.25 / 2.75; return 7.5625 * t * t + 0.9375; }
    t -= 2.625 / 2.75;
    return 7.5625 * t * t + 0.984375;
  },
  easeInBounce: (t) => 1 - easings.easeOutBounce(1 - t),

  // Expo
  easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),

  // Sine
  easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Snap (sharp deceleration)
  snap: (t) => {
    const c = 0.1;
    return t < c ? 0 : 1 - Math.pow(1 - (t - c) / (1 - c), 3);
  },
};

export type EasingId = keyof typeof easings;

// ─── Extrapolation ──────────────────────────────────────────

export type ExtrapolateType = 'extend' | 'clamp' | 'identity';

export interface InterpolateOptions {
  easing?: EasingId | EasingFn;
  extrapolateLeft?: ExtrapolateType;
  extrapolateRight?: ExtrapolateType;
}

// ─── Core Interpolation ─────────────────────────────────────

/**
 * Interpolate a value at a given frame within an input/output range.
 * Supports multi-stop ranges: interpolate(frame, [0, 30, 60], [0, 1, 0])
 */
export function interpolate(
  frame: number,
  inputRange: number[],
  outputRange: number[],
  options?: InterpolateOptions,
): number {
  if (inputRange.length !== outputRange.length) {
    throw new Error(`inputRange (${inputRange.length}) and outputRange (${outputRange.length}) must have same length`);
  }
  if (inputRange.length < 2) {
    throw new Error('inputRange must have at least 2 values');
  }

  const extraLeft = options?.extrapolateLeft ?? 'clamp';
  const extraRight = options?.extrapolateRight ?? 'clamp';
  const easingFn = typeof options?.easing === 'function'
    ? options.easing
    : options?.easing
      ? easings[options.easing] ?? easings.linear
      : easings.linear;

  // Find the segment this frame falls into
  let segIdx = 0;
  for (let i = 1; i < inputRange.length; i++) {
    if (frame >= inputRange[i]) segIdx = i;
    else break;
  }
  // Clamp segIdx to valid segment range
  segIdx = Math.min(segIdx, inputRange.length - 2);

  const inStart = inputRange[segIdx];
  const inEnd = inputRange[segIdx + 1];
  const outStart = outputRange[segIdx];
  const outEnd = outputRange[segIdx + 1];

  // Handle edges / extrapolation
  if (frame <= inputRange[0]) {
    if (extraLeft === 'clamp') return outputRange[0];
    if (extraLeft === 'identity') return frame;
    // extend: fall through to linear extrapolation
  }
  if (frame >= inputRange[inputRange.length - 1]) {
    if (extraRight === 'clamp') return outputRange[outputRange.length - 1];
    if (extraRight === 'identity') return frame;
    // extend: fall through to linear extrapolation
  }

  // Compute progress within segment
  const segLength = inEnd - inStart;
  if (segLength === 0) return outEnd;
  const rawProgress = (frame - inStart) / segLength;
  const clampedProgress = Math.max(0, Math.min(1, rawProgress));

  // Apply easing only to the clamped progress
  const t = easingFn(clampedProgress);

  // Lerp
  return outStart + (outEnd - outStart) * t;
}

// ─── Spring Animation ───────────────────────────────────────

export interface SpringConfig {
  stiffness: number;   // default 100
  damping: number;     // default 10
  mass: number;        // default 1
  overshootClamping?: boolean;
}

const DEFAULT_SPRING: SpringConfig = {
  stiffness: 100,
  damping: 10,
  mass: 1,
  overshootClamping: false,
};

// Cache spring curves: key → array of values per frame
const springCache = new Map<string, number[]>();

function springCacheKey(fps: number, config: SpringConfig): string {
  return `${fps}-${config.stiffness}-${config.damping}-${config.mass}-${config.overshootClamping ?? false}`;
}

/**
 * Physics-based spring animation (damped harmonic oscillator).
 * Returns 0→1 spring curve value at the given frame.
 * Algorithm: Euler integration of the damped spring ODE.
 */
export function spring(opts: {
  frame: number;
  fps: number;
  config?: Partial<SpringConfig>;
  from?: number;
  to?: number;
}): number {
  const config: SpringConfig = { ...DEFAULT_SPRING, ...opts.config };
  const { frame, fps } = opts;
  const from = opts.from ?? 0;
  const to = opts.to ?? 1;

  if (frame <= 0) return from;

  const key = springCacheKey(fps, config);
  let cached = springCache.get(key);

  if (!cached || cached.length <= frame) {
    cached = computeSpringCurve(fps, config, Math.max(frame + 1, 300));
    springCache.set(key, cached);
  }

  const progress = cached[Math.min(frame, cached.length - 1)];
  return from + (to - from) * progress;
}

function computeSpringCurve(fps: number, config: SpringConfig, maxFrames: number): number[] {
  const { stiffness: k, damping: c, mass: m, overshootClamping } = config;
  const dt = 1 / fps;

  let position = 0;  // starts at 0, target is 1
  let velocity = 0;
  const values: number[] = [0];

  for (let i = 1; i < maxFrames; i++) {
    const springForce = -k * (position - 1);  // toward target (1)
    const dampingForce = -c * velocity;
    const acceleration = (springForce + dampingForce) / m;

    velocity += acceleration * dt;
    position += velocity * dt;

    if (overshootClamping && position > 1) {
      position = 1;
      velocity = 0;
    }

    values.push(position);

    // Stop if settled (close enough to 1 with near-zero velocity)
    if (Math.abs(position - 1) < 0.001 && Math.abs(velocity) < 0.001) {
      // Fill remaining frames with 1
      for (let j = i + 1; j < maxFrames; j++) values.push(1);
      break;
    }
  }

  return values;
}

// ─── Utility: ms to frames ──────────────────────────────────

export function msToFrames(ms: number, fps: number): number {
  return Math.round(ms * fps / 1000);
}

export function framesToMs(frames: number, fps: number): number {
  return Math.round(frames * 1000 / fps);
}
