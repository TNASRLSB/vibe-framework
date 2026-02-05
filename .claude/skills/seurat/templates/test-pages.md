# Test Pages Templates

Templates for `/seurat test-system` command. When generating test pages, use these structures with tokens from `system.md`.

---

## index.html

Main entry point linking to all archetype test pages.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design System Test Pages</title>
  <link rel="stylesheet" href="tokens.css">
  <style>
    body {
      font-family: var(--font-body);
      background: var(--color-bg);
      color: var(--color-text);
      padding: var(--space-6);
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { font-family: var(--font-display); margin-bottom: var(--space-4); }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-3);
    }
    .card {
      background: var(--color-surface);
      border-radius: var(--radius);
      padding: var(--space-4);
      text-decoration: none;
      color: inherit;
      border: 1px solid var(--color-border);
      transition: transform 150ms ease, box-shadow 150ms ease;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .card h2 { margin: 0 0 var(--space-2); font-size: var(--text-lg); }
    .card p { margin: 0; color: var(--color-text-muted); font-size: var(--text-sm); }
  </style>
</head>
<body>
  <h1>Design System Test Pages</h1>
  <p style="margin-bottom: var(--space-5); color: var(--color-text-muted);">
    Review each archetype to validate your design system before adoption.
  </p>

  <div class="grid">
    <a href="entry.html" class="card">
      <h2>Entry</h2>
      <p>Landing pages, hero sections, CTAs</p>
    </a>
    <a href="discovery.html" class="card">
      <h2>Discovery</h2>
      <p>Search, filters, product grids</p>
    </a>
    <a href="detail.html" class="card">
      <h2>Detail</h2>
      <p>Product pages, galleries, specs</p>
    </a>
    <a href="action.html" class="card">
      <h2>Action</h2>
      <p>Forms, inputs, validation</p>
    </a>
    <a href="management.html" class="card">
      <h2>Management</h2>
      <p>Tables, bulk actions, admin</p>
    </a>
    <a href="system.html" class="card">
      <h2>System</h2>
      <p>Errors, empty states, confirmations</p>
    </a>
  </div>
</body>
</html>
```

---

## tokens.css

Generated from `system.md`. Example structure:

```css
:root {
  /* Spacing - from system.md */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-5: 48px;
  --space-6: 64px;
  --space-7: 96px;
  --space-8: 128px;

  /* Typography - from system.md */
  --font-display: "Font Name", fallback;
  --font-body: "Font Name", fallback;
  --font-mono: "Font Name", monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;

  /* Colors - from system.md */
  --color-bg: hsl(...);
  --color-surface: hsl(...);
  --color-border: hsl(...);
  --color-text: hsl(...);
  --color-text-muted: hsl(...);
  --color-accent: hsl(...);

  /* Shadows - from system.md */
  --shadow-sm: ...;
  --shadow-md: ...;
  --shadow-lg: ...;

  /* Radius - from system.md */
  --radius: ...;
  --radius-full: 9999px;
}

/* Dark mode toggle support */
[data-theme="dark"] {
  --color-bg: hsl(...);
  --color-surface: hsl(...);
  /* ... inverted values ... */
}
```

---

## entry.html

Entry/Landing page components demo.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Entry Page - Design System Test</title>
  <link rel="stylesheet" href="tokens.css">
</head>
<body>
  <a href="index.html">&larr; Back to index</a>

  <h1>Entry Page Components</h1>

  <!-- NAVIGATION -->
  <section>
    <h2>Navigation</h2>
    <nav class="nav-example">
      <div class="nav-logo">Logo</div>
      <ul class="nav-links">
        <li><a href="#">Features</a></li>
        <li><a href="#">Pricing</a></li>
        <li><a href="#">About</a></li>
      </ul>
      <button class="btn-primary">Get Started</button>
    </nav>
  </section>

  <!-- HERO SECTION -->
  <section>
    <h2>Hero Section</h2>
    <div class="hero">
      <h1 class="hero-headline">Your Compelling Value Proposition</h1>
      <p class="hero-subhead">
        Expand on the headline with 15-25 words that clarify the benefit.
      </p>
      <div class="hero-actions">
        <button class="btn-primary">Primary CTA</button>
        <button class="btn-secondary">Secondary CTA</button>
      </div>
    </div>
  </section>

  <!-- SOCIAL PROOF -->
  <section>
    <h2>Social Proof</h2>
    <div class="logos-bar">
      <span class="logo-placeholder">Logo 1</span>
      <span class="logo-placeholder">Logo 2</span>
      <span class="logo-placeholder">Logo 3</span>
      <span class="logo-placeholder">Logo 4</span>
    </div>

    <div class="testimonial">
      <blockquote>"Specific testimonial with concrete result or benefit."</blockquote>
      <cite>Name, Title at Company</cite>
    </div>
  </section>

  <!-- FEATURES -->
  <section>
    <h2>Features Grid</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">Icon</div>
        <h3>Feature One</h3>
        <p>Brief description of benefit.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">Icon</div>
        <h3>Feature Two</h3>
        <p>Brief description of benefit.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">Icon</div>
        <h3>Feature Three</h3>
        <p>Brief description of benefit.</p>
      </div>
    </div>
  </section>

  <!-- FINAL CTA -->
  <section>
    <h2>Final CTA Section</h2>
    <div class="cta-section">
      <h2>Ready to get started?</h2>
      <p>Reinforce the value proposition one more time.</p>
      <button class="btn-primary btn-large">Start Free Trial</button>
    </div>
  </section>

  <!-- FOOTER -->
  <section>
    <h2>Footer</h2>
    <footer class="footer">
      <div class="footer-links">
        <div class="footer-column">
          <h4>Product</h4>
          <ul>
            <li><a href="#">Features</a></li>
            <li><a href="#">Pricing</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 Company. All rights reserved.</p>
      </div>
    </footer>
  </section>
</body>
</html>
```

---

## discovery.html

Search/Listing page components demo.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Discovery Page - Design System Test</title>
  <link rel="stylesheet" href="tokens.css">
</head>
<body>
  <a href="index.html">&larr; Back to index</a>

  <h1>Discovery Page Components</h1>

  <!-- SEARCH BAR -->
  <section>
    <h2>Search Bar</h2>
    <div class="search-bar">
      <input type="search" placeholder="Search products...">
      <button class="btn-icon">Search</button>
    </div>
  </section>

  <!-- FILTERS -->
  <section>
    <h2>Filter Sidebar</h2>
    <aside class="filters">
      <div class="filter-group">
        <h3>Category</h3>
        <label><input type="checkbox"> Electronics</label>
        <label><input type="checkbox"> Clothing</label>
        <label><input type="checkbox"> Home</label>
      </div>
      <div class="filter-group">
        <h3>Price Range</h3>
        <label><input type="checkbox"> Under $50</label>
        <label><input type="checkbox"> $50 - $100</label>
        <label><input type="checkbox"> Over $100</label>
      </div>
      <button class="btn-secondary">Clear All</button>
    </aside>
  </section>

  <!-- RESULTS HEADER -->
  <section>
    <h2>Results Header</h2>
    <div class="results-header">
      <span class="results-count">42 results</span>
      <div class="results-controls">
        <select class="sort-select">
          <option>Sort by: Relevance</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Newest</option>
        </select>
        <div class="view-toggle">
          <button class="btn-icon active">Grid</button>
          <button class="btn-icon">List</button>
        </div>
      </div>
    </div>
  </section>

  <!-- PRODUCT GRID -->
  <section>
    <h2>Product Grid</h2>
    <div class="product-grid">
      <div class="product-card">
        <div class="product-image">Image</div>
        <h3 class="product-title">Product Name</h3>
        <p class="product-price">$99.00</p>
        <span class="product-rating">★★★★☆ (42)</span>
      </div>
      <div class="product-card">
        <div class="product-image">Image</div>
        <h3 class="product-title">Product Name</h3>
        <p class="product-price">$149.00</p>
        <span class="product-rating">★★★★★ (128)</span>
      </div>
      <div class="product-card loading">
        <div class="skeleton"></div>
      </div>
    </div>
  </section>

  <!-- PAGINATION -->
  <section>
    <h2>Pagination</h2>
    <nav class="pagination">
      <button class="btn-icon" disabled>&larr;</button>
      <button class="page-number active">1</button>
      <button class="page-number">2</button>
      <button class="page-number">3</button>
      <span>...</span>
      <button class="page-number">12</button>
      <button class="btn-icon">&rarr;</button>
    </nav>
  </section>

  <!-- EMPTY STATE -->
  <section>
    <h2>Empty State</h2>
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No results found</h3>
      <p>Try adjusting your filters or search terms.</p>
      <button class="btn-secondary">Clear Filters</button>
    </div>
  </section>
</body>
</html>
```

---

## detail.html

Detail/Product page components demo.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Detail Page - Design System Test</title>
  <link rel="stylesheet" href="tokens.css">
</head>
<body>
  <a href="index.html">&larr; Back to index</a>

  <h1>Detail Page Components</h1>

  <!-- BREADCRUMBS -->
  <section>
    <h2>Breadcrumbs</h2>
    <nav class="breadcrumbs">
      <a href="#">Home</a>
      <span>/</span>
      <a href="#">Category</a>
      <span>/</span>
      <span class="current">Product Name</span>
    </nav>
  </section>

  <!-- MEDIA GALLERY -->
  <section>
    <h2>Media Gallery</h2>
    <div class="gallery">
      <div class="gallery-main">
        <div class="gallery-image">Main Image</div>
      </div>
      <div class="gallery-thumbs">
        <button class="thumb active">1</button>
        <button class="thumb">2</button>
        <button class="thumb">3</button>
        <button class="thumb">4</button>
      </div>
    </div>
  </section>

  <!-- PRODUCT INFO -->
  <section>
    <h2>Product Info</h2>
    <div class="product-info">
      <h1 class="product-title">Product Title with Key Attributes</h1>
      <div class="product-meta">
        <span class="rating">★★★★☆ 4.2 (128 reviews)</span>
        <span class="sku">SKU: ABC123</span>
      </div>
      <p class="product-price">
        <span class="price-current">$149.00</span>
        <span class="price-original">$199.00</span>
        <span class="price-discount">25% off</span>
      </p>
    </div>
  </section>

  <!-- VARIANT SELECTOR -->
  <section>
    <h2>Variant Selector</h2>
    <div class="variants">
      <div class="variant-group">
        <label>Size</label>
        <div class="variant-options">
          <button class="variant-option">S</button>
          <button class="variant-option active">M</button>
          <button class="variant-option">L</button>
          <button class="variant-option disabled">XL</button>
        </div>
      </div>
      <div class="variant-group">
        <label>Color</label>
        <div class="variant-options colors">
          <button class="color-swatch" style="background: #1a1a1a" title="Black"></button>
          <button class="color-swatch active" style="background: #3b5998" title="Navy"></button>
          <button class="color-swatch" style="background: #8b4513" title="Brown"></button>
        </div>
      </div>
    </div>
  </section>

  <!-- ADD TO CART -->
  <section>
    <h2>Primary Action</h2>
    <div class="product-actions">
      <div class="quantity-selector">
        <button class="btn-icon">-</button>
        <input type="number" value="1" min="1">
        <button class="btn-icon">+</button>
      </div>
      <button class="btn-primary btn-large">Add to Cart</button>
      <button class="btn-icon btn-wishlist">♡</button>
    </div>
  </section>

  <!-- TABS -->
  <section>
    <h2>Content Tabs</h2>
    <div class="tabs">
      <div class="tab-list">
        <button class="tab active">Description</button>
        <button class="tab">Specifications</button>
        <button class="tab">Reviews (128)</button>
      </div>
      <div class="tab-panel">
        <p>Product description with scannable paragraphs and bullet points for key features.</p>
        <ul>
          <li>Feature one with benefit</li>
          <li>Feature two with benefit</li>
          <li>Feature three with benefit</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- RELATED PRODUCTS -->
  <section>
    <h2>Related Products</h2>
    <div class="related-grid">
      <div class="product-card-small">
        <div class="product-image">Img</div>
        <h4>Related Product 1</h4>
        <p>$79.00</p>
      </div>
      <div class="product-card-small">
        <div class="product-image">Img</div>
        <h4>Related Product 2</h4>
        <p>$99.00</p>
      </div>
      <div class="product-card-small">
        <div class="product-image">Img</div>
        <h4>Related Product 3</h4>
        <p>$129.00</p>
      </div>
    </div>
  </section>
</body>
</html>
```

---

## action.html

Form/Action page components demo.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Action Page - Design System Test</title>
  <link rel="stylesheet" href="tokens.css">
</head>
<body>
  <a href="index.html">&larr; Back to index</a>

  <h1>Action Page Components</h1>

  <!-- PROGRESS INDICATOR -->
  <section>
    <h2>Progress Indicator</h2>
    <div class="progress-steps">
      <div class="step completed">
        <span class="step-number">✓</span>
        <span class="step-label">Account</span>
      </div>
      <div class="step-connector completed"></div>
      <div class="step active">
        <span class="step-number">2</span>
        <span class="step-label">Shipping</span>
      </div>
      <div class="step-connector"></div>
      <div class="step">
        <span class="step-number">3</span>
        <span class="step-label">Payment</span>
      </div>
    </div>
  </section>

  <!-- FORM INPUTS -->
  <section>
    <h2>Form Inputs</h2>

    <div class="form-group">
      <label for="text-default">Text Input (Default)</label>
      <input type="text" id="text-default" placeholder="Enter text...">
    </div>

    <div class="form-group">
      <label for="text-focus">Text Input (Focus)</label>
      <input type="text" id="text-focus" class="focus" placeholder="Focused state">
    </div>

    <div class="form-group error">
      <label for="text-error">Text Input (Error)</label>
      <input type="text" id="text-error" value="Invalid input">
      <span class="error-message">Please enter a valid value</span>
    </div>

    <div class="form-group success">
      <label for="text-success">Text Input (Success)</label>
      <input type="text" id="text-success" value="Valid input">
      <span class="success-message">Looks good!</span>
    </div>

    <div class="form-group disabled">
      <label for="text-disabled">Text Input (Disabled)</label>
      <input type="text" id="text-disabled" disabled value="Disabled">
    </div>
  </section>

  <!-- FORM CONTROLS -->
  <section>
    <h2>Form Controls</h2>

    <div class="form-group">
      <label for="select">Select Dropdown</label>
      <select id="select">
        <option>Option One</option>
        <option>Option Two</option>
        <option>Option Three</option>
      </select>
    </div>

    <div class="form-group">
      <label for="textarea">Textarea</label>
      <textarea id="textarea" rows="4" placeholder="Enter longer text..."></textarea>
    </div>

    <div class="form-group">
      <span class="label">Checkboxes</span>
      <label class="checkbox">
        <input type="checkbox" checked>
        <span>Option checked</span>
      </label>
      <label class="checkbox">
        <input type="checkbox">
        <span>Option unchecked</span>
      </label>
    </div>

    <div class="form-group">
      <span class="label">Radio Buttons</span>
      <label class="radio">
        <input type="radio" name="radio-group" checked>
        <span>Option A</span>
      </label>
      <label class="radio">
        <input type="radio" name="radio-group">
        <span>Option B</span>
      </label>
    </div>

    <div class="form-group">
      <span class="label">Toggle Switch</span>
      <label class="toggle">
        <input type="checkbox">
        <span class="toggle-slider"></span>
        <span class="toggle-label">Enable feature</span>
      </label>
    </div>
  </section>

  <!-- BUTTONS -->
  <section>
    <h2>Buttons</h2>
    <div class="button-row">
      <button class="btn-primary">Primary</button>
      <button class="btn-secondary">Secondary</button>
      <button class="btn-tertiary">Tertiary</button>
      <button class="btn-danger">Danger</button>
    </div>
    <div class="button-row">
      <button class="btn-primary" disabled>Disabled</button>
      <button class="btn-primary loading">
        <span class="spinner"></span>
        Loading...
      </button>
    </div>
    <div class="button-row">
      <button class="btn-primary btn-small">Small</button>
      <button class="btn-primary">Default</button>
      <button class="btn-primary btn-large">Large</button>
    </div>
  </section>

  <!-- FORM ACTIONS -->
  <section>
    <h2>Form Actions</h2>
    <div class="form-actions">
      <button class="btn-secondary">Cancel</button>
      <button class="btn-primary">Create Account</button>
    </div>
  </section>

  <!-- OAUTH BUTTONS -->
  <section>
    <h2>OAuth / Alternative Actions</h2>
    <div class="divider-text">or continue with</div>
    <div class="oauth-buttons">
      <button class="btn-oauth">
        <span class="oauth-icon">G</span>
        Google
      </button>
      <button class="btn-oauth">
        <span class="oauth-icon">GH</span>
        GitHub
      </button>
    </div>
  </section>
</body>
</html>
```

---

## management.html

Table/Management page components demo.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Management Page - Design System Test</title>
  <link rel="stylesheet" href="tokens.css">
</head>
<body>
  <a href="index.html">&larr; Back to index</a>

  <h1>Management Page Components</h1>

  <!-- PAGE HEADER -->
  <section>
    <h2>Page Header</h2>
    <header class="page-header">
      <div class="page-title">
        <h1>Users</h1>
        <span class="count-badge">1,234</span>
      </div>
      <button class="btn-primary">Add User</button>
    </header>
  </section>

  <!-- TOOLBAR -->
  <section>
    <h2>Toolbar</h2>
    <div class="toolbar">
      <div class="search-field">
        <input type="search" placeholder="Search users...">
      </div>
      <div class="toolbar-filters">
        <select>
          <option>All Roles</option>
          <option>Admin</option>
          <option>User</option>
        </select>
        <select>
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>
      <div class="toolbar-actions">
        <button class="btn-icon" title="Export">Export</button>
        <button class="btn-icon" title="Settings">Settings</button>
      </div>
    </div>
  </section>

  <!-- SELECTION HEADER -->
  <section>
    <h2>Selection Header</h2>
    <div class="selection-header">
      <span>3 selected</span>
      <button class="btn-secondary btn-small">Select All</button>
      <div class="bulk-actions">
        <button class="btn-secondary btn-small">Edit</button>
        <button class="btn-danger btn-small">Delete</button>
      </div>
    </div>
  </section>

  <!-- DATA TABLE -->
  <section>
    <h2>Data Table</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th class="checkbox-col"><input type="checkbox"></th>
          <th class="sortable sorted-asc">Name</th>
          <th class="sortable">Email</th>
          <th class="sortable">Role</th>
          <th>Status</th>
          <th class="actions-col">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr class="selected">
          <td><input type="checkbox" checked></td>
          <td>
            <div class="user-cell">
              <div class="avatar">JD</div>
              <span>John Doe</span>
            </div>
          </td>
          <td>john@example.com</td>
          <td>Admin</td>
          <td><span class="status-badge success">Active</span></td>
          <td class="row-actions">
            <button class="btn-icon" title="Edit">Edit</button>
            <button class="btn-icon" title="Delete">Delete</button>
          </td>
        </tr>
        <tr>
          <td><input type="checkbox"></td>
          <td>
            <div class="user-cell">
              <div class="avatar">JS</div>
              <span>Jane Smith</span>
            </div>
          </td>
          <td>jane@example.com</td>
          <td>User</td>
          <td><span class="status-badge warning">Pending</span></td>
          <td class="row-actions">
            <button class="btn-icon" title="Edit">Edit</button>
            <button class="btn-icon" title="Delete">Delete</button>
          </td>
        </tr>
        <tr>
          <td><input type="checkbox"></td>
          <td>
            <div class="user-cell">
              <div class="avatar">BW</div>
              <span>Bob Wilson</span>
            </div>
          </td>
          <td>bob@example.com</td>
          <td>User</td>
          <td><span class="status-badge error">Inactive</span></td>
          <td class="row-actions">
            <button class="btn-icon" title="Edit">Edit</button>
            <button class="btn-icon" title="Delete">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- PAGINATION -->
  <section>
    <h2>Table Pagination</h2>
    <div class="table-pagination">
      <div class="page-size">
        <span>Show</span>
        <select>
          <option>25</option>
          <option>50</option>
          <option>100</option>
        </select>
        <span>per page</span>
      </div>
      <div class="page-info">
        Showing 1-25 of 1,234
      </div>
      <nav class="page-nav">
        <button class="btn-icon" disabled>&larr;</button>
        <span>Page 1 of 50</span>
        <button class="btn-icon">&rarr;</button>
      </nav>
    </div>
  </section>

  <!-- STATUS BADGES -->
  <section>
    <h2>Status Badges</h2>
    <div class="badge-row">
      <span class="status-badge success">Active</span>
      <span class="status-badge warning">Pending</span>
      <span class="status-badge error">Inactive</span>
      <span class="status-badge info">New</span>
      <span class="status-badge neutral">Draft</span>
    </div>
  </section>
</body>
</html>
```

---

## system.html

Error/System state components demo.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Pages - Design System Test</title>
  <link rel="stylesheet" href="tokens.css">
</head>
<body>
  <a href="index.html">&larr; Back to index</a>

  <h1>System Page Components</h1>

  <!-- 404 ERROR -->
  <section>
    <h2>404 Not Found</h2>
    <div class="error-page">
      <div class="error-icon">🔍</div>
      <h1 class="error-code">404</h1>
      <h2 class="error-message">Page not found</h2>
      <p class="error-description">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div class="error-actions">
        <button class="btn-primary">Go Home</button>
        <button class="btn-secondary">Search</button>
      </div>
    </div>
  </section>

  <!-- 500 ERROR -->
  <section>
    <h2>500 Server Error</h2>
    <div class="error-page">
      <div class="error-icon">⚠️</div>
      <h1 class="error-code">500</h1>
      <h2 class="error-message">Something went wrong</h2>
      <p class="error-description">
        We're experiencing technical difficulties. Our team has been notified.
      </p>
      <div class="error-actions">
        <button class="btn-primary">Try Again</button>
        <button class="btn-secondary">Contact Support</button>
      </div>
    </div>
  </section>

  <!-- MAINTENANCE -->
  <section>
    <h2>Maintenance</h2>
    <div class="error-page">
      <div class="error-icon">🔧</div>
      <h2 class="error-message">Under Maintenance</h2>
      <p class="error-description">
        We're making some improvements. We'll be back shortly.
      </p>
      <p class="maintenance-eta">Expected return: 2:00 PM UTC</p>
    </div>
  </section>

  <!-- SUCCESS STATE -->
  <section>
    <h2>Success State</h2>
    <div class="success-page">
      <div class="success-icon">✓</div>
      <h2 class="success-message">Payment Successful!</h2>
      <p class="success-description">
        Your order #12345 has been confirmed. You'll receive a confirmation email shortly.
      </p>
      <div class="success-actions">
        <button class="btn-primary">View Order</button>
        <button class="btn-secondary">Continue Shopping</button>
      </div>
    </div>
  </section>

  <!-- EMPTY STATE -->
  <section>
    <h2>Empty State</h2>
    <div class="empty-page">
      <div class="empty-icon">📦</div>
      <h2 class="empty-message">No items yet</h2>
      <p class="empty-description">
        Start by adding your first item to get started.
      </p>
      <button class="btn-primary">Add First Item</button>
    </div>
  </section>

  <!-- ALERTS -->
  <section>
    <h2>Alert Banners</h2>

    <div class="alert alert-info">
      <span class="alert-icon">ℹ️</span>
      <div class="alert-content">
        <strong>Info:</strong> This is an informational message.
      </div>
      <button class="alert-close">×</button>
    </div>

    <div class="alert alert-success">
      <span class="alert-icon">✓</span>
      <div class="alert-content">
        <strong>Success:</strong> Your changes have been saved.
      </div>
      <button class="alert-close">×</button>
    </div>

    <div class="alert alert-warning">
      <span class="alert-icon">⚠️</span>
      <div class="alert-content">
        <strong>Warning:</strong> Your session will expire in 5 minutes.
      </div>
      <button class="alert-close">×</button>
    </div>

    <div class="alert alert-error">
      <span class="alert-icon">✕</span>
      <div class="alert-content">
        <strong>Error:</strong> Failed to save changes. Please try again.
      </div>
      <button class="alert-close">×</button>
    </div>
  </section>

  <!-- CONFIRMATION MODAL -->
  <section>
    <h2>Confirmation Modal</h2>
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-icon danger">⚠️</div>
        <h2 class="modal-title">Delete item?</h2>
        <p class="modal-description">
          This action cannot be undone. Are you sure you want to delete this item?
        </p>
        <div class="modal-actions">
          <button class="btn-secondary">Cancel</button>
          <button class="btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </section>

  <!-- LOADING STATES -->
  <section>
    <h2>Loading States</h2>

    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <div class="skeleton-card">
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text short"></div>
    </div>
  </section>
</body>
</html>
```

---

## Usage Notes

When running `/seurat test-system`:

1. **Read `system.md`** to get actual token values
2. **Generate `tokens.css`** from those values
3. **Copy and adapt templates** with actual tokens applied
4. **Add component styles** inline or in a `<style>` block using tokens
5. **Include theme toggle** if dark mode is defined in system.md

The templates above are structure-only. Actual styles should be generated from the design direction (Precision, Warmth, Sophistication, etc.) defined in `system.md`.
