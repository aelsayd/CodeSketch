import { App, MarkdownPostProcessorContext, Notice } from "obsidian";
import { fixDuplicateBlockIds } from "./blockUUIDFixer";
import { getUUID, removeUUID } from "./common";

export function createCodeBlockSaver(
  app: App,
  blockName: string,
  ctx: MarkdownPostProcessorContext,
  blockId: string
) {
  const { UUID } = getUUID(blockId);

  const saveCodeToBlock = async (value: string) => {
    const file = app.workspace.getActiveFile();
    if (!file || !ctx) return;

    await fixDuplicateBlockIds(app, blockName, blockId);

    const content = await app.vault.read(file);
    const regex = new RegExp("```" + blockName + "[\\s\\S]*?```", "g");
    const blocks = [...content.matchAll(regex)];

    if (!blocks.length) {
      console.warn("No blocks found for blockName:", blockName);
      return;
    }

    let blockWithId = blocks.find((match) =>
      match[0].includes(`block-id:${blockId}`)
    );

    if (!blockWithId) {
      blockWithId = blocks.find(
        (match) => !/<!--\s*block-id\s*:/i.test(match[0])
      );

      if (!blockWithId) {
        console.warn("No idless block found to replace");
        return;
      }
    }

    const cleanedValue = removeUUID(value);
    const newBlock = `\`\`\`${blockName}\n${UUID}\n${cleanedValue.trim()}\n\`\`\``;

    const updatedContent = content.replace(blockWithId[0], newBlock);

    new Notice("Saving...", 1000);
    await app.vault.modify(file, updatedContent);
  };

  return saveCodeToBlock;
}
