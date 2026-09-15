/**
 * Matching for the site search.
 *
 * The original was a single `.includes()` against a concatenated string, which
 * failed on the site's own suggested searches: "Puppies" never matched because
 * the category is stored as "puppy", and "Royal Black Shepherd" never matched
 * "Royal Black German Shepherd" because one word sits in the middle. Both
 * returned "no matches" for dogs that are plainly listed.
 *
 * So: match on tokens rather than the whole phrase, and reduce obvious plurals.
 * Every word the visitor typed must appear somewhere in the record, in any
 * order, with anything allowed in between.
 */

/** Lowercase, strip punctuation, collapse whitespace. */
const normalise = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

/**
 * Crude English singulariser — enough for "puppies" → "puppy" and
 * "shepherds" → "shepherd". Deliberately not a real stemmer: over-stemming
 * makes search match things the visitor did not ask for, which is worse than
 * missing an unusual plural.
 */
function singular(token: string): string {
  if (token.length > 3 && token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (token.length > 4 && token.endsWith("ses")) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
}

const tokenise = (s: string) => normalise(s).split(" ").filter(Boolean).map(singular);

/**
 * Does `haystack` satisfy every word of `query`?
 *
 * Prefix matching on each token so "kang" finds "Kangal" as the visitor types,
 * which is what makes an as-you-type box feel responsive.
 */
export function matches(haystack: string, query: string): boolean {
  const needles = tokenise(query);
  if (needles.length === 0) return false;
  const hay = tokenise(haystack);
  return needles.every((n) => hay.some((h) => h.startsWith(n) || h.includes(n)));
}

/** Rank exact and leading matches above incidental ones. */
export function score(haystack: string, query: string): number {
  const hay = normalise(haystack);
  const q = normalise(query);
  if (hay === q) return 3;
  if (hay.startsWith(q)) return 2;
  if (hay.includes(q)) return 1;
  return 0;
}
