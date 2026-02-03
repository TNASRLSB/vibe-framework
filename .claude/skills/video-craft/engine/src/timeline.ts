// Builds an ordered timeline of actions from a parsed config

import type { Config, SceneConfig, ElementConfig } from './config.js';
import { getElementText } from './config.js';
import { computeSceneTiming, parseDurationStr, type ElementTimingInput } from './timing.js';
import {
  ENTRANCES, EXITS, TRANSITIONS,
  getEntrancePool, getTransitionPool,
  pickRandom, defaultEntranceDuration, defaultTransitionDuration,
  type AnimationDef, type TransitionDef,
} from './actions.js';
import type { SpeedPreset, ModeId } from './presets.js';
import { SAFE_EASINGS, CHAOS_EASINGS } from './presets.js';
import { SCENE_TYPES, type SceneTypeId } from './composition.js';
import { planChoreography } from './choreography.js';

export interface TimelineElement {
  sceneIndex: number;
  elementIndex: number;
  element: ElementConfig;
  text: string;
  entranceId: string;
  entranceDef: AnimationDef;
  entranceDurationMs: number;
  exitId: string | null;
  exitDef: AnimationDef | null;
  exitDurationMs: number;
  holdMs: number;
  startMs: number;    // absolute time from video start
  endMs: number;
  easing: string;
  delayMs: number;
}

export interface TimelineScene {
  sceneIndex: number;
  scene: SceneConfig;
  startMs: number;
  durationMs: number;
  elements: TimelineElement[];
  transitionOut: TransitionDef | null;
  transitionOutDurationMs: number;
}

export interface Timeline {
  scenes: TimelineScene[];
  totalDurationMs: number;
  fps: number;
  totalFrames: number;
}

export function buildTimeline(config: Config): Timeline {
  const mode = config.video.mode as ModeId;
  const speed = config.video.speed as SpeedPreset;
  const entranceSpeed = (config.video['entrance-speed'] ?? config.video.speed) as SpeedPreset;
  const fps = config.video.fps;

  const entrancePool = getEntrancePool(mode);
  const transitionPool = getTransitionPool(mode);
  const easingPool = mode === 'chaos' ? CHAOS_EASINGS : SAFE_EASINGS;

  // For safe mode: pick a consistent entrance for the whole video
  const safeEntrance = pickRandom(entrancePool);
  // For hybrid mode: track breaker usage
  let hybridBreakerUsedInScene = false;

  const timelineScenes: TimelineScene[] = [];
  let videoCursor = 0;

  for (let si = 0; si < config.scenes.length; si++) {
    const scene = config.scenes[si];

    // Determine transition out
    let transitionOut: TransitionDef | null = null;
    let transitionOutDurationMs = 0;
    if (si < config.scenes.length - 1) {
      if (scene['transition-out'] && TRANSITIONS[scene['transition-out']]) {
        transitionOut = TRANSITIONS[scene['transition-out']];
      } else {
        transitionOut = pickRandom(transitionPool);
      }
      transitionOutDurationMs = scene['transition-duration']
        ? parseDurationStr(String(scene['transition-duration']))
        : defaultTransitionDuration(transitionOut);
    }

    // Build element timing inputs
    const elemInputs: ElementTimingInput[] = [];
    const elemEntrances: { entranceId: string; entranceDef: AnimationDef; exitId: string | null; exitDef: AnimationDef | null; easing: string }[] = [];

    hybridBreakerUsedInScene = false;

    // Get scene type info for choreography
    const sceneTypeId = scene.sceneTypeId as SceneTypeId | undefined;
    const sceneType = sceneTypeId ? SCENE_TYPES[sceneTypeId] : null;

    // Plan choreography for this scene if we have a scene type
    const choreoPlan = sceneType
      ? planChoreography(sceneType, scene.elements.length, si, config.scenes.length, mode)
      : null;

    for (const el of scene.elements) {
      // Pick entrance
      let entranceDef: AnimationDef;
      let entranceId: string;
      if (el.entrance && ENTRANCES[el.entrance]) {
        entranceId = el.entrance;
        entranceDef = ENTRANCES[el.entrance];
      } else if (mode === 'safe') {
        entranceDef = safeEntrance;
        entranceId = safeEntrance.id;
      } else if (mode === 'chaos') {
        entranceDef = pickRandom(Object.values(ENTRANCES));
        entranceId = entranceDef.id;
      } else {
        // hybrid: safe base, occasional breaker
        if (!hybridBreakerUsedInScene && Math.random() < 0.3) {
          entranceDef = pickRandom(Object.values(ENTRANCES));
          entranceId = entranceDef.id;
          hybridBreakerUsedInScene = true;
        } else {
          entranceDef = pickRandom(entrancePool);
          entranceId = entranceDef.id;
        }
      }

      // Pick exit
      let exitDef: AnimationDef | null = null;
      let exitId: string | null = null;
      if (el.exit && EXITS[el.exit]) {
        exitId = el.exit;
        exitDef = EXITS[el.exit];
      }

      // Pick easing: use choreography plan easing as default, element override takes precedence
      const easing = el.easing ?? (choreoPlan?.easing) ?? pickRandom(easingPool);

      elemEntrances.push({ entranceId, entranceDef, exitId, exitDef, easing });

      const baseDur = el['entrance-duration']
        ? parseDurationStr(String(el['entrance-duration']))
        : defaultEntranceDuration(entranceDef);
      const exitBaseDur = el['exit-duration']
        ? parseDurationStr(String(el['exit-duration']))
        : (exitDef ? defaultEntranceDuration(exitDef) : 0);

      elemInputs.push({
        text: getElementText(el),
        entranceDurationBase: baseDur,
        exitDurationBase: exitBaseDur,
        explicitHold: el.hold ? parseDurationStr(String(el.hold)) : undefined,
        explicitDelay: el.delay ? parseDurationStr(String(el.delay)) : undefined,
      });
    }

    // Compute scene timing with stagger options from scene type
    const sceneDuration = scene.duration ? parseDurationStr(String(scene.duration)) : undefined;
    const firstElementIsHeading = scene.elements[0]?.type === 'heading';
    const sceneTiming = computeSceneTiming(
      elemInputs, speed, entranceSpeed, transitionOutDurationMs, sceneDuration,
      sceneType ? {
        sceneStaggerDelayMs: sceneType.staggerDelayMs,
        staggerPattern: sceneType.staggerPattern,
        microPauseMs: choreoPlan?.microPauseMs,
        firstElementIsHeading,
      } : undefined,
    );

    // Build timeline elements
    const timelineElements: TimelineElement[] = [];
    for (let ei = 0; ei < scene.elements.length; ei++) {
      const el = scene.elements[ei];
      const et = sceneTiming.elements[ei];
      const ea = elemEntrances[ei];

      timelineElements.push({
        sceneIndex: si,
        elementIndex: ei,
        element: el,
        text: getElementText(el),
        entranceId: ea.entranceId,
        entranceDef: ea.entranceDef,
        entranceDurationMs: et.entranceDuration,
        exitId: ea.exitId,
        exitDef: ea.exitDef,
        exitDurationMs: et.exitDuration,
        holdMs: et.holdTime,
        startMs: videoCursor + et.startTime,
        endMs: videoCursor + et.endTime,
        easing: ea.easing,
        delayMs: et.delay,
      });
    }

    timelineScenes.push({
      sceneIndex: si,
      scene,
      startMs: videoCursor,
      durationMs: sceneTiming.totalDuration,
      elements: timelineElements,
      transitionOut,
      transitionOutDurationMs,
    });

    videoCursor += sceneTiming.totalDuration;
  }

  const totalDurationMs = videoCursor;
  const totalFrames = Math.ceil(totalDurationMs / 1000 * fps);

  return { scenes: timelineScenes, totalDurationMs, fps, totalFrames };
}
