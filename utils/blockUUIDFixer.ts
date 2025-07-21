import { App, Notice } from "obsidian";
import { getUUID, removeUUID } from "./common";

export const fixDuplicateBlockIds = async (
  app: App,
  blockName: string,
  blockId: string
) => {
  const file = app.workspace.getActiveFile();
  if (!file) return;

  let content = await app.vault.read(file);
  const regex = new RegExp("```" + blockName + "[\\s\\S]*?```", "g");
  const blocks = [...content.matchAll(regex)];

  const matchingBlocks = blocks.filter((match) =>
    match[0].includes(`block-id:${blockId}`)
  );

  if (matchingBlocks.length <= 1) {
    return;
  }

  for (let i = 1; i < matchingBlocks.length; i++) {
    const oldBlock = matchingBlocks[i][0];
    const blockWithoutUUID = removeUUID(oldBlock);
    const newUUID = getUUID().UUID;
    const newBlock = blockWithoutUUID.replace(
      /^(```\w+)/,
      `$1\n${newUUID}`
    );

    content = content.replace(oldBlock, newBlock);
  }

  await app.vault.modify(file, content);
  new Notice(`Fixed ${matchingBlocks.length - 1} duplicate block IDs`, 3000);
}
