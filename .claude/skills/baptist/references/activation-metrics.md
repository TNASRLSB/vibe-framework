# Activation Metrics Reference

Strategic reference for post-signup onboarding and activation optimization. For UI/empty states/progress indicators, delegate to Seurat. For onboarding email copy, delegate to Ghostwriter.

---

## Aha Moment Framework

### Definition
The action that correlates most strongly with long-term retention. What do retained users do that churned users don't?

### Finding Your Aha Moment
1. Segment users into "retained" (active at D30+) and "churned" (inactive)
2. Compare behaviors in the first 7 days
3. Identify actions with the largest retention gap
4. Validate: if you push users toward this action, does retention improve?

### Examples by Product Type
| Product | Aha Moment | Key Metric |
|---|---|---|
| Project management | Create first project + add team member | Time to first project |
| Analytics tool | Install tracking + see first report | Time to first data view |
| Design tool | Create first design + export/share | Time to first export |
| Collaboration | Invite first teammate | Time to first invite |
| Marketplace | Complete first transaction | Time to first purchase |
| Content platform | First content creation + engagement | Time to first post |

---

## Key Activation Metrics

### Primary Metrics
| Metric | Definition | Target |
|---|---|---|
| **Activation rate** | % of signups reaching activation event | 40-60% (varies by product) |
| **Time to activation** | Median time from signup to aha moment | As short as possible |
| **D1 retention** | % returning day after signup | >25% |
| **D7 retention** | % active at day 7 | >15% |
| **D30 retention** | % active at day 30 | >10% |

### Secondary Metrics
| Metric | What it reveals |
|---|---|
| Onboarding completion rate | How many finish setup |
| Steps to activation | Friction in the path |
| Feature adoption rate | Which features get used |
| Time to first value | How quickly users experience benefit |
| Activation by cohort/source | Quality differences by channel |

---

## Funnel Post-Signup

### Standard Post-Signup Funnel
```
Signup → Welcome Screen → First Action → Core Value → Repeat Use
100%      85-95%           60-70%        40-50%       20-30%
```

Track drop-off at each step. The biggest drops indicate:
- **Signup → Welcome**: Technical issues, confusion
- **Welcome → First Action**: Unclear next step, overwhelm
- **First Action → Core Value**: Friction, wrong first action guided
- **Core Value → Repeat Use**: No habit loop, insufficient value

### Onboarding Flow Types

| Type | When to use | Risk |
|---|---|---|
| **Product-first** | Simple products, B2C, mobile apps | Blank slate overwhelm |
| **Guided setup** | Products needing personalization | Adds friction before value |
| **Value-first** | Products with demo/sample data | May not feel "real" |

---

## Engagement Loops (Hook Model)

### Loop Structure
```
Trigger → Action → Variable Reward → Investment
```

### Components
- **Trigger**: What brings the user back (email, notification, habit)
- **Action**: What they do when they return
- **Variable Reward**: Unpredictable value (new content, social engagement, progress)
- **Investment**: What they put in that increases future value (data, connections, content)

### Examples
| Trigger | Action | Reward | Investment |
|---|---|---|---|
| Email digest of activity | Log in to respond | Social engagement | Add reply/content |
| Usage limit approaching | Upgrade or optimize | More capacity | Financial commitment |
| New feature announcement | Explore new capability | Productivity gain | Learn new workflow |
| Weekly progress report | Review metrics | Insight/achievement | Set new goals |

---

## Stalled User Recovery

### Detection Criteria
Define "stalled" for your product:
- X days inactive after signup
- Incomplete onboarding checklist
- Zero core actions taken after 48 hours

### Re-engagement Sequence
1. **24h after stall**: Reminder of value + specific next step
2. **72h**: Address common blockers + offer help
3. **7 days**: Stronger incentive or personal outreach
4. **14 days**: Final attempt, consider win-back offer

### In-App Recovery
- Welcome back message with "pick up where you left off"
- Simplified path to activation
- Offer live walkthrough for high-value accounts

---

## Onboarding Checklist Best Practices

### Structure
- 3-7 items (not overwhelming)
- Order by value (most impactful first)
- Start with quick wins
- Progress bar / completion percentage
- Celebration on completion
- Dismiss option (don't trap users)

### Item Format
```
☐ [Clear action verb] ([estimated time])
  [Brief benefit explanation]
  [Quick-start button]
```

### Progress Psychology
- Start at 20%, not 0% (account creation counts)
- Quick early wins build momentum
- Clear benefit of completing each item
- Don't block features behind completion

---

## Experiment Ideas

### Flow Simplification
- Add/remove email verification during onboarding
- Empty states vs pre-populated demo data
- Pre-filled templates to accelerate setup
- Reduce number of required onboarding steps

### Progress and Motivation
- Progress bars: 3-5 items vs 5-7 items
- Gamification: badges/rewards vs none
- "X% complete" messaging prominence
- Celebration animations on milestones

### Personalization
- Segment by role/goal to customize path
- Ask use-case question to personalize flow
- Industry-specific examples and templates
- Dynamic feature recommendations

### Multi-Channel
- Behavior-based onboarding emails vs time-based
- Personalized welcome from founder vs generic
- In-app tooltips vs email instructions
- Proactive outreach for stuck users
