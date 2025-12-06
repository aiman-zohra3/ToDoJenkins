# Quick Start Guide - Selenium Tests

## Prerequisites Check

Before running tests, ensure:

1. **Application is running:**
   ```bash
   npm start
   ```
   The app should be accessible at `http://localhost:5000`

2. **MongoDB is running:**
   ```bash
   # Check MongoDB status
   mongosh
   # Or if using systemd:
   sudo systemctl status mongod
   ```

3. **Chrome is installed:**
   ```bash
   google-chrome --version
   ```

## Quick Test Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the application** (in one terminal):
   ```bash
   npm start
   ```

3. **Run tests** (in another terminal):
   ```bash
   npm run test:selenium
   ```

## Test Coverage

The test suite includes **13 test cases**:

✅ **Navigation Tests (2)**
- Home page loading
- About page navigation

✅ **Authentication Tests (5)**
- User registration (success)
- User registration (password mismatch error)
- User login (success)
- User login (invalid credentials)
- Logout functionality

✅ **Todo CRUD Tests (5)**
- Create todo (success)
- View todos list
- Edit todo
- Delete todo
- Form validation (missing title)

✅ **Security Tests (1)**
- Protected route access (redirect to login)

## Expected Output

When tests run successfully, you should see:
```
PASS  tests/selenium.test.js
  Todo Application - Selenium Test Suite
    ✓ TC1: Should load home page successfully (XXXX ms)
    ✓ TC2: Should navigate to about page (XXXX ms)
    ✓ TC3: Should register a new user successfully (XXXX ms)
    ...
    
Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
```

## Troubleshooting

### "ChromeDriver not found"
```bash
npm install chromedriver --save-dev
```

### "Connection refused" or "ECONNREFUSED"
- Ensure the application is running: `npm start`
- Check the port: `curl http://localhost:5000`

### "Element not found" errors
- Increase wait times in test file
- Check if the application UI has changed
- Verify selectors match the current HTML structure

### Tests timeout
- Increase timeout in `jest.config.js`
- Check application performance
- Verify MongoDB connection

## Running in CI/CD

For Jenkins or other CI/CD systems:

1. Set environment variable:
   ```bash
   export TEST_BASE_URL=http://your-server:5000
   ```

2. Ensure headless Chrome works:
   ```bash
   google-chrome --headless --disable-gpu --version
   ```

3. Run tests:
   ```bash
   npm run test:selenium
   ```

## Notes

- All tests use **headless Chrome** (no GUI required)
- Each test uses **unique email addresses** to avoid conflicts
- Tests are **independent** and can run in any order
- Default timeout is **60 seconds** per test


