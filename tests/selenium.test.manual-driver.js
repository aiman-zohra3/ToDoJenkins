// Alternative version that uses system ChromeDriver if available
// Use this if npm install chromedriver fails due to disk space

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { ServiceBuilder } = require('selenium-webdriver/chrome');
const { BASE_URL, TEST_USER, CHROME_OPTIONS } = require('./selenium.config');

// Setup Chrome driver with headless mode
let driver;

beforeAll(async () => {
  try {
    const options = new chrome.Options();
    CHROME_OPTIONS.args.forEach(arg => options.addArguments(arg));
    
    // Try to use system ChromeDriver from PATH
    // Make sure ChromeDriver is in your system PATH or specify the path directly
    const builder = new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options);
    
    // Option 1: Use ChromeDriver from system PATH (if installed globally)
    // Option 2: Specify path manually if ChromeDriver is installed elsewhere
    // Example: builder.setChromeService(new ServiceBuilder('C:\\path\\to\\chromedriver.exe'));
    
    driver = await builder.build();
    await driver.manage().setTimeouts({ implicit: 5000 });
    console.log('Chrome driver initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Chrome driver:', error.message);
    console.error('\nTo fix:');
    console.error('1. Free up disk space (clean temp files, uninstall unused programs)');
    console.error('2. Download ChromeDriver manually from: https://googlechromelabs.github.io/chrome-for-testing/');
    console.error('3. Extract and add to PATH, or specify path in this file');
    throw error;
  }
}, 60000);

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
}, 30000);

// Helper function to wait for element
async function waitForElement(selector, timeout = 10000) {
  return await driver.wait(until.elementLocated(By.css(selector)), timeout);
}

// Helper function to generate unique email
function generateEmail() {
  return `testuser_${Date.now()}@example.com`;
}

// Copy all test cases from selenium.test.js here...
// (Same test cases as before)

describe('Todo Application - Selenium Test Suite', () => {
  // Add your test cases here - same as selenium.test.js
  test('TC1: Placeholder - Copy tests from selenium.test.js', async () => {
    // Copy all 13 test cases from selenium.test.js
  });
});

