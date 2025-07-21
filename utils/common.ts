export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

export const BLOCK_ID_REGEX = /<!--\s*block-id\s*:\s*([a-z0-9-]+)\s*-->\n/i;

export const getUUID = (blockId?: string) => {
  if (!blockId) {
    blockId = crypto.randomUUID();
  }
  return { blockId, UUID: `<!--block-id:${blockId}-->` }
}

export const removeUUID = (code: string): string => {
  return code.replace(BLOCK_ID_REGEX, '');
};
