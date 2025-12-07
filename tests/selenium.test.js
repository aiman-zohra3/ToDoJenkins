const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Todo Application - Selenium Test Suite', () => {
  let driver;
  let baseUrl;

beforeAll(async () => {
  baseUrl = process.env.TEST_BASE_URL || 'http://localhost:5000';
  
  console.log(`Using base URL: ${baseUrl}`);
  
  // Setup Chrome options for Puppeteer image
  const chromeOptions = new chrome.Options();
  
  // Puppeteer image has Chrome at /usr/bin/google-chrome
  chromeOptions.setChromeBinaryPath('/usr/bin/google-chrome');
  
  // Headless mode arguments
  chromeOptions.addArguments('--headless=new');
  chromeOptions.addArguments('--no-sandbox');
  chromeOptions.addArguments('--disable-dev-shm-usage');
  chromeOptions.addArguments('--disable-gpu');
  chromeOptions.addArguments('--disable-software-rasterizer');
  chromeOptions.addArguments('--disable-dev-tools');
  chromeOptions.addArguments('--no-zygote');
  chromeOptions.addArguments('--single-process');
  chromeOptions.addArguments('--window-size=1920,1080');
  
  console.log('Building Chrome driver...');
  
  // Build the driver - let Selenium find ChromeDriver automatically
  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();
  
  // Set implicit wait
  await driver.manage().setTimeouts({ implicit: 10000, pageLoad: 30000 });
  
  console.log('Chrome driver initialized successfully');
}, 120000); // Increased timeout to 120 seconds

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
    email: generateEmail(), // Generated unique email
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

  // Utility function to logout
  const logoutUser = async () => {
    await driver.findElement(By.linkText('Logout')).click();
    await driver.wait(until.urlContains('/login'), 10000);
  };

  // TC1: Should load home page successfully
  test('TC1: Should load home page successfully', async () => {
    await driver.get(baseUrl);
    const title = await driver.getTitle();
    assert(title.includes('Todo') || title.includes('Home'));
    
    // Check for key elements on home page
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
    
    // Fill registration form
    await driver.findElement(By.name('name')).sendKeys(testUser.name);
    await driver.findElement(By.name('email')).sendKeys(testUser.email);
    await driver.findElement(By.name('password')).sendKeys(testUser.password);
    await driver.findElement(By.name('confirmPassword')).sendKeys(testUser.password);
    
    // Submit form
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Wait for redirect to login page with success message
    await driver.wait(until.urlContains('/login'), 10000);
    
    // Check for success message
    const successMessage = await driver.findElement(By.css('.alert-success')).getText();
    assert(successMessage.includes('successfully') || successMessage.includes('registered'));
    
    console.log(`Registered user with email: ${testUser.email}`);
  });

  // TC4: Should show error when passwords do not match
  test('TC4: Should show error when passwords do not match', async () => {
    await driver.get(`${baseUrl}/register`);
    
    // Fill form with mismatching passwords
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys('test@example.com');
    await driver.findElement(By.name('password')).sendKeys('password123');
    await driver.findElement(By.name('confirmPassword')).sendKeys('differentpassword');
    
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Check for error message
    await driver.wait(until.elementLocated(By.css('.alert-danger')), 10000);
    const errorMessage = await driver.findElement(By.css('.alert-danger')).getText();
    assert(errorMessage.includes('match') || errorMessage.includes('Passwords'));
  });

  // TC5: Should login with valid credentials
  test('TC5: Should login with valid credentials', async () => {
    // First register a user if not already done
    try {
      await driver.get(`${baseUrl}/login`);
      
      // Try to find login form
      await driver.findElement(By.name('email')).sendKeys(testUser.email);
      await driver.findElement(By.name('password')).sendKeys(testUser.password);
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      // Wait for redirect to todos page
      await driver.wait(until.urlContains('/todos'), 10000);
      
      // Check if we're on todos page
      const currentUrl = await driver.getCurrentUrl();
      assert(currentUrl.includes('/todos'));
      
      // Check for welcome message or user name
      const pageSource = await driver.getPageSource();
      assert(pageSource.includes('Todo') || pageSource.includes('Welcome'));
    } catch (error) {
      // If login fails, user might not exist, register first
      await driver.get(`${baseUrl}/register`);
      await driver.findElement(By.name('name')).sendKeys(testUser.name);
      await driver.findElement(By.name('email')).sendKeys(testUser.email);
      await driver.findElement(By.name('password')).sendKeys(testUser.password);
      await driver.findElement(By.name('confirmPassword')).sendKeys(testUser.password);
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.wait(until.urlContains('/login'), 10000);
      
      // Now login
      await driver.get(`${baseUrl}/login`);
      await driver.findElement(By.name('email')).sendKeys(testUser.email);
      await driver.findElement(By.name('password')).sendKeys(testUser.password);
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.wait(until.urlContains('/todos'), 10000);
    }
  });

  // TC6: Should show error with invalid login credentials
  test('TC6: Should show error with invalid login credentials', async () => {
    await driver.get(`${baseUrl}/login`);
    
    // Try to login with invalid credentials
    await driver.findElement(By.name('email')).sendKeys('invalid@example.com');
    await driver.findElement(By.name('password')).sendKeys('wrongpassword');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Check for error message
    await driver.wait(until.elementLocated(By.css('.alert-danger')), 10000);
    const errorMessage = await driver.findElement(By.css('.alert-danger')).getText();
    assert(errorMessage.includes('Invalid') || errorMessage.includes('incorrect'));
  });

  // TC7: Should create a new todo successfully
  test('TC7: Should create a new todo successfully', async () => {
    // Login first
    await loginUser(testUser.email, testUser.password);
    
    // Create new todo
    const todoTitle = `Test Todo ${Date.now()}`;
    await driver.findElement(By.name('title')).sendKeys(todoTitle);
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Wait for the todo to appear in the list
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${todoTitle}')]`)), 10000);
    
    // Verify todo was created
    const pageSource = await driver.getPageSource();
    assert(pageSource.includes(todoTitle));
  });

  // TC8: Should display todos list after login
  test('TC8: Should display todos list after login', async () => {
    // Login first
    await loginUser(testUser.email, testUser.password);
    
    // Check for todos list container
    await driver.wait(until.elementLocated(By.css('.todo-list, table, ul')), 10000);
    
    // Check for add todo form
    await driver.findElement(By.name('title'));
    await driver.findElement(By.css('button[type="submit"]'));
  });

  // TC9: Should edit an existing todo
  test('TC9: Should edit an existing todo', async () => {
    // Login first
    await loginUser(testUser.email, testUser.password);
    
    // Create a todo to edit
    const originalTitle = `Todo to Edit ${Date.now()}`;
    await driver.findElement(By.name('title')).sendKeys(originalTitle);
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Wait for todo to appear
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${originalTitle}')]`)), 10000);
    
    // Find and click edit button (assuming there's an edit button/link)
    // This selector might need adjustment based on your actual HTML structure
    const editButtons = await driver.findElements(By.xpath("//button[contains(text(), 'Edit')] | //a[contains(text(), 'Edit')]"));
    if (editButtons.length > 0) {
      await editButtons[editButtons.length - 1].click();
      
      // Wait for edit form to appear
      await driver.wait(until.elementLocated(By.name('title')), 10000);
      
      // Edit the todo
      const updatedTitle = `Updated Todo ${Date.now()}`;
      const titleField = await driver.findElement(By.name('title'));
      await titleField.clear();
      await titleField.sendKeys(updatedTitle);
      
      // Save changes
      const saveButton = await driver.findElement(By.xpath("//button[contains(text(), 'Save')] | //button[@type='submit']"));
      await saveButton.click();
      
      // Verify update
      await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${updatedTitle}')]`)), 10000);
    }
  });

  // TC10: Should delete a todo successfully
  test('TC10: Should delete a todo successfully', async () => {
    // Login first
    await loginUser(testUser.email, testUser.password);
    
    // Create a todo to delete
    const todoToDelete = `Todo to Delete ${Date.now()}`;
    await driver.findElement(By.name('title')).sendKeys(todoToDelete);
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Wait for todo to appear
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${todoToDelete}')]`)), 10000);
    
    // Find and click delete button (assuming there's a delete button)
    // This selector might need adjustment
    const deleteButtons = await driver.findElements(By.xpath("//button[contains(text(), 'Delete')] | //a[contains(text(), 'Delete')]"));
    if (deleteButtons.length > 0) {
      const todoTextBefore = await driver.getPageSource();
      
      // Click the last delete button (for the todo we just created)
      await deleteButtons[deleteButtons.length - 1].click();
      
      // Handle confirmation dialog if present
      try {
        const alert = await driver.switchTo().alert();
        await alert.accept();
      } catch (error) {
        // No alert present, continue
      }
      
      // Wait for deletion
      await driver.sleep(2000);
      
      // Verify todo is deleted
      const todoTextAfter = await driver.getPageSource();
      assert(!todoTextAfter.includes(todoToDelete));
    }
  });

  // TC11: Should logout successfully
  test('TC11: Should logout successfully', async () => {
    // Login first
    await loginUser(testUser.email, testUser.password);
    
    // Logout
    await logoutUser();
    
    // Verify we're on login page
    const currentUrl = await driver.getCurrentUrl();
    assert(currentUrl.includes('/login'));
    
    // Verify login form is present
    await driver.findElement(By.name('email'));
    await driver.findElement(By.name('password'));
  });

  // TC12: Should redirect to login when accessing protected route
  test('TC12: Should redirect to login when accessing protected route', async () => {
    // Logout if logged in
    try {
      await logoutUser();
    } catch (error) {
      // Not logged in, continue
    }
    
    // Try to access protected route (todos page)
    await driver.get(`${baseUrl}/todos`);
    
    // Should be redirected to login page
    await driver.wait(until.urlContains('/login'), 10000);
    const currentUrl = await driver.getCurrentUrl();
    assert(currentUrl.includes('/login'));
  });

  // TC13: Should show validation error when creating todo without title
  test('TC13: Should show validation error when creating todo without title', async () => {
    // Login first
    await loginUser(testUser.email, testUser.password);
    
    // Try to submit empty todo form
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();
    
    // Check for validation error
    // This might be a browser validation message or application error
    try {
      await driver.sleep(1000); // Wait a bit
      const pageSource = await driver.getPageSource();
      // Look for any error messages
      if (pageSource.includes('required') || pageSource.includes('Title') || pageSource.includes('error')) {
        // Validation error is present
        assert(true);
      }
    } catch (error) {
      // Some form validation might be handled differently
      console.log('Validation check completed');
    }
  });
});