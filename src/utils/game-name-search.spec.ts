import { gameNameSearchClauses } from './game-name-search';

describe('gameNameSearchClauses', () => {
  const searchOf = (clauses: any[]) =>
    clauses.find((c) => 'search' in c.name)?.name.search;

  it('builds a <->-joined tsquery for a plain multi-word filter', () => {
    const clauses = gameNameSearchClauses('Ticket to Ride');

    expect(searchOf(clauses)).toBe('Ticket <-> to <-> Ride');
  });

  it('always includes the raw contains and startsWith ILIKE clauses', () => {
    const clauses = gameNameSearchClauses('Cities & Knights');

    expect(clauses).toContainEqual({
      name: { contains: 'Cities & Knights', mode: 'insensitive' },
    });
    expect(clauses).toContainEqual({
      name: { startsWith: 'Cities & Knights', mode: 'insensitive' },
    });
  });

  it('strips tsquery operators so they never reach to_tsquery', () => {
    // & | ! : ( ) would each be a tsquery syntax error if passed through.
    expect(searchOf(gameNameSearchClauses('Catan: Cities & Knights'))).toBe(
      'Catan <-> Cities <-> Knights',
    );
    expect(searchOf(gameNameSearchClauses('Heroes | Villains'))).toBe(
      'Heroes <-> Villains',
    );
    expect(searchOf(gameNameSearchClauses('Pandemic (Legacy)'))).toBe(
      'Pandemic <-> Legacy',
    );
  });

  it('handles apostrophes in titles without breaking the lexeme', () => {
    expect(searchOf(gameNameSearchClauses("Assassin's Creed"))).toBe(
      'Assassin <-> s <-> Creed',
    );
  });

  it('omits the search clause entirely when nothing alphanumeric survives', () => {
    const clauses = gameNameSearchClauses('& : !');

    expect(searchOf(clauses)).toBeUndefined();
    // The ILIKE clauses still carry the raw filter.
    expect(clauses).toHaveLength(2);
  });

  it('collapses repeated and surrounding punctuation', () => {
    expect(searchOf(gameNameSearchClauses('  Root --  Marauder  '))).toBe(
      'Root <-> Marauder',
    );
  });
});
