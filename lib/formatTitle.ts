/**
 * Strips emojis and applies sentence case to a property title.
 * Applied on blur so the agent can still type freely.
 */
export function formatPropertyTitle(raw: string): string {
  const noEmoji = raw
    .replace(
      /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FEFF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA9F}\u{1FAA0}-\u{1FAD6}‍︎️]/gu,
      "",
    )
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!noEmoji) return noEmoji;
  return noEmoji.charAt(0).toUpperCase() + noEmoji.slice(1).toLowerCase();
}

export function stripEmojis(raw: string): string {
  return raw.replace(
    /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FEFF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA9F}\u{1FAA0}-\u{1FAD6}‍︎️]/gu,
    "",
  );
}
