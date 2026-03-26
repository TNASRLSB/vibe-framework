---
name: pause
description: Temporarily disable VIBE quality hooks for the current session. Use during rapid prototyping or exploratory coding.
disable-model-invocation: true
---

# VIBE Pause

Create a flag file to signal that VIBE quality hooks should be skipped for this session:

```bash
touch "/tmp/vibe-paused-${CLAUDE_SESSION_ID}"
```

Confirm to the user:

> VIBE quality hooks are **paused** for this session.
> Hooks (lint-on-edit, security scans, review gates) will not run until you resume.
>
> Run `/vibe:resume` to re-enable them.
