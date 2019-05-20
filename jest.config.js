module.exports = {
  projects: [
    {
      displayName: 'linter',
      runner: 'jest-runner-standard',
      testMatch: [
        '<rootDir>/**/*.{js,jsx}'
      ],
      testPathIgnorePatterns: ['<rootDir>/node_modules/']
    },
    {
      displayName: 'project',
      testPathIgnorePatterns: ['<rootDir>/node_modules/'],
      collectCoverageFrom: [
        'src/**/*.{js,jsx}'
      ],
      coveragePathIgnorePatterns: ['/node_modules/'],
      transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
      }
    }
  ]
}
