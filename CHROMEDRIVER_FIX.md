# ChromeDriver Installation Fix

## Problem
Disk space is full - cannot download ChromeDriver automatically.

## Solutions

### Option 1: Free Up Disk Space (Recommended)
1. Clean temporary files:
   ```powershell
   # Clean npm cache
   npm cache clean --force
   
   # Clean Windows temp files
   Remove-Item -Path $env:TEMP\* -Recurse -Force -ErrorAction SilentlyContinue
   ```

2. Check disk space:
   ```powershell
   Get-PSDrive C
   ```

3. Free up space by:
   - Uninstalling unused programs
   - Deleting old downloads
   - Running Disk Cleanup

### Option 2: Manual ChromeDriver Installation

1. **Download ChromeDriver manually:**
   - Visit: https://googlechromelabs.github.io/chrome-for-testing/
   - Download ChromeDriver matching your Chrome version (142)
   - Extract the ZIP file

2. **Add to PATH or specify path:**
   - Option A: Add ChromeDriver to system PATH
   - Option B: Update `tests/selenium.test.js` to specify the path:
     ```javascript
     builder.setChromeService(new ServiceBuilder('C:\\path\\to\\chromedriver.exe'));
     ```

### Option 3: Use WebDriver Manager (Alternative)

Install webdriver-manager which handles versions automatically:
```powershell
npm install webdriver-manager --save-dev
```

Then update your test file to use it.

### Option 4: Use Existing ChromeDriver

If you have ChromeDriver installed elsewhere:
1. Find the path: `where chromedriver` (in PowerShell)
2. Update the test file to use that path

## Quick Fix

After freeing space, run:
```powershell
npm install chromedriver@latest --save-dev
```

Then run tests:
```powershell
npm run test:selenium
```

