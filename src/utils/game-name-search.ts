import { Prisma } from '@prisma/client';

/**
 * Build the name-matching OR clauses for a free-text game filter.
 *
 * The full-text `search` clause compiles to PostgreSQL `to_tsquery`, which has
 * strict operator syntax: a bare `&`, `|`, `!`, `:`, parentheses, `<`, `>`,
 * `*`, quote, or backslash is a syntax error that surfaces as a 500. We
 * therefore tokenize the filter on any run of non-alphanumeric characters
 * (which also strips those operators), drop empty tokens, and join with the
 * `<->` (followed-by) operator. If nothing survives (e.g. a filter that's pure
 * punctuation) the `search` clause is omitted entirely.
 *
 * The `contains`/`startsWith` clauses use ILIKE and match the raw filter
 * literally, so any punctuation the user typed is still honored there.
 */
export function gameNameSearchClauses(
  filter: string,
): Prisma.GameWhereInput[] {
  const clauses: Prisma.GameWhereInput[] = [
    { name: { contains: filter, mode: 'insensitive' } },
  ];

  const search = filter
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .join(' <-> ');

  if (search) {
    clauses.unshift({ name: { search } });
  }

  return clauses;
}
