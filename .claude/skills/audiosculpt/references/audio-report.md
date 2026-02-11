## Audio Report

Every time audiosculpt generates audio, produce a companion **HTML** report with:
- Visual score rendering (piano roll)
- **Live audio playback** with Strudel
- **Animated playhead** synchronized to visualization

**File naming:** `<output-name>-audio-report.html`

### Required CDN Includes

```html
<script src="https://unpkg.com/@strudel/web@1.0.3"></script>
<script src="https://cdn.jsdelivr.net/npm/abcjs@6.4.1/dist/abcjs-basic-min.js"></script>
```

### Layout Structure

Toggle buttons: **Score** | Instruments | SFX Events | Master Chain

### Playback Controls

```javascript
document.getElementById('playBtn').addEventListener('click', async () => {
  const { initStrudel, repl } = await import('https://unpkg.com/@strudel/web@1.0.3');
  await initStrudel();
  setcpm(BPM / 4);

  if (isPlaying) {
    hush();
    isPlaying = false;
    playBtn.textContent = '▶ Play';
    return;
  }

  await repl({ code: currentPattern }).start();
  isPlaying = true;
  playBtn.textContent = '■ Stop';
  startPlayheadAnimation();
});
```

### Visualizations

1. **Piano Roll (SVG)** — X=time, Y=MIDI pitch, color per instrument
2. **Staff Notation (abcjs)** — Full score with all instruments stacked

### Info Tables

3. **Instruments** — Table: name, sound source, effects, gain
4. **SFX Events** — Full TIR event table
5. **Master Chain** — Signal flow: ducking → compressor → limiter
