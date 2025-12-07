# Docker Setup Guide for Todo Jenkins App

This guide explains how to build and run the Todo Jenkins application using Docker, including running Selenium tests in a containerized environment.

## Quick Start

### Build and Run the Application

```powershell
# Build the production image
docker build -t todo-app:latest .

# Run the application (port 5000)
docker run -d --name todo-app -p 5000:5000 todo-app:latest

# Check logs
docker logs -f todo-app

# Stop the application
docker stop todo-app
docker rm todo-app
```

### Build and Run Tests

```powershell
# Build the test image (includes dev dependencies and Chrome)
docker build -f Dockerfile.test -t todo-test:latest .

# Run Selenium tests
docker run --rm \
  --name todo-test \
  --network host \
  -e TEST_BASE_URL=http://localhost:5000 \
  -e CHROME_BIN=/usr/bin/chromium-browser \
  -e CHROMEDRIVER_PATH=/usr/bin/chromedriver \
  todo-test:latest \
  npm run test:selenium

# Or run all Jest tests
docker run --rm \
  -e CHROME_BIN=/usr/bin/chromium-browser \
  -e CHROMEDRIVER_PATH=/usr/bin/chromedriver \
  todo-test:latest \
  npm test
```

## Docker Images

### Dockerfile (Production)
- **Base Image:** `node:18-alpine`
- **Includes:**
  - Node.js 18
  - Chromium browser
  - ChromeDriver for Selenium tests
  - Production npm dependencies
- **Exposed Port:** 5000
- **Environment Variables:**
  - `NODE_ENV`: production
  - `CHROME_BIN`: /usr/bin/chromium-browser
  - `CHROMEDRIVER_PATH`: /usr/bin/chromedriver

### Dockerfile.test (Testing)
- **Base Image:** `node:18-alpine`
- **Includes:**
  - Node.js 18
  - Chromium browser
  - ChromeDriver
  - Both production and development dependencies (Jest, Selenium)
- **Default Command:** `npm run test:selenium`
- **Environment Variables:**
  - `NODE_ENV`: test
  - `CHROME_BIN`: /usr/bin/chromium-browser
  - `CHROMEDRIVER_PATH`: /usr/bin/chromedriver

## Jenkins Pipeline Integration

The `Jenkinsfile` includes the following stages:

1. **Checkout** - Clones the repository from GitHub
2. **Pull Docker Image** - Pulls the base Puppeteer Docker image
3. **Install Dependencies** - Installs npm dependencies in container
4. **Start Application** - Runs the Todo app in a Docker container
5. **Build Test Image** - Builds the custom test Docker image with Chrome/ChromeDriver
6. **Run Tests** - Executes Selenium tests in the test container
7. **Cleanup** - Stops and removes all Docker containers

## Advanced Usage

### Mount Local Directory for Development

```powershell
# Run app with hot-reload (mount current directory)
docker run -it \
  --name todo-app-dev \
  -p 5000:5000 \
  -v ${PWD}:/usr/src/app \
  -w /usr/src/app \
  todo-app:latest \
  npm start
```

### Docker Compose (Optional)

For running both app and database together, create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://mongo:27017/todo
    depends_on:
      - mongo

  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  test:
    build:
      context: .
      dockerfile: Dockerfile.test
    environment:
      TEST_BASE_URL: http://app:5000
      CHROME_BIN: /usr/bin/chromium-browser
      CHROMEDRIVER_PATH: /usr/bin/chromedriver
    depends_on:
      - app
    command: npm run test:selenium

volumes:
  mongo_data:
```

Then run with:
```powershell
docker-compose up
docker-compose exec test npm run test:selenium
docker-compose down
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | production/test | Node.js environment |
| `TEST_BASE_URL` | http://localhost:5000 | Base URL for Selenium tests |
| `CHROME_BIN` | /usr/bin/chromium-browser | Chrome executable path |
| `CHROMEDRIVER_PATH` | /usr/bin/chromedriver | ChromeDriver executable path |
| `APP_PORT` | 5000 | Port for Express app |

## Troubleshooting

### Chrome/ChromeDriver Issues in Container

If you encounter Chrome or ChromeDriver issues:

1. Ensure Dockerfile.test is using Alpine Linux-based image (chromium available in apk)
2. Add `--no-sandbox` flag to Chrome options (already in selenium.config.js)
3. Mount `/dev/shm` for shared memory:
   ```powershell
   docker run --rm --shm-size=1gb todo-test:latest npm run test:selenium
   ```

### Network Issues

For tests to reach the app container:
- Use `--network host` to share the host network
- Or use `--link app-container:localhost` if using custom networks

### Permission Issues

If permission errors occur:
- Run with `--user root` or adjust user in Dockerfile
- Set proper volume mount permissions

## Building for Different Platforms

```powershell
# For multi-platform (ARM64, AMD64)
docker buildx build --platform linux/amd64,linux/arm64 -t todo-app:latest .
docker buildx build --platform linux/amd64,linux/arm64 -f Dockerfile.test -t todo-test:latest .
```

## CI/CD with Jenkins

The Jenkinsfile automates the entire process:

```groovy
// Triggered by webhook or schedule
// Checks out code → Builds test image → Runs tests → Reports results
```

To use in Jenkins:
1. Create a new Pipeline job
2. Point to this repository
3. Set the Jenkinsfile path: `Jenkinsfile`
4. Enable GitHub webhook triggers
5. Run the job

## Security Considerations

- Use `.dockerignore` to exclude sensitive files
- Store sensitive environment variables in Jenkins secrets, not in Dockerfile
- Use minimal base images (alpine) to reduce attack surface
- Keep Node.js and system packages updated regularly
- Don't run as root in production (adjust USER instruction if needed)

## Performance Tips

- Use `.dockerignore` to reduce build context size
- Alpine images are smaller and faster to build than full distributions
- Multi-stage builds can reduce final image size
- Mount volumes only when needed for development
