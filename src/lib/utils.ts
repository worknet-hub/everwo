import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Returns true if the string contains only emojis (and optional whitespace)
export function isEmojiOnly(str: string): boolean {
  // This regex matches most emoji, including multi-codepoint ones, and ignores whitespace
  // It will return true if the string contains only emojis and whitespace
  // Note: No regex is perfect for all emoji, but this covers most cases
  const emojiRegex = /^(?:\s|(?:[\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2011-\u26FF]|[\uD83D\uDE00-\uD83D\uDE4F]|[\uD83D\uDE80-\uD83D\uDEFF]|[\uD83C\uDF00-\uD83D\uDDFF]|[\uD83E\uDD00-\uD83E\uDDFF])+)+$/u;
  return emojiRegex.test(str.trim());
}
