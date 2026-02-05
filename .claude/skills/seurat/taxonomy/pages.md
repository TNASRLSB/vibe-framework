# Page Taxonomy

Six archetypal page types. Every page in your project maps to one of these.

---

## 1. Entry Pages (Start/Landing)

**Purpose**: First impression, value proposition, conversion gateway.

### Layout Patterns

| Pattern | Structure | Best For |
|---------|-----------|----------|
| Hero-centric | Full-viewport hero → stacked sections | SaaS, products |
| Split | 50/50 text + media | Apps, tools |
| Video-first | Background video/animation | Creative, entertainment |
| Minimal | Logo + single CTA | Launch pages, waitlists |

### Component Slots

```
┌─────────────────────────────────────┐
│ [Nav]                               │
├─────────────────────────────────────┤
│ [Hero]                              │
│   - Headline                        │
│   - Subhead                         │
│   - Primary CTA                     │
│   - Secondary CTA (optional)        │
│   - Visual (image/video/animation)  │
├─────────────────────────────────────┤
│ [Social Proof]                      │
│   - Logos / Testimonials / Stats    │
├─────────────────────────────────────┤
│ [Features]                          │
│   - 3-4 key benefits                │
├─────────────────────────────────────┤
│ [How It Works] (optional)           │
├─────────────────────────────────────┤
│ [Pricing] (optional)                │
├─────────────────────────────────────┤
│ [Final CTA]                         │
├─────────────────────────────────────┤
│ [Footer]                            │
└─────────────────────────────────────┘
```

### Content Patterns

| Element | Guidelines |
|---------|------------|
| Headline | 5-10 words, benefit-focused, no jargon |
| Subhead | 15-25 words, expand on headline |
| CTA text | Action verb + outcome ("Start free trial", "Get started") |
| Social proof | Specific numbers > vague claims |
| Image ratios | Hero: 16:9 or 4:3, Features: 1:1 or 4:3 |

### Interaction Flows

```
Primary:   Hero CTA → Signup/Pricing
Secondary: Scroll → Features → Learn more
Tertiary:  Nav → Explore sections
```

---

## 2. Discovery Pages (Search/Listings)

**Purpose**: Browse, filter, find items from a collection.

### Layout Patterns

| Pattern | Structure | Best For |
|---------|-----------|----------|
| Sidebar + Grid | Filters left, results right | E-commerce, catalogs |
| Top filters + Grid | Horizontal filters above results | Mobile-first, simple filtering |
| Map + List | Split view with geo context | Location-based, real estate |
| Infinite scroll | No pagination, load on scroll | Social, content feeds |

### Component Slots

```
┌─────────────────────────────────────────────┐
│ [Header/Nav]                                │
├──────────────┬──────────────────────────────┤
│ [Filters]    │ [Results Header]             │
│  - Search    │   - Count ("42 results")     │
│  - Categories│   - Sort dropdown            │
│  - Price     │   - View toggle (grid/list)  │
│  - Attributes├──────────────────────────────┤
│              │ [Results Grid/List]          │
│              │   - Item cards               │
│              │   - Loading states           │
│              ├──────────────────────────────┤
│              │ [Pagination / Load more]     │
├──────────────┴──────────────────────────────┤
│ [Empty State] (when no results)             │
└─────────────────────────────────────────────┘
```

### Content Patterns

| Element | Guidelines |
|---------|------------|
| Card info | Title, price/key metric, 1-2 attributes, thumbnail |
| Image ratios | Product: 1:1 or 4:5, Content: 16:9 or 3:2 |
| Results count | Always show, update on filter change |
| Filter labels | Noun-based ("Category"), not verb-based |
| Empty state | Helpful message + clear next action |

### Interaction Flows

```
Primary:   Filter/Search → Refine results
Secondary: Click item → Detail page
Tertiary:  Sort → Reorder results
Recovery:  Empty state → Clear filters / Suggest alternatives
```

---

## 3. Detail Pages (Content/Item View)

**Purpose**: Deep dive on single item, drive primary action.

### Layout Patterns

| Pattern | Structure | Best For |
|---------|-----------|----------|
| Media + Info | Gallery left, details right | Products, portfolios |
| Full-width sections | Stacked content blocks | Articles, case studies |
| Sticky sidebar | Scrolling content + fixed action | Long-form + purchase |
| Tab-based | Content organized in tabs | Complex items with specs |

### Component Slots

```
┌─────────────────────────────────────────────┐
│ [Breadcrumbs]                               │
├─────────────────────┬───────────────────────┤
│ [Media Gallery]     │ [Title Block]         │
│  - Main image       │   - Title             │
│  - Thumbnails       │   - Price/Key metric  │
│  - Zoom/Lightbox    │   - Rating (optional) │
│                     ├───────────────────────┤
│                     │ [Variants] (optional) │
│                     │   - Size, color, etc. │
│                     ├───────────────────────┤
│                     │ [Primary Action]      │
│                     │   - Add to cart / Buy │
│                     │   - Secondary actions │
├─────────────────────┴───────────────────────┤
│ [Tabs / Sections]                           │
│   - Description                             │
│   - Specifications                          │
│   - Reviews                                 │
├─────────────────────────────────────────────┤
│ [Related Items]                             │
└─────────────────────────────────────────────┘
```

### Content Patterns

| Element | Guidelines |
|---------|------------|
| Title | Descriptive, include key attributes |
| Description | Scannable: short paragraphs, bullets for specs |
| Gallery | 3-6 images, largest first, consistent ratios |
| Reviews | Show count + average, recent first |
| Related | 3-4 items max, visually consistent with main |

### Interaction Flows

```
Primary:   Add to cart / Buy / Subscribe
Secondary: Save / Wishlist / Share
Tertiary:  View more images / Read reviews
Navigation: Breadcrumbs → Back to listing
```

---

## 4. Action Pages (Forms/Edit)

**Purpose**: Complete a task, submit data, make changes.

### Layout Patterns

| Pattern | Structure | Best For |
|---------|-----------|----------|
| Centered card | Single focused form | Login, signup, simple forms |
| Stepped wizard | Multi-step with progress | Checkout, onboarding |
| Split layout | Form + preview/summary | Editors, builders |
| Inline sections | Collapsible form groups | Settings, long forms |

### Component Slots

```
┌─────────────────────────────────────────────┐
│ [Progress Indicator] (if multi-step)        │
├─────────────────────────────────────────────┤
│ [Form Header]                               │
│   - Title ("Create account")                │
│   - Helper text (optional)                  │
├─────────────────────────────────────────────┤
│ [Form Sections]                             │
│   - Section label                           │
│   - Input groups                            │
│   - Inline validation                       │
│   - Helper text                             │
├─────────────────────────────────────────────┤
│ [Form Actions]                              │
│   - Primary: Submit                         │
│   - Secondary: Cancel / Save draft          │
├─────────────────────────────────────────────┤
│ [Alternative Actions] (optional)            │
│   - "Already have account? Log in"          │
│   - OAuth buttons                           │
└─────────────────────────────────────────────┘
```

### Content Patterns

| Element | Guidelines |
|---------|------------|
| Labels | Above inputs, sentence case, no colons |
| Placeholders | Example format, not label repeat |
| Validation | Inline, on blur, specific messages |
| Required | Mark optional fields, not required |
| Submit text | Specific action ("Create account" not "Submit") |
| Progress | Step numbers + labels, current highlighted |

### Interaction Flows

```
Primary:   Fill form → Submit → Success state
Secondary: Save draft → Continue later
Recovery:  Validation error → Fix → Retry
Exit:      Cancel → Confirm if data entered
```

---

## 5. Management Pages (Bulk Operations)

**Purpose**: Administer multiple items, perform bulk actions.

### Layout Patterns

| Pattern | Structure | Best For |
|---------|-----------|----------|
| Data table | Rows + columns, sortable | User lists, orders, logs |
| Card grid + select | Visual items with checkboxes | Media libraries, products |
| Tree view | Hierarchical with expand/collapse | File systems, categories |
| Kanban | Columns with drag-drop | Tasks, pipelines, workflows |

### Component Slots

```
┌─────────────────────────────────────────────┐
│ [Page Header]                               │
│   - Title + count ("Users (1,234)")         │
│   - Primary action ("Add user")             │
├─────────────────────────────────────────────┤
│ [Toolbar]                                   │
│   - Search                                  │
│   - Filters                                 │
│   - Bulk actions (when selected)            │
│   - View options                            │
├─────────────────────────────────────────────┤
│ [Selection Header] (when items selected)    │
│   - "3 selected" + Select all               │
│   - Bulk action buttons                     │
├─────────────────────────────────────────────┤
│ [Data Table / Grid]                         │
│   - Checkbox column                         │
│   - Data columns (sortable)                 │
│   - Row actions (edit, delete)              │
│   - Status indicators                       │
├─────────────────────────────────────────────┤
│ [Pagination]                                │
│   - Page size selector                      │
│   - Page navigation                         │
│   - "Showing 1-25 of 1,234"                 │
└─────────────────────────────────────────────┘
```

### Content Patterns

| Element | Guidelines |
|---------|------------|
| Columns | 5-7 max visible, most important first |
| Row actions | Icon buttons or overflow menu |
| Status | Color-coded badges, consistent vocabulary |
| Empty state | Helpful message + create action |
| Selection | Checkbox + row highlight, count in toolbar |
| Bulk actions | Destructive actions require confirmation |

### Interaction Flows

```
Primary:   Select items → Bulk action → Confirm
Secondary: Click row → Edit inline or navigate to detail
Tertiary:  Sort/Filter → Refine view
Destructive: Delete → Confirm modal → Undo option
```

---

## 6. System Pages (Errors/Confirmations)

**Purpose**: System feedback, edge states, error recovery.

### Layout Patterns

| Pattern | Structure | Best For |
|---------|-----------|----------|
| Centered minimal | Icon + message + action | 404, 500, maintenance |
| Full-page takeover | Branded error with nav | Public errors |
| Inline alert | Banner or card in context | Partial failures |
| Success celebration | Animation + next steps | Completions, achievements |

### Component Slots

```
┌─────────────────────────────────────────────┐
│ [Nav] (optional - may hide for focus)       │
├─────────────────────────────────────────────┤
│                                             │
│         [Icon / Illustration]               │
│                                             │
│         [Status Code] (optional)            │
│         "404"                               │
│                                             │
│         [Message]                           │
│         "Page not found"                    │
│                                             │
│         [Explanation]                       │
│         "The page you're looking for..."   │
│                                             │
│         [Recovery Actions]                  │
│         [Go home] [Search] [Contact]        │
│                                             │
└─────────────────────────────────────────────┘
```

### Content Patterns

| Element | Guidelines |
|---------|------------|
| Icon | Match severity (warning, error, success, info) |
| Headline | Short, state what happened |
| Explanation | 1-2 sentences, no technical jargon |
| Actions | Primary recovery + alternatives |
| Tone | Friendly but not dismissive of frustration |

### Page Types

| Type | Use Case | Tone |
|------|----------|------|
| 404 Not Found | Missing page | Helpful, "let's find what you need" |
| 500 Server Error | System failure | Apologetic, "we're on it" |
| 403 Forbidden | Access denied | Clear, explain what to do |
| Maintenance | Planned downtime | Informative, give timeline |
| Success | Task completed | Celebratory, clear next step |
| Empty state | No content yet | Encouraging, prompt action |

### Interaction Flows

```
Primary:   Recovery action → Return to app
Secondary: Alternative action → Try different path
Fallback:  Contact support → Get help
Auto:      Retry automatically (for transient errors)
```

---

## Mapping Your Sitemap

Use this template to classify your project's pages:

```markdown
| Route | Archetype | Notes |
|-------|-----------|-------|
| `/` | Entry | Landing page |
| `/products` | Discovery | Product catalog |
| `/products/:id` | Detail | Product detail |
| `/cart` | Action | Cart/checkout flow |
| `/admin/users` | Management | User administration |
| `/404` | System | Not found |
```

### Hybrid Pages

Some pages combine archetypes:

| Page | Primary | Secondary |
|------|---------|-----------|
| Homepage with products | Entry | Discovery (featured section) |
| Product detail with reviews form | Detail | Action (review submission) |
| Dashboard | Management | System (empty states) |

Choose the **primary** archetype for layout, incorporate **secondary** patterns in specific sections.

---

## Quick Reference

| Need to... | Use archetype |
|------------|---------------|
| Convert visitors | Entry |
| Browse collections | Discovery |
| Show single item | Detail |
| Collect user input | Action |
| Manage data/items | Management |
| Handle edge cases | System |
