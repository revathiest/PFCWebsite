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
    'src/*.js',
    '!**/node_modules/**'
  ],

  // === OUTPUT ===
  verbose: false,
  silent: true,
  reporters: ['default']
};
