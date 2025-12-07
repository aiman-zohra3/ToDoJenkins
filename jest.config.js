module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 60000,
  // Ignore nested example project to avoid haste map collisions
  testPathIgnorePatterns: ["/simple-todo-app-mongodb-express-node-master/"],
  verbose: true
};


