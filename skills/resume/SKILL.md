---
name: resume
description: Re-enable VIBE quality hooks after pausing. Run after /vibe:pause.
disable-model-invocation: true
whenToUse: "Use to re-enable VIBE quality hooks after pausing. Example: '/vibe:resume'"
maxTokenBudget: 1000
---

# VIBE Resume

Remove the pause flag file to re-enable VIBE quality hooks:

```bash
rm -f "/tmp/vibe-paused-${CLAUDE_SESSION_ID}"
```

Confirm to the user:

> VIBE quality hooks are **active** again.
> All quality gates (lint-on-edit, security scans, review gates) are back in effect.
