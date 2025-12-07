pipeline {
    agent any

    environment {
        # Using pre-built Docker image with Node.js + Chrome + ChromeDriver
        # Alternative: Use node:18 and install Chrome at runtime, or use custom Dockerfile
        # For simplicity, we'll use node:18 and install Chrome via script
        # Or you can use: ghcr.io/puppeteer/puppeteer:latest (has Node + Chrome)
        DOCKER_IMAGE = 'ghcr.io/puppeteer/puppeteer:latest'
        APP_CONTAINER = 'todo-app-container'
        TEST_CONTAINER = 'todo-test-container'
        APP_PORT = '5000'
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Cloning repository from GitHub..."
                git branch: 'main', url: 'https://github.com/aiman-zohra3/ToDoJenkins.git'
            }
        }

        stage('Pull Docker Image') {
            steps {
                echo "Pulling pre-built Docker image with Node.js + Chrome + ChromeDriver..."
                echo "Using: ${DOCKER_IMAGE}"
                sh "docker pull ${DOCKER_IMAGE} || echo 'Image pull failed, will use local image'"
            }
        }

        stage('Start Application Container') {
            steps {
                script {
                    echo "Starting application in Docker container..."
                    sh """
                        # Stop and remove existing container if it exists
                        docker stop ${APP_CONTAINER} || true
                        docker rm ${APP_CONTAINER} || true
                        
                        # Start the application container in background
                        # Mount the code and install dependencies, then start the app
                        docker run -d \
                            --name ${APP_CONTAINER} \
                            -p ${APP_PORT}:${APP_PORT} \
                            -v \$(pwd):/app \
                            -w /app \
                            ${DOCKER_IMAGE} \
                            sh -c "npm install && npm start"
                        
                        # Wait for application to be ready
                        echo "Waiting for application to start..."
                        sleep 15
                        
                        # Check if application is running
                        timeout 60 bash -c 'until curl -f http://localhost:${APP_PORT} || docker logs ${APP_CONTAINER} 2>&1 | grep -q "listening on port"; do sleep 2; done' || true
                        sleep 5
                    """
                }
            }
        }

        stage('Run Selenium Tests') {
            steps {
                script {
                    echo "Running Selenium tests in containerized environment..."
                    sh """
                        # Run tests in a new container using the same pre-built image
                        # The tests will connect to the application running in the other container
                        docker run --rm \
                            --name ${TEST_CONTAINER} \
                            --network host \
                            -v \$(pwd):/app \
                            -w /app \
                            -e TEST_BASE_URL=http://localhost:${APP_PORT} \
                            ${DOCKER_IMAGE} \
                            sh -c "npm install && npm run test:selenium"
                    """
                }
            }
            post {
                always {
                    echo "Test stage completed"
                }
                success {
                    echo "All Selenium tests passed!"
                }
                failure {
                    echo "Selenium tests failed!"
                }
            }
        }

        stage('Stop Application Container') {
            steps {
                script {
                    echo "Stopping application container..."
                    sh """
                        docker stop ${APP_CONTAINER} || true
                        docker rm ${APP_CONTAINER} || true
                    """
                }
            }
        }
    }

    post {
        always {
            script {
                echo "Cleaning up Docker resources..."
                sh """
                    docker stop ${APP_CONTAINER} ${TEST_CONTAINER} || true
                    docker rm ${APP_CONTAINER} ${TEST_CONTAINER} || true
                """
            }
        }
        success {
            echo "Pipeline succeeded! All tests passed."
        }
        failure {
            echo "Pipeline failed! Check logs for details."
        }
    }
}

