import { QtiSimpleChoice } from '@citolab/qti-components';
import { css, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';

import { interactionControlStyles } from './interactionControlStyles';

export class QtiSimpleChoiceStats extends QtiSimpleChoice {
  @property({ type: Number, attribute: false })
  statCount = 0;

  @property({ type: Number, attribute: false })
  statTotalCount = 0;

  @property({ type: Boolean, attribute: false })
  statIsCorrect = false;

  @property({ type: String, attribute: false })
  statTooltip = '';

  static override styles = [
    ...(Array.isArray(QtiSimpleChoice.styles)
      ? QtiSimpleChoice.styles
      : [QtiSimpleChoice.styles]),
    interactionControlStyles,
    css`
      :host {
        display: block !important;
        width: 100%;
        box-sizing: border-box;
        position: relative;
        overflow: visible !important;
        padding-left: 2.75rem !important;
        pointer-events: none;
      }

      .choice-stats-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-wrap: nowrap;
        gap: 10px;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        /*
         * Re-enable hover across the whole row (the host is pointer-events:none) so
         * the distribution tooltip opens anywhere on the row — including the empty
         * gap between the answer text and the bar — not just on the bar itself. The
         * item is read-only, so this never re-enables choice selection.
         */
        pointer-events: auto;
      }

      [part='ch'],
      #label {
        flex: 0 0 auto;
      }

      slot {
        /*
         * Hug the choice text (do not grow): free space in the row is owned by
         * the stat pill's margin-left:auto, which keeps it pinned to the end
         * column in every state — including when the correct answer is shown.
         */
        flex: 0 1 auto;
        min-width: 0;
        width: auto !important;
        display: flex;
        align-items: center;
      }

      .qti-review-inline-stat {
        flex: 0 0 auto;
        margin-left: auto;
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        position: relative;
        z-index: 20;
        overflow: visible;
        pointer-events: auto;
        cursor: default;
      }

      .qti-review-inline-stat__track {
        position: relative;
        display: block;
        min-width: 88px;
        width: 88px;
        height: 12px;
        padding: 0;
        border: 1px solid #cbd5e1;
        border-radius: 9999px;
        background: #e2e8f0;
        box-sizing: border-box;
        overflow: hidden;
        flex-shrink: 0;
      }

      .qti-review-inline-stat__fill {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 0;
        max-width: 100%;
        border-radius: inherit;
        pointer-events: none;
      }

      .qti-review-inline-stat__n {
        font-size: 13px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: #020617;
        line-height: 1;
        letter-spacing: -0.02em;
        min-width: 1.25rem;
        text-align: right;
      }

      /*
       * Correct-answer highlight is owned here in the shadow tree (rather than
       * an outer ::part(slot) rule) so it decorates only the text box and never
       * alters the flex sizing of the row — the stat pill stays in its column.
       */
      :host(:state(correct-response)) slot {
        background:
          linear-gradient(
            104deg,
            rgba(130, 255, 173, 0) 0.9%,
            rgba(130, 255, 173, 0.95) 2.4%,
            rgba(130, 255, 173, 0.45) 5.8%,
            rgba(130, 255, 173, 0.1) 93%,
            rgba(130, 255, 173, 0.65) 96%,
            rgba(130, 255, 173, 0) 98%
          ),
          linear-gradient(
            183deg,
            rgba(130, 255, 173, 0) 0%,
            rgba(130, 255, 173, 0.28) 7.9%,
            rgba(130, 255, 173, 0) 15%
          );
        border-radius: 7.5px;
        padding: 0 8px;
        color: #166534;
        font-weight: 600;
      }

      :host(:state(correct-response))::after {
        content: '\\2714';
        color: var(--qti-correct, #16a34a);
        position: absolute;
        left: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        font-weight: bold;
        line-height: 1;
      }
    `,
  ];

  resetStat(): void {
    this.statCount = 0;
    this.statTotalCount = 0;
    this.statIsCorrect = false;
    this.statTooltip = '';
  }

  override render() {
    const pct =
      this.statTotalCount > 0
        ? Math.min(100, Math.max(0, (this.statCount / this.statTotalCount) * 100))
        : 0;
    const barColor = this.statIsCorrect
      ? 'hsl(142 71% 36%)'
      : 'hsl(215 16% 47%)';
    const showStat = this.statTotalCount > 0;

    return html`
      <div
        class="choice-stats-row"
        title=${showStat ? this.statTooltip : nothing}
        data-review-tooltip=${showStat ? this.statTooltip : nothing}
        aria-label=${showStat
          ? this.statTooltip.replace(/\n+/g, ', ')
          : nothing}
      >
        ${super.render()}
        ${showStat
          ? html`
              <span class="qti-review-inline-stat">
                <span class="qti-review-inline-stat__track">
                  <span
                    class="qti-review-inline-stat__fill"
                    style="width: ${pct}%; background-color: ${barColor};"
                  ></span>
                </span>
                <span class="qti-review-inline-stat__n">${this.statCount}</span>
              </span>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-simple-choice-stats': QtiSimpleChoiceStats;
  }
}

if (!customElements.get('qti-simple-choice-stats')) {
  customElements.define('qti-simple-choice-stats', QtiSimpleChoiceStats);
}
