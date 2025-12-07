
pipeline {
    agent any

    environment {
        APP_IMAGE = 'todo-app:latest'
        TEST_IMAGE = 'todo-test:latest'
        APP_CONTAINER = 'todo-app-container'
        TEST_CONTAINER = 'todo-test-container'
        APP_PORT = '5000'
    }

    stages {
        stage('Cleanup Old Containers') {
            steps {
                script {
                    echo "Cleaning up existing containers..."
                    sh """
                        docker stop ${APP_CONTAINER} ${TEST_CONTAINER} 2>/dev/null || true
                        docker rm -f ${APP_CONTAINER} ${TEST_CONTAINER} 2>/dev/null || true
                    """
                }
            }
        }

        stage('Checkout') {
            steps {
                echo "Cloning repository from GitHub..."
                git branch: 'main', url: 'https://github.com/aiman-zohra3/ToDoJenkins.git'
            }
        }

        stage('Build Test Image') {
            steps {
                script {
                    echo "Building Docker image for tests..."
                    sh """
                        docker build -f Dockerfile.test -t ${TEST_IMAGE} .
                    """
                }
            }
        }

        stage('Start Application') {
            steps {
                script {
                    echo "Starting application container..."
                    sh """
                        docker run -d \
                            --name ${APP_CONTAINER} \
                            --network host \
                            -v \$(pwd):/usr/src/app \
                            -w /usr/src/app \
                            ${TEST_IMAGE} \
                            npm start
                        
                        echo "Waiting for application to start..."
                        sleep 15
                        
                        echo "Checking if application is running..."
                        curl -f http://localhost:${APP_PORT} || echo "App may still be starting..."
                    """
                }
            }
        }

        stage('Run Selenium Tests') {
            steps {
                script {
                    echo "Running Selenium tests..."
                    sh """
                        docker run --rm \
                            --name ${TEST_CONTAINER} \
                            --network host \
                            -v \$(pwd):/usr/src/app \
                            -w /usr/src/app \
                            -e TEST_BASE_URL=http://localhost:${APP_PORT} \
                            -e CHROME_BIN=/usr/bin/chromium-browser \
                            -e CHROMEDRIVER_PATH=/usr/bin/chromedriver \
                            ${TEST_IMAGE} \
                            npm run test:selenium
                    """
                }
            }
        }

        stage('Cleanup') {
            steps {
                script {
                    echo "Stopping application container..."
                    sh """
                        docker stop ${APP_CONTAINER} || true
                        docker rm -f ${APP_CONTAINER} || true
                    """
                }
            }
        }
    }

    post {
        always {
            script {
                echo "Final cleanup..."
                sh """
                    docker stop ${APP_CONTAINER} ${TEST_CONTAINER} 2>/dev/null || true
                    docker rm -f ${APP_CONTAINER} ${TEST_CONTAINER} 2>/dev/null || true
                """
            }
        }
        success {
            echo "✓ Pipeline succeeded! All tests passed."
        }
        failure {
            echo "✗ Pipeline failed! Check logs for details."
        }
    }
}