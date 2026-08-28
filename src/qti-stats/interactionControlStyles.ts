import { css, unsafeCSS } from 'lit';

const CHECK_SVG = unsafeCSS(
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' width='100%25' height='100%25' viewBox='0 0 24 24'%3E%3Cpath d='M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z'/%3E%3C/svg%3E\")"
);

/**
 * Base interaction-control styling for the teacher-stats `-stats` web components.
 *
 * Renaming an interaction to its `-stats` variant detaches it from the qti-components
 * theme, which targets the original tag names (e.g. `qti-simple-choice::part(ch)`,
 * `qti-extended-text-interaction::part(textarea)`). Without this, the controls
 * (radio/checkbox glyphs, text fields, dropdown trigger) render unstyled / invisible.
 *
 * These rules mirror that theme one-to-one, translated to the element's own shadow
 * (`&::part(x)` → `[part='x']`, `&:state(y)::part(x)` → `:host(:state(y)) [part='x']`),
 * and use the SAME `--qti-*` custom properties so the variant looks identical to the
 * original when the theme vars are in scope — falling back to sensible defaults only
 * when they are not. Selectors for parts an interaction doesn't have are no-ops, so
 * this sheet is safe to include in every `-stats` component.
 */
export const interactionControlStyles = css`
  /* ── Choice: radio / checkbox (qti-simple-choice-stats) ──────────────── */
  [part='cha'] {
    width: calc(var(--qti-form-size, 1.25rem) - 6px);
    height: calc(var(--qti-form-size, 1.25rem) - 6px);
  }

  :host(:state(radio)) [part='ch'] {
    display: grid;
    place-content: center;
    width: var(--qti-form-size, 1.25rem);
    height: var(--qti-form-size, 1.25rem);
    border: var(--qti-border-thickness, 1px) var(--qti-border-style, solid)
      var(--qti-border-color, #94a3b8);
    border-radius: 100%;
    outline: none;
  }

  :host(:state(radio):state(--checked)) [part='cha'] {
    background-color: var(--qti-border-active, #2563eb);
    border-radius: 100%;
  }

  :host(:state(checkbox)) [part='ch'] {
    display: grid;
    place-content: center;
    width: var(--qti-form-size, 1.25rem);
    height: var(--qti-form-size, 1.25rem);
    border: var(--qti-border-thickness, 1px) var(--qti-border-style, solid)
      var(--qti-border-color, #94a3b8);
    border-radius: var(--qti-border-radius, 0.375rem);
    outline: none;
  }

  :host(:state(checkbox):state(--checked)) [part='cha'] {
    background-color: var(--qti-border-active, #2563eb);
    -webkit-mask: ${CHECK_SVG};
    mask: ${CHECK_SVG};
  }

  /*
   * Replay single-student selection: the chosen option is marked with a plain
   * [data-replay-selected] attribute from JS (the choice's internal selection state
   * isn't reachable from outside), styled here to look exactly like a checked
   * radio/checkbox.
   */
  :host([data-replay-selected]:state(radio)) [part='cha'] {
    background-color: var(--qti-border-active, #2563eb);
    border-radius: 100%;
  }

  :host([data-replay-selected]:state(checkbox)) [part='cha'] {
    background-color: var(--qti-border-active, #2563eb);
    -webkit-mask: ${CHECK_SVG};
    mask: ${CHECK_SVG};
  }

  /* ── Short text entry: input (qti-text-entry-interaction-stats) ──────── */
  [part='input'] {
    cursor: text;
    padding: var(--qti-padding-vertical, 0.5rem)
      var(--qti-padding-horizontal, 0.75rem);
    background: var(--qti-bg, #ffffff);
    border: var(--qti-border-thickness, 1px) var(--qti-border-style, solid)
      var(--qti-border-color, #94a3b8);
    border-radius: var(--qti-border-radius, 0.375rem);
    outline: none;
  }

  :host(:focus-within) [part='input'] {
    border-color: var(--qti-border-active, #2563eb);
    box-shadow: 0 0 0 var(--qti-focus-border-width, 2px)
      var(--qti-focus-color, rgba(37, 99, 235, 0.35));
  }

  /* ── Free text: textarea (qti-extended-text-interaction-stats) ───────── */
  [part='textarea'] {
    display: block;
    width: 100%;
    box-sizing: border-box;
    min-height: 6rem;
    cursor: text;
    padding: var(--qti-padding-vertical, 0.5rem)
      var(--qti-padding-horizontal, 0.75rem);
    background: var(--qti-bg, #ffffff);
    border: var(--qti-border-thickness, 1px) var(--qti-border-style, solid)
      var(--qti-border-color, #94a3b8);
    border-radius: var(--qti-border-radius, 0.375rem);
    outline: none;
  }

  :host(:focus-within) [part='textarea'] {
    border-color: var(--qti-border-active, #2563eb);
    box-shadow: 0 0 0 var(--qti-focus-border-width, 2px)
      var(--qti-focus-color, rgba(37, 99, 235, 0.35));
  }

  /* ── Inline choice: dropdown trigger (qti-inline-choice-interaction-stats) ─ */
  [part='trigger'] {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: inherit;
    vertical-align: baseline;
    padding: var(--qti-padding-vertical, 0.5rem)
      var(--qti-padding-horizontal, 0.75rem);
    background: var(--qti-bg, #ffffff);
    border: var(--qti-border-thickness, 1px) var(--qti-border-style, solid)
      var(--qti-border-color, #94a3b8);
    border-radius: var(--qti-border-radius, 0.375rem);
    outline: none;
  }
`;
