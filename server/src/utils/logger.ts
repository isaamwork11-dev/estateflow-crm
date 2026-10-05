type LogMeta = Record<string, unknown>;

function format(meta?: LogMeta): string {
  if (!meta || Object.keys(meta).length === 0) return '';
  return ' ' + JSON.stringify(meta);
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    console.log(`[INFO] ${message}${format(meta)}`);
  },
  warn(message: string, meta?: LogMeta) {
    console.warn(`[WARN] ${message}${format(meta)}`);
  },
  error(message: string, meta?: LogMeta) {
    console.error(`[ERROR] ${message}${format(meta)}`);
  },
};
