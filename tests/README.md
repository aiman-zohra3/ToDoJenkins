# Selenium Test Suite

This directory contains automated Selenium test cases for the Todo Application.

## Overview

The test suite includes **13 comprehensive test cases** covering:
- Home page and navigation
- User registration (success and error cases)
- User login (success and error cases)
- Todo CRUD operations (Create, Read, Update, Delete)
- Logout functionality
- Protected route access
- Form validation

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** running locally or accessible
3. **Chrome browser** installed
4. **ChromeDriver** (automatically installed via npm)

## Installation

Install dependencies:

```bash
npm install
```

## Configuration

The test configuration is in `tests/selenium.config.js`. You can modify:
- `BASE_URL`: Default is `http://localhost:5000`
- `CHROME_OPTIONS`: Headless Chrome configuration

To change the base URL, set the environment variable:
```bash
export TEST_BASE_URL=http://your-server:5000
```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run only Selenium tests:
```bash
npm run test:selenium
```

### Run with custom base URL:
```bash
TEST_BASE_URL=http://localhost:5000 npm run test:selenium
```

## Test Cases

1. **TC1**: Home Page Navigation - Verifies home page loads correctly
2. **TC2**: About Page Navigation - Tests navigation to about page
3. **TC3**: User Registration Success - Tests successful user registration
4. **TC4**: Registration Password Mismatch - Tests password validation
5. **TC5**: User Login Success - Tests successful login
6. **TC6**: Invalid Login Credentials - Tests login error handling
7. **TC7**: Create Todo Success - Tests todo creation
8. **TC8**: View Todos List - Tests todos list display
9. **TC9**: Edit Todo - Tests todo editing functionality
10. **TC10**: Delete Todo - Tests todo deletion
11. **TC11**: Logout Functionality - Tests user logout
12. **TC12**: Protected Route Access - Tests authentication requirement
13. **TC13**: Todo Validation Error - Tests form validation

## Headless Chrome

All tests run in **headless Chrome mode** by default, making them suitable for:
- CI/CD pipelines (Jenkins, GitHub Actions, etc.)
- AWS EC2 instances
- Docker containers
- Any environment without a display

## Jenkins Integration

To integrate with Jenkins pipeline:

1. Ensure the application is running before tests:
   ```groovy
   stage('Start Application') {
     sh 'npm start &'
     sh 'sleep 10' // Wait for app to start
   }
   ```

2. Run tests:
   ```groovy
   stage('Selenium Tests') {
     sh 'npm run test:selenium'
   }
   ```

3. Make sure Chrome and ChromeDriver are installed on the Jenkins agent:
   ```groovy
   sh 'google-chrome --version'
   sh 'chromedriver --version'
   ```

## Troubleshooting

### ChromeDriver Issues
If ChromeDriver is not found, install it:
```bash
npm install chromedriver --save-dev
```

### Timeout Issues
Increase timeout in `jest.config.js`:
```javascript
testTimeout: 120000 // 2 minutes
```

### Connection Issues
Ensure the application is running before executing tests:
```bash
npm start
# In another terminal
npm run test:selenium
```

## Notes

- Each test uses unique email addresses to avoid conflicts
- Tests are independent and can run in any order
- Headless mode is configured for CI/CD environments
- Implicit waits are set to handle dynamic content loading


