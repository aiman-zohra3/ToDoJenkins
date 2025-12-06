pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo "Cloning repository..."
                git branch: 'main', url: 'https://github.com/aiman-zohra3/ToDoJenkins.git'
            }
        }

        stage('Build Test Image') {
            steps {
                echo "Building Docker image with Node + Chrome + WebDriver..."
                sh 'docker build -t todo-node-chrome:latest .'
            }
        }

        stage('Run Tests in Container') {
            steps {
                echo "Running Selenium tests inside container..."
                sh '''
                    docker run --rm \
                        -v $PWD:/app \
                        -w /app \
                        --name todo-test-container \
                        todo-node-chrome:latest \
                        npm test
                '''
            }
        }
    }

    post {
        always {
            echo "Cleaning up..."
            sh 'docker rm -f todo-test-container || true'
        }
        success {
            echo "Pipeline succeeded. All tests passed!"
        }
        failure {
            echo "Pipeline failed. Check logs."
        }
    }
}
