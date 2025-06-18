import { slugify } from '../src/utils.js';

describe('slugify', () => {
  it('converts text to kebab-case', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });
});
