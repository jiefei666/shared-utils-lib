export const warn = (...args: unknown[]) =>
  console.warn(`PostMessage Warn:`, ...args)

export const isThenable = (val: unknown) => !!(val && !!(val as any)?.then)
