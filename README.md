# Julius Evola Daily

A 365-day reader for young men, drawn primarily from Julius Evola’s *Revolt Against the Modern World* and *Ride the Tiger*, with support from *Men Among the Ruins* and *Meditations on the Peaks*.

Live site: **https://evoladaily.com/**

## Current status

- English: Days 1–365 complete
- German (`/de/`): Days 1–365 complete
- Italian (`/it/`): Days 1–365 complete

## Repository structure

This is a pure static site served by GitHub Pages from the `main` branch. URL structure is fixed by the published paths:

- English days: `/day-XX.html` (files in repository root)
- German days: `/de/day-XX.html`
- Italian days: `/it/day-XX.html`
- Shared assets (`theme.js`, `common.js`, `style.css`, `cover.jpg`) stay in the root so every page can reference them with simple relative paths

Moving the day HTML files out of these locations would break the live URLs, canonical tags, Open Graph links, and the sitemap. The flat layout is therefore intentional and correct for this deployment.

## Branching

- `main` is the production branch. GitHub Pages publishes it directly to EvolaDaily.com.
- Use feature branches (or the `cleanup-structure` branch) for any reorganization, large edits, or experiments.
- Test thoroughly on the branch (or via a pull request preview) before merging to `main`.
- Never force-push to `main`.

## How to contribute / add days

1. Create a branch from `main`.
2. Add or edit the HTML files in the correct language folder.
3. Wire previous/next navigation inside the batch.
4. Update `theme.js` language range only after the pages exist.
5. Regenerate `sitemap.xml` if the set of pages changes.
6. Open a pull request and verify the live site still works after merge.

## Features

- Dark / light theme (persists via localStorage)
- Language switcher (EN / DE / IT)
- Listen (text-to-speech)
- Share quote as image
- Report inaccuracy (opens GitHub issue)

Primary sources: *Revolt Against the Modern World*, *Ride the Tiger*, *Men Among the Ruins*, *Meditations on the Peaks*.
