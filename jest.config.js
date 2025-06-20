module.exports = {
  // Use jsdom so DOM APIs like document and localStorage are available
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  moduleFileExtensions: ['js', 'json'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Mock CSS imports used by Vite
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },

  // === TRANSFORMS ===
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // === COVERAGE SETTINGS ===
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!**/node_modules/**',
    '!src/shop.js',
    '!src/nav.js',
    '!src/main.js',
    '!src/editor.js',
    '!src/content-manager.js',
    '!src/log-search.js',
    '!src/friend.js',
    '!src/friends.js',
    '!src/officers.js',
    '!src/accolade.js',
    '!src/admin.js',
    '!src/router.js',
    '!src/unauthorized.js',
    '!src/auth.js'
  ],

  // === OUTPUT ===
  verbose: false,
  reporters: ['default']
};
