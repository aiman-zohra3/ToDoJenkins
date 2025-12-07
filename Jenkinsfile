pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'todo-node-chrome'
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

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image with Node.js + Chrome + ChromeDriver..."
                sh "docker build -t ${DOCKER_IMAGE}:latest ."
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
                        docker run -d \
                            --name ${APP_CONTAINER} \
                            -p ${APP_PORT}:${APP_PORT} \
                            ${DOCKER_IMAGE}:latest
                        
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
                        # Run tests in a new container using the same image
                        # The tests will connect to the application running in the other container
                        docker run --rm \
                            --name ${TEST_CONTAINER} \
                            --network host \
                            -e TEST_BASE_URL=http://localhost:${APP_PORT} \
                            ${DOCKER_IMAGE}:latest \
                            npm run test:selenium
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

