pipeline {
    agent any

    environment {
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
                echo "Pulling Docker image..."
                sh "docker pull ${DOCKER_IMAGE} || echo 'Using local image'"
            }
        }

        stage('Start Application Container') {
            steps {
                script {
                    echo "Starting application container..."
                    sh """
                        docker stop ${APP_CONTAINER} || true
                        docker rm ${APP_CONTAINER} || true
                        
                        docker run -d \
                            --name ${APP_CONTAINER} \
                            -p ${APP_PORT}:${APP_PORT} \
                            -v \$(pwd):/app \
                            -w /app \
                            ${DOCKER_IMAGE} \
                            sh -c "npm install && npm start"
                        
                        echo "Waiting for application to start..."
                        sleep 15
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
                            -v \$(pwd):/app \
                            -w /app \
                            -e TEST_BASE_URL=http://localhost:${APP_PORT} \
                            ${DOCKER_IMAGE} \
                            sh -c "npm install && npm run test:selenium"
                    """
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
                echo "Cleaning up..."
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