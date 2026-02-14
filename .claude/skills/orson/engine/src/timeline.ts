// Frame-addressed timeline compiler (v3)
// Takes Config → frame-addressed Timeline with RendererFrameAnimation[] per element.
// No CSS animation delays — every animation is expressed as { property, startFrame, endFrame, values }.

import type { Config, SceneConfig, ElementConfig } from './config.js';
import { getElementText } from './config.js';
import {
  computeSceneTimingFrames, parseDurationStr, msToFrames, framesToMs,
  type ElementTimingInput, type SceneTimingOptions,
} from './timing.js';
import {
  ENTRANCES, EXITS, TRANSITIONS,
  getEntrancePool, getTransitionPool,
  pickRandom, defaultEntranceDuration, defaultTransitionDuration,
  selectEntranceByRole,
  type AnimationDef, type TransitionDef, type PropertyDef, isMultiKeyframe,
} from './actions.js';
import type { AnimatableProperty, EasingId } from './interpolate.js';
import type { RendererFrameAnimation } from './frame-renderer.js';
import type { SpeedPreset } from './presets.js';
import { SCENE_TYPES, type SceneTypeId } from './composition.js';
import { planChoreography } from './choreography.js';

// ─── Output Types ────────────────────────────────────────────

export interface TimelineElement {
  sceneIndex: number;
  elementIndex: number;
  element: ElementConfig;
  text: string;
  /** CSS selector for frame renderer: [data-el="s0-e0"] */
  domSelector: string;
  entranceId: string;
  exitId: string | null;
  /** Frame-addressed animations — one per animated property */
  animations: RendererFrameAnimation[];
  /** Ms values for audio/subtitle pipeline */
  startMs: number;
  endMs: number;
  holdMs: number;
  entranceDurationMs: number;
  exitDurationMs: number;
}

export interface TimelineScene {
  sceneIndex: number;
  scene: SceneConfig;
  startFrame: number;
  endFrame: number;
  elements: TimelineElement[];
  transition?: {
    type: string;
    startFrame: number;
    endFrame: number;
    durationFrames: number;
    outgoing: RendererFrameAnimation[];
    incoming: RendererFrameAnimation[];
  };
  /** Ms values for audio/subtitle pipeline */
  startMs: number;
  durationMs: number;
  transitionOutDurationMs: number;
}

export interface Timeline {
  scenes: TimelineScene[];
  totalDurationMs: number;
  fps: number;
  totalFrames: number;
}

// ─── Animation Expansion ─────────────────────────────────────

/**
 * Expand an AnimationDef into RendererFrameAnimation[] entries.
 * Each property in the def becomes a separate RendererFrameAnimation.
 */
function expandAnimation(
  def: AnimationDef,
  startFrame: number,
  durationFrames: number,
  easingOverride?: EasingId,
): RendererFrameAnimation[] {
  const result: RendererFrameAnimation[] = [];
  const endFrame = startFrame + Math.max(1, durationFrames);
  const easing = easingOverride ?? def.easing ?? 'easeOutCubic';

  for (const [prop, propDef] of Object.entries(def.properties)) {
    if (!propDef) continue;

    if (isMultiKeyframe(propDef)) {
      result.push({
        property: prop as AnimatableProperty,
        startFrame,
        endFrame,
        values: propDef.values,
        keyframes: propDef.keyframes,
        easing,
      });
    } else {
      result.push({
        property: prop as AnimatableProperty,
        startFrame,
        endFrame,
        values: [propDef.from, propDef.to],
        easing,
      });
    }
  }

  return result;
}

/**
 * Expand one side of a transition (outgoing or incoming) into RendererFrameAnimation[].
 */
function expandTransitionSide(
  properties: Partial<Record<AnimatableProperty, PropertyDef>>,
  startFrame: number,
  endFrame: number,
  easing: EasingId,
): RendererFrameAnimation[] {
  const result: RendererFrameAnimation[] = [];

  for (const [prop, propDef] of Object.entries(properties)) {
    if (!propDef) continue;

    if (isMultiKeyframe(propDef)) {
      result.push({
        property: prop as AnimatableProperty,
        startFrame,
        endFrame,
        values: propDef.values,
        keyframes: propDef.keyframes,
        easing,
      });
    } else {
      result.push({
        property: prop as AnimatableProperty,
        startFrame,
        endFrame,
        values: [propDef.from, propDef.to],
        easing,
      });
    }
  }

  return result;
}

// ─── Choreography: anticipation & follow-through ──────────────

/**
 * Generate anticipation RendererFrameAnimation[] — small reverse before main entrance.
 * Returns empty array if no anticipation applicable.
 */
function buildAnticipation(
  entranceId: string,
  startFrame: number,
  anticipationFrames: number,
): RendererFrameAnimation[] {
  if (anticipationFrames <= 0) return [];

  const endFrame = startFrame + anticipationFrames;

  // Movement-based entrances: small Y offset in wrong direction
  if (entranceId.includes('slide') || entranceId.includes('fade-in-up') || entranceId.includes('fade-in-down') ||
      entranceId.includes('spring-up') || entranceId.includes('bounce-in-up')) {
    return [{
      property: 'y', startFrame, endFrame,
      values: [0, 5], easing: 'easeInQuad',
    }];
  }
  // Scale-based entrances: small scale-down before
  if (entranceId.includes('grow') || entranceId.includes('zoom') || entranceId.includes('bounce-in') ||
      entranceId.includes('elastic') || entranceId.includes('spring-scale')) {
    return [{
      property: 'scale', startFrame, endFrame,
      values: [1, 0.95], easing: 'easeInQuad',
    }];
  }

  return [];
}

/**
 * Generate follow-through RendererFrameAnimation[] — slight overshoot after landing.
 * Returns empty array if no follow-through applicable.
 */
function buildFollowThrough(
  entranceId: string,
  startFrame: number,
  followFrames: number,
): RendererFrameAnimation[] {
  if (followFrames <= 0) return [];

  const endFrame = startFrame + followFrames;

  // Movement-based: small overshoot
  if (entranceId.includes('slide') || entranceId.includes('fade-in') ||
      entranceId.includes('spring-up') || entranceId.includes('bounce-in-up')) {
    return [{
      property: 'y', startFrame, endFrame,
      values: [-3, 0], keyframes: [0, 1], easing: 'easeOutQuad',
    }];
  }
  // Scale-based: small scale overshoot
  if (entranceId.includes('grow') || entranceId.includes('zoom') || entranceId.includes('spring-scale')) {
    return [{
      property: 'scale', startFrame, endFrame,
      values: [1.02, 1], keyframes: [0, 1], easing: 'easeOutQuad',
    }];
  }

  return [];
}

// ─── Main Timeline Builder ───────────────────────────────────

export function buildTimeline(config: Config): Timeline {
  const mode = config.video.mode as string;
  const speed = config.video.speed as SpeedPreset;
  const entranceSpeed = (config.video['entrance-speed'] ?? config.video.speed) as SpeedPreset;
  const fps = config.video.fps;

  const entrancePool = getEntrancePool(mode);
  const transitionPool = getTransitionPool(mode);

  // For safe mode: pick a consistent entrance for the whole video
  const safeEntrance = pickRandom(entrancePool);
  let hybridBreakerUsedInScene = false;

  const timelineScenes: TimelineScene[] = [];
  let videoCursorMs = 0;
  let videoCursorFrame = 0;

  for (let si = 0; si < config.scenes.length; si++) {
    const scene = config.scenes[si];

    // ── Transition out ──
    let transitionDef: TransitionDef | null = null;
    let transitionOutDurationMs = 0;
    if (si < config.scenes.length - 1) {
      if (scene['transition-out'] && TRANSITIONS[scene['transition-out']]) {
        transitionDef = TRANSITIONS[scene['transition-out']];
      } else {
        transitionDef = pickRandom(transitionPool);
      }
      transitionOutDurationMs = scene['transition-duration']
        ? parseDurationStr(String(scene['transition-duration']))
        : defaultTransitionDuration(transitionDef);
    }

    // ── Scene type & choreography ──
    const sceneTypeId = scene.sceneTypeId as SceneTypeId | undefined;
    const sceneType = sceneTypeId ? SCENE_TYPES[sceneTypeId] : null;
    const choreoPlan = sceneType
      ? planChoreography(sceneType, scene.elements.length, si, config.scenes.length, mode)
      : null;

    // Scene-type preferred entrance pool
    const scenePreferredPool: AnimationDef[] = sceneType?.preferredEntrances
      ? sceneType.preferredEntrances
          .map(id => ENTRANCES[id])
          .filter((d): d is AnimationDef => !!d)
      : [];
    let scenePreferredIdx = 0;

    // ── Pick entrances & build timing inputs ──
    const elemInputs: ElementTimingInput[] = [];
    const elemChoices: { entranceId: string; entranceDef: AnimationDef; exitId: string | null; exitDef: AnimationDef | null }[] = [];

    hybridBreakerUsedInScene = false;
    const usedEntrancesInScene = new Set<string>();

    for (const el of scene.elements) {
      let entranceDef: AnimationDef;
      let entranceId: string;

      // Derive element role for semantic animation selection
      let elRole: string | undefined;
      if (el.type === 'heading') {
        if (si === 0) elRole = 'hero-heading';
        else if (si === config.scenes.length - 1) elRole = 'cta';
        else elRole = 'heading';
      } else if (el.type === 'text') elRole = 'body';
      else if (el.type === 'card' || el.type === 'card-group') elRole = 'card-title';
      else if (el.type === 'button') elRole = 'cta';

      if (el.entrance && ENTRANCES[el.entrance]) {
        entranceId = el.entrance;
        entranceDef = ENTRANCES[el.entrance];
      } else {
        // Try role-based selection first (semantic animation mapping)
        const roleMatch = selectEntranceByRole(elRole, usedEntrancesInScene);
        if (roleMatch) {
          entranceDef = roleMatch;
          entranceId = roleMatch.id;
        } else if (mode === 'safe') {
          if (scenePreferredPool.length > 0) {
            entranceDef = scenePreferredPool[scenePreferredIdx % scenePreferredPool.length];
            scenePreferredIdx++;
            entranceId = entranceDef.id;
          } else {
            entranceDef = safeEntrance;
            entranceId = safeEntrance.id;
          }
        } else if (mode === 'chaos' || mode === 'cocomelon') {
          entranceDef = pickRandom(Object.values(ENTRANCES));
          entranceId = entranceDef.id;
        } else {
          // hybrid
          if (!hybridBreakerUsedInScene && Math.random() < 0.3) {
            entranceDef = pickRandom(Object.values(ENTRANCES));
            entranceId = entranceDef.id;
            hybridBreakerUsedInScene = true;
          } else if (scenePreferredPool.length > 0) {
            entranceDef = scenePreferredPool[scenePreferredIdx % scenePreferredPool.length];
            scenePreferredIdx++;
            entranceId = entranceDef.id;
          } else {
            entranceDef = pickRandom(entrancePool);
            entranceId = entranceDef.id;
          }
        }
      }

      // Pick exit
      let exitDef: AnimationDef | null = null;
      let exitId: string | null = null;
      if (el.exit && EXITS[el.exit]) {
        exitId = el.exit;
        exitDef = EXITS[el.exit];
      }

      elemChoices.push({ entranceId, entranceDef, exitId, exitDef });

      const baseDur = el['entrance-duration']
        ? parseDurationStr(String(el['entrance-duration']))
        : defaultEntranceDuration(entranceDef);
      const exitBaseDur = el['exit-duration']
        ? parseDurationStr(String(el['exit-duration']))
        : (exitDef ? defaultEntranceDuration(exitDef) : 0);

      // Derive element role for timing (heading bonus) — reuse elRole from above
      let timingRole: string | undefined;
      if (el.type === 'heading') {
        if (si === 0) timingRole = 'hero-heading';
        else if (si === config.scenes.length - 1) timingRole = 'cta';
        else timingRole = 'heading';
      } else if (el.type === 'text') {
        timingRole = 'body';
      } else if (el.type === 'card' || el.type === 'card-group') {
        timingRole = 'card-title';
      } else if (el.type === 'button') {
        timingRole = 'cta';
      }

      elemInputs.push({
        text: getElementText(el),
        entranceDurationBase: baseDur,
        exitDurationBase: exitBaseDur,
        explicitHold: el.hold ? parseDurationStr(String(el.hold)) : undefined,
        explicitDelay: el.delay ? parseDurationStr(String(el.delay)) : undefined,
        role: timingRole,
      });
    }

    // ── Compute scene timing in frames ──
    const sceneDuration = scene.duration ? parseDurationStr(String(scene.duration)) : undefined;
    const firstElementIsHeading = scene.elements[0]?.type === 'heading';
    const timingOptions: SceneTimingOptions | undefined = sceneType ? {
      sceneStaggerDelayMs: sceneType.staggerDelayMs,
      staggerPattern: sceneType.staggerPattern,
      microPauseMs: choreoPlan?.microPauseMs,
      firstElementIsHeading,
    } : undefined;

    const sceneTiming = computeSceneTimingFrames(
      elemInputs, speed, entranceSpeed, transitionOutDurationMs,
      fps, sceneDuration, timingOptions,
    );

    const sceneStartFrame = videoCursorFrame;
    const sceneDurationFrames = sceneTiming.totalDurationFrames;
    const sceneEndFrame = sceneStartFrame + sceneDurationFrames;

    // ── Build timeline elements with expanded animations ──
    const timelineElements: TimelineElement[] = [];

    for (let ei = 0; ei < scene.elements.length; ei++) {
      const et = sceneTiming.elements[ei];
      const choice = elemChoices[ei];

      // Absolute frame positions
      const elStartFrame = sceneStartFrame + et.startFrame;

      // Choreography: apply anticipation + follow-through as extra animations
      const useAnticipation = choreoPlan?.anticipation ?? false;
      const useFollowThrough = choreoPlan?.followThrough ?? false;
      const anticipationFrames = useAnticipation ? Math.max(1, Math.round(et.entranceDurationFrames * 0.12)) : 0;
      const followThroughFrames = useFollowThrough ? Math.max(1, Math.round(et.entranceDurationFrames * 0.15)) : 0;

      // Duration multiplier for choreography composite
      const durationMult = 1 + (useAnticipation ? 0.12 : 0) + (useFollowThrough ? 0.15 : 0);
      const adjustedEntranceFrames = Math.round(et.entranceDurationFrames * durationMult);

      // Build animation timeline:
      // [anticipation] → [entrance] → [hold] → [exit]
      const allAnims: RendererFrameAnimation[] = [];

      // Anticipation (before entrance starts)
      if (useAnticipation && anticipationFrames > 0) {
        allAnims.push(...buildAnticipation(choice.entranceId, elStartFrame, anticipationFrames));
      }

      // Entrance
      const entranceStart = elStartFrame + anticipationFrames;
      const entranceDurFrames = et.entranceDurationFrames;
      allAnims.push(...expandAnimation(choice.entranceDef, entranceStart, entranceDurFrames));

      // Follow-through (after entrance lands)
      if (useFollowThrough && followThroughFrames > 0) {
        const ftStart = entranceStart + entranceDurFrames;
        allAnims.push(...buildFollowThrough(choice.entranceId, ftStart, followThroughFrames));
      }

      // Exit
      if (choice.exitDef && et.exitDurationFrames > 0) {
        const exitStartFrame = entranceStart + entranceDurFrames + et.holdTimeFrames + followThroughFrames;
        allAnims.push(...expandAnimation(choice.exitDef, exitStartFrame, et.exitDurationFrames));
      }

      const domSelector = `[data-el="s${si}-e${ei}"]`;
      const startMs = videoCursorMs + framesToMs(et.startFrame, fps);
      const endMs = videoCursorMs + framesToMs(et.endFrame, fps);

      timelineElements.push({
        sceneIndex: si,
        elementIndex: ei,
        element: scene.elements[ei],
        text: getElementText(scene.elements[ei]),
        domSelector,
        entranceId: choice.entranceId,
        exitId: choice.exitId,
        animations: allAnims,
        startMs,
        endMs,
        holdMs: framesToMs(et.holdTimeFrames, fps),
        entranceDurationMs: framesToMs(adjustedEntranceFrames, fps),
        exitDurationMs: framesToMs(et.exitDurationFrames, fps),
      });
    }

    // Gap detection: fix gaps where no element is visible
    fixElementGaps(timelineElements, fps);

    // ── Build transition ──
    let transition: TimelineScene['transition'] | undefined;
    if (transitionDef && transitionOutDurationMs > 0) {
      const transDurFrames = sceneTiming.transitionOutDurationFrames;
      const transStartFrame = sceneEndFrame - transDurFrames;
      const transEndFrame = sceneEndFrame;
      const transEasing = (transitionDef.easing ?? 'easeInOutCubic') as EasingId;

      transition = {
        type: transitionDef.id,
        startFrame: transStartFrame,
        endFrame: transEndFrame,
        durationFrames: transDurFrames,
        outgoing: expandTransitionSide(transitionDef.outgoing, transStartFrame, transEndFrame, transEasing),
        incoming: expandTransitionSide(transitionDef.incoming, transStartFrame, transEndFrame, transEasing),
      };
    }

    timelineScenes.push({
      sceneIndex: si,
      scene,
      startFrame: sceneStartFrame,
      endFrame: sceneEndFrame,
      elements: timelineElements,
      transition,
      startMs: videoCursorMs,
      durationMs: sceneTiming.totalDurationMs,
      transitionOutDurationMs,
    });

    videoCursorMs += sceneTiming.totalDurationMs;
    videoCursorFrame += sceneDurationFrames;
  }

  return {
    scenes: timelineScenes,
    totalDurationMs: videoCursorMs,
    fps,
    totalFrames: videoCursorFrame,
  };
}

// ─── Gap Detection ───────────────────────────────────────────

const MAX_GAP_FRAMES = 12; // ~200ms at 60fps

/**
 * Detect and fix gaps where no element is visible within a scene.
 * Strategy: shift the next element earlier to close the gap.
 * Mutates elements in-place.
 */
function fixElementGaps(elements: TimelineElement[], fps: number): void {
  if (elements.length < 2) return;

  // Compute visibility intervals from animation frame ranges
  const sorted = [...elements].sort((a, b) => {
    const aMin = a.animations.length > 0 ? Math.min(...a.animations.map(an => an.startFrame)) : 0;
    const bMin = b.animations.length > 0 ? Math.min(...b.animations.map(an => an.startFrame)) : 0;
    return aMin - bMin;
  });

  const intervals = sorted.map(el => {
    if (el.animations.length === 0) return { start: 0, end: 0, el };
    const starts = el.animations.map(a => a.startFrame);
    const ends = el.animations.map(a => a.endFrame);
    return { start: Math.min(...starts), end: Math.max(...ends), el };
  }).filter(iv => iv.end > iv.start);

  if (intervals.length < 2) return;

  // Merge overlapping intervals
  const merged: { start: number; end: number }[] = [];
  for (const iv of intervals) {
    if (merged.length === 0 || iv.start > merged[merged.length - 1].end) {
      merged.push({ start: iv.start, end: iv.end });
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, iv.end);
    }
  }

  // Fix gaps between merged intervals
  for (let i = 0; i < merged.length - 1; i++) {
    const gapFrames = merged[i + 1].start - merged[i].end;
    if (gapFrames <= MAX_GAP_FRAMES) continue;

    const shift = gapFrames - MAX_GAP_FRAMES;
    const gapEnd = merged[i + 1].start;

    // Find first element that starts at/after gapEnd
    const target = sorted.find(item => {
      if (item.animations.length === 0) return false;
      return Math.min(...item.animations.map(a => a.startFrame)) >= gapEnd;
    });

    if (target) {
      for (const anim of target.animations) {
        anim.startFrame -= shift;
        anim.endFrame -= shift;
      }
      target.startMs -= framesToMs(shift, fps);
      target.endMs -= framesToMs(shift, fps);
    }
  }
}
