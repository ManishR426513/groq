import type { Node } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import {
  type Decoration,
  DecorationSet,
  type EditorView,
} from 'prosemirror-view';
import { createRoot } from 'react-dom/client';

import { Suggestion as PreviewSuggestion } from '@/components/suggestion';
import type { Suggestion } from '@/lib/db/schema';
import { ArtifactKind } from '@/components/artifact';

export interface UISuggestion extends Suggestion {
  selectionStart: number;
  selectionEnd: number;
  originalText?: string; // Add this property if needed
  suggestedText?: string; // Add this property if needed
}

interface Position {
  start: number;
  end: number;
}

function findPositionsInDoc(doc: Node, searchText: string): Position | null {
  let positions: { start: number; end: number } | null = null;

  doc.nodesBetween(0, doc.content.size, (node, pos) => {
    if (node.isText && node.text) {
      const index = node.text.indexOf(searchText);

      if (index !== -1) {
        positions = {
          start: pos + index,
          end: pos + index + searchText.length,
        };

        return false;
      }
    }

    return true;
  });

  return positions;
}

export function projectWithPositions(
  doc: Node,
  suggestions: Array<Suggestion>,
): Array<UISuggestion> {
  return suggestions.map((suggestion) => {
    // Fixed: Use content instead of originalText, or provide fallback
    const searchText = (suggestion as any).originalText || suggestion.content;
    const positions = findPositionsInDoc(doc, searchText);

    if (!positions) {
      return {
        ...suggestion,
        selectionStart: 0,
        selectionEnd: 0,
        originalText: searchText,
        suggestedText: suggestion.content,
      };
    }

    return {
      ...suggestion,
      selectionStart: positions.start,
      selectionEnd: positions.end,
      originalText: searchText,
      suggestedText: suggestion.content,
    };
  });
}

export function createSuggestionWidget(
  suggestion: UISuggestion,
  view: EditorView,
  artifactKind: ArtifactKind = 'text',
): { dom: HTMLElement; destroy: () => void } {
  const dom = document.createElement('span');
  const root = createRoot(dom);

  dom.addEventListener('mousedown', (event) => {
    event.preventDefault();
    view.dom.blur();
  });

  const onApply = () => {
    const { state, dispatch } = view;

    const decorationTransaction = state.tr;
    const currentState = suggestionsPluginKey.getState(state);
    const currentDecorations = currentState?.decorations;

    if (currentDecorations) {
      const newDecorations = DecorationSet.create(
        state.doc,
        currentDecorations.find().filter((decoration: Decoration) => {
          return decoration.spec.suggestionId !== suggestion.id;
        }),
      );

      decorationTransaction.setMeta(suggestionsPluginKey, {
        decorations: newDecorations,
        selected: null,
      });
      dispatch(decorationTransaction);
    }

    // Fixed: Use suggestedText with fallback to content
    const replacementText = suggestion.suggestedText || suggestion.content;
    const textTransaction = view.state.tr.replaceWith(
      suggestion.selectionStart,
      suggestion.selectionEnd,
      state.schema.text(replacementText),
    );

    textTransaction.setMeta('no-debounce', true);

    dispatch(textTransaction);
  };

  root.render(
    <PreviewSuggestion
      suggestion={suggestion}
      onApply={onApply}
      artifactKind={artifactKind}
    />,
  );

  return {
    dom,
    destroy: () => {
      // Wrapping unmount in setTimeout to avoid synchronous unmounting during render
      setTimeout(() => {
        root.unmount();
      }, 0);
    },
  };
}

export const suggestionsPluginKey = new PluginKey('suggestions');
export const suggestionsPlugin = new Plugin({
  key: suggestionsPluginKey,
  state: {
    init() {
      return { decorations: DecorationSet.empty, selected: null };
    },
    apply(tr, state) {
      const newDecorations = tr.getMeta(suggestionsPluginKey);
      if (newDecorations) return newDecorations;

      return {
        decorations: state.decorations.map(tr.mapping, tr.doc),
        selected: state.selected,
      };
    },
  },
  props: {
    decorations(state) {
      return this.getState(state)?.decorations ?? DecorationSet.empty;
    },
  },
});
