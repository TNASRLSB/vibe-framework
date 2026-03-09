# Functional Testing with Playwright (`--functions`)

Test automatizzati: verifica che le funzionalità funzionino. Assertions programmatiche, pass/fail, report hooks, CI-friendly. Claude non "vede" il browser — esegue codice.

---

## Principi

### P1. Profondità, non larghezza

Ogni test verifica: **stato iniziale → azione → risultato → side-effects**. Minimo 3 assertions per test.

```typescript
// ❌ SBAGLIATO: un solo expect, non verifica nulla di utile
test("login page loads", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("form")).toBeVisible();
});

// ✅ CORRETTO: stato iniziale + azione + risultato + side-effect
test("auth -- login with valid credentials", async ({ page }) => {
  await page.goto("/login");
  // Stato iniziale: form visibile, nessun errore
  await expect(page.locator("form")).toBeVisible();
  await expect(page.getByText(/error|invalid/i)).not.toBeVisible();

  // Azione
  await page.fill('[name="email"]', EMAIL);
  await page.fill('[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');

  // Risultato: redirect a dashboard
  await page.waitForURL("**/dashboard/**", { timeout: 15000 });
  expect(page.url()).toContain("/dashboard");

  // Side-effect: sessione creata, nome utente visibile
  await expect(page.getByText(EXPECTED_USERNAME)).toBeVisible();
});
```

### P2. Copertura esaustiva delle entità

Se la map identifica N entità ripetute (prodotti, utenti, categorie, pagine), testare **TUTTE** con loop parametrizzato. Mai campionare.

```typescript
// Entità estratte dalla map come costanti tipizzate
const PRODUCTS = [
  { id: "prod-1", name: "Widget A", price: 29.99, category: "tools" },
  { id: "prod-2", name: "Widget B", price: 49.99, category: "tools" },
  { id: "prod-3", name: "Gadget C", price: 99.99, category: "electronics" },
  // ... TUTTI, non un campione
] as const;

test.describe("Product pages", () => {
  for (const product of PRODUCTS) {
    test(`${product.name} -- page loads and shows correct data`, async ({ page }) => {
      await page.goto(`/products/${product.id}`);
      await waitForPage(page);

      await expect(page.getByRole("heading")).toContainText(product.name);
      await expect(page.getByText(`${product.price}`)).toBeVisible();
      await expect(page.getByText(product.category)).toBeVisible();

      // Data integrity via API
      const res = await apiFetch(page, "GET", `/api/products/${product.id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe(product.name);
      expect(res.body.price).toBe(product.price);
    });
  }
});
```

### P3. Flow multi-step reali

I test coprono sequenze complete. Non fermarsi al primo click.

```typescript
// ❌ SBAGLIATO: verifica solo che il form esista
test("checkout form exists", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.locator("form")).toBeVisible();
});

// ✅ CORRETTO: flow completo fill → submit → feedback → stato finale
test("checkout -- complete purchase flow", async ({ page }) => {
  // Prerequisito: prodotto nel carrello
  await page.goto("/cart");
  await waitForPage(page);
  const cartCount = await page.locator("[data-testid='cart-item']").count();
  expect(cartCount).toBeGreaterThan(0);

  // Step 1: vai al checkout
  await page.click("text=Checkout");
  await page.waitForURL("**/checkout**");

  // Step 2: compila form
  await page.fill('[name="address"]', "123 Test St");
  await page.fill('[name="city"]', "Test City");
  await page.selectOption('[name="country"]', "US");

  // Step 3: submit
  await page.click('button[type="submit"]');

  // Step 4: attendi conferma
  await expect(page.getByText(/order confirmed|thank you/i)).toBeVisible({ timeout: 15000 });

  // Step 5: verifica side-effects
  const orderRes = await apiFetch(page, "GET", "/api/orders?latest=true");
  expect(orderRes.status).toBe(200);
  expect(orderRes.body.status).toBe("confirmed");

  // Step 6: carrello svuotato
  await page.goto("/cart");
  await waitForPage(page);
  await expect(page.getByText(/empty|no items/i)).toBeVisible();
});
```

### P4. Data integrity via API (~30% dei test)

Verificare che i dati dietro l'UI siano completi, corretti, consistenti.

```typescript
test.describe("API data integrity", () => {
  test("all entities have required fields", async ({ page }) => {
    await page.goto("/");
    const res = await apiFetch(page, "GET", "/api/entities");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(ENTITIES.length); // Conta esatta, non >0

    for (const item of res.body) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.createdAt).toBeTruthy();
      // Validazione strutturale specifica al dominio
    }
  });

  test("cross-entity consistency", async ({ page }) => {
    await page.goto("/");
    for (const entity of ENTITIES) {
      const res = await apiFetch(page, "GET", `/api/entities/${entity.id}/details`);
      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeGreaterThanOrEqual(entity.expectedMinItems);
    }
  });
});
```

### P5. Graceful timeout per elementi opzionali

Distinguere elementi **obbligatori** (devono esistere) da **opzionali** (possono mancare senza fallire il test).

```typescript
// Elemento OBBLIGATORIO: il test fallisce se mancante
await expect(page.getByRole("heading")).toBeVisible({ timeout: 10000 });

// Elemento OPZIONALE: log nel report, ma non fallisce il test
const hasBanner = await page.getByText("New feature!")
  .isVisible({ timeout: 3000 })
  .catch(() => false);
if (hasBanner) {
  reportAppend(`  - Info: promo banner visible`);
} else {
  reportAppend(`  - Info: promo banner not visible (optional)`);
}

// Azione con timeout graceful + screenshot diagnostico
const checkBtn = page.getByRole("button", { name: /submit/i });
const visible = await checkBtn.isVisible({ timeout: 20000 }).catch(() => false);
if (!visible) {
  await screenshot(page, `submit-timeout-${context}`);
  reportAppend(`  - Issue: submit button NOT visible after 20s`);
  return; // Skip rest of test, non fail
}
```

### P6. Bug regression dedicato

Se il progetto ha bug noti, generare un describe block per ognuno.

```typescript
test.describe("Bug regression", () => {
  // Da bugs.md o issues noti
  test("BUG-042 -- form submit should not duplicate entries", async ({ page }) => {
    await page.goto("/items/new");
    await page.fill('[name="title"]', "Test Item");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/items/**");

    // Il bug era: doppio submit creava 2 entries
    const res = await apiFetch(page, "GET", "/api/items?title=Test+Item");
    expect(res.body.length).toBe(1); // Non 2
  });

  test("BUG-057 -- special chars in search should not crash", async ({ page }) => {
    await page.goto("/search");
    await page.fill('[name="q"]', 'test "quotes" & <tags>');
    await page.click('button[type="submit"]');

    // Il bug era: crash con caratteri speciali
    await expect(page.locator(".results")).toBeVisible({ timeout: 10000 });
    // Nessun errore JS
  });
});
```

### P7. Report hooks obbligatori

Ogni file test generato **DEVE** includere report hooks. Non opzionale.

```typescript
// In cima al file test, dopo gli import
import { setupReportHooks } from "./helpers";

// Dopo aver creato il test object
const { passCount, failCount, issues } = setupReportHooks(test);
```

### P8. Costanti tipizzate

Le entità della map diventano array/oggetti tipizzati in cima al file. Helper functions per generare ID, slug, label. Zero hardcoding nei test.

```typescript
// Costanti estratte dalla map — TUTTI i dati qui, mai nei test
type Entity = {
  id: string;
  name: string;
  slug: string;
  expectedFields: string[];
};

const ENTITIES: readonly Entity[] = [
  { id: "ent-1", name: "First", slug: "first", expectedFields: ["title", "body"] },
  { id: "ent-2", name: "Second", slug: "second", expectedFields: ["title", "body", "image"] },
] as const;

// Helper per generare dati derivati
function buildEntityUrl(entity: Entity): string {
  return `/entities/${entity.slug}`;
}

// Helper per label localizzate (se app multilingua)
function labels(lang: string) {
  const map: Record<string, Record<string, string>> = {
    en: { submit: "Submit", cancel: "Cancel", success: "Saved" },
    it: { submit: "Invia", cancel: "Annulla", success: "Salvato" },
  };
  return map[lang] ?? map["en"];
}
```

### P9. Naming convention

```typescript
// Pattern: "[entità/area] -- [comportamento sotto test]"
test("auth -- login with valid credentials", ...);
test("auth -- login with wrong password shows error", ...);
test("products -- all products load correctly", ...);
test("cart -- add item increments counter", ...);
test("checkout -- complete purchase flow", ...);
test("API integrity -- all products have required fields", ...);
test("responsive -- mobile layout shows hamburger menu", ...);
test("BUG-042 -- form submit should not duplicate entries", ...);
```

---

## Architecture

### Single-Window Fixture

Un unico BrowserContext riusato tra tutti i test. Drasticamente più veloce del default Playwright.

| Default Playwright | Single-Window |
|---|---|
| Nuovo context per ogni test | 1 context per worker, page riusata |
| Parallel execution | Sequential (più veloce con 1 context) |
| `retries: 2` nasconde test flaky | `retries: 0` forza il fix |
| 4+ minuti per 50 test | ~30 secondi per 50 test |

### File Structure

```
e2e/
  fixtures.ts              # Worker-scoped single-window fixture
  helpers.ts               # waitForPage, apiFetch, screenshot, setupReportHooks
  global-setup.ts          # Auth session caching (solo se map ha auth UC)
  screenshots/             # Screenshot catturati durante i test
  .auth/
    session.json           # Sessione auth cached (gitignored)
  suite.spec.ts            # File test unico (progetti <100 test)
  # OPPURE per progetti >100 test:
  tests/
    [area-1].spec.ts
    [area-2].spec.ts
    ...
  report.md                # Report generato dai hooks
playwright.config.ts       # Config nella root del progetto
```

**Single-file vs multi-file:** Usare `suite.spec.ts` unico per progetti con <100 test (più facile da navigare, un solo report). Dividere in file per area se >100 test.

**IMPORTANTE:** `.auth/` va aggiunto a `.gitignore`.

---

## Worker-Scoped Fixture

`e2e/fixtures.ts` — il cuore dell'architettura. Tutti i test importano da qui, **mai** da `@playwright/test` direttamente.

```typescript
import { test as base, expect, Page, BrowserContext } from "@playwright/test";
import fs from "fs";

const VIEWPORT = { width: 1280, height: 900 };
const AUTH_FILE = "./e2e/.auth/session.json";

const hasAuth = fs.existsSync(AUTH_FILE);

export const test = base.extend<{}, { workerContext: BrowserContext }>({
  workerContext: [
    async ({ browser }, use) => {
      const ctx = await browser.newContext({
        viewport: VIEWPORT,
        ...(hasAuth && { storageState: AUTH_FILE }),
      });
      await use(ctx);
      await ctx.close();
    },
    { scope: "worker" },
  ],

  context: async ({ workerContext }, use) => {
    await use(workerContext);
  },

  page: async ({ workerContext }, use) => {
    const pages = workerContext.pages();
    const page = pages[0] || (await workerContext.newPage());
    await page.setViewportSize(VIEWPORT);
    await use(page);
  },
});

export { expect };
```

---

## Auth Session Caching

`e2e/global-setup.ts` — **generare SOLO se la functional map contiene use case di autenticazione.**

```typescript
import { chromium, type FullConfig } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = process.env.E2E_TARGET === "production"
  ? "https://PRODUCTION_URL"    // <-- dal progetto target
  : "http://localhost:PORT";     // <-- dal progetto target

const EMAIL = process.env.E2E_EMAIL ?? "test@example.com";
const PASSWORD = process.env.E2E_PASSWORD ?? "testpassword";

export const AUTH_FILE = path.join(__dirname, ".auth/session.json");
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

function isSessionFresh(): boolean {
  try {
    return Date.now() - fs.statSync(AUTH_FILE).mtimeMs < MAX_AGE_MS;
  } catch {
    return false;
  }
}

async function globalSetup(_config: FullConfig) {
  // Inizializza report
  const reportPath = path.join(__dirname, "report.md");
  const now = new Date().toLocaleString();
  const target = process.env.E2E_TARGET === "production" ? "PRODUCTION_URL" : "localhost";
  const mode = process.env.E2E_TARGET === "production" ? "production" : "local";
  fs.writeFileSync(reportPath, `# E2E Report — ${now}\n\n**Target:** ${target}\n**Mode:** ${mode}\n\n---\n\n`);

  if (isSessionFresh()) {
    console.log("Reusing existing session (< 24h old)");
    return;
  }

  console.log("Running auth flow...");
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // --- ADATTARE AL FLUSSO AUTH DEL PROGETTO TARGET ---
  await page.goto(`${BASE}/login`);
  await page.fill('[name="email"]', EMAIL);
  await page.fill('[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard/**", { timeout: 15000 });
  // --- FINE SEZIONE DA ADATTARE ---

  await page.context().storageState({ path: AUTH_FILE });
  console.log("Session saved");
  await browser.close();
}

export default globalSetup;
```

**Adattamento al progetto target:**
- URL base (produzione e locale)
- Selectors del form login (dipende dall'UI)
- URL di redirect post-login
- Provider auth (Clerk, NextAuth, Supabase, custom)
- Credenziali di default

---

## Helper Functions

`e2e/helpers.ts` — utility condivise da tutti i test file.

### waitForPage

```typescript
export async function waitForPage(page: Page, timeout = 15000) {
  await page.waitForLoadState("networkidle", { timeout });
  await page.waitForFunction(
    () => document.body.innerText.length > 100,
    { timeout: 10000 }
  );
}
```

**Adattamento al framework:**
- **SPA (React, Vue, Svelte):** `innerText.length > 100` funziona
- **SSR (Next.js, Nuxt):** Aggiungere check hydration
- **MPA tradizionale:** `networkidle` può bastare da solo

### apiFetch

```typescript
export async function apiFetch(
  page: Page,
  method: "GET" | "POST" | "PUT" | "DELETE",
  urlPath: string,
  body?: Record<string, unknown>
): Promise<{ status: number; body: any }> {
  return page.evaluate(
    async ({ method, path, body }) => {
      const opts: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" },
      };
      if (body) opts.body = JSON.stringify(body);
      const r = await fetch(path, opts);
      const text = await r.text();
      let parsed;
      try { parsed = JSON.parse(text); } catch { parsed = text; }
      return { status: r.status, body: parsed };
    },
    { method, path: urlPath, body }
  );
}
```

### screenshot

```typescript
export async function screenshot(page: Page, name: string) {
  await page.screenshot({
    path: path.join(__dirname, "screenshots", `${name}.png`),
    fullPage: true,
  });
}
```

### setupReportHooks

**Ogni file test DEVE chiamare questa funzione.** Genera report real-time durante l'esecuzione.

```typescript
export function setupReportHooks(test: any) {
  const REPORT_PATH = path.join(__dirname, "report.md");
  const SCREENSHOT_DIR = path.join(__dirname, "screenshots");

  let passCount = 0;
  let failCount = 0;
  const issues: string[] = [];

  function reportAppend(line: string) {
    fs.appendFileSync(REPORT_PATH, line + "\n");
  }

  test.afterEach(async ({ page }: { page: Page }, testInfo: any) => {
    const title = testInfo.titlePath.join(" > ");
    const duration = `${(testInfo.duration / 1000).toFixed(1)}s`;

    if (testInfo.status === "passed") {
      passCount++;
      reportAppend(`- PASS ${title} (${duration})`);
    } else {
      failCount++;
      const screenshotName = `fail-${failCount}`;
      try {
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `${screenshotName}.png`),
          fullPage: true,
        });
      } catch { /* page may be closed */ }

      const errorMsg = testInfo.error?.message?.split("\n")[0] ?? "unknown error";
      reportAppend(`\n### FAIL #${failCount}: ${title}`);
      reportAppend(`- **Durata:** ${duration}`);
      reportAppend(`- **Errore:** \`${errorMsg}\``);
      reportAppend(`- **Screenshot:** ![${screenshotName}](screenshots/${screenshotName}.png)`);
      reportAppend("");

      issues.push(`${title}: ${errorMsg}`);
    }
  });

  test.afterAll(() => {
    reportAppend("\n---\n");
    reportAppend("## Summary\n");
    reportAppend("| | Count |");
    reportAppend("|---|---|");
    reportAppend(`| Passed | ${passCount} |`);
    reportAppend(`| Failed | ${failCount} |`);
    reportAppend(`| Total | ${passCount + failCount} |`);

    if (issues.length > 0) {
      reportAppend("\n## Issues Found\n");
      for (const issue of issues) {
        reportAppend(`- ${issue}`);
      }
    }
  });

  return { passCount, failCount, issues, reportAppend };
}
```

---

## Environment Targeting

```typescript
// playwright.config.ts
const isProduction = process.env.E2E_TARGET === "production";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 60000,
  reporter: [["html", { open: "never" }], ["list"]],
  globalSetup: "./e2e/global-setup.ts",

  use: {
    baseURL: isProduction ? "https://PRODUCTION_URL" : "http://localhost:PORT",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 900 },
    headless: false,
  },

  projects: [{ name: "chromium", use: { browserName: "chromium" } }],

  ...(!isProduction && {
    webServer: {
      command: "npm run dev",
      url: "http://localhost:PORT",
      reuseExistingServer: true,
      timeout: 30000,
    },
  }),
});
```

**Adattamento allo stack:**

| Stack | `webServer.command` | Porta default |
|-------|---------------------|---------------|
| Next.js | `npx next dev` | 3000 |
| Vite/React | `npx vite` | 5173 |
| Express/Node | `node server.js` | 3000 |
| SvelteKit | `npx vite dev` | 5173 |

---

## Test Organization — Dalla Map ai Test

### Map → Test Groups

| Elemento nella map | Test generato |
|---|---|
| Use case (UC-001...) | Flow test multi-step (P3) |
| UC con flussi alternativi | Test case separati per ogni flusso |
| Entità ripetute (N prodotti, N utenti) | Loop parametrizzato su TUTTE (P2) |
| API endpoints | `apiFetch()` data integrity (P4) |
| Note "responsive" nella map | Gruppo dedicato con viewport mobile/tablet |
| Error flows | Gruppo dedicato: 404, bad params, unauthorized |
| Bug noti (bugs.md, issues) | Describe block bug regression (P6) |

### Responsive Testing

Gruppo dedicato con viewport espliciti:

```typescript
test.describe("Responsive", () => {
  test("mobile layout (375x812)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await waitForPage(page);

    // Verificare: hamburger menu, layout stacked, touch targets
    await expect(page.locator("[data-testid='mobile-menu']")).toBeVisible();
    await expect(page.locator("[data-testid='sidebar']")).not.toBeVisible();
    await screenshot(page, "mobile-home");
  });

  test("tablet layout (768x1024)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await waitForPage(page);
    await screenshot(page, "tablet-home");
  });
});
```

### Error/Edge Case Testing

```typescript
test.describe("Error handling", () => {
  test("404 -- non-existent page shows error gracefully", async ({ page }) => {
    const res = await page.goto("/non-existent-page-xyz");
    // Verificare 404 page o redirect, NO crash
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(50); // Non pagina vuota
  });

  test("API -- bad params returns structured error", async ({ page }) => {
    await page.goto("/");
    const res = await apiFetch(page, "GET", "/api/entities/non-existent-id");
    expect([400, 404]).toContain(res.status);
  });

  test("API -- missing required fields returns 400", async ({ page }) => {
    await page.goto("/");
    const res = await apiFetch(page, "POST", "/api/entities", {});
    expect(res.status).toBe(400);
  });
});
```

---

## Selectors Strategy

### Ordine di priorità

1. `data-testid` — Esplicito, non si rompe con cambi di stile
2. `role` + name — Basato su accessibilità
3. `text` — Contenuto visibile all'utente
4. `css` — Ultimo resort

```typescript
// Preferito
page.locator('[data-testid="submit-button"]')

// Buono
page.getByRole('button', { name: 'Submit' })
page.getByText('Submit')

// Evitare
page.locator('.btn-primary.mt-4')
page.locator('#app > div > div:nth-child(3)')
```

---

## Completeness Checklist

**Dopo aver letto la functional map**, consultare queste tabelle per categorie mancanti.

### User Flows

| Flow | Cosa testare |
|------|-------------|
| Authentication | Login, logout, password reset, session expiry |
| Registration | Signup, verification, profile setup |
| Navigation | Menu, breadcrumbs, deep links, back button |
| Forms | Validation, submission, error display, multi-step |
| Search | Query, filters, results, pagination, empty state |
| CRUD | Create, read, update, delete, list |

### Data Integrity

| Cosa verificare | Pattern |
|-----------------|---------|
| Entità complete | Loop su TUTTE, check campi obbligatori |
| Consistenza cross-entità | Rapporti e proporzioni attesi (>X%) |
| Struttura API response | Schema validation per ogni endpoint |
| Relazioni tra dati | Foreign key integrity, nested data |

### UI States

| Stato | Cosa verificare |
|-------|----------------|
| Loading | Spinner/skeleton visibile |
| Empty | Empty state mostrato |
| Error | Messaggio errore visibile e utile |
| Success | Feedback successo appare |
| Offline | Gestione offline (se applicabile) |

### Interactions

| Interazione | Cosa verificare |
|-------------|----------------|
| Click | Stato cambia, feedback visivo |
| Form input | Validazione, error display, submit |
| Hover | Tooltip, dropdown (se applicabile) |
| Keyboard | Tab navigation, shortcuts |
| Scroll | Infinite scroll, lazy load |
| Resize | Responsive breakpoints |
