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
