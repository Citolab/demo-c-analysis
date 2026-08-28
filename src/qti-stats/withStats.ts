import { css, html, nothing, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { interactionControlStyles } from './interactionControlStyles';

import type { CSSResultGroup, TemplateResult } from 'lit';
import type { StatResponse } from './reviewStatsModel';

/**
 * Generic teacher-review stats for any response-bearing QTI interaction.
 *
 * {@link StatsInteractionMixin} extends a `@citolab/qti-components` interaction base
 * class with a `distinctResponses` property and renders an "Antwoordverdeling" panel
 * (bar + count per distinct response) below the interaction's own UI. Interaction
 * types that need a tailored layout (choice, text-entry, extended-text, inline-choice)
 * have their own components instead and reuse {@link statsPanelStyles} /
 * {@link renderStatsPanel} where convenient.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

const CORRECT_BAR_COLOR = 'hsl(142 71% 36%)';
const NEUTRAL_BAR_COLOR = 'hsl(215 16% 47%)';

export const statsPanelStyles = css`
  .qti-stats-panel {
    margin: 0.5rem 0 0.75rem;
  }

  .qti-stats-panel__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 0.35rem;
  }

  .qti-stats-panel__label {
    flex: 1 1 auto;
    min-width: 0;
    font-size: 13px;
    color: hsl(215 16% 35%);
    overflow-wrap: anywhere;
  }

  .qti-review-inline-stat {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
  }

  .qti-review-inline-stat__track {
    display: block;
    width: 88px;
    height: 10px;
    border-radius: 9999px;
    background: hsl(214 32% 91%);
    overflow: hidden;
  }

  .qti-review-inline-stat__fill {
    display: block;
    height: 100%;
    border-radius: 9999px;
  }

  .qti-review-inline-stat__n {
    font-size: 13px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: hsl(215 16% 35%);
    min-width: 1.25rem;
    text-align: right;
  }
`;

/** Renders the shared distribution panel, or `nothing` when there are no responses. */
export function renderStatsPanel(
  responses: readonly StatResponse[]
): TemplateResult | typeof nothing {
  if (responses.length === 0) {
    return nothing;
  }
  return html`
    <div class="qti-stats-panel" role="group" aria-label="Antwoordverdeling">
      ${responses.map(
        (response) => html`
          <div
            class="qti-stats-panel__row"
            title=${response.tooltip}
            data-review-tooltip=${response.tooltip}
            aria-label=${response.tooltip.replace(/\n+/g, ', ')}
          >
            <span class="qti-stats-panel__label">${response.value}</span>
            <span class="qti-review-inline-stat">
              <span class="qti-review-inline-stat__track">
                <span
                  class="qti-review-inline-stat__fill"
                  style="width: ${response.percentage}%; background-color: ${response.isCorrect
                    ? CORRECT_BAR_COLOR
                    : NEUTRAL_BAR_COLOR};"
                ></span>
              </span>
              <span class="qti-review-inline-stat__n">${response.count}</span>
            </span>
          </div>
        `
      )}
    </div>
  `;
}

function toStyleArray(styles: CSSResultGroup | undefined): CSSResultGroup[] {
  if (!styles) return [];
  return Array.isArray(styles) ? styles : [styles];
}

export declare class StatsInteractionInterface {
  /** Distinct response rows for the "Antwoordverdeling" panel. */
  distinctResponses: StatResponse[];
  resetStats(): void;
}

export const StatsInteractionMixin = <T extends Constructor<LitElement>>(
  Base: T
) => {
  class StatsInteractionElement extends Base {
    @property({ attribute: false })
    distinctResponses: StatResponse[] = [];

    // Use a getter (not a data field): some qti-components bases declare `styles`
    // as a getter-only static, which a `static styles = [...]` field cannot override.
    static get styles(): CSSResultGroup {
      return [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...toStyleArray((Base as any).styles),
        interactionControlStyles,
        statsPanelStyles,
      ];
    }

    resetStats(): void {
      this.distinctResponses = [];
    }

    override render(): unknown {
      const base = (super.render as (() => unknown) | undefined)?.call(this);
      return html`${base ?? nothing}${renderStatsPanel(this.distinctResponses)}`;
    }
  }

  return StatsInteractionElement as unknown as Constructor<
    StatsInteractionInterface & InstanceType<T>
  > &
    T;
};
