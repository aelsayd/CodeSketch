import { P5Runner } from '../components/p5Runner';
import { ItemView, WorkspaceLeaf } from 'obsidian';
import { createElement, useState } from "react";
import { createRoot, Root } from 'react-dom/client';

export const CANVAS_VIEW = 'canvas-view';

export const Canvas = ({ code }: { code: string }) => {
  console.log("rendering: ", code)

  return (
    <div>
      <h1>test</h1>
      <P5Runner code={code} blockId={"CANVAS_VIEW_FRAME_" + Math.random()} />
    </div>
  )
}

export class CanvasView extends ItemView {
  private code: string;

  setCode(code: string) {
    this.code = code;

    const container = this.containerEl.children[1];
    container.empty();
    const root = createRoot(container);
    root.render(
      createElement(Canvas, { code: this.code })
    );
  }

  constructor(leaf: WorkspaceLeaf, code: string) {
    super(leaf);
    this.code = code;
  }

  getViewType() {
    return CANVAS_VIEW;
  }

  getDisplayText() {
    return 'Canvas View';
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    const root = createRoot(container);
    root.render(
      createElement(Canvas, {
        code: this.code
      })
    );
  }

  async onClose() {
    // Nothing to clean up.
  }
}
