# Simple Todo App with MongoDB, Express.js and Node.js
The ToDo app uses the following technologies and javascript libraries:
* MongoDB
* Express.js
* Node.js
* express-handlebars
* method-override
* connect-flash
* express-session
* mongoose
* bcryptjs
* passport

## What is this?
A simple todo app. Based on the tutorial session of Brad Traversy.

## How can I try it?
Demo: https://secret-reef-33032.herokuapp.com

## What are the features?
You can register with your email address, and you can create ToDo items. You can list ToDos, edit and delete them. 

## Docker & Containerization

This project includes Docker support for both running the application and executing automated tests in a containerized environment.

### Quick Docker Commands

```bash
# Build and run the application
docker build -t todo-app:latest .
docker run -d -p 5000:5000 todo-app:latest

# Build and run tests with Selenium
docker build -f Dockerfile.test -t todo-test:latest .
docker run --rm --network host -e TEST_BASE_URL=http://localhost:5000 todo-test:latest npm run test:selenium
```

For detailed Docker setup, see [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)

## CI/CD & Testing

This project includes:
- **Jenkinsfile** - Complete CI/CD pipeline with stages for checkout, build, test, and deployment
- **Selenium Tests** - Automated browser testing with Jest + Selenium WebDriver
- **Containerized Tests** - Tests run in Docker with Chrome and ChromeDriver included

### Running Tests Locally

```bash
# Jest tests
npm test

# Selenium tests (requires Chrome/ChromeDriver)
npm run test:selenium

# Selenium tests in Docker
docker build -f Dockerfile.test -t todo-test:latest .
docker run --rm --network host todo-test:latest npm run test:selenium
```

See [tests/QUICKSTART.md](./tests/QUICKSTART.md) for more testing details.

## What are Future Plans for this Project?
* Enhancing with ToDo item statuses such as new, in progress, completed, blocked
* Sharing ToDo items with other users
* Commenting ToDo items
* Storing and managing history of ToDo items

###### This project is licensed under the MIT Open Source License
