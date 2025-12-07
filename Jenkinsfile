pipeline {
    agent any

    environment {
        REGISTRY = 'ghcr.io'
        REPO_URL = 'https://github.com/aiman-zohra3/ToDoJenkins.git'
        DOCKER_IMAGE = 'ghcr.io/puppeteer/puppeteer:latest'
        APP_CONTAINER = 'todo-app-container'
        TEST_CONTAINER = 'todo-test-container'
        APP_PORT = '5000'
        TEST_TIMEOUT = '60000'
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Cloning repository from GitHub..."
                git branch: 'main', url: "${REPO_URL}"
            }
        }

        stage('Pull Docker Image') {
            steps {
                echo "Pulling Docker image..."
                sh "docker pull ${DOCKER_IMAGE} || echo 'Using local image'"
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo "Installing npm dependencies..."
                    sh """
                        docker run --rm \
                            --user root \
                            -v \$(pwd):/app \
                            -w /app \
                            ${DOCKER_IMAGE} \
                            npm install --unsafe-perm
                    """
                }
            }
        }

        stage('Start Application') {
            steps {
                script {
                    echo "Starting application..."
                    sh """
                        docker stop ${APP_CONTAINER} || true
                        docker rm ${APP_CONTAINER} || true
                        
                        docker run -d \
                            --name ${APP_CONTAINER} \
                            --user root \
                            -p ${APP_PORT}:${APP_PORT} \
                            -v \$(pwd):/app \
                            -w /app \
                            ${DOCKER_IMAGE} \
                            npm start
                        
                        echo "Waiting for application..."
                        sleep 10
                    """
                }
            }
        }

        stage('Build Test Image') {
            steps {
                script {
                    echo "Building custom test Docker image with Chrome and ChromeDriver..."
                    sh """
                        docker build \
                            -f Dockerfile.test \
                            -t todo-test:latest \
                            .
                    """
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    echo "Running Selenium tests in containerized environment..."
                    sh """
                        docker run --rm \
                            --name ${TEST_CONTAINER} \
                            --network host \
                            --user root \
                            -v \$(pwd):/usr/src/app \
                            -w /usr/src/app \
                            -e TEST_BASE_URL=http://localhost:${APP_PORT} \
                            -e CHROME_BIN=/usr/bin/chromium-browser \
                            -e CHROMEDRIVER_PATH=/usr/bin/chromedriver \
                            todo-test:latest \
                            npm run test:selenium
                    """
                }
            }
        }

        stage('Cleanup') {
            steps {
                script {
                    echo "Stopping containers..."
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
                echo "Final cleanup..."
                sh """
                    docker stop ${APP_CONTAINER} ${TEST_CONTAINER} || true
                    docker rm ${APP_CONTAINER} ${TEST_CONTAINER} || true
                """
            }
        }
        success {
            echo "✓ Pipeline succeeded! All tests passed."
        }
        failure {
            echo "✗ Pipeline failed. Check logs."
        }
    }
}