import { Plugin } from "obsidian";

//@ts-ignore
import ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-chrome";
import "ace-builds/src-noconflict/ext-language_tools";
import * as beautify from "js-beautify";

import { generateId } from "utils/common";

const getHeight = (source: string, lineHeight = 20) => {
  const newLines = Array.from(source.matchAll(/\n/g)).length;
  return newLines * lineHeight + "px";
};

const createEditorDiv = (id: string) => {
  const editor = document.createElement("div");
  editor.id = id;
  editor.style.width = "100%";
  editor.style.minHeight = "100px";
  editor.style.maxHeight = "700px";
  return editor;
};
const initAce = (source: string, id: string) => {
  const aceEditor = ace.edit(id);
  aceEditor.setTheme("ace/theme/chrome");
  aceEditor.session.setMode("ace/mode/javascript");
  aceEditor.setValue(source, -1);
  aceEditor.setOptions({
    fontSize: "14px",
    readOnly: false,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true,
  });

  return aceEditor;
};

export default class P5Editor extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor(
      "p5",
      async (source, el, ctx) => {
        if (!(window as any).p5) {
          await new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = `${this.app.vault.adapter.getResourcePath(`${this.manifest.dir}/assets/p5.min.js`)}`;
            script.onload = resolve;
            document.head.appendChild(script);
          });
        }
        const editorId = `ace-editor-${generateId()}`;
        const outputId = `output-${editorId}`;

        const editor = createEditorDiv(editorId);
        editor.style.height = getHeight(source);
        el.appendChild(editor);

        const outputEl = document.createElement("p");
        outputEl.id = outputId;
        outputEl.style.fontFamily = "monospace";
        outputEl.style.color = "gray";
        outputEl.style.margin = "0";
        el.appendChild(outputEl);

        setTimeout(() => {
          const aceEditor = initAce(source, editorId);

          const saveCodeToBlock = async () => {
            const file = this.app.workspace.getActiveFile();
            if (!file) return;
            if (!ctx) return;

            const blockElement = (ctx as any).containerEl;
            const codeBlocks = Array.from(
              blockElement.querySelectorAll(".block-language-p5"),
            );
            const index = codeBlocks.indexOf((ctx as any).el);

            const content = await this.app.vault.read(file);
            const blocks = content.match(/```p5[\s\S]*?```/g);

            if (blocks && index >= 0) {
              const newContent = content.replace(
                blocks[index],
                `\`\`\`p5\n${aceEditor.getValue()}\n\`\`\``,
              );
              await this.app.vault.modify(file, newContent);
            }
          };

          const frameId = "sketchFrame-" + editorId;

          const runCode = async () => {
            try {
              const userCode = aceEditor.getValue();

              const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
    <script>
      ${userCode}

      if (typeof setup === "function") {
        const originalSetup = setup;
        setup = (...args) => {
          const result = originalSetup(...args);
          window.parent.postMessage({
            type: "resize-iframe",
            id: "${frameId}",
            height: document.body.scrollHeight
          }, "*");
          return result;
        };
      }
    </script>
  </head>
  <body style="margin:0; padding:0;"></body>
</html>
`;

              // Create a Blob URL
              const blob = new Blob([htmlContent], { type: "text/html" });
              const blobURL = URL.createObjectURL(blob);

              // Inject into iframe
              outputEl.innerHTML = `
  <iframe width="100%" height="0px" id="${frameId}" src="${blobURL}"></iframe>
`;

              //               outputEl.innerHTML = `
              // <iframe width="100%" height="0px" id="${frameId}" srcdoc='<!DOCTYPE html>
              // <!DOCTYPE html>
              // <html>
              //   <head>
              //     <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
              //     <script>
              // ${aceEditor.getValue()}

              // if(setup){
              // const originalSetup = setup;

              // setup = (...args) => {
              //   const result = originalSetup(...args);

              //   window.parent.postMessage({
              //     type: "resize-iframe",
              // id: "${frameId}",
              //     height: document.body.scrollHeight
              //   }, "*");

              //   return result; // return the p5 canvas element as normal
              // };

              // }
              //     </script>

              //   </head>
              //   <body style="margin:0; padding: 0"></body>
              // </html>
              // '></iframe>
              // `;

              console.log("blegh");
              if (!window.__resizeIframeListenerAdded__) {
                window.addEventListener("message", (e) => {
                  if (
                    e.data?.type === "resize-iframe" &&
                    e.data.id
                  ) {
                    const iframe = document.getElementById(
                      e.data.id,
                    );
                    if (iframe) {
                      const height = Math.min(
                        e.data.height + 5,
                        600,
                      );
                      iframe.style.height = height + "px";
                    }
                  }
                });
              }
              window.__resizeIframeListenerAdded__ = true;

              // const sketchFunc = new Function('p', aceEditor.getValue());
              // new (window as any).p5(sketchFunc, outputEl);
            } catch (err) {
              console.log(err);
              outputEl.textContent =
                "⚠ " + err.message + err.stack;
              outputEl.style.color = "red";
            }
          };

          runCode();

          const runButton = document.createElement("button");
          runButton.textContent = "Run";
          runButton.style.margin = "8px 10px";
          runButton.onclick = runCode;
          el.appendChild(runButton);

          const saveButton = document.createElement("button");
          saveButton.textContent = "Save";
          saveButton.style.margin = "8px 2px";
          saveButton.onclick = saveCodeToBlock;
          el.appendChild(saveButton);

          const formatButton = document.createElement("button");
          formatButton.textContent = "Format";
          formatButton.style.margin = "8px 2px";
          formatButton.onclick = () => {
            const session = aceEditor.getSession();
            session.setValue(
              beautify.js_beautify(session.getValue()),
            );
          };
          el.appendChild(formatButton);

          aceEditor.on("change", () => {
            const session = aceEditor.getSession();
            editor.style.height = getHeight(session.getValue());
          });
        }, 0);
      },
    );
  }

  onunload() { }
}
