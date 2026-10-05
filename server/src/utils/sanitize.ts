const MAX_MESSAGE_LENGTH = 4000;

export function sanitizeUserMessage(input: string): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
}
