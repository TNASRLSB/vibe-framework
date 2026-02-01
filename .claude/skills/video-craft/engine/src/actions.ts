// CSS @keyframes database for entrances, exits, and transitions

export type EnergyLevel = 'minimal' | 'low' | 'medium' | 'high' | 'special';

export interface AnimationDef {
  id: string;
  name: string;
  energy: EnergyLevel;
  durationRange: [number, number]; // [min, max] in ms
  keyframes: string;               // CSS @keyframes body
  initialStyle: string;            // CSS applied before animation starts (e.g., opacity: 0)
  fillMode: string;                // usually 'forwards'
  continuous?: boolean;            // if true, animation loops infinitely (no fill-mode)
}

// ─── ENTRANCES ───────────────────────────────────────────────

export const ENTRANCES: Record<string, AnimationDef> = {
  'fade-in': {
    id: 'fade-in', name: 'Fade In', energy: 'minimal',
    durationRange: [300, 800],
    keyframes: `from { opacity: 0; } to { opacity: 1; }`,
    initialStyle: 'opacity: 0;',
    fillMode: 'forwards',
  },
  'fade-in-up': {
    id: 'fade-in-up', name: 'Fade In Up', energy: 'minimal',
    durationRange: [300, 800],
    keyframes: `from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`,
    initialStyle: 'opacity: 0; transform: translateY(20px);',
    fillMode: 'forwards',
  },
  'fade-in-down': {
    id: 'fade-in-down', name: 'Fade In Down', energy: 'minimal',
    durationRange: [300, 800],
    keyframes: `from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); }`,
    initialStyle: 'opacity: 0; transform: translateY(-20px);',
    fillMode: 'forwards',
  },
  'fade-in-left': {
    id: 'fade-in-left', name: 'Fade In Left', energy: 'minimal',
    durationRange: [300, 800],
    keyframes: `from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); }`,
    initialStyle: 'opacity: 0; transform: translateX(-20px);',
    fillMode: 'forwards',
  },
  'fade-in-right': {
    id: 'fade-in-right', name: 'Fade In Right', energy: 'minimal',
    durationRange: [300, 800],
    keyframes: `from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); }`,
    initialStyle: 'opacity: 0; transform: translateX(20px);',
    fillMode: 'forwards',
  },
  'soft-reveal': {
    id: 'soft-reveal', name: 'Soft Reveal', energy: 'minimal',
    durationRange: [400, 1000],
    keyframes: `from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); }`,
    initialStyle: 'opacity: 0; transform: scale(0.98);',
    fillMode: 'forwards',
  },
  'slide-up': {
    id: 'slide-up', name: 'Slide Up', energy: 'low',
    durationRange: [300, 700],
    keyframes: `from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); }`,
    initialStyle: 'opacity: 0; transform: translateY(100%);',
    fillMode: 'forwards',
  },
  'slide-down': {
    id: 'slide-down', name: 'Slide Down', energy: 'low',
    durationRange: [300, 700],
    keyframes: `from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: translateY(0); }`,
    initialStyle: 'opacity: 0; transform: translateY(-100%);',
    fillMode: 'forwards',
  },
  'slide-left': {
    id: 'slide-left', name: 'Slide Left', energy: 'low',
    durationRange: [300, 700],
    keyframes: `from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); }`,
    initialStyle: 'opacity: 0; transform: translateX(100%);',
    fillMode: 'forwards',
  },
  'slide-right': {
    id: 'slide-right', name: 'Slide Right', energy: 'low',
    durationRange: [300, 700],
    keyframes: `from { opacity: 0; transform: translateX(-100%); } to { opacity: 1; transform: translateX(0); }`,
    initialStyle: 'opacity: 0; transform: translateX(-100%);',
    fillMode: 'forwards',
  },
  'grow': {
    id: 'grow', name: 'Grow', energy: 'low',
    durationRange: [300, 600],
    keyframes: `from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); }`,
    initialStyle: 'opacity: 0; transform: scale(0);',
    fillMode: 'forwards',
  },
  'clip-reveal-up': {
    id: 'clip-reveal-up', name: 'Clip Reveal Up', energy: 'low',
    durationRange: [400, 800],
    keyframes: `from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); }`,
    initialStyle: 'clip-path: inset(100% 0 0 0);',
    fillMode: 'forwards',
  },
  'clip-reveal-down': {
    id: 'clip-reveal-down', name: 'Clip Reveal Down', energy: 'low',
    durationRange: [400, 800],
    keyframes: `from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); }`,
    initialStyle: 'clip-path: inset(0 0 100% 0);',
    fillMode: 'forwards',
  },
  'clip-reveal-left': {
    id: 'clip-reveal-left', name: 'Clip Reveal Left', energy: 'low',
    durationRange: [400, 800],
    keyframes: `from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); }`,
    initialStyle: 'clip-path: inset(0 100% 0 0);',
    fillMode: 'forwards',
  },
  'clip-reveal-right': {
    id: 'clip-reveal-right', name: 'Clip Reveal Right', energy: 'low',
    durationRange: [400, 800],
    keyframes: `from { clip-path: inset(0 0 0 100%); } to { clip-path: inset(0 0 0 0); }`,
    initialStyle: 'clip-path: inset(0 0 0 100%);',
    fillMode: 'forwards',
  },
  'bounce-in': {
    id: 'bounce-in', name: 'Bounce In', energy: 'medium',
    durationRange: [500, 900],
    keyframes: `0% { opacity: 0; transform: scale(0); } 60% { opacity: 1; transform: scale(1.1); } 80% { transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); }`,
    initialStyle: 'opacity: 0; transform: scale(0);',
    fillMode: 'forwards',
  },
  'bounce-in-up': {
    id: 'bounce-in-up', name: 'Bounce In Up', energy: 'medium',
    durationRange: [500, 900],
    keyframes: `0% { opacity: 0; transform: translateY(60px); } 60% { opacity: 1; transform: translateY(-10px); } 80% { transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); }`,
    initialStyle: 'opacity: 0; transform: translateY(60px);',
    fillMode: 'forwards',
  },
  'bounce-in-down': {
    id: 'bounce-in-down', name: 'Bounce In Down', energy: 'medium',
    durationRange: [500, 900],
    keyframes: `0% { opacity: 0; transform: translateY(-60px); } 60% { opacity: 1; transform: translateY(10px); } 80% { transform: translateY(-5px); } 100% { opacity: 1; transform: translateY(0); }`,
    initialStyle: 'opacity: 0; transform: translateY(-60px);',
    fillMode: 'forwards',
  },
  'elastic-in': {
    id: 'elastic-in', name: 'Elastic In', energy: 'medium',
    durationRange: [600, 1200],
    keyframes: `0% { opacity: 0; transform: scale(0.3); } 50% { opacity: 1; transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); }`,
    initialStyle: 'opacity: 0; transform: scale(0.3);',
    fillMode: 'forwards',
  },
  'swing-in': {
    id: 'swing-in', name: 'Swing In', energy: 'medium',
    durationRange: [500, 1000],
    keyframes: `0% { opacity: 0; transform: rotateX(-90deg); } 60% { opacity: 1; transform: rotateX(10deg); } 80% { transform: rotateX(-5deg); } 100% { opacity: 1; transform: rotateX(0); }`,
    initialStyle: 'opacity: 0; transform: rotateX(-90deg); transform-origin: top;',
    fillMode: 'forwards',
  },
  'flip-in-x': {
    id: 'flip-in-x', name: 'Flip In X', energy: 'medium',
    durationRange: [400, 800],
    keyframes: `from { opacity: 0; transform: rotateX(90deg); } to { opacity: 1; transform: rotateX(0); }`,
    initialStyle: 'opacity: 0; transform: rotateX(90deg);',
    fillMode: 'forwards',
  },
  'flip-in-y': {
    id: 'flip-in-y', name: 'Flip In Y', energy: 'medium',
    durationRange: [400, 800],
    keyframes: `from { opacity: 0; transform: rotateY(90deg); } to { opacity: 1; transform: rotateY(0); }`,
    initialStyle: 'opacity: 0; transform: rotateY(90deg);',
    fillMode: 'forwards',
  },
  'zoom-in': {
    id: 'zoom-in', name: 'Zoom In', energy: 'medium',
    durationRange: [300, 700],
    keyframes: `from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); }`,
    initialStyle: 'opacity: 0; transform: scale(0.3);',
    fillMode: 'forwards',
  },
  'zoom-in-rotate': {
    id: 'zoom-in-rotate', name: 'Zoom In Rotate', energy: 'medium',
    durationRange: [400, 800],
    keyframes: `from { opacity: 0; transform: scale(0.3) rotate(-15deg); } to { opacity: 1; transform: scale(1) rotate(0); }`,
    initialStyle: 'opacity: 0; transform: scale(0.3) rotate(-15deg);',
    fillMode: 'forwards',
  },
  'roll-in': {
    id: 'roll-in', name: 'Roll In', energy: 'medium',
    durationRange: [500, 1000],
    keyframes: `from { opacity: 0; transform: translateX(-100%) rotate(-120deg); } to { opacity: 1; transform: translateX(0) rotate(0); }`,
    initialStyle: 'opacity: 0; transform: translateX(-100%) rotate(-120deg);',
    fillMode: 'forwards',
  },
  'slam': {
    id: 'slam', name: 'Slam', energy: 'high',
    durationRange: [200, 500],
    keyframes: `from { opacity: 0; transform: scale(3); } to { opacity: 1; transform: scale(1); }`,
    initialStyle: 'opacity: 0; transform: scale(3);',
    fillMode: 'forwards',
  },
  'drop': {
    id: 'drop', name: 'Drop', energy: 'high',
    durationRange: [400, 800],
    keyframes: `0% { opacity: 0; transform: translateY(-500px); } 60% { opacity: 1; transform: translateY(20px); } 80% { transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); }`,
    initialStyle: 'opacity: 0; transform: translateY(-500px);',
    fillMode: 'forwards',
  },
  'whip-in-left': {
    id: 'whip-in-left', name: 'Whip In Left', energy: 'high',
    durationRange: [200, 500],
    keyframes: `from { opacity: 0; transform: translateX(-200%); } to { opacity: 1; transform: translateX(0); }`,
    initialStyle: 'opacity: 0; transform: translateX(-200%);',
    fillMode: 'forwards',
  },
  'whip-in-right': {
    id: 'whip-in-right', name: 'Whip In Right', energy: 'high',
    durationRange: [200, 500],
    keyframes: `from { opacity: 0; transform: translateX(200%); } to { opacity: 1; transform: translateX(0); }`,
    initialStyle: 'opacity: 0; transform: translateX(200%);',
    fillMode: 'forwards',
  },
  'glitch-in': {
    id: 'glitch-in', name: 'Glitch In', energy: 'high',
    durationRange: [300, 600],
    keyframes: `0% { opacity: 0; transform: translate(-5px, 3px); filter: hue-rotate(90deg); } 20% { opacity: 0.8; transform: translate(3px, -2px); filter: hue-rotate(180deg); } 40% { opacity: 0.6; transform: translate(-2px, 1px); filter: hue-rotate(270deg); } 60% { opacity: 0.9; transform: translate(1px, -1px); filter: hue-rotate(45deg); } 80% { opacity: 1; transform: translate(-1px, 0); filter: hue-rotate(0deg); } 100% { opacity: 1; transform: translate(0, 0); filter: hue-rotate(0deg); }`,
    initialStyle: 'opacity: 0;',
    fillMode: 'forwards',
  },
  'flash-in': {
    id: 'flash-in', name: 'Flash In', energy: 'high',
    durationRange: [200, 400],
    keyframes: `0% { opacity: 0; filter: brightness(5); } 50% { opacity: 1; filter: brightness(3); } 100% { opacity: 1; filter: brightness(1); }`,
    initialStyle: 'opacity: 0;',
    fillMode: 'forwards',
  },
  'pixel-in': {
    id: 'pixel-in', name: 'Pixel In', energy: 'high',
    durationRange: [400, 800],
    keyframes: `from { opacity: 0; filter: blur(20px); transform: scale(1.1); } to { opacity: 1; filter: blur(0); transform: scale(1); }`,
    initialStyle: 'opacity: 0; filter: blur(20px); transform: scale(1.1);',
    fillMode: 'forwards',
  },
  'blur-in': {
    id: 'blur-in', name: 'Blur In', energy: 'special',
    durationRange: [300, 700],
    keyframes: `from { opacity: 0; filter: blur(10px); } to { opacity: 1; filter: blur(0); }`,
    initialStyle: 'opacity: 0; filter: blur(10px);',
    fillMode: 'forwards',
  },
  'highlight-text': {
    id: 'highlight-text', name: 'Highlight Text', energy: 'special',
    durationRange: [400, 800],
    keyframes: `from { background-size: 0% 100%; } to { background-size: 100% 100%; }`,
    initialStyle: 'background-repeat: no-repeat; background-size: 0% 100%;',
    fillMode: 'forwards',
  },
  'underline-draw': {
    id: 'underline-draw', name: 'Underline Draw', energy: 'special',
    durationRange: [300, 600],
    keyframes: `from { background-size: 0% 3px; } to { background-size: 100% 3px; }`,
    initialStyle: 'background-image: linear-gradient(currentColor, currentColor); background-position: 0 100%; background-repeat: no-repeat; background-size: 0% 3px; padding-bottom: 4px;',
    fillMode: 'forwards',
  },
  'typewriter': {
    id: 'typewriter', name: 'Typewriter', energy: 'special',
    durationRange: [800, 3000],
    keyframes: `from { max-width: 0; } to { max-width: 100%; }`,
    initialStyle: 'overflow: hidden; white-space: nowrap; max-width: 0; border-right: 2px solid currentColor;',
    fillMode: 'forwards',
  },
  'split-reveal': {
    id: 'split-reveal', name: 'Split Reveal', energy: 'special',
    durationRange: [400, 800],
    keyframes: `from { clip-path: inset(0 50% 0 50%); opacity: 0; } to { clip-path: inset(0 0 0 0); opacity: 1; }`,
    initialStyle: 'clip-path: inset(0 50% 0 50%); opacity: 0;',
    fillMode: 'forwards',
  },
  'rise-and-fade': {
    id: 'rise-and-fade', name: 'Rise and Fade', energy: 'minimal',
    durationRange: [400, 900],
    keyframes: `from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); }`,
    initialStyle: 'opacity: 0; transform: translateY(30px) scale(0.95);',
    fillMode: 'forwards',
  },
  'letter-spacing-in': {
    id: 'letter-spacing-in', name: 'Letter Spacing In', energy: 'special',
    durationRange: [400, 800],
    keyframes: `from { opacity: 0; letter-spacing: 0.5em; } to { opacity: 1; letter-spacing: normal; }`,
    initialStyle: 'opacity: 0; letter-spacing: 0.5em;',
    fillMode: 'forwards',
  },
  'stamp': {
    id: 'stamp', name: 'Stamp', energy: 'high',
    durationRange: [150, 400],
    keyframes: `0% { opacity: 0; transform: scale(4) rotate(-10deg); } 70% { opacity: 1; transform: scale(0.95) rotate(1deg); } 100% { opacity: 1; transform: scale(1) rotate(0); }`,
    initialStyle: 'opacity: 0; transform: scale(4) rotate(-10deg);',
    fillMode: 'forwards',
  },

  // ─── SPRING VARIANTS (overshoot + settle) ─────────────────
  'spring-up': {
    id: 'spring-up', name: 'Spring Up', energy: 'medium',
    durationRange: [500, 900],
    keyframes: `0% { opacity: 0; transform: translateY(40px); } 60% { opacity: 1; transform: translateY(-8px); } 75% { transform: translateY(3px); } 90% { transform: translateY(-1px); } 100% { opacity: 1; transform: translateY(0); }`,
    initialStyle: 'opacity: 0; transform: translateY(40px);',
    fillMode: 'forwards',
  },
  'spring-scale': {
    id: 'spring-scale', name: 'Spring Scale', energy: 'medium',
    durationRange: [500, 900],
    keyframes: `0% { opacity: 0; transform: scale(0.5); } 55% { opacity: 1; transform: scale(1.08); } 70% { transform: scale(0.96); } 85% { transform: scale(1.02); } 100% { opacity: 1; transform: scale(1); }`,
    initialStyle: 'opacity: 0; transform: scale(0.5);',
    fillMode: 'forwards',
  },
  'spring-left': {
    id: 'spring-left', name: 'Spring Left', energy: 'medium',
    durationRange: [500, 900],
    keyframes: `0% { opacity: 0; transform: translateX(60px); } 55% { opacity: 1; transform: translateX(-10px); } 70% { transform: translateX(4px); } 85% { transform: translateX(-2px); } 100% { opacity: 1; transform: translateX(0); }`,
    initialStyle: 'opacity: 0; transform: translateX(60px);',
    fillMode: 'forwards',
  },

  // ─── KINETIC TYPOGRAPHY ───────────────────────────────────
  'word-by-word': {
    id: 'word-by-word', name: 'Word by Word', energy: 'special',
    durationRange: [800, 2000],
    keyframes: `from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); }`,
    initialStyle: 'opacity: 0; transform: translateY(15px);',
    fillMode: 'forwards',
  },
  'char-stagger': {
    id: 'char-stagger', name: 'Char Stagger', energy: 'special',
    durationRange: [1000, 3000],
    keyframes: `from { opacity: 0; transform: translateY(10px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); }`,
    initialStyle: 'opacity: 0; transform: translateY(10px) scale(0.8);',
    fillMode: 'forwards',
  },
  'kinetic-push': {
    id: 'kinetic-push', name: 'Kinetic Push', energy: 'high',
    durationRange: [300, 600],
    keyframes: `0% { opacity: 0; transform: translateX(-100%) scaleX(1.3) scaleY(0.8); } 60% { opacity: 1; transform: translateX(5%) scaleX(0.95) scaleY(1.02); } 100% { opacity: 1; transform: translateX(0) scaleX(1) scaleY(1); }`,
    initialStyle: 'opacity: 0; transform: translateX(-100%) scaleX(1.3) scaleY(0.8);',
    fillMode: 'forwards',
  },
  'text-reveal-mask': {
    id: 'text-reveal-mask', name: 'Text Reveal Mask', energy: 'special',
    durationRange: [500, 1000],
    keyframes: `from { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); } to { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }`,
    initialStyle: 'clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);',
    fillMode: 'forwards',
  },
  'scale-word': {
    id: 'scale-word', name: 'Scale Word', energy: 'high',
    durationRange: [300, 600],
    keyframes: `0% { opacity: 0; transform: scale(3); filter: blur(8px); } 70% { opacity: 1; transform: scale(0.95); filter: blur(0); } 100% { opacity: 1; transform: scale(1); filter: blur(0); }`,
    initialStyle: 'opacity: 0; transform: scale(3); filter: blur(8px);',
    fillMode: 'forwards',
  },

  // ─── MORPH / CLIP-PATH ────────────────────────────────────
  'morph-circle-in': {
    id: 'morph-circle-in', name: 'Morph Circle In', energy: 'medium',
    durationRange: [500, 900],
    keyframes: `from { clip-path: circle(0% at 50% 50%); opacity: 0; } to { clip-path: circle(75% at 50% 50%); opacity: 1; }`,
    initialStyle: 'clip-path: circle(0% at 50% 50%); opacity: 0;',
    fillMode: 'forwards',
  },
  'morph-diamond-in': {
    id: 'morph-diamond-in', name: 'Morph Diamond In', energy: 'medium',
    durationRange: [500, 900],
    keyframes: `from { clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%); opacity: 0; } to { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); opacity: 1; }`,
    initialStyle: 'clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%); opacity: 0;',
    fillMode: 'forwards',
  },
  'morph-hexagon-in': {
    id: 'morph-hexagon-in', name: 'Morph Hexagon In', energy: 'medium',
    durationRange: [500, 900],
    keyframes: `from { clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%); opacity: 0; } to { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); opacity: 1; }`,
    initialStyle: 'clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%); opacity: 0;',
    fillMode: 'forwards',
  },

  // ─── ANTICIPATION (Disney-style) ──────────────────────────
  'anticipate-up': {
    id: 'anticipate-up', name: 'Anticipate Up', energy: 'medium',
    durationRange: [600, 1000],
    keyframes: `0% { opacity: 0; transform: translateY(30px); } 15% { opacity: 0.5; transform: translateY(35px); } 40% { opacity: 1; transform: translateY(-5px); } 65% { transform: translateY(2px); } 100% { opacity: 1; transform: translateY(0); }`,
    initialStyle: 'opacity: 0; transform: translateY(30px);',
    fillMode: 'forwards',
  },
  'anticipate-scale': {
    id: 'anticipate-scale', name: 'Anticipate Scale', energy: 'medium',
    durationRange: [600, 1000],
    keyframes: `0% { opacity: 0; transform: scale(0.7); } 15% { opacity: 0.3; transform: scale(0.65); } 50% { opacity: 1; transform: scale(1.06); } 75% { transform: scale(0.98); } 100% { opacity: 1; transform: scale(1); }`,
    initialStyle: 'opacity: 0; transform: scale(0.7);',
    fillMode: 'forwards',
  },

  // ─── CONTINUOUS (loop infinitely, no settle) ───────────────
  'traverse': {
    id: 'traverse', name: 'Traverse', energy: 'medium',
    durationRange: [4000, 8000],
    keyframes: `0% { opacity: 1; transform: translateX(-110%); } 100% { opacity: 1; transform: translateX(110%); }`,
    initialStyle: 'opacity: 1;',
    fillMode: 'none',
    continuous: true,
  },
  'marquee': {
    id: 'marquee', name: 'Marquee', energy: 'low',
    durationRange: [6000, 12000],
    keyframes: `0% { transform: translateX(100%); } 100% { transform: translateX(-100%); }`,
    initialStyle: 'white-space: nowrap; overflow: visible;',
    fillMode: 'none',
    continuous: true,
  },
  'float-drift': {
    id: 'float-drift', name: 'Float Drift', energy: 'minimal',
    durationRange: [3000, 6000],
    keyframes: `0% { opacity: 1; transform: translateY(0) translateX(0); } 25% { transform: translateY(-8px) translateX(4px); } 50% { transform: translateY(-4px) translateX(-3px); } 75% { transform: translateY(-10px) translateX(2px); } 100% { opacity: 1; transform: translateY(0) translateX(0); }`,
    initialStyle: 'opacity: 1;',
    fillMode: 'none',
    continuous: true,
  },
};

// ─── EXITS ───────────────────────────────────────────────────

export const EXITS: Record<string, AnimationDef> = {
  'fade-out': {
    id: 'fade-out', name: 'Fade Out', energy: 'minimal',
    durationRange: [300, 800],
    keyframes: `from { opacity: 1; } to { opacity: 0; }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'fade-out-up': {
    id: 'fade-out-up', name: 'Fade Out Up', energy: 'minimal',
    durationRange: [300, 800],
    keyframes: `from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'fade-out-down': {
    id: 'fade-out-down', name: 'Fade Out Down', energy: 'minimal',
    durationRange: [300, 800],
    keyframes: `from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'soft-hide': {
    id: 'soft-hide', name: 'Soft Hide', energy: 'minimal',
    durationRange: [400, 1000],
    keyframes: `from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.98); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'slide-out-up': {
    id: 'slide-out-up', name: 'Slide Out Up', energy: 'low',
    durationRange: [300, 700],
    keyframes: `from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-100%); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'slide-out-down': {
    id: 'slide-out-down', name: 'Slide Out Down', energy: 'low',
    durationRange: [300, 700],
    keyframes: `from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(100%); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'slide-out-left': {
    id: 'slide-out-left', name: 'Slide Out Left', energy: 'low',
    durationRange: [300, 700],
    keyframes: `from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-100%); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'slide-out-right': {
    id: 'slide-out-right', name: 'Slide Out Right', energy: 'low',
    durationRange: [300, 700],
    keyframes: `from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100%); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'shrink': {
    id: 'shrink', name: 'Shrink', energy: 'low',
    durationRange: [300, 600],
    keyframes: `from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'bounce-out': {
    id: 'bounce-out', name: 'Bounce Out', energy: 'medium',
    durationRange: [500, 900],
    keyframes: `0% { opacity: 1; transform: scale(1); } 40% { transform: scale(1.1); } 100% { opacity: 0; transform: scale(0); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'zoom-out': {
    id: 'zoom-out', name: 'Zoom Out', energy: 'medium',
    durationRange: [300, 700],
    keyframes: `from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.3); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'flip-out-x': {
    id: 'flip-out-x', name: 'Flip Out X', energy: 'medium',
    durationRange: [400, 800],
    keyframes: `from { opacity: 1; transform: rotateX(0); } to { opacity: 0; transform: rotateX(90deg); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'flip-out-y': {
    id: 'flip-out-y', name: 'Flip Out Y', energy: 'medium',
    durationRange: [400, 800],
    keyframes: `from { opacity: 1; transform: rotateY(0); } to { opacity: 0; transform: rotateY(90deg); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'elastic-out': {
    id: 'elastic-out', name: 'Elastic Out', energy: 'medium',
    durationRange: [600, 1200],
    keyframes: `0% { opacity: 1; transform: scale(1); } 30% { transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.05); } 100% { opacity: 0; transform: scale(0.3); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'swing-out': {
    id: 'swing-out', name: 'Swing Out', energy: 'medium',
    durationRange: [500, 1000],
    keyframes: `0% { opacity: 1; transform: rotateX(0); } 40% { transform: rotateX(-10deg); } 60% { transform: rotateX(5deg); } 100% { opacity: 0; transform: rotateX(90deg); }`,
    initialStyle: 'transform-origin: top;',
    fillMode: 'forwards',
  },
  'roll-out': {
    id: 'roll-out', name: 'Roll Out', energy: 'medium',
    durationRange: [500, 1000],
    keyframes: `from { opacity: 1; transform: translateX(0) rotate(0); } to { opacity: 0; transform: translateX(100%) rotate(120deg); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'clip-hide-up': {
    id: 'clip-hide-up', name: 'Clip Hide Up', energy: 'low',
    durationRange: [400, 800],
    keyframes: `from { clip-path: inset(0 0 0 0); } to { clip-path: inset(0 0 100% 0); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'clip-hide-down': {
    id: 'clip-hide-down', name: 'Clip Hide Down', energy: 'low',
    durationRange: [400, 800],
    keyframes: `from { clip-path: inset(0 0 0 0); } to { clip-path: inset(100% 0 0 0); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'clip-hide-left': {
    id: 'clip-hide-left', name: 'Clip Hide Left', energy: 'low',
    durationRange: [400, 800],
    keyframes: `from { clip-path: inset(0 0 0 0); } to { clip-path: inset(0 0 0 100%); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'clip-hide-right': {
    id: 'clip-hide-right', name: 'Clip Hide Right', energy: 'low',
    durationRange: [400, 800],
    keyframes: `from { clip-path: inset(0 0 0 0); } to { clip-path: inset(0 100% 0 0); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'whip-out-left': {
    id: 'whip-out-left', name: 'Whip Out Left', energy: 'high',
    durationRange: [200, 500],
    keyframes: `from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-200%); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'whip-out-right': {
    id: 'whip-out-right', name: 'Whip Out Right', energy: 'high',
    durationRange: [200, 500],
    keyframes: `from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(200%); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'flash-out': {
    id: 'flash-out', name: 'Flash Out', energy: 'high',
    durationRange: [200, 400],
    keyframes: `0% { opacity: 1; filter: brightness(1); } 50% { opacity: 1; filter: brightness(5); } 100% { opacity: 0; filter: brightness(1); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'glitch-out': {
    id: 'glitch-out', name: 'Glitch Out', energy: 'high',
    durationRange: [300, 600],
    keyframes: `0% { opacity: 1; transform: translate(0, 0); filter: hue-rotate(0deg); } 20% { opacity: 0.8; transform: translate(3px, -2px); filter: hue-rotate(90deg); } 40% { opacity: 0.6; transform: translate(-2px, 1px); filter: hue-rotate(180deg); } 60% { opacity: 0.3; transform: translate(1px, -1px); filter: hue-rotate(270deg); } 100% { opacity: 0; transform: translate(0, 0); filter: hue-rotate(0deg); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'pixel-out': {
    id: 'pixel-out', name: 'Pixel Out', energy: 'high',
    durationRange: [400, 800],
    keyframes: `from { opacity: 1; filter: blur(0); } to { opacity: 0; filter: blur(20px); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'blur-out': {
    id: 'blur-out', name: 'Blur Out', energy: 'special',
    durationRange: [300, 700],
    keyframes: `from { opacity: 1; filter: blur(0); } to { opacity: 0; filter: blur(10px); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'morph-circle-out': {
    id: 'morph-circle-out', name: 'Morph Circle Out', energy: 'medium',
    durationRange: [500, 900],
    keyframes: `from { clip-path: circle(75% at 50% 50%); opacity: 1; } to { clip-path: circle(0% at 50% 50%); opacity: 0; }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'spring-out-down': {
    id: 'spring-out-down', name: 'Spring Out Down', energy: 'medium',
    durationRange: [400, 700],
    keyframes: `0% { opacity: 1; transform: translateY(0); } 20% { transform: translateY(-8px); } 100% { opacity: 0; transform: translateY(50px); }`,
    initialStyle: '',
    fillMode: 'forwards',
  },
  'highlight-text-out': {
    id: 'highlight-text-out', name: 'Highlight Text Out', energy: 'special',
    durationRange: [400, 800],
    keyframes: `from { background-size: 100% 100%; } to { background-size: 0% 100%; }`,
    initialStyle: 'background-repeat: no-repeat; background-size: 100% 100%;',
    fillMode: 'forwards',
  },
  'underline-undraw': {
    id: 'underline-undraw', name: 'Underline Undraw', energy: 'special',
    durationRange: [300, 600],
    keyframes: `from { background-size: 100% 3px; } to { background-size: 0% 3px; }`,
    initialStyle: 'background-image: linear-gradient(currentColor, currentColor); background-position: 0 100%; background-repeat: no-repeat; background-size: 100% 3px; padding-bottom: 4px;',
    fillMode: 'forwards',
  },
};

// ─── TRANSITIONS (between scenes) ───────────────────────────

export interface TransitionDef {
  id: string;
  name: string;
  energy: EnergyLevel;
  durationRange: [number, number];
  // Transitions are implemented via CSS on scene containers
  // sceneA gets exitCss, sceneB gets enterCss
  sceneAKeyframes: string;
  sceneBKeyframes: string;
}

export const TRANSITIONS: Record<string, TransitionDef> = {
  'cut': {
    id: 'cut', name: 'Cut', energy: 'minimal',
    durationRange: [0, 0],
    sceneAKeyframes: `from { opacity: 1; } to { opacity: 0; }`,
    sceneBKeyframes: `from { opacity: 0; } to { opacity: 1; }`,
  },
  'fade': {
    id: 'fade', name: 'Fade', energy: 'minimal',
    durationRange: [300, 800],
    sceneAKeyframes: `from { opacity: 1; } to { opacity: 0; }`,
    sceneBKeyframes: `from { opacity: 0; } to { opacity: 1; }`,
  },
  'crossfade': {
    id: 'crossfade', name: 'Crossfade', energy: 'minimal',
    durationRange: [300, 1000],
    sceneAKeyframes: `from { opacity: 1; } to { opacity: 0; }`,
    sceneBKeyframes: `from { opacity: 0; } to { opacity: 1; }`,
  },
  'slide-left': {
    id: 'slide-left', name: 'Slide Left', energy: 'low',
    durationRange: [300, 700],
    sceneAKeyframes: `from { transform: translateX(0); } to { transform: translateX(-100%); }`,
    sceneBKeyframes: `from { transform: translateX(100%); } to { transform: translateX(0); }`,
  },
  'slide-right': {
    id: 'slide-right', name: 'Slide Right', energy: 'low',
    durationRange: [300, 700],
    sceneAKeyframes: `from { transform: translateX(0); } to { transform: translateX(100%); }`,
    sceneBKeyframes: `from { transform: translateX(-100%); } to { transform: translateX(0); }`,
  },
  'slide-up': {
    id: 'slide-up', name: 'Slide Up', energy: 'low',
    durationRange: [300, 700],
    sceneAKeyframes: `from { transform: translateY(0); } to { transform: translateY(-100%); }`,
    sceneBKeyframes: `from { transform: translateY(100%); } to { transform: translateY(0); }`,
  },
  'slide-down': {
    id: 'slide-down', name: 'Slide Down', energy: 'low',
    durationRange: [300, 700],
    sceneAKeyframes: `from { transform: translateY(0); } to { transform: translateY(100%); }`,
    sceneBKeyframes: `from { transform: translateY(-100%); } to { transform: translateY(0); }`,
  },
  'wipe-left': {
    id: 'wipe-left', name: 'Wipe Left', energy: 'medium',
    durationRange: [300, 700],
    sceneAKeyframes: `from { clip-path: inset(0 0 0 0); } to { clip-path: inset(0 100% 0 0); }`,
    sceneBKeyframes: `from { clip-path: inset(0 0 0 100%); } to { clip-path: inset(0 0 0 0); }`,
  },
  'wipe-right': {
    id: 'wipe-right', name: 'Wipe Right', energy: 'medium',
    durationRange: [300, 700],
    sceneAKeyframes: `from { clip-path: inset(0 0 0 0); } to { clip-path: inset(0 0 0 100%); }`,
    sceneBKeyframes: `from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); }`,
  },
  'circle-reveal': {
    id: 'circle-reveal', name: 'Circle Reveal', energy: 'medium',
    durationRange: [400, 800],
    sceneAKeyframes: `from { clip-path: circle(150% at 50% 50%); } to { clip-path: circle(0% at 50% 50%); }`,
    sceneBKeyframes: `from { clip-path: circle(0% at 50% 50%); } to { clip-path: circle(150% at 50% 50%); }`,
  },
  'flash': {
    id: 'flash', name: 'Flash', energy: 'high',
    durationRange: [150, 400],
    sceneAKeyframes: `0% { opacity: 1; filter: brightness(1); } 50% { opacity: 1; filter: brightness(5); } 100% { opacity: 0; filter: brightness(1); }`,
    sceneBKeyframes: `0% { opacity: 0; filter: brightness(5); } 50% { opacity: 1; filter: brightness(3); } 100% { opacity: 1; filter: brightness(1); }`,
  },
  'glitch': {
    id: 'glitch', name: 'Glitch', energy: 'high',
    durationRange: [200, 600],
    sceneAKeyframes: `0% { opacity: 1; } 30% { opacity: 0.8; transform: translate(5px, -3px); } 60% { opacity: 0.4; transform: translate(-3px, 2px); } 100% { opacity: 0; }`,
    sceneBKeyframes: `0% { opacity: 0; } 40% { opacity: 0.4; transform: translate(-3px, 2px); } 70% { opacity: 0.8; transform: translate(2px, -1px); } 100% { opacity: 1; transform: translate(0, 0); }`,
  },
  'zoom-in': {
    id: 'zoom-in', name: 'Zoom In', energy: 'medium',
    durationRange: [400, 800],
    sceneAKeyframes: `from { transform: scale(1); opacity: 1; } to { transform: scale(0.5); opacity: 0; }`,
    sceneBKeyframes: `from { transform: scale(2); opacity: 0; } to { transform: scale(1); opacity: 1; }`,
  },
  'zoom-out': {
    id: 'zoom-out', name: 'Zoom Out', energy: 'medium',
    durationRange: [400, 800],
    sceneAKeyframes: `from { transform: scale(1); opacity: 1; } to { transform: scale(2); opacity: 0; }`,
    sceneBKeyframes: `from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; }`,
  },
  'blur': {
    id: 'blur', name: 'Blur', energy: 'low',
    durationRange: [400, 800],
    sceneAKeyframes: `from { filter: blur(0); opacity: 1; } to { filter: blur(15px); opacity: 0; }`,
    sceneBKeyframes: `from { filter: blur(15px); opacity: 0; } to { filter: blur(0); opacity: 1; }`,
  },
  'push-left': {
    id: 'push-left', name: 'Push Left', energy: 'low',
    durationRange: [300, 700],
    sceneAKeyframes: `from { transform: translateX(0); } to { transform: translateX(-100%); }`,
    sceneBKeyframes: `from { transform: translateX(100%); } to { transform: translateX(0); }`,
  },
  'push-right': {
    id: 'push-right', name: 'Push Right', energy: 'low',
    durationRange: [300, 700],
    sceneAKeyframes: `from { transform: translateX(0); } to { transform: translateX(100%); }`,
    sceneBKeyframes: `from { transform: translateX(-100%); } to { transform: translateX(0); }`,
  },
  'push-up': {
    id: 'push-up', name: 'Push Up', energy: 'low',
    durationRange: [300, 700],
    sceneAKeyframes: `from { transform: translateY(0); } to { transform: translateY(-100%); }`,
    sceneBKeyframes: `from { transform: translateY(100%); } to { transform: translateY(0); }`,
  },
  'push-down': {
    id: 'push-down', name: 'Push Down', energy: 'low',
    durationRange: [300, 700],
    sceneAKeyframes: `from { transform: translateY(0); } to { transform: translateY(100%); }`,
    sceneBKeyframes: `from { transform: translateY(-100%); } to { transform: translateY(0); }`,
  },
  'diamond-reveal': {
    id: 'diamond-reveal', name: 'Diamond Reveal', energy: 'medium',
    durationRange: [400, 800],
    sceneAKeyframes: `from { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); } to { clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%); }`,
    sceneBKeyframes: `from { clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%); } to { clip-path: polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%); }`,
  },
  'rotate': {
    id: 'rotate', name: 'Rotate', energy: 'high',
    durationRange: [400, 800],
    sceneAKeyframes: `from { transform: rotate(0) scale(1); opacity: 1; } to { transform: rotate(90deg) scale(0.5); opacity: 0; }`,
    sceneBKeyframes: `from { transform: rotate(-90deg) scale(0.5); opacity: 0; } to { transform: rotate(0) scale(1); opacity: 1; }`,
  },
  'iris-open': {
    id: 'iris-open', name: 'Iris Open', energy: 'medium',
    durationRange: [400, 800],
    sceneAKeyframes: `from { opacity: 1; } to { opacity: 0; }`,
    sceneBKeyframes: `from { clip-path: circle(0% at 50% 50%); } to { clip-path: circle(150% at 50% 50%); }`,
  },
  'iris-close': {
    id: 'iris-close', name: 'Iris Close', energy: 'medium',
    durationRange: [400, 800],
    sceneAKeyframes: `from { clip-path: circle(150% at 50% 50%); } to { clip-path: circle(0% at 50% 50%); }`,
    sceneBKeyframes: `from { opacity: 0; } to { opacity: 1; }`,
  },
  // ─── MORPH TRANSITIONS ──────────────────────────────────
  'morph-reveal': {
    id: 'morph-reveal', name: 'Morph Reveal', energy: 'medium',
    durationRange: [500, 900],
    sceneAKeyframes: `from { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } to { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }`,
    sceneBKeyframes: `from { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); } to { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }`,
  },
  'diagonal-wipe': {
    id: 'diagonal-wipe', name: 'Diagonal Wipe', energy: 'medium',
    durationRange: [400, 800],
    sceneAKeyframes: `from { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } to { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); }`,
    sceneBKeyframes: `from { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); } to { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }`,
  },
  'scale-reveal': {
    id: 'scale-reveal', name: 'Scale Reveal', energy: 'medium',
    durationRange: [500, 900],
    sceneAKeyframes: `from { transform: scale(1); opacity: 1; } to { transform: scale(0.8); opacity: 0; filter: blur(5px); }`,
    sceneBKeyframes: `from { transform: scale(1.2); opacity: 0; filter: blur(5px); } to { transform: scale(1); opacity: 1; filter: blur(0); }`,
  },
};

// ─── EMPHASIS (attention-getters for already-visible elements) ──

export const EMPHASIS: Record<string, AnimationDef> = {
  'pulse': {
    id: 'pulse', name: 'Pulse', energy: 'low',
    durationRange: [400, 800],
    keyframes: `0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'shake': {
    id: 'shake', name: 'Shake', energy: 'medium',
    durationRange: [300, 600],
    keyframes: `0%, 100% { transform: translateX(0); } 10%, 50%, 90% { transform: translateX(-4px); } 30%, 70% { transform: translateX(4px); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'wiggle': {
    id: 'wiggle', name: 'Wiggle', energy: 'medium',
    durationRange: [400, 800],
    keyframes: `0%, 100% { transform: rotate(0); } 25% { transform: rotate(-3deg); } 75% { transform: rotate(3deg); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'heartbeat': {
    id: 'heartbeat', name: 'Heartbeat', energy: 'medium',
    durationRange: [600, 1000],
    keyframes: `0%, 100% { transform: scale(1); } 14% { transform: scale(1.1); } 28% { transform: scale(1); } 42% { transform: scale(1.1); } 70% { transform: scale(1); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'jello': {
    id: 'jello', name: 'Jello', energy: 'medium',
    durationRange: [500, 900],
    keyframes: `0%, 100% { transform: skewX(0) skewY(0); } 30% { transform: skewX(-6deg) skewY(-6deg); } 40% { transform: skewX(4deg) skewY(4deg); } 50% { transform: skewX(-3deg) skewY(-3deg); } 65% { transform: skewX(1.5deg) skewY(1.5deg); } 75% { transform: skewX(-0.5deg) skewY(-0.5deg); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'rubber-band': {
    id: 'rubber-band', name: 'Rubber Band', energy: 'high',
    durationRange: [400, 800],
    keyframes: `0% { transform: scaleX(1) scaleY(1); } 30% { transform: scaleX(1.25) scaleY(0.75); } 40% { transform: scaleX(0.75) scaleY(1.25); } 50% { transform: scaleX(1.15) scaleY(0.85); } 65% { transform: scaleX(0.95) scaleY(1.05); } 75% { transform: scaleX(1.05) scaleY(0.95); } 100% { transform: scaleX(1) scaleY(1); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'tada': {
    id: 'tada', name: 'Tada', energy: 'high',
    durationRange: [500, 1000],
    keyframes: `0% { transform: scale(1) rotate(0); } 10%, 20% { transform: scale(0.9) rotate(-3deg); } 30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); } 40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); } 100% { transform: scale(1) rotate(0); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'flash-attention': {
    id: 'flash-attention', name: 'Flash Attention', energy: 'high',
    durationRange: [300, 600],
    keyframes: `0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: 0.3; }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'color-pop': {
    id: 'color-pop', name: 'Color Pop', energy: 'special',
    durationRange: [400, 800],
    keyframes: `0%, 100% { filter: brightness(1) saturate(1); } 50% { filter: brightness(1.3) saturate(1.5); }`,
    initialStyle: '',
    fillMode: 'none',
  },
};

// ─── LOOPING (continuous animations for living elements) ─────

export const LOOPING: Record<string, AnimationDef> = {
  'float': {
    id: 'float', name: 'Float', energy: 'minimal',
    durationRange: [2000, 4000],
    keyframes: `0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'breathe': {
    id: 'breathe', name: 'Breathe', energy: 'minimal',
    durationRange: [3000, 5000],
    keyframes: `0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: 0.9; }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'gentle-rotate': {
    id: 'gentle-rotate', name: 'Gentle Rotate', energy: 'minimal',
    durationRange: [4000, 8000],
    keyframes: `from { transform: rotate(0); } to { transform: rotate(360deg); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'sway': {
    id: 'sway', name: 'Sway', energy: 'low',
    durationRange: [2000, 4000],
    keyframes: `0%, 100% { transform: rotate(0); } 25% { transform: rotate(2deg); } 75% { transform: rotate(-2deg); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'shimmer': {
    id: 'shimmer', name: 'Shimmer', energy: 'low',
    durationRange: [2000, 3000],
    keyframes: `0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.15); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'bob': {
    id: 'bob', name: 'Bob', energy: 'low',
    durationRange: [1500, 3000],
    keyframes: `0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'glow-pulse': {
    id: 'glow-pulse', name: 'Glow Pulse', energy: 'medium',
    durationRange: [2000, 4000],
    keyframes: `0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); } 50% { box-shadow: 0 0 20px 5px rgba(255,255,255,0.15); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'drift-horizontal': {
    id: 'drift-horizontal', name: 'Drift Horizontal', energy: 'minimal',
    durationRange: [3000, 6000],
    keyframes: `0%, 100% { transform: translateX(0); } 50% { transform: translateX(6px); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'rotate-breathe': {
    id: 'rotate-breathe', name: 'Rotate Breathe', energy: 'low',
    durationRange: [4000, 8000],
    keyframes: `0%, 100% { transform: rotate(0) scale(1); } 50% { transform: rotate(1deg) scale(1.01); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'color-shift': {
    id: 'color-shift', name: 'Color Shift', energy: 'low',
    durationRange: [3000, 6000],
    keyframes: `0%, 100% { filter: hue-rotate(0deg); } 50% { filter: hue-rotate(15deg); }`,
    initialStyle: '',
    fillMode: 'none',
  },
  'shadow-breathe': {
    id: 'shadow-breathe', name: 'Shadow Breathe', energy: 'minimal',
    durationRange: [3000, 5000],
    keyframes: `0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.2); } 50% { box-shadow: 0 8px 24px rgba(0,0,0,0.35); }`,
    initialStyle: '',
    fillMode: 'none',
  },
};

// ─── MODE POOLS ──────────────────────────────────────────────

const SAFE_ENTRANCE_IDS = [
  'fade-in', 'fade-in-up', 'fade-in-down', 'fade-in-left', 'fade-in-right', 'soft-reveal',
  'slide-up', 'slide-down', 'slide-left', 'slide-right', 'grow',
  'clip-reveal-up', 'clip-reveal-down', 'clip-reveal-left', 'clip-reveal-right',
  'zoom-in', 'blur-in', 'highlight-text', 'underline-draw',
  'rise-and-fade', 'typewriter', 'letter-spacing-in',
  'spring-up', 'spring-scale', 'spring-left',
  'text-reveal-mask', 'morph-circle-in',
  'anticipate-up', 'anticipate-scale',
];

const SAFE_EXIT_IDS = [
  'fade-out', 'fade-out-up', 'fade-out-down', 'soft-hide',
  'slide-out-up', 'slide-out-down', 'slide-out-left', 'slide-out-right', 'shrink',
  'clip-hide-up', 'clip-hide-down', 'clip-hide-left', 'clip-hide-right',
  'blur-out', 'highlight-text-out', 'underline-undraw',
  'morph-circle-out', 'spring-out-down',
];

const SAFE_TRANSITION_IDS = [
  'cut', 'fade', 'crossfade',
  'slide-left', 'slide-right', 'slide-up', 'slide-down',
  'blur', 'push-left', 'push-right', 'push-up', 'push-down',
  'morph-reveal', 'scale-reveal', 'wipe-left', 'wipe-right',
];

const SAFE_EMPHASIS_IDS = ['pulse', 'color-pop', 'heartbeat'];
const SAFE_LOOPING_IDS = ['float', 'breathe', 'shimmer', 'bob', 'drift-horizontal', 'shadow-breathe'];

export function getEntrancePool(mode: string): AnimationDef[] {
  if (mode === 'chaos' || mode === 'cocomelon') return Object.values(ENTRANCES);
  // safe and hybrid base pool
  return SAFE_ENTRANCE_IDS.map(id => ENTRANCES[id]).filter(Boolean);
}

export function getExitPool(mode: string): AnimationDef[] {
  if (mode === 'chaos' || mode === 'cocomelon') return Object.values(EXITS);
  return SAFE_EXIT_IDS.map(id => EXITS[id]).filter(Boolean);
}

export function getTransitionPool(mode: string): TransitionDef[] {
  if (mode === 'chaos' || mode === 'cocomelon') return Object.values(TRANSITIONS);
  return SAFE_TRANSITION_IDS.map(id => TRANSITIONS[id]).filter(Boolean);
}

export function getEmphasisPool(mode: string): AnimationDef[] {
  if (mode === 'chaos' || mode === 'cocomelon') return Object.values(EMPHASIS);
  return SAFE_EMPHASIS_IDS.map(id => EMPHASIS[id]).filter(Boolean);
}

export function getLoopingPool(mode: string): AnimationDef[] {
  if (mode === 'chaos' || mode === 'cocomelon') return Object.values(LOOPING);
  return SAFE_LOOPING_IDS.map(id => LOOPING[id]).filter(Boolean);
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get entrance pool filtered by industry profile preferences.
 * Returns preferred entrances that exist in the base pool, with fallback to full pool.
 */
export function getEntrancePoolForProfile(
  mode: string,
  preferredIds: string[],
  allowedEnergy: EnergyLevel[],
): AnimationDef[] {
  const basePool = getEntrancePool(mode);
  // Filter by preferred IDs first
  const preferred = preferredIds
    .map(id => ENTRANCES[id])
    .filter((d): d is AnimationDef => !!d && allowedEnergy.includes(d.energy));
  if (preferred.length >= 3) return preferred;
  // Fallback: filter base pool by energy level
  const filtered = basePool.filter(d => allowedEnergy.includes(d.energy));
  return filtered.length > 0 ? filtered : basePool;
}

/**
 * Get exit pool filtered by industry profile preferences.
 */
export function getExitPoolForProfile(
  mode: string,
  preferredIds: string[],
): AnimationDef[] {
  const basePool = getExitPool(mode);
  const preferred = preferredIds
    .map(id => EXITS[id])
    .filter((d): d is AnimationDef => !!d);
  return preferred.length >= 2 ? preferred : basePool;
}

/**
 * Get transition pool filtered by industry profile preferences.
 */
export function getTransitionPoolForProfile(
  mode: string,
  preferredIds: string[],
): TransitionDef[] {
  const basePool = getTransitionPool(mode);
  const preferred = preferredIds
    .map(id => TRANSITIONS[id])
    .filter((d): d is TransitionDef => !!d);
  return preferred.length >= 2 ? preferred : basePool;
}

export function defaultEntranceDuration(def: AnimationDef): number {
  // midpoint of range
  return Math.round((def.durationRange[0] + def.durationRange[1]) / 2);
}

export function defaultTransitionDuration(def: TransitionDef): number {
  if (def.durationRange[1] === 0) return 0;
  return Math.round((def.durationRange[0] + def.durationRange[1]) / 2);
}
