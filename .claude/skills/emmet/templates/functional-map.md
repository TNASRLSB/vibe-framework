# Functional Map

**Generato:** YYYY-MM-DD HH:MM
**Codebase hash:** [short git hash o file count]
**Aggiornato:** —

---

## Screens

<!--
Per ogni screen/view/page trovata nel codebase.
Formato:

### [Nome Screen]
- **File:** path/to/file.ext #selettore
- **Entry point:** Si/No (default visible al caricamento)
- **Elementi interattivi:**
  - [Tipo] "[Testo/Label]" → handler() → [Effetto]
  - Button "Salva" → save() → API POST /data → CONFERMA
  - Input "Email" → validateEmail() → state.email
  - Link "Dashboard" → navigateTo(DASHBOARD)
-->

### [Screen Name]
- **File:** `path:line`
- **Entry point:** Si/No
- **Elementi interattivi:**
  - [Tipo] "[Label]" → [handler] → [effetto]

---

## State Transitions

<!--
Diagramma Mermaid del grafo di navigazione.
Ogni nodo = screen. Ogni arco = azione utente che causa la transizione.
-->

```mermaid
graph TD
  SCREEN_A -->|"azione"| SCREEN_B
```

---

## Personas

<!--
Personas derivate dalla complessita dei flussi.
Formato:

### [Nome Persona]
- **Goal:** [Obiettivo principale]
- **Flusso:** Screen1 → Screen2 → Screen3
- **Touchpoints critici:** [Dove puo bloccarsi/frustrarsi]
- **Tolleranza errori:** Bassa/Media/Alta
-->

### [Persona Name]
- **Goal:** [obiettivo]
- **Flusso:** [sequenza screen]
- **Touchpoints critici:** [punti critici]
- **Tolleranza errori:** Bassa/Media/Alta

---

## Use Cases

<!--
Un use case per ogni flusso utente significativo.
Numerazione:
- UC-001 a UC-099: Flussi core
- UC-100 a UC-199: Flussi secondari
- UC-200+: Edge cases

Formato:

### UC-NNN: [Titolo]
- **Persona:** [nome persona]
- **Precondizioni:** [stato iniziale]
- **Flusso principale:**
  1. [Step 1]
  2. [Step 2]
- **Flussi alternativi:**
  - Na. [alternativa]
- **Ultimo test:** mai — NON TESTATO
-->

### UC-001: [Titolo]
- **Persona:** [persona]
- **Precondizioni:** [precondizioni]
- **Flusso principale:**
  1. [Step]
- **Flussi alternativi:**
  - 1a. [alternativa]
- **Ultimo test:** mai — NON TESTATO

---

## Workflows

<!--
Diagrammi per i flussi piu complessi.
Usare Mermaid sequenceDiagram o graph per mostrare:
- Flusso principale
- Decision points
- Error/fallback branches
- Integrazioni esterne (API, DB)

Formato:

### WF-NNN: [Titolo]

```mermaid
sequenceDiagram
  participant U as User
  participant A as App
  participant S as Server
  U->>A: azione
  A->>S: request
  S-->>A: response
  A-->>U: feedback
```
-->

### WF-001: [Titolo]

```mermaid
graph TD
  START -->|"azione"| STEP_1
  STEP_1 -->|"success"| END
  STEP_1 -->|"error"| ERROR_HANDLER
```

---

## Pure Functions

<!--
Funzioni pure e quasi-pure catalogate dal codebase.
Divise per priorita di test (P1 = alta, P2 = media, P3 = bassa).

Criteri di priorita:
- P1: Logica condizionale complessa, calcoli, validazione, parsing
- P2: Trasformazione dati, formatting, mapping
- P3: Wrapper semplici, utility minimali

Formato:

### P1 — High Priority

#### `functionName`
- **File:** path/to/file.ext:line
- **Firma:** (param1: type, param2: type) => returnType
- **Dipendenze esterne:** [lista dipendenze da mockare, o "nessuna"]
- **Complessita:** Bassa / Media / Alta
- **Edge case:**
  - param1: null, stringa vuota
  - param2: 0, negativo, NaN
- **Ultimo test:** mai — NON TESTATO
-->

### P1 — High Priority

#### `functionName`
- **File:** `path:line`
- **Firma:** `(param1: type, param2: type) => returnType`
- **Dipendenze esterne:** [dipendenze da mockare]
- **Complessita:** Bassa / Media / Alta
- **Edge case:**
  - param1: [edge case derivati dal tipo]
  - param2: [edge case derivati dal tipo]
- **Ultimo test:** mai — NON TESTATO

### P2 — Medium Priority

### P3 — Low Priority

---

## Coverage Summary

| Metrica | Valore |
|---------|--------|
| Screens trovate | 0 |
| Elementi interattivi | 0 |
| Personas identificate | 0 |
| Use cases totali | 0 |
| Use cases testati | 0 |
| Use cases NON testati | 0 |
| Workflow diagrams | 0 |
| Pure functions trovate | 0 |
| Pure functions testate | 0 |
| Pure functions NON testate | 0 |
| Unit test totali | 0 |
| Unit test PASS | 0 |
| Unit test FAIL | 0 |
