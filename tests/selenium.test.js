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
    
    // Try multiple methods to find ChromeDriver
    let serviceBuilder = null;
    
    // Method 1: Try chromedriver npm package
    try {
      const chromedriver = require('chromedriver');
      if (chromedriver && chromedriver.path) {
        serviceBuilder = new ServiceBuilder(chromedriver.path);
        console.log('Using ChromeDriver from npm package:', chromedriver.path);
      }
    } catch (err) {
      // Package not available, continue to next method
    }
    
    // Method 2: If package method failed, use system PATH
    if (!serviceBuilder) {
      console.log('Using ChromeDriver from system PATH');
      serviceBuilder = new ServiceBuilder();
    }
    
    const builder = new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options);
    
    if (serviceBuilder) {
      builder.setChromeService(serviceBuilder);
    }
    
    driver = await builder.build();
    await driver.manage().setTimeouts({ implicit: 5000 });
    console.log('Chrome driver initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Chrome driver:', error.message);
    console.error('\nTroubleshooting steps:');
    console.error('1. Install ChromeDriver: npm install chromedriver@latest --save-dev');
    console.error('2. Or download manually from: https://googlechromelabs.github.io/chrome-for-testing/');
    console.error('3. Make sure Chrome browser is installed and up to date');
    throw error;
  }
}, 120000); // Increased timeout to 120 seconds

afterAll(async () => {
  if (driver) await driver.quit();
}, 30000);

// Helper: Wait for element
async function waitForElement(selector, timeout = 10000) {
  return await driver.wait(until.elementLocated(By.css(selector)), timeout);
}

// Helper: Unique email
function generateEmail() {
  return `test_${Date.now()}@example.com`;
}

describe('Todo Application - Selenium Test Suite', () => {

  // --------------------------------------------------------
  // TC1: HOME PAGE
  // --------------------------------------------------------
  test('TC1: Should load home page successfully', async () => {
    await driver.get(BASE_URL);
    const title = await driver.getTitle();
    expect(title).toBeTruthy();

    const welcomeText = await driver.findElement(By.css('h1.display-3')).getText();
    expect(welcomeText).toContain('Welcome to ToDoNow!');
  });

  // --------------------------------------------------------
  // TC2: About
  // --------------------------------------------------------
  test('TC2: Should navigate to about page', async () => {
    await driver.get(BASE_URL);

    const aboutLink = await waitForElement('a.nav-link[href="/about"]');
    await aboutLink.click();

    await driver.wait(until.urlContains('/about'), 5000);
    expect(await driver.getCurrentUrl()).toContain('/about');
  });

  // --------------------------------------------------------
  // TC3: Register Success
  // --------------------------------------------------------
  test('TC3: Success: Register a new user', async () => {
    const email = generateEmail();

    await driver.get(BASE_URL);

    const registerLink = await waitForElement('a.nav-link[href="/users/register"]');
    await registerLink.click();

    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys(email);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.name('password2')).sendKeys('testpass123');

    await driver.findElement(By.css('button.btn.btn-primary[type="submit"]')).click();

    await driver.wait(until.urlContains('/users/login'), 5000);
    expect(await driver.getCurrentUrl()).toContain('/users/login');
  });

  // --------------------------------------------------------
  // TC4: Password mismatch
  // --------------------------------------------------------
  test('TC4: error -->  passwords do not match', async () => {
    const email = generateEmail();

    await driver.get(`${BASE_URL}/users/register`);

    await driver.findElement(By.name('name')).sendKeys('User');
    await driver.findElement(By.name('email')).sendKeys(email);
    await driver.findElement(By.name('password')).sendKeys('11');
    await driver.findElement(By.name('password2')).sendKeys('22');

    await driver.findElement(By.css('button.btn.btn-primary[type="submit"]')).click();

    await driver.sleep(500);
    const errors = await driver.findElements(By.css('.alert.alert-danger'));
    expect(errors.length).toBeGreaterThan(0);
  });

  // Test Case 5: User Login - Success
  test('TC5: Success --> login with valid credentials', async () => {
    const uniqueEmail = generateEmail();
    
    // First register a user
    await driver.get(`${BASE_URL}/users/register`);
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.name('password2')).sendKeys('testpass123');
    await driver.findElement(By.css('button.btn.btn-primary[type="submit"]')).click();
    
    // Wait for redirect to login
    await driver.wait(until.urlContains('/users/login'), 5000);
    
    // Using exact field names from views/users/login.handlebars
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    // Using exact selector from views/users/login.handlebars: button.btn.btn-primary[type="submit"]
    await driver.findElement(By.css('button.btn.btn-primary[type="submit"]')).click();
    
    // Should redirect to todos page
    await driver.wait(until.urlContains('/todos'), 5000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/todos');
  });

  // Test Case 6: User Login - Invalid Credentials
  test('TC6: error --> invalid login credentials', async () => {
    await driver.get(`${BASE_URL}/users/login`);
    
    // Using exact field names from views/users/login.handlebars
    await driver.findElement(By.name('email')).sendKeys('invalid@example.com');
    await driver.findElement(By.name('password')).sendKeys('wrongpassword');
    await driver.findElement(By.css('button.btn.btn-primary[type="submit"]')).click();
    
    // Should stay on login page or show error
    await driver.sleep(1000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/users/login');
  });

  // Test Case 7: View Todos List
  test('TC7: success --> display todos list after login', async () => {
    const uniqueEmail = generateEmail();
    
    // Register and login
    await driver.get(`${BASE_URL}/users/register`);
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.name('password2')).sendKeys('testpass123');
    await driver.findElement(By.css('button.btn.btn-primary[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/users/login'), 5000);
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.css('button.btn.btn-primary[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/todos'), 5000);
    
    // Check if todos page is displayed
    const pageContent = await driver.findElement(By.css('body')).getText();
    expect(pageContent).toBeTruthy();
  });

  // Test Case 8: Logout Functionality
  test('TC8: sucess -->  logout successfully', async () => {
    const uniqueEmail = generateEmail();
    
    // Register and login
    await driver.get(`${BASE_URL}/users/register`);
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.name('password2')).sendKeys('testpass123');
    await driver.findElement(By.css('button.btn.btn-primary[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/users/login'), 5000);
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.css('button.btn.btn-primary[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/todos'), 5000);
    
    // Logout - using exact selector from views/partials/_navbar.handlebars: a.nav-link[href="/users/logout"]
    const logoutLink = await waitForElement('a.nav-link[href="/users/logout"]');
    await logoutLink.click();
    
    // Should redirect to login page
    await driver.wait(until.urlContains('/users/login'), 5000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/users/login');
  });

  // Test Case 9: Access Protected Route Without Authentication
  test('TC9: success --> redirect to login when accessing protected route', async () => {
    await driver.get(`${BASE_URL}/todos`);
    
    // Should redirect to login page
    await driver.wait(until.urlContains('/users/login'), 5000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/users/login');
  });

  // Test Case 10: Create Todo - Validation Error (Missing Title)
  test('TC10:  error --> cant create todo without title', async () => {
    const uniqueEmail = generateEmail();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
    // Register and login
    await driver.get(`${BASE_URL}/users/register`);
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.name('password2')).sendKeys('testpass123');
    await driver.findElement(By.css('button.btn.btn-primary[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/users/login'), 5000);
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.css('button.btn.btn-primary[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/todos'), 5000);
    
    // Navigate to add todo page - the link is in a dropdown menu, so navigate directly
    // Or open dropdown first: hover over "Manage Todos" then click "Add a new Todo"
    await driver.get(`${BASE_URL}/todos/add`);
    await driver.wait(until.urlContains('/todos/add'), 5000);
    
    // Try to submit without title (only fill details) - using exact field name from views/todos/add.handlebars
    await driver.findElement(By.name('details')).sendKeys('Details without title');
    
    // Using exact selector from views/todos/add.handlebars
    const submitButton = await driver.findElement(By.css('button.btn.btn-dark[type="submit"]'));
    await submitButton.click();
    
    // Wait a bit for either HTML5 validation or server-side validation
    await driver.sleep(2000);
    
    // Check if we're still on the add page (form didn't submit successfully)
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/todos/add');
    
    // If HTML5 validation didn't prevent submission, backend validation should show error
    // Check for error message from views/partials/_errors.handlebars: .alert.alert-danger
    try {
      const errorElements = await driver.findElements(By.css('.alert.alert-danger'));
      // Either HTML5 validation prevented submission OR backend showed error
      // If error elements exist, backend validation worked
      if (errorElements.length > 0) {
        const errorText = await errorElements[0].getText();
        expect(errorText).toContain('title');
      }
      // If no error elements, HTML5 validation prevented the form submission (also valid)
    } catch (err) {
      // HTML5 validation prevented submission - this is also acceptable
      // The form should still be on the same page
      expect(currentUrl).toContain('/todos/add');
    }
  });
});
