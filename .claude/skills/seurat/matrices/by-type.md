# Profiles by Type

Profili per tipologia di progetto web/app.

---

## Core Web

### SaaS

```yaml
id: type-saas
name: SaaS (Software as a Service)

visual_weights:
  trust: 0.6
  innovation: 0.7
  formality: 0.5
  warmth: 0.4
  playfulness: 0.3
  density: 0.5

style_affinities:
  high: [material, glassmorphism, bento]
  medium: [flat, neumorphism, spatial]
  low: [brutalism, claymorphism, gen-z, y2k, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.6, mono: 0.3}
  grid: {swiss: 0.5, bento: 0.4}
  curves: {organic: 0.6}
  density: {balanced: 0.7}
```

### E-commerce

```yaml
id: type-ecommerce
name: E-commerce

visual_weights:
  trust: 0.7
  innovation: 0.4
  formality: 0.4
  warmth: 0.6
  playfulness: 0.3
  density: 0.6

style_affinities:
  high: [flat, material, bento]
  medium: [glassmorphism]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.5, cold: 0.4}
  grid: {swiss: 0.6, bento: 0.4}
  curves: {organic: 0.5, geometric: 0.4}
  density: {balanced: 0.5, dense: 0.4}
```

### Portfolio

```yaml
id: type-portfolio
name: Portfolio (Personal, Agency, Creative)

visual_weights:
  trust: 0.4
  innovation: 0.8
  formality: 0.3
  warmth: 0.5
  playfulness: 0.6
  density: 0.3

style_affinities:
  high: [brutalism, bento, spatial, glassmorphism]
  medium: [flat, gen-z, y2k]
  low: [material, neumorphism, claymorphism, skeuomorphism]

modifier_tendencies:
  palette: {mono: 0.4, neon: 0.3, jewel: 0.3}
  grid: {asymmetric: 0.5, bento: 0.4}
  curves: {mixed: 0.5}
  density: {sparse: 0.7}
```

### Documentation

```yaml
id: type-documentation
name: Documentation (API Docs, Knowledge Base, Wiki)

visual_weights:
  trust: 0.6
  innovation: 0.3
  formality: 0.7
  warmth: 0.3
  playfulness: 0.1
  density: 0.6

style_affinities:
  high: [flat, material]
  medium: [bento]
  low: [neumorphism, glassmorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {mono: 0.6, cold: 0.3}
  grid: {swiss: 0.8}
  curves: {geometric: 0.7}
  density: {balanced: 0.5, dense: 0.4}
```

### Landing Page

```yaml
id: type-landing
name: Landing Page (Product, Event, Waitlist)

visual_weights:
  trust: 0.5
  innovation: 0.7
  formality: 0.4
  warmth: 0.5
  playfulness: 0.4
  density: 0.3

style_affinities:
  high: [glassmorphism, bento, spatial]
  medium: [flat, material, brutalism]
  low: [neumorphism, claymorphism, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.4, neon: 0.3, jewel: 0.3}
  grid: {asymmetric: 0.4, bento: 0.4}
  curves: {organic: 0.6}
  density: {sparse: 0.6, balanced: 0.3}
```

### Blog/Publishing

```yaml
id: type-blog
name: Blog/Publishing (Personal, Corporate, Magazine)

visual_weights:
  trust: 0.5
  innovation: 0.4
  formality: 0.5
  warmth: 0.5
  playfulness: 0.3
  density: 0.4

style_affinities:
  high: [flat, bento]
  medium: [material, brutalism]
  low: [neumorphism, glassmorphism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {mono: 0.4, warm: 0.3, cold: 0.3}
  grid: {swiss: 0.6}
  curves: {geometric: 0.5, organic: 0.4}
  density: {sparse: 0.5, balanced: 0.4}
```

### Corporate Website

```yaml
id: type-corporate
name: Corporate Website (Institutional)

visual_weights:
  trust: 0.8
  innovation: 0.4
  formality: 0.8
  warmth: 0.3
  playfulness: 0.1
  density: 0.4

style_affinities:
  high: [flat, material]
  medium: [bento, glassmorphism]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.7, mono: 0.2}
  grid: {swiss: 0.8}
  curves: {geometric: 0.6, organic: 0.3}
  density: {balanced: 0.7}

hard_constraints:
  playfulness.max: 0.3
```

### Dashboard/Admin Panel

```yaml
id: type-dashboard
name: Dashboard/Admin Panel

visual_weights:
  trust: 0.6
  innovation: 0.5
  formality: 0.6
  warmth: 0.3
  playfulness: 0.2
  density: 0.7

style_affinities:
  high: [material, flat, bento]
  medium: [glassmorphism]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.6, mono: 0.3}
  grid: {swiss: 0.6, bento: 0.3}
  curves: {geometric: 0.6}
  density: {dense: 0.5, balanced: 0.4}
```

---

## Mobile-First

### PWA

```yaml
id: type-pwa
name: Progressive Web App

visual_weights:
  trust: 0.5
  innovation: 0.6
  formality: 0.4
  warmth: 0.5
  playfulness: 0.4
  density: 0.5

style_affinities:
  high: [material, flat]
  medium: [glassmorphism, bento]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.5, warm: 0.4}
  grid: {swiss: 0.7}
  curves: {organic: 0.6}
  density: {balanced: 0.6}
```

### Mobile App Landing

```yaml
id: type-app-landing
name: Mobile App Landing (Showcase)

visual_weights:
  trust: 0.5
  innovation: 0.7
  formality: 0.4
  warmth: 0.5
  playfulness: 0.5
  density: 0.3

style_affinities:
  high: [glassmorphism, bento, spatial]
  medium: [material, flat]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.4, neon: 0.3}
  grid: {bento: 0.5, asymmetric: 0.4}
  curves: {organic: 0.7}
  density: {sparse: 0.6}
```

### On-Demand App

```yaml
id: type-ondemand
name: On-Demand App (Food delivery, Ride sharing)

visual_weights:
  trust: 0.6
  innovation: 0.5
  formality: 0.3
  warmth: 0.7
  playfulness: 0.4
  density: 0.5

style_affinities:
  high: [material, flat, claymorphism]
  medium: [bento]
  low: [neumorphism, glassmorphism, brutalism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.6}
  grid: {swiss: 0.6}
  curves: {organic: 0.7}
  density: {balanced: 0.6}
```

---

## Content & Media

### Video Streaming

```yaml
id: type-video
name: Video Streaming

visual_weights:
  trust: 0.5
  innovation: 0.6
  formality: 0.4
  warmth: 0.4
  playfulness: 0.4
  density: 0.5

style_affinities:
  high: [flat, glassmorphism]
  medium: [material, spatial]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, bento, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.7, mono: 0.2}
  grid: {swiss: 0.5, bento: 0.4}
  curves: {organic: 0.5}
  density: {balanced: 0.5, dense: 0.4}

# Note: Dark mode strongly preferred
```

### Audio/Podcast

```yaml
id: type-audio
name: Audio/Podcast Platform

visual_weights:
  trust: 0.5
  innovation: 0.6
  formality: 0.3
  warmth: 0.5
  playfulness: 0.5
  density: 0.4

style_affinities:
  high: [flat, glassmorphism, neumorphism]
  medium: [material, skeuomorphism]
  low: [brutalism, claymorphism, gen-z, y2k, bento, spatial]

modifier_tendencies:
  palette: {cold: 0.5, neon: 0.3}
  grid: {swiss: 0.5}
  curves: {organic: 0.6}
  density: {balanced: 0.6}
```

### Gallery

```yaml
id: type-gallery
name: Gallery (Photo, Art, Media)

visual_weights:
  trust: 0.4
  innovation: 0.6
  formality: 0.4
  warmth: 0.4
  playfulness: 0.4
  density: 0.3

style_affinities:
  high: [flat, bento, brutalism]
  medium: [glassmorphism, spatial]
  low: [material, neumorphism, claymorphism, gen-z, y2k, skeuomorphism]

modifier_tendencies:
  palette: {mono: 0.6}
  grid: {bento: 0.5, asymmetric: 0.4}
  curves: {geometric: 0.5}
  density: {sparse: 0.6}
```

### News/Magazine

```yaml
id: type-news
name: News/Magazine

visual_weights:
  trust: 0.7
  innovation: 0.4
  formality: 0.6
  warmth: 0.4
  playfulness: 0.2
  density: 0.6

style_affinities:
  high: [flat, brutalism]
  medium: [material, bento]
  low: [neumorphism, glassmorphism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {mono: 0.5, cold: 0.4}
  grid: {swiss: 0.7}
  curves: {geometric: 0.6}
  density: {balanced: 0.5, dense: 0.4}
```

---

## Community & Social

### Forum/Community

```yaml
id: type-forum
name: Forum/Community

visual_weights:
  trust: 0.5
  innovation: 0.4
  formality: 0.4
  warmth: 0.6
  playfulness: 0.4
  density: 0.6

style_affinities:
  high: [flat, material]
  medium: [bento]
  low: [neumorphism, glassmorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.4, cold: 0.4}
  grid: {swiss: 0.7}
  curves: {organic: 0.5}
  density: {balanced: 0.5, dense: 0.4}
```

### Social Network

```yaml
id: type-social
name: Social Network

visual_weights:
  trust: 0.5
  innovation: 0.6
  formality: 0.3
  warmth: 0.6
  playfulness: 0.6
  density: 0.5

style_affinities:
  high: [flat, material]
  medium: [glassmorphism, gen-z]
  low: [neumorphism, brutalism, claymorphism, y2k, bento, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.4, neon: 0.3}
  grid: {swiss: 0.6}
  curves: {organic: 0.6}
  density: {balanced: 0.6}
```

### Membership/Subscription

```yaml
id: type-membership
name: Membership/Subscription Platform

visual_weights:
  trust: 0.6
  innovation: 0.5
  formality: 0.4
  warmth: 0.5
  playfulness: 0.4
  density: 0.4

style_affinities:
  high: [flat, glassmorphism, bento]
  medium: [material]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.4, jewel: 0.3}
  grid: {bento: 0.5, swiss: 0.4}
  curves: {organic: 0.6}
  density: {balanced: 0.6}
```

### Event/Conference

```yaml
id: type-event
name: Event/Conference

visual_weights:
  trust: 0.5
  innovation: 0.6
  formality: 0.5
  warmth: 0.5
  playfulness: 0.4
  density: 0.4

style_affinities:
  high: [glassmorphism, bento, brutalism]
  medium: [flat, spatial]
  low: [material, neumorphism, claymorphism, gen-z, y2k, skeuomorphism]

modifier_tendencies:
  palette: {neon: 0.4, jewel: 0.3, cold: 0.3}
  grid: {bento: 0.5, asymmetric: 0.4}
  curves: {organic: 0.5}
  density: {balanced: 0.6}
```

---

## Specialized

### Booking/Reservation

```yaml
id: type-booking
name: Booking/Reservation

visual_weights:
  trust: 0.7
  innovation: 0.4
  formality: 0.5
  warmth: 0.5
  playfulness: 0.3
  density: 0.5

style_affinities:
  high: [material, flat]
  medium: [glassmorphism, bento]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.5, cold: 0.4}
  grid: {swiss: 0.7}
  curves: {organic: 0.5}
  density: {balanced: 0.6}
```

### Real Estate

```yaml
id: type-realestate
name: Real Estate

visual_weights:
  trust: 0.7
  innovation: 0.4
  formality: 0.6
  warmth: 0.5
  playfulness: 0.2
  density: 0.5

style_affinities:
  high: [flat, material, bento]
  medium: [glassmorphism]
  low: [neumorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.5, cold: 0.4}
  grid: {bento: 0.5, swiss: 0.4}
  curves: {organic: 0.5}
  density: {balanced: 0.6}
```

### Job Board

```yaml
id: type-jobboard
name: Job Board

visual_weights:
  trust: 0.6
  innovation: 0.4
  formality: 0.6
  warmth: 0.4
  playfulness: 0.2
  density: 0.6

style_affinities:
  high: [flat, material]
  medium: [bento]
  low: [neumorphism, glassmorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.6, mono: 0.3}
  grid: {swiss: 0.7}
  curves: {geometric: 0.5}
  density: {balanced: 0.5, dense: 0.4}
```

### Educational/LMS

```yaml
id: type-education
name: Educational/LMS

visual_weights:
  trust: 0.6
  innovation: 0.5
  formality: 0.5
  warmth: 0.6
  playfulness: 0.4
  density: 0.5

style_affinities:
  high: [material, flat, claymorphism]
  medium: [bento]
  low: [neumorphism, glassmorphism, brutalism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.5, cold: 0.4}
  grid: {swiss: 0.6}
  curves: {organic: 0.6}
  density: {balanced: 0.6}
```

### Nonprofit

```yaml
id: type-nonprofit
name: Nonprofit (Charity, Fundraising)

visual_weights:
  trust: 0.8
  innovation: 0.4
  formality: 0.5
  warmth: 0.7
  playfulness: 0.3
  density: 0.4

style_affinities:
  high: [flat, material]
  medium: [bento, claymorphism]
  low: [neumorphism, glassmorphism, brutalism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.6, earth: 0.3}
  grid: {swiss: 0.6}
  curves: {organic: 0.6}
  density: {balanced: 0.6}
```

### Wiki/Knowledge

```yaml
id: type-wiki
name: Wiki/Knowledge Base

visual_weights:
  trust: 0.6
  innovation: 0.3
  formality: 0.6
  warmth: 0.3
  playfulness: 0.1
  density: 0.6

style_affinities:
  high: [flat]
  medium: [material]
  low: [neumorphism, glassmorphism, brutalism, claymorphism, gen-z, y2k, bento, spatial, skeuomorphism]

modifier_tendencies:
  palette: {mono: 0.6, cold: 0.3}
  grid: {swiss: 0.8}
  curves: {geometric: 0.7}
  density: {balanced: 0.5, dense: 0.4}
```

### Directory/Listing

```yaml
id: type-directory
name: Directory/Listing

visual_weights:
  trust: 0.5
  innovation: 0.3
  formality: 0.5
  warmth: 0.4
  playfulness: 0.2
  density: 0.7

style_affinities:
  high: [flat, material]
  medium: [bento]
  low: [neumorphism, glassmorphism, brutalism, claymorphism, gen-z, y2k, spatial, skeuomorphism]

modifier_tendencies:
  palette: {cold: 0.5, mono: 0.4}
  grid: {swiss: 0.7}
  curves: {geometric: 0.5}
  density: {dense: 0.5, balanced: 0.4}
```

### Form/Survey

```yaml
id: type-form
name: Form/Survey (Typeform-style)

visual_weights:
  trust: 0.5
  innovation: 0.6
  formality: 0.4
  warmth: 0.6
  playfulness: 0.5
  density: 0.2

style_affinities:
  high: [flat, glassmorphism]
  medium: [material, neumorphism]
  low: [brutalism, claymorphism, gen-z, y2k, bento, spatial, skeuomorphism]

modifier_tendencies:
  palette: {warm: 0.4, cold: 0.4}
  grid: {swiss: 0.6}
  curves: {organic: 0.7}
  density: {sparse: 0.8}
```
