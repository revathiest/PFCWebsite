import { slugify } from '../src/utils.js';

test('slugify converts strings to lowercase hyphenated slugs', () => {
  expect(slugify('Hello World')).toBe('hello-world');
  expect(slugify('  Multi  Word   Test ')).toBe('multi-word-test');
  expect(slugify('Café au lait')).toBe('caf-au-lait');
});
