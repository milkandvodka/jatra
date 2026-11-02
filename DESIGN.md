# Design

The visual system of Jatra as built. Tokens live in `src/app/globals.css` under `:root`.

## Direction

The pinned poster (taste-skill seed 812209479): something holds still while everything else changes. On Jatra, the procession (*jatra*) becomes the pinned stage: "This season" holds while the city's events pass by sideways. The one curve on the site is the Mukteswar torana, the arch the hero window is cut in.

## Colour

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Ground | `--bg` | `#dedad3` | Page ground: Old Town sandstone |
| Surface | `--surface` / `--surface-2` | `#d3cec6` / `#c9c3ba` | One tone step for panels, chips, tier rows; never a line |
| Ink | `--ink` | `#0a0a0a` | All running text and the main shapes |
| Muted | `--muted` | `#5c5852` | Secondary notes only (5:1 on the ground) |
| Accent | `--accent` | `#256f82` | The primary action, focus rings, the Host band |
| Field | `--field-red` | `#a12a1e` | The host chapter, sampled from Pipili appliqué |
| On dark | `--on-dark` | `#dedad3` | Ink on photographs, red, teal and black fields |

Chapters change the whole field (putty, film, photographs, red, surface, teal, black) with hard cuts, never fades.

## Type

General Sans 400/500/600/700, one family. Odia script in Noto Sans Oriya 600 for the name only.

| Step | Token | Size | Use |
| --- | --- | --- | --- |
| Small | `--step-small` | 13–14px | Meta, captions, legal |
| Body | `--step-body` | 17–19px | Running text, list items, controls |
| Lead | `--step-lead` | 20–26px | Row names, card titles, the wordmark |
| Head | `--step-head` | 32–64px (10vw on phones) | Section and page headings, the hero `h1` |
| Display | `--step-display` | 12vw (18vw on phones) | "This season", the verbs |
| Mega | `--step-mega` | 26vw (34vw on phones) | The Host band and the cropped footer name |

Display tracking is -0.025 to -0.045em with leading 0.85–0.95. Headlines are two lines at most. Text is sentence case, with no eyebrows, no monospace and no tracked capitals.

## Space and frame

12 columns, 32px margins (20px on phones), 24px gutters (16px on phones). Sections are 120–200px apart. Every section uses the full width: when the text takes one side, a picture, list or figure takes the other.

## Components

- **Button:** square, one fill (teal primary, ink secondary, putty on dark), 52px tall, `scale(0.97)` on press.
- **Chip and day button:** square, surface fill, ink fill when pressed (`aria-pressed`).
- **Poster:** a 4:5 picture with a putty date block cut into its top-left corner, then title, place and price.
- **Ticket:** black body and putty stub with a dashed tear line, an SVG QR code and a tabular code.
- **Fields:** a 1px edge (the only lines on the site), with the accent outline on focus.
- **Dialog:** the only element with a shadow, because it floats.

## Motion

| Token | Value |
| --- | --- |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)`, UI under 600ms |
| `--ease-expo` | `cubic-bezier(0.16, 1, 0.3, 1)`, reveals and line rises |
| `--ease-in-out` | `cubic-bezier(0.76, 0, 0.24, 1)`, wipes and things that travel |
| `--t-press` / `--t-hover` / `--t-ui` | 140 / 180 / 240ms |

One signature move: the procession. Around it are the hero window opening, masked line and character rises, picture shutters, list layout animation, and press feedback on every control. Scroll-linked motion is locked to the scrollbar. Reduced motion shows the finished state.
