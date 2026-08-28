import { QtiChoiceInteraction } from '@citolab/qti-components';
import type { QtiSimpleChoiceStats } from './qti-simple-choice-stats';

type ChoiceLike = HTMLElement & {
  identifier: string;
  disabled: boolean;
  readonly: boolean;
  internals: ElementInternals;
};

type ChoiceInteractionStatsInternals = QtiChoiceInteraction & {
  _choiceElements: ChoiceLike[];
  _setInputType: (choice: ChoiceLike) => void;
  _updateChoiceSelection: () => void;
  disabled: boolean;
  readonly: boolean;
  response: string | string[] | null;
};

const STATS_CHOICE_SELECTOR = 'qti-simple-choice-stats';

export class QtiChoiceInteractionStats extends QtiChoiceInteraction {
  // `_syncChoicesFromDOM` is an internal hook on the base interaction (not in its
  // public types), so we override it without the `override` keyword.
  protected _syncChoicesFromDOM() {
    const self = this as unknown as ChoiceInteractionStatsInternals;
    const previousChoices = new Set(self._choiceElements);
    self._choiceElements = Array.from(
      this.querySelectorAll(STATS_CHOICE_SELECTOR)
    ) as ChoiceLike[];

    self._choiceElements.forEach((choiceElement) => {
      if (!previousChoices.has(choiceElement)) {
        if (self.disabled) {
          choiceElement.disabled = true;
        }
        choiceElement.readonly = self.readonly;

        if (choiceElement.internals && !choiceElement.internals.ariaChecked) {
          choiceElement.internals.ariaChecked = 'false';
        }

        self._setInputType(choiceElement);
      }
    });

    const validIdentifiers = new Set(
      self._choiceElements.map((choice) => choice.identifier)
    );
    if (Array.isArray(self.response)) {
      const filteredResponse = self.response.filter((id) =>
        validIdentifiers.has(id)
      );
      if (filteredResponse.length !== self.response.length) {
        self.response = filteredResponse;
      }
    } else     if (self.response && !validIdentifiers.has(self.response)) {
      self.response = '';
    }

    self._updateChoiceSelection();

    if (this.showCorrectResponse) {
      this.toggleCorrectResponse(true);
    }
  }

  override reset(): void {
    super.reset();
    this.querySelectorAll(STATS_CHOICE_SELECTOR).forEach((choiceElement) => {
      (choiceElement as QtiSimpleChoiceStats).resetStat?.();
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-choice-interaction-stats': QtiChoiceInteractionStats;
  }
}

if (!customElements.get('qti-choice-interaction-stats')) {
  customElements.define(
    'qti-choice-interaction-stats',
    QtiChoiceInteractionStats
  );
}
