# Julius Evola Daily — Translation Playbook

Canonical copy lives in the repo: `https://github.com/sentiment001/juliusevola/blob/main/TRANSLATION_PLAYBOOK.md`

In a future project chat you do not need to paste this file. Say: “Follow TRANSLATION_PLAYBOOK.md in the repo. Do German Days XX–YY.” or “Start Italian 1–10.”

Repo: `sentiment001/juliusevola`  
Live site: https://sentiment001.github.io/juliusevola/  
English year is complete (Days 1–365). Day 365 next-nav returns to Day 1.

---

## 1. Objective

Produce high-quality, term-bank-controlled static translations of every day page.

- German under `/de/day-XX.html`
- Italian under `/it/day-XX.html`

The language control must stay visually seamless on phone and laptop. Preference may persist via localStorage later; same-day links across languages are required now.

Do not machine-translate with a generic API. Do not soften Evola. Do not turn pages into current political commentary. Match the pressure of the English originals.

---

## 2. Batch rule (non-negotiable)

**Ten days per language per session.**

Never attempt the full remaining year in one chat. Context collapse produces drift in terminology and tone.

Default sequence:

1. Finish German in phase blocks of 10.
2. Then Italian on the same blocks, starting at Days 1–10.

Do not run both languages to Day 365 in parallel.

---

## 3. Current status (update after every batch)

- German live: Days **1–15** under `/de/`
- German next batch: **Days 16–25** (Diagnosis of the Modern World begins at Day 16)
- Italian live: **none**. Menu item exists and is greyed.
- Italian next batch: **Days 1–10** when German batches are proceeding or when the user explicitly starts Italian
- Availability switch: `theme.js` → `LANGS[].days`

After each batch:

1. Push the HTML files.
2. Extend `LANGS` days for that language in `theme.js`.
3. Wire previous/next on the boundary pages (last page of prior batch must point forward).
4. Update this status block and project memory.

---

## 4. Phase map (stay inside it)

- Days 1–15 — Orientation
- Days 16–35 — Diagnosis of the Modern World
- Days 36–55 — The Traditional Order
- Days 56–75 — The Differentiated Individual
- Days 76–100 — Riding the Tiger
- Days 101–130 — Intensification / Application
- Day 131–365 — Deeper material

Footer phase label on translated pages should match the English page’s phase.

---

## 5. How to produce a batch

1. Confirm language and day range with the user if they did not specify. If they say “continue German,” take the next 10 from the status block.
2. Read the English source pages for those days (`day-XX.html` on the live site or in the repo). Translate from the actual page, not from memory of the topic title alone.
3. Apply the term bank for that language. Do not invent new equivalents for locked terms.
4. Keep the English writing rules in the target language:
   - No em dashes.
   - No “not X, but Y” / “non X, ma Y” / “nicht X, sondern Y” as a habit. Recast.
   - 4–5 paragraphs. Each 3–5 sentences. Prefer thicker.
   - Quote + exact book title in the target language.
   - Force and demand on the reader. Competent exposition is not enough.
5. Generate static HTML matching the existing `/de/` page shell:
   - `lang="de"` or `lang="it"`
   - CSS/JS paths are `../style.css`, `../theme.js`, `../common.js`
   - Canonical and og:url under `/de/` or `/it/`
   - Header has `#themeToggle`. Language menu is injected by `theme.js`. Do not hardcode a second language link.
   - Day nav previous/next in the target language (`Tag` / `Giorno`)
   - Footer: `Tag N von 365` or `Giorno N di 365` plus phase
6. Push to `sentiment001/juliusevola` on `main`.
7. Update `theme.js` `LANGS` days array so the menu un-greys those days.
8. If the previous batch’s last page still has an empty next slot, patch it.

---

## 6. Language switcher (`theme.js`)

`LANGS` is the single source of availability:

```js
var LANGS = [
  { code: 'en', label: 'English', dir: '', days: null },
  { code: 'de', label: 'Deutsch', dir: 'de', days: [1,2,/* ... */] },
  { code: 'it', label: 'Italiano', dir: 'it', days: [/* add as pages go live */] }
];
```

- English is always available.
- A language is live for a given day only if that day number is in `days`.
- Empty `days` means the language appears in the menu but every row is grey except that the current language still shows.
- Routing:
  - English day → `/day-XX.html`
  - German day → `/de/day-XX.html`
  - Italian day → `/it/day-XX.html`
  - From a language folder, English is `../day-XX.html`
  - From German to Italian: `../it/day-XX.html` (and the reverse)
- On the home page, a live language may send the reader to that language’s Day 1.
- When adding French or others later, add one object to `LANGS`. Do not redesign the control.

Italian stays grey until the first `/it/` pages exist and `days` is filled.

---

## 7. Book titles (locked)

**German**
- Revolt Against the Modern World → *Revolte gegen die moderne Welt*
- Ride the Tiger → *Den Tiger reiten*
- Men Among the Ruins → *Menschen inmitten der Ruinen*
- Meditations on the Peaks → *Meditationen auf den Gipfeln*

**Italian** (Evola’s originals — prefer these for quotes)
- Revolt Against the Modern World → *Rivolta contro il mondo moderno*
- Ride the Tiger → *Cavalcare la tigre*
- Men Among the Ruins → *Gli uomini e le rovine*
- Meditations on the Peaks → *Meditazioni delle vette*

Quotes in Italian should follow the Italian editions when a faithful wording is known. Do not invent a quote Evola did not write. If the exact Italian line is uncertain, give a faithful rendering and still name the Italian book title.

---

## 8. German term bank (locked)

Use these equivalents. Do not freelance replacements.

- Tradition → die Tradition
- traditional → traditional / traditionsgebunden
- vertical / horizontal → vertikal / horizontal
- quality over quantity → Qualität über Quantität
- higher and lower ways of being → höhere und niedere Weisen des Seins
- the lost center → das verlorene Zentrum
- race of the spirit → Rasse des Geistes
- solar / telluric → solar / tellurisch
- the type of man required → der geforderte Menschentypus
- myth as higher knowledge → Mythos als höheres Wissen
- action under a higher measure → Handeln unter einem höheren Maß
- the threshold → die Schwelle
- myth of progress → der Mythos des Fortschritts
- quantity over quality → Quantität über Qualität
- dissolution of forms → Auflösung der Formen
- individualism and the mass → Individualismus und die Masse
- reign of the economy → Herrschaft der Wirtschaft
- democracy and leveling → Demokratie und Nivellierung
- loss of the sacred → Verlust des Sakralen
- softness and decline of virility → Weichheit und Niedergang der Virilität
- nihilism → Nihilismus
- rootlessness → Wurzellosigkeit
- the Dark Age → das dunkle Zeitalter / Kali-Yuga
- the terrain → das Gelände / das Terrain
- hierarchical principle → hierarchisches Prinzip
- rank and function → Rang und Funktion
- warrior and king → Krieger und König
- sacred authority → sakrale Autorität
- empire as form → das Reich als Form
- initiation → Initiation
- two natures of man → die zwei Naturen des Menschen
- axis and the pole → Achse und Pol
- form and limit → Form und Grenze
- differentiated individual → der differenzierte Mensch / der differenzierte Einzelne
- interior distance → innere Distanz
- absolute individual → der absolute Einzelne
- solitude → Einsamkeit
- style → Stil
- remaining standing → aufrecht bleiben / standhalten
- Ride the Tiger → Den Tiger reiten
- detachment → Distanz / innere Distanznahme
- long view → der lange Blick
- action under pressure → Handeln unter Druck
- body → der Leib
- work → die Arbeit / das Werk
- speech → die Rede / das Wort
- desire → das Begehren / die Begierde
- friendship → die Freundschaft
- time → die Zeit
- modern world → die moderne Welt
- dissolution → Auflösung
- higher measure → höheres Maß
- center / periphery → Zentrum / Peripherie

German orthography: traditional spelling with ß and circumflex-free modern umlauts is fine; prefer *daß* / *muß* only if already used on existing `/de/` pages for consistency with Days 1–15 (those pages use *daß*, *muß*). Match the existing German pages.

UI words on German pages: Tag, Home, Nacht (theme button label is replaced by icons in JS).

---

## 9. Italian term bank (locked)

- Tradition → la Tradizione
- traditional → tradizionale
- vertical / horizontal → verticale / orizzontale
- quality over quantity → qualità sopra la quantità
- higher and lower ways of being → modi superiori e inferiori dell'essere
- the lost center → il centro perduto
- race of the spirit → razza dello spirito
- solar / telluric → solare / tellurico
- the type of man required → il tipo d'uomo richiesto
- myth as higher knowledge → mito come conoscenza superiore
- action under a higher measure → azione sotto una misura superiore
- the threshold → la soglia
- myth of progress → il mito del progresso
- quantity over quality → quantità sopra la qualità
- dissolution of forms → dissoluzione delle forme
- individualism and the mass → individualismo e massa
- reign of the economy → regno dell'economia
- democracy and leveling → democrazia e livellamento
- loss of the sacred → perdita del sacro
- softness and decline of virility → mollezza e declino della virilità
- nihilism → nichilismo
- rootlessness → sradicamento
- the Dark Age → l'età oscura / Kali-Yuga
- the terrain → il terreno
- hierarchical principle → principio gerarchico
- rank and function → rango e funzione
- warrior and king → guerriero e re
- sacred authority → autorità sacra
- empire as form → l'Impero come forma
- initiation → iniziazione
- two natures of man → le due nature dell'uomo
- axis and the pole → asse e polo
- form and limit → forma e limite
- differentiated individual → l'individuo differenziato
- interior distance → distanza interiore
- absolute individual → l'individuo assoluto
- solitude → solitudine
- style → stile
- remaining standing → restare in piedi / tenere
- Ride the Tiger → Cavalcare la tigre
- detachment → distacco
- long view → lo sguardo lungo
- action under pressure → azione sotto pressione
- body → il corpo
- work → il lavoro / l'opera
- speech → la parola
- desire → il desiderio
- friendship → l'amicizia
- time → il tempo
- modern world → il mondo moderno
- dissolution → dissoluzione
- higher measure → misura superiore
- center / periphery → centro / periferia

UI words on Italian pages: Giorno, Home. Theme button is icon-based.

---

## 10. Quality bar

Days 1–15 English set the density. Translations must match it.

Fail and rewrite if a page:

- sounds like generic MT
- softens hierarchy, race of the spirit, solar/telluric, or the late-age diagnosis
- introduces culture-war slang
- breaks the term bank
- is thinner than the English source

Italian commentary is a faithful rendering of our English day pages, not a second book. The quotes are the exception: prefer Evola’s own Italian.

---

## 11. What not to do

- Do not use a free translation API as the voice of the site.
- Do not feed ideologically loaded framing to third-party models if the user is routing a pass through Claude. Send literary/register instructions and term banks, not a political pitch.
- Do not edit hundreds of English HTML files to add language buttons. `theme.js` injects the control.
- Do not create a new language-switcher design when adding a language.
- Do not leave generation scripts in the repo or in `/home/workdir/artifacts`.
- Do not update `realDays` for translations. `realDays.js` / `index.html` stay English titles.

---

## 12. Suggested user prompts for the next chat

- `Follow TRANSLATION_PLAYBOOK.md in the repo. Do German Days 16–25.`
- `Follow TRANSLATION_PLAYBOOK.md in the repo. Do German Days 26–35.`
- `Follow TRANSLATION_PLAYBOOK.md in the repo. Start Italian Days 1–10 under /it/.`

That is sufficient. Do not re-litigate the architecture unless the user asks to change it.
