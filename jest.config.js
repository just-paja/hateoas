module.exports = {
  projects: [
    {
      displayName: 'linter',
      runner: 'jest-runner-standard',
      testMatch: ['<rootDir>/**/*.{js,jsx}'],
      testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/lib/']
    },
    {
      displayName: 'project',
      testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/lib/'],
      collectCoverageFrom: ['src/**/*.{js,jsx}'],
      coveragePathIgnorePatterns: ['/node_modules/', '/lib/'],
      transform: {
        '^.+\\.(js|jsx)$': 'babel-jest'
      }
    }
  ]
}
