// Selenium Test Configuration
// Base URL for the application
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';

// Test user credentials (will be created during tests)
const TEST_USER = {
  name: 'Test User',
  email: `testuser_${Date.now()}@example.com`,
  password: 'testpass123'
};

// Headless Chrome options
const CHROME_OPTIONS = {
  args: [
    '--headless',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1920,1080'
  ]
};

module.exports = {
  BASE_URL,
  TEST_USER,
  CHROME_OPTIONS
};


