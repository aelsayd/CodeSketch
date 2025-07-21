import { Plugin } from "obsidian";

//@ts-ignore
import { Editor } from "./components/editor";
import { createElement } from "react";
import { createRoot } from 'react-dom/client';
import { createCodeBlockSaver } from "utils/blockSaver";

import { BLOCK_ID_REGEX, getUUID, removeUUID } from "utils/common";

export default class P5Editor extends Plugin {
  async onload() {
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
