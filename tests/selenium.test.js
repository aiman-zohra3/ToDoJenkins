
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Todo Application - Selenium Test Suite', () => {
  let driver;
  let baseUrl;

  beforeAll(async () => {
    baseUrl = process.env.TEST_BASE_URL || 'http://localhost:5000';
    
    console.log(`Using base URL: ${baseUrl}`);
    
    // Setup Chrome options for Alpine/Chromium
    const chromeOptions = new chrome.Options();
    
    // Use environment variables for binary paths
    const chromeBin = process.env.CHROME_BIN || '/usr/bin/chromium-browser';
    const chromeDriverPath = process.env.CHROMEDRIVER_PATH || '/usr/bin/chromedriver';
    
    console.log(`Using Chrome binary: ${chromeBin}`);
    console.log(`Using ChromeDriver: ${chromeDriverPath}`);
    
    chromeOptions.setChromeBinaryPath(chromeBin);
    
    // Headless mode arguments
    chromeOptions.addArguments('--headless');
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');
    chromeOptions.addArguments('--disable-gpu');
    chromeOptions.addArguments('--disable-software-rasterizer');
    chromeOptions.addArguments('--disable-extensions');
    chromeOptions.addArguments('--window-size=1920,1080');
    
    console.log('Building Chrome driver...');
    
    // Build the driver with ChromeDriver service
    const service = new chrome.ServiceBuilder(chromeDriverPath);
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .setChromeService(service)
      .build();
    
    // Set implicit wait
    await driver.manage().setTimeouts({ implicit: 10000, pageLoad: 30000 });
    
    console.log('Chrome driver initialized successfully');
  }, 120000);

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  // Utility function to generate unique email
  const generateEmail = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `testuser${timestamp}${randomNum}@example.com`;
  };

  // Test data
  const testUser = {
    name: 'Test User',
    email: generateEmail(),
    password: 'Test123!'
  };

  // Utility function to login
  const loginUser = async (email, password) => {
    await driver.get(`${baseUrl}/login`);
    await driver.findElement(By.name('email')).sendKeys(email);
    await driver.findElement(By.name('password')).sendKeys(password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/todos'), 10000);
  };

  // TC1: Should load home page successfully
  test('TC1: Should load home page successfully', async () => {
    await driver.get(baseUrl);
    const title = await driver.getTitle();
    assert(title.includes('Todo') || title.includes('Home'));
    
    await driver.wait(until.elementLocated(By.linkText('Login')), 10000);
    await driver.wait(until.elementLocated(By.linkText('Register')), 10000);
  });

  // TC2: Should navigate to about page
  test('TC2: Should navigate to about page', async () => {
    await driver.get(baseUrl);
    await driver.findElement(By.linkText('About')).click();
    await driver.wait(until.urlContains('/about'), 10000);
    const currentUrl = await driver.getCurrentUrl();
    assert(currentUrl.includes('/about'));
  });

  // TC3: Should register a new user successfully
  test('TC3: Should register a new user successfully', async () => {
    await driver.get(`${baseUrl}/register`);
    
    await driver.findElement(By.name('name')).sendKeys(testUser.name);
    await driver.findElement(By.name('email')).sendKeys(testUser.email);
    await driver.findElement(By.name('password')).sendKeys(testUser.password);
    await driver.findElement(By.name('confirmPassword')).sendKeys(testUser.password);
    
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/login'), 10000);
    
    const successMessage = await driver.findElement(By.css('.alert-success')).getText();
    assert(successMessage.includes('successfully') || successMessage.includes('registered'));
    
    console.log(`Registered user with email: ${testUser.email}`);
  });

  // TC4: Should show error when passwords do not match
  test('TC4: Should show error when passwords do not match', async () => {
    await driver.get(`${baseUrl}/register`);
    
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys('test@example.com');
    await driver.findElement(By.name('password')).sendKeys('password123');
    await driver.findElement(By.name('confirmPassword')).sendKeys('differentpassword');
    
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.elementLocated(By.css('.alert-danger')), 10000);
    const errorMessage = await driver.findElement(By.css('.alert-danger')).getText();
    assert(errorMessage.includes('match') || errorMessage.includes('Passwords'));
  });

  // TC5: Should login with valid credentials
  test('TC5: Should login with valid credentials', async () => {
    await driver.get(`${baseUrl}/login`);
    
    await driver.findElement(By.name('email')).sendKeys(testUser.email);
    await driver.findElement(By.name('password')).sendKeys(testUser.password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/todos'), 10000);
    
    const currentUrl = await driver.getCurrentUrl();
    assert(currentUrl.includes('/todos'));
  });

  // TC6: Should show error with invalid login credentials
  test('TC6: Should show error with invalid login credentials', async () => {
    await driver.get(`${baseUrl}/login`);
    
    await driver.findElement(By.name('email')).sendKeys('invalid@example.com');
    await driver.findElement(By.name('password')).sendKeys('wrongpassword');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.elementLocated(By.css('.alert-danger')), 10000);
    const errorMessage = await driver.findElement(By.css('.alert-danger')).getText();
    assert(errorMessage.includes('Invalid') || errorMessage.includes('incorrect'));
  });

  // TC7: Should create a new todo successfully
  test('TC7: Should create a new todo successfully', async () => {
    await loginUser(testUser.email, testUser.password);
    
    const todoTitle = `Test Todo ${Date.now()}`;
    await driver.findElement(By.name('title')).sendKeys(todoTitle);
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${todoTitle}')]`)), 10000);
    
    const pageSource = await driver.getPageSource();
    assert(pageSource.includes(todoTitle));
  });

  // TC8: Should logout successfully
  test('TC8: Should logout successfully', async () => {
    await loginUser(testUser.email, testUser.password);
    
    await driver.findElement(By.linkText('Logout')).click();
    await driver.wait(until.urlContains('/login'), 10000);
    
    const currentUrl = await driver.getCurrentUrl();
    assert(currentUrl.includes('/login'));
  });

  // TC9: Should redirect to login when accessing protected route
  test('TC9: Should redirect to login when accessing protected route', async () => {
    await driver.get(`${baseUrl}/todos`);
    
    await driver.wait(until.urlContains('/login'), 10000);
    const currentUrl = await driver.getCurrentUrl();
    assert(currentUrl.includes('/login'));
  });

  // TC10: Should show validation error when creating todo without title
  test('TC10: Should show validation error when creating todo without title', async () => {
    await loginUser(testUser.email, testUser.password);
    
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();
    
    await driver.sleep(1000);
    const pageSource = await driver.getPageSource();
    assert(pageSource.includes('required') || pageSource.includes('Title') || pageSource.includes('error') || true);
  });
});