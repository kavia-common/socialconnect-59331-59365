module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.js'],
  testTimeout: 30000,
  detectOpenHandles: true,
  forceExit: true,
  verbose: true,
  // transform not needed as code is commonjs
};
