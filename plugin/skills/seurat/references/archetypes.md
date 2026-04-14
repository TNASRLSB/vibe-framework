# Page Archetypes Reference

Complete definitions for all 6 page archetypes supported by Seurat.

Every page in an application maps to one of these archetypes. Each defines a layout strategy, component palette, data flow, and responsive behavior.

---

## 1. Entry

### Purpose
First contact. The user arrives, understands what this is, and takes one action. Conversion is the only metric that matters.

### Examples
Landing pages, login/signup, onboarding first screen, app install prompt, pricing page.

### Layout Structure

```
+--------------------------------------------------+
|  Logo / Nav (minimal)                            |
+--------------------------------------------------+
|                                                  |
|  Hero: Headline + Subhead + CTA                  |
|  (60-80vh, single focus)                         |
|                                                  |
+--------------------------------------------------+
|  Social proof strip                              |
+--------------------------------------------------+
|  3-col feature grid (benefits, not features)     |
+--------------------------------------------------+
|  Testimonial / Case study                        |
+--------------------------------------------------+
|  Final CTA (repeat of hero CTA)                  |
+--------------------------------------------------+
|  Footer (minimal)                                |
+--------------------------------------------------+
```

### Component Palette
- Hero section (headline, subheadline, primary CTA, optional media)
- Social proof bar (logos, numbers, badges)
- Feature cards (icon + title + description, 3 or 4 per row)
- Testimonial cards (quote, avatar, name, role)
- CTA section (headline + button, high contrast)
- Minimal navigation (logo + 1-2 links + CTA button)

### Key Rules
- **One primary CTA per viewport.** Never compete with yourself.
- **Above the fold:** Headline, value prop, and CTA must all be visible without scrolling on desktop.
- **Progressive disclosure:** Details below the fold for those who need convincing.
- **No sidebar.** Entry pages are focused funnels.

### Responsive Behavior
| Breakpoint | Behavior |
|------------|----------|
| >= 1024px | Full layout, hero side-by-side text+image |
| 768-1023px | Stack hero vertically, maintain 3-col features |
| 640-767px | 2-col features, larger CTA buttons |
| < 640px | Single column, full-width CTA, hamburger nav |

### Data Flow
```
Entry page --> Form/CTA click --> Action page (signup/checkout)
                              --> External link (app store)
```

---

## 2. Discovery

### Purpose
Help users find what they want. Browse, search, filter, compare. Optimize for scanning speed and decision-making.

### Examples
Search results, product catalog, blog listing, file explorer, marketplace, feed.

### Layout Structure

```
+--------------------------------------------------+
|  Nav (full, with search prominent)               |
+--------------------------------------------------+
|  Filters   |  Results grid/list                  |
|  sidebar    |                                     |
|  (or top    |  Item  Item  Item                   |
|   bar on    |  Item  Item  Item                   |
|   mobile)   |  Item  Item  Item                   |
|             |                                     |
|             |  Pagination / Load more             |
+--------------------------------------------------+
|  Footer                                          |
+--------------------------------------------------+
```

### Component Palette
- Search bar (prominent, with suggestions/autocomplete)
- Filter panel (sidebar or collapsible top bar)
- Filter chips (active filters, removable)
- Result cards (thumbnail, title, metadata, action)
- Result list items (compact variant for dense display)
- Sort controls (relevance, date, price, etc.)
- Pagination or infinite scroll
- Empty state (no results found, with suggestions)
- Loading skeletons (match card/list layout)

### Key Rules
- **Search is king.** It must be the most prominent element after nav.
- **Filters don't reload the page.** Use client-side filtering or URL params.
- **Show result count.** "47 results" helps users gauge scope.
- **Card and list toggle.** Let users choose their preferred density.
- **Skeleton loading.** Never show a blank page while results load.

### Responsive Behavior
| Breakpoint | Behavior |
|------------|----------|
| >= 1024px | Sidebar filters + 3-4 col grid |
| 768-1023px | Collapsible sidebar + 2-3 col grid |
| 640-767px | Top filter bar (expandable) + 2 col grid |
| < 640px | Filter button + sheet overlay + single column |

### Data Flow
```
Discovery page --> [Search/Filter] --> Updated results (no page reload)
               --> Item click --> Detail page
               --> Quick action (add to cart, save, etc.)
```

---

## 3. Detail

### Purpose
Deep dive on a single item. Provide all information needed to make a decision or understand the subject. Support both scanning and deep reading.

### Examples
Product page, user profile, article/blog post, project detail, property listing, recipe.

### Layout Structure

```
+--------------------------------------------------+
|  Nav (with breadcrumb)                           |
+--------------------------------------------------+
|  Media        |  Key info block                  |
|  (image/      |  Title                           |
|   gallery/    |  Price/status                    |
|   video)      |  Primary CTA                     |
|               |  Key metadata                    |
+--------------------------------------------------+
|  Tab bar (Description | Specs | Reviews)         |
+--------------------------------------------------+
|  Tab content (scrollable)                        |
|                                                  |
+--------------------------------------------------+
|  Related items carousel                          |
+--------------------------------------------------+
|  Footer                                          |
+--------------------------------------------------+
```

### Component Palette
- Media gallery (images, video, 360 view, zoom)
- Info block (title, subtitle, price/status, metadata)
- Primary CTA (buy, contact, apply, download)
- Tab navigation (horizontal tabs for content sections)
- Description block (rich text with headings)
- Specs/attributes table (key-value pairs)
- Reviews/comments section (with ratings)
- Related items carousel
- Breadcrumb navigation
- Share/save actions

### Key Rules
- **Media and CTA in first viewport.** The user must see the thing and be able to act on it without scrolling.
- **Breadcrumbs always.** Users arrive from Discovery -- they need to go back.
- **Sticky CTA on mobile.** Fixed bottom bar with primary action.
- **Lazy-load below fold.** Tabs, reviews, related items load on demand.

### Responsive Behavior
| Breakpoint | Behavior |
|------------|----------|
| >= 1024px | Side-by-side media + info, full tab bar |
| 768-1023px | Stacked media/info, full tab bar |
| 640-767px | Full-width media, scrollable tabs |
| < 640px | Full-width media, accordion tabs, sticky CTA bar |

### Data Flow
```
Discovery page --> Detail page --> Action (CTA click) --> Action page
                               --> Related item click --> Another Detail page
                               --> Back (breadcrumb) --> Discovery page
```

---

## 4. Action

### Purpose
Complete a task. The user has decided what to do -- now guide them through doing it. Minimize friction, prevent errors, confirm completion.

### Examples
Checkout, multi-step form, file upload wizard, settings editor, content editor, booking flow.

### Layout Structure

```
+--------------------------------------------------+
|  Nav (simplified, no distractions)               |
+--------------------------------------------------+
|  Progress indicator (step 1 of 3)                |
+--------------------------------------------------+
|                                                  |
|  Form content (one logical group per step)       |
|                                                  |
|  [Field]                                         |
|  [Field]                                         |
|  [Field]                                         |
|                                                  |
+--------------------------------------------------+
|  Actions: [Back]              [Continue / Submit] |
+--------------------------------------------------+
```

### Component Palette
- Progress indicator (steps with labels, current highlighted)
- Form fields (text, select, checkbox, radio, date, file)
- Field groups (related fields with section title)
- Inline validation (success/error below each field)
- Summary panel (in multi-step, show what's been entered)
- Action bar (sticky bottom, back + continue/submit)
- Success state (confirmation with next steps)
- Error state (what went wrong + how to fix it)

### Key Rules
- **One thing per step.** Don't overwhelm. Group related fields.
- **Inline validation, not submit-and-pray.** Validate on blur, show errors immediately.
- **Summary before submit.** In multi-step flows, show a review step.
- **Preserve state.** If the user navigates away and back, their data is still there.
- **Simplified nav.** Remove global navigation distractions. Add a "save and exit" escape.
- **No required fields without labels.** Every required field must say so.

### Responsive Behavior
| Breakpoint | Behavior |
|------------|----------|
| >= 1024px | Centered form (max-width 640px), sidebar summary for multi-step |
| 768-1023px | Centered form, summary above or in accordion |
| 640-767px | Full-width form with padding |
| < 640px | Full-width, sticky action bar, large touch targets |

### Data Flow
```
Detail/Entry page --> Action page Step 1 --> Step 2 --> ... --> Step N
                                         --> Back to previous step
                                         --> Save and exit
                  --> Confirmation page (success)
                  --> Error recovery (retry)
```

### Form Accessibility Checklist
- [ ] Every input has a visible `<label>` element
- [ ] Required fields are indicated (not just by color)
- [ ] Error messages use `aria-describedby` linked to the field
- [ ] Error summary at top of form with links to each error
- [ ] Tab order follows visual order
- [ ] Autocomplete attributes set (`autocomplete="email"`, etc.)
- [ ] Submit button is a `<button type="submit">`, not a div

---

## 5. Management

### Purpose
Organize, monitor, and control. The user manages multiple items, views status, and takes bulk actions. Information density is high but must remain scannable.

### Examples
Admin dashboard, settings page, CMS content list, project board, analytics overview, account management.

### Layout Structure

```
+--------------------------------------------------+
|  Top bar (user menu, notifications, global search)|
+----------+---------------------------------------+
|          |  Page title + actions                 |
|  Side    |                                       |
|  nav     |  Stat cards row                       |
|          |                                       |
|  Section |  Data table / content area            |
|  Section |  [Select] [Filter] [Bulk actions]     |
|  Section |  Row  Row  Row  Row  Row              |
|  Section |  Row  Row  Row  Row  Row              |
|          |                                       |
|          |  Pagination                           |
+----------+---------------------------------------+
```

### Component Palette
- Sidebar navigation (collapsible, with sections and icons)
- Top bar (search, notifications, user avatar/menu)
- Stat cards (number, label, trend indicator, sparkline)
- Data table (sortable columns, row selection, inline actions)
- Filter bar (search + dropdowns + date range)
- Bulk action bar (appears when items selected)
- Detail panel/drawer (slide-in for item details)
- Charts (line, bar, pie -- use sparingly)
- Settings form groups (with save per section)
- Empty states (per section, with action to populate)

### Key Rules
- **Sidebar collapses, never disappears.** On mobile, it becomes a hamburger sheet.
- **Data tables are not optional.** Management means managing lists. Tables beat cards for data-dense views.
- **Bulk actions appear contextually.** Only when items are selected.
- **Inline editing where possible.** Click-to-edit beats navigate-to-edit.
- **Persistent state.** Filters, sort order, pagination position persist across sessions.
- **Export.** Always offer CSV/Excel export for table data.

### Responsive Behavior
| Breakpoint | Behavior |
|------------|----------|
| >= 1280px | Full sidebar + full table with all columns |
| 1024-1279px | Narrow sidebar (icons only) + table with priority columns |
| 768-1023px | Hamburger sidebar + responsive table (priority columns) |
| < 768px | Hamburger sidebar + card list instead of table |

### Data Flow
```
Management page --> Filter/Search --> Updated list
                --> Select items --> Bulk action
                --> Click item --> Detail drawer or Detail page
                --> Create new --> Action page
                --> Export --> File download
```

---

## 6. System

### Purpose
Handle infrastructure states that interrupt normal flow. Errors, loading, maintenance, empty states. These pages are often overlooked but deeply affect user experience.

### Examples
404 Not Found, 500 Server Error, maintenance mode, offline state, loading screen, empty state, permission denied.

### Layout Structure

```
+--------------------------------------------------+
|  Nav (if available / applicable)                 |
+--------------------------------------------------+
|                                                  |
|           [Icon / Illustration]                  |
|                                                  |
|           Status code or title                   |
|           Explanation (1-2 sentences)            |
|                                                  |
|           [Primary action: Go home / Retry]      |
|           [Secondary action: Contact support]    |
|                                                  |
+--------------------------------------------------+
|  Footer (if applicable)                          |
+--------------------------------------------------+
```

### Component Palette
- Status illustration (friendly, on-brand, not generic)
- Status title (clear, not technical -- "Page not found" not "404 Error")
- Explanation text (what happened + what to do)
- Action buttons (go home, retry, go back, contact support)
- Search bar (on 404 pages -- help users find what they wanted)
- Status indicator (for loading/maintenance, show progress or ETA)
- Offline indicator (persistent banner when connection is lost)

### Variants

#### 404 Not Found
- Friendly message, not blaming the user
- Search bar to help find the right page
- Popular links / recent pages
- "Go home" CTA

#### 500 Server Error
- Apologetic tone
- "We are working on it" if possible
- Retry button
- Status page link if available
- Contact support link

#### Maintenance Mode
- Expected duration if known
- Email notification signup
- Status page link
- Friendly illustration

#### Loading State
- Skeleton screens for known layouts
- Progress bar for known-duration operations
- Spinner only for unknown-duration, short operations
- Never leave users with zero feedback

#### Empty State
- Explain what will appear here
- CTA to create the first item
- Illustration showing the potential
- Import option if applicable

#### Permission Denied (403)
- Explain what they need access to
- Who to contact for access
- Alternative actions they can take

### Key Rules
- **No technical jargon.** "Page not found" not "404 HTTP Error".
- **Always provide a way out.** At minimum: go home, go back, retry.
- **Match the brand.** System pages are still part of the product.
- **Search on 404.** Users typed a URL or followed a dead link -- help them find it.
- **Skeleton > spinner > blank.** Prefer skeleton loading for pages with known structure.

### Responsive Behavior
| Breakpoint | Behavior |
|------------|----------|
| All sizes | Centered content, scales illustration, full-width buttons on mobile |

System pages should be the simplest responsive implementation. Centered single-column content works at every breakpoint.

### Data Flow
```
Any page --> Error/System state --> Primary action --> Home or retry
                                --> Secondary action --> Support or back
                                --> Search (404) --> Discovery page
```

---

## Archetype Selection Decision Tree

```
Is the user arriving for the first time?
  YES --> Entry

Is the user browsing/searching multiple items?
  YES --> Discovery

Is the user looking at one specific item?
  YES --> Detail

Is the user completing a task (form, checkout, wizard)?
  YES --> Action

Is the user managing/monitoring things?
  YES --> Management

Is it an error, loading, empty, or offline state?
  YES --> System
```

---

## Archetype Transitions

Pages connect to each other in predictable patterns:

```
Entry --> Discovery (browse) or Action (direct conversion)
Discovery --> Detail (item selected) or Action (quick action)
Detail --> Action (CTA clicked) or Discovery (back to browse)
Action --> System (success/error confirmation)
Management --> Detail (item clicked) or Action (create/edit)
System --> Entry (go home) or previous page (go back)
```

Always ensure transition animations are consistent and respect `prefers-reduced-motion`.
