import { QtiExtendedTextInteraction } from '@citolab/qti-components';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';

import { interactionControlStyles } from './interactionControlStyles';
import { renderStatsPanel, statsPanelStyles } from './withStats';

import type { StatResponse } from './reviewStatsModel';

/**
 * Teacher-review stats for free-text (extended-text) answers: distinct responses
 * with their distribution, rendered below the textarea. Specific (rather than the
 * generic mixin) so the answer distribution reads as the primary content here.
 */
export class QtiExtendedTextInteractionStats extends QtiExtendedTextInteraction {
  @property({ type: Boolean, attribute: 'stats-only' })
  statsOnly = false;

  @property({ attribute: false })
  distinctResponses: StatResponse[] = [];

  static override styles = [
    ...(Array.isArray(QtiExtendedTextInteraction.styles)
      ? QtiExtendedTextInteraction.styles
      : [QtiExtendedTextInteraction.styles]),
    interactionControlStyles,
    statsPanelStyles,
    css`
      :host([stats-only]) [part='textarea'] {
        min-height: 1.5rem;
        height: 1.75rem;
        resize: none;
        overflow: hidden;
        pointer-events: none;
        padding: 0.2rem 0.45rem;
        font-size: 11px;
        line-height: 1.2;
      }

      :host([stats-only]) .qti-stats-panel {
        margin-top: 0.35rem;
      }
    `,
  ];

  resetStats(): void {
    this.distinctResponses = [];
  }

  override render() {
    return html`${super.render()}${renderStatsPanel(this.distinctResponses)}`;
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    super.updated(changed);
    if (changed.has('statsOnly')) {
      this.syncCompactTextarea();
    }
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.syncCompactTextarea();
  }

  private syncCompactTextarea(): void {
    if (!this.statsOnly) return;

    const textarea = this.shadowRoot?.querySelector('textarea');
    if (!textarea) return;

    textarea.rows = 1;
    textarea.readOnly = true;
    textarea.tabIndex = -1;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-extended-text-interaction-stats': QtiExtendedTextInteractionStats;
  }
}

if (!customElements.get('qti-extended-text-interaction-stats')) {
  customElements.define(
    'qti-extended-text-interaction-stats',
    QtiExtendedTextInteractionStats
  );
}
