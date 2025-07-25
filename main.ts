import { Plugin, WorkspaceLeaf } from "obsidian";

//@ts-ignore
import { Editor } from "./components/editor";
import { createElement } from "react";
import { createRoot } from 'react-dom/client';
import { createCodeBlockSaver } from "./utils/blockSaver";

import { BLOCK_ID_REGEX, getUUID, removeUUID } from "./utils/common";
import { CanvasView, CANVAS_VIEW } from "./views/canvas-view";

export default class P5Editor extends Plugin {
  private static instance: P5Editor;

  static getInstance() {
    return P5Editor.instance;
  }

  async activateView(code: string) {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(CANVAS_VIEW);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);

      if (leaf) {
        await leaf.setViewState({ type: CANVAS_VIEW, active: true });
        const view = leaf.view as CanvasView;
        view.setCode(code);
      }
    }

    if (leaf) workspace.revealLeaf(leaf);
  }

  async onload() {
    P5Editor.instance = this;

    this.registerView(CANVAS_VIEW, (leaf) => new CanvasView(leaf, ""));

    this.registerMarkdownCodeBlockProcessor("p5", (source, el, ctx) => {
      const blockName = "p5";

      setTimeout(() => {
        const idMatch = source.match(BLOCK_ID_REGEX);
        const { blockId } = getUUID(idMatch?.[1]);

        const save = createCodeBlockSaver(this.app, blockName, ctx, blockId);

        el.empty();

        const root = createRoot(el);
        root.render(
          createElement(Editor, {
            source: removeUUID(source),
            save,
            blockId
          })
        );

        const observer = new MutationObserver(() => {
          if (!el.isConnected) {
            root.unmount();
            observer.disconnect();
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        })
      }, 0);
    });
  }

  onunload() { }
}
