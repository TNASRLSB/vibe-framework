# Demo Script JSON Format

The demo script is a JSON file that defines a live website recording session with narration, zoom, cursor animation, and background music.

## Full Example

```json
{
  "url": "https://example.com",
  "format": "horizontal-16x9",
  "fps": 30,
  "codec": "h264",
  "voice": "en-US-AriaNeural",
  "lang": "en-US",
  "narrationStyle": "neutral",
  "music": { "enabled": true, "style": "auto", "volume": 0.3 },
  "subtitles": { "enabled": true, "style": "bottom" },
  "auth": [
    { "action": "navigate", "url": "https://example.com/login" },
    { "action": "fill", "selector": "#email", "value": "user@example.com" },
    { "action": "fill", "selector": "#password", "value": "password" },
    { "action": "click", "selector": "button[type=submit]" },
    { "action": "wait", "waitFor": ".dashboard" }
  ],
  "steps": [
    {
      "narration": "Welcome to Example App. Let me show you the dashboard.",
      "action": "none",
      "zoom": 1
    },
    {
      "narration": "Click the New Project button to create a project.",
      "action": "click",
      "selector": ".btn-new-project",
      "zoom": 1.5,
      "highlight": true
    },
    {
      "narration": "Type your project name here.",
      "action": "fill",
      "selector": "#project-name",
      "value": "My First Project",
      "zoom": 2,
      "highlight": true
    }
  ],
  "output": "./output/demo.mp4",
  "gapBetweenSteps": 800,
  "zoomTransitionMs": 400
}
```

## Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | Website URL to demo |
| `format` | string | No | Video format preset (default: `horizontal-16x9`) |
| `fps` | number | No | Frames per second (default: 30) |
| `codec` | string | No | Video codec: `h264`, `h265`, `av1` |
| `voice` | string | No | TTS voice identifier (from `voices.json`) |
| `lang` | string | No | Language code for narration |
| `narrationStyle` | string | No | Style: `neutral`, `enthusiastic`, etc. |
| `ttsEngine` | string | No | TTS engine override (e.g. `edge-tts`, `elevenlabs`) |
| `music` | object | No | Music config: `enabled`, `style`, `volume` |
| `subtitles` | object | No | Subtitle config: `enabled`, `style` |
| `auth` | array | No | Pre-recording authentication steps |
| `steps` | array | Yes | Demo steps (see below) |
| `output` | string | No | Output file path |
| `gapBetweenSteps` | number | No | Pause between steps in ms (default: 800) |
| `zoomTransitionMs` | number | No | Zoom transition duration in ms (default: 400) |
| `storageState` | string | No | Path to Playwright storageState JSON for OAuth/SSO |

### Step Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `narration` | string | Yes | Text to narrate (1-2 sentences) |
| `action` | string | Yes | Action: `click`, `fill`, `scroll`, `hover`, `navigate`, `wait`, `none` |
| `selector` | string | Conditional | CSS selector for action target (required for click/fill/hover) |
| `value` | string | Conditional | Text to type (fill) or URL (navigate) |
| `zoom` | number | No | Zoom level 1-3 (default: 1) |
| `highlight` | boolean | No | Show ring around target element |
| `waitFor` | string | No | CSS selector to wait for (for `wait` action) |

### Auth Step Fields

Same as step fields, but only `action`, `url`, `selector`, `value`, and `waitFor` are used. Auth steps execute before recording begins.
