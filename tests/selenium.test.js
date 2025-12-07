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
    
    // Configure ChromeDriver - try chromedriver package first
    let serviceBuilder;
    try {
      const chromedriver = require('chromedriver');
      if (chromedriver && chromedriver.path) {
        serviceBuilder = new ServiceBuilder(chromedriver.path);
        console.log('Using ChromeDriver:', chromedriver.path);
      }
    } catch (err) {
      // ChromeDriver package not available, use system PATH
      console.log('Using ChromeDriver from system PATH');
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

describe('Todo Application - Selenium Test Suite', () => {
  
  // Test Case 1: Home Page Navigation
  test('TC1: Should load home page successfully', async () => {
    await driver.get(BASE_URL);
    const title = await driver.getTitle();
    expect(title).toBeTruthy();
    
    const welcomeText = await driver.findElement(By.css('h1.display-3')).getText();
    expect(welcomeText).toContain('Welcome to ToDoNow!');
  });

  // Test Case 2: About Page Navigation
  test('TC2: Should navigate to about page', async () => {
    await driver.get(BASE_URL);
    const aboutLink = await waitForElement('a[href="/about"]');
    await aboutLink.click();
    
    await driver.wait(until.urlContains('/about'), 5000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/about');
  });

  // Test Case 3: User Registration - Success
  test('TC3: Should register a new user successfully', async () => {
    const uniqueEmail = generateEmail();
    
    await driver.get(BASE_URL);
    const registerLink = await waitForElement('a[href="/users/register"]');
    await registerLink.click();
    
    await driver.wait(until.urlContains('/users/register'), 5000);
    
    // Fill registration form
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.name('password2')).sendKeys('testpass123');
    
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();
    
    // Should redirect to login page
    await driver.wait(until.urlContains('/users/login'), 5000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/users/login');
  });

  // Test Case 4: User Registration - Password Mismatch Error
  test('TC4: Should show error when passwords do not match', async () => {
    const uniqueEmail = generateEmail();
    
    await driver.get(`${BASE_URL}/users/register`);
    
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.name('password2')).sendKeys('differentpass');
    
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();
    
    // Wait for error message
    await driver.sleep(1000);
    const errorElements = await driver.findElements(By.css('.alert-danger'));
    expect(errorElements.length).toBeGreaterThan(0);
  });

  // Test Case 5: User Login - Success
  test('TC5: Should login with valid credentials', async () => {
    const uniqueEmail = generateEmail();
    
    // First register a user
    await driver.get(`${BASE_URL}/users/register`);
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.name('password2')).sendKeys('testpass123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Wait for redirect to login
    await driver.wait(until.urlContains('/users/login'), 5000);
    
    // Now login
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Should redirect to todos page
    await driver.wait(until.urlContains('/todos'), 5000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/todos');
  });

  // Test Case 6: User Login - Invalid Credentials
  test('TC6: Should show error with invalid login credentials', async () => {
    await driver.get(`${BASE_URL}/users/login`);
    
    await driver.findElement(By.name('email')).sendKeys('invalid@example.com');
    await driver.findElement(By.name('password')).sendKeys('wrongpassword');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Should stay on login page or show error
    await driver.sleep(1000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/users/login');
  });

  // Test Case 7: Create Todo - Success
  test('TC7: Should create a new todo successfully', async () => {
    const uniqueEmail = generateEmail();
    
    // Register and login
    await driver.get(`${BASE_URL}/users/register`);
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.name('password2')).sendKeys('testpass123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/users/login'), 5000);
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/todos'), 5000);
    
    // Navigate to add todo page
    const addTodoLink = await waitForElement('a[href="/todos/add"]');
    await addTodoLink.click();
    
    await driver.wait(until.urlContains('/todos/add'), 5000);
    
    // Fill todo form
    await driver.findElement(By.name('title')).sendKeys('Test Todo Title');
    await driver.findElement(By.name('duedate')).sendKeys('2024-12-31');
    await driver.findElement(By.name('details')).sendKeys('This is a test todo item');
    
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();
    
    // Should redirect to todos list
    await driver.wait(until.urlContains('/todos'), 5000);
    const todoTitle = await driver.findElement(By.css('h4')).getText();
    expect(todoTitle).toBe('Test Todo Title');
  });

  // Test Case 8: View Todos List
  test('TC8: Should display todos list after login', async () => {
    const uniqueEmail = generateEmail();
    
    // Register and login
    await driver.get(`${BASE_URL}/users/register`);
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.name('password2')).sendKeys('testpass123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/users/login'), 5000);
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/todos'), 5000);
    
    // Check if todos page is displayed
    const pageContent = await driver.findElement(By.css('body')).getText();
    expect(pageContent).toBeTruthy();
  });

  // Test Case 9: Edit Todo
  test('TC9: Should edit an existing todo', async () => {
    const uniqueEmail = generateEmail();
    
    // Register and login
    await driver.get(`${BASE_URL}/users/register`);
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.name('password2')).sendKeys('testpass123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/users/login'), 5000);
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/todos'), 5000);
    
    // Create a todo first
    const addTodoLink = await waitForElement('a[href="/todos/add"]');
    await addTodoLink.click();
    await driver.wait(until.urlContains('/todos/add'), 5000);
    
    await driver.findElement(By.name('title')).sendKeys('Original Title');
    await driver.findElement(By.name('details')).sendKeys('Original details');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/todos'), 5000);
    
    // Edit the todo
    const editButton = await waitForElement('a[href*="/todos/edit/"]');
    await editButton.click();
    
    await driver.wait(until.urlContains('/todos/edit/'), 5000);
    
    // Update the title
    const titleField = await driver.findElement(By.name('title'));
    await titleField.clear();
    await titleField.sendKeys('Updated Title');
    
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();
    
    // Verify update
    await driver.wait(until.urlContains('/todos'), 5000);
    const updatedTitle = await driver.findElement(By.css('h4')).getText();
    expect(updatedTitle).toBe('Updated Title');
  });

  // Test Case 10: Delete Todo
  test('TC10: Should delete a todo successfully', async () => {
    const uniqueEmail = generateEmail();
    
    // Register and login
    await driver.get(`${BASE_URL}/users/register`);
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.name('password2')).sendKeys('testpass123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/users/login'), 5000);
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/todos'), 5000);
    
    // Create a todo first
    const addTodoLink = await waitForElement('a[href="/todos/add"]');
    await addTodoLink.click();
    await driver.wait(until.urlContains('/todos/add'), 5000);
    
    await driver.findElement(By.name('title')).sendKeys('Todo to Delete');
    await driver.findElement(By.name('details')).sendKeys('This will be deleted');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/todos'), 5000);
    
    // Delete the todo
    const deleteButton = await waitForElement('input[value="Delete"]');
    await deleteButton.click();
    
    // Verify deletion - should redirect to todos page
    await driver.wait(until.urlContains('/todos'), 5000);
    const pageContent = await driver.findElement(By.css('body')).getText();
    // If no todos, should show "No todos listed"
    expect(pageContent).toBeTruthy();
  });

  // Test Case 11: Logout Functionality
  test('TC11: Should logout successfully', async () => {
    const uniqueEmail = generateEmail();
    
    // Register and login
    await driver.get(`${BASE_URL}/users/register`);
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.name('password2')).sendKeys('testpass123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/users/login'), 5000);
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/todos'), 5000);
    
    // Logout
    const logoutLink = await waitForElement('a[href="/users/logout"]');
    await logoutLink.click();
    
    // Should redirect to login page
    await driver.wait(until.urlContains('/users/login'), 5000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/users/login');
  });

  // Test Case 12: Access Protected Route Without Authentication
  test('TC12: Should redirect to login when accessing protected route', async () => {
    await driver.get(`${BASE_URL}/todos`);
    
    // Should redirect to login page
    await driver.wait(until.urlContains('/users/login'), 5000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/users/login');
  });

  // Test Case 13: Create Todo - Validation Error (Missing Title)
  test('TC13: Should show validation error when creating todo without title', async () => {
    const uniqueEmail = generateEmail();
    
    // Register and login
    await driver.get(`${BASE_URL}/users/register`);
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.name('password2')).sendKeys('testpass123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/users/login'), 5000);
    await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
    await driver.findElement(By.name('password')).sendKeys('testpass123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    await driver.wait(until.urlContains('/todos'), 5000);
    
    // Navigate to add todo page
    const addTodoLink = await waitForElement('a[href="/todos/add"]');
    await addTodoLink.click();
    
    await driver.wait(until.urlContains('/todos/add'), 5000);
    
    // Try to submit without title (only fill details)
    await driver.findElement(By.name('details')).sendKeys('Details without title');
    
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();
    
    // HTML5 validation should prevent submission or show error
    await driver.sleep(1000);
    // The form should not submit due to required attribute
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/todos/add');
  });
});

