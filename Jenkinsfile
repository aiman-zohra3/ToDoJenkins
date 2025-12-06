pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        APP_PORT = '5000'
        TEST_BASE_URL = "http://app-container:${APP_PORT}"
        DOCKER_IMAGE = 'todo-jenkins-test'
        DOCKER_NETWORK = 'todo-test-network'
        APP_CONTAINER = 'app-container'
        TEST_CONTAINER = 'test-container'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Building Docker image for testing...'
                    sh """
                        docker build -t ${DOCKER_IMAGE}:latest .
                    """
                }
            }
        }
        
        stage('Create Docker Network') {
            steps {
                script {
                    echo 'Creating Docker network for containers...'
                    sh """
                        docker network create ${DOCKER_NETWORK} || true
                    """
                }
            }
        }
        
        stage('Start Application Container') {
            steps {
                script {
                    echo 'Starting application in Docker container...'
                    sh """
                        # Stop and remove existing container if it exists
                        docker stop ${APP_CONTAINER} || true
                        docker rm ${APP_CONTAINER} || true
                        
                        # Start the application container
                        docker run -d \\
                            --name ${APP_CONTAINER} \\
                            --network ${DOCKER_NETWORK} \\
                            -p ${APP_PORT}:${APP_PORT} \\
                            -e PORT=${APP_PORT} \\
                            ${DOCKER_IMAGE}:latest
                        
                        # Wait for application to be ready
                        echo 'Waiting for application to start...'
                        sleep 15
                        
                        # Check if application is running
                        timeout 60 bash -c 'until docker logs ${APP_CONTAINER} 2>&1 | grep -q "listening on port"; do sleep 2; done' || true
                        sleep 5
                        
                        # Verify application is accessible from host
                        curl -f http://localhost:${APP_PORT} || echo 'Application may still be starting...'
                    """
                }
            }
        }
        
        stage('Run Selenium Tests') {
            steps {
                script {
                    echo 'Running Selenium tests in Docker container...'
                    sh """
                        # Run tests in a new container on the same network
                        docker run --rm \\
                            --name ${TEST_CONTAINER} \\
                            --network ${DOCKER_NETWORK} \\
                            -e TEST_BASE_URL=${TEST_BASE_URL} \\
                            ${DOCKER_IMAGE}:latest \\
                            npm run test:selenium
                    """
                }
            }
            post {
                always {
                    echo 'Test stage completed'
                }
                success {
                    echo 'All tests passed!'
                }
                failure {
                    echo 'Tests failed!'
                }
            }
        }
        
        stage('Stop Application Container') {
            steps {
                script {
                    echo 'Stopping application container...'
                    sh """
                        docker stop ${APP_CONTAINER} || true
                        docker rm ${APP_CONTAINER} || true
                    """
                }
            }
        }
        
        stage('Cleanup Network') {
            steps {
                script {
                    echo 'Cleaning up Docker network...'
                    sh """
                        docker network rm ${DOCKER_NETWORK} || true
                    """
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo 'Final cleanup...'
                sh """
                    docker stop ${APP_CONTAINER} ${TEST_CONTAINER} || true
                    docker rm ${APP_CONTAINER} ${TEST_CONTAINER} || true
                    docker network rm ${DOCKER_NETWORK} || true
                """
            }
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}

