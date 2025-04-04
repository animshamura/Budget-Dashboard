pipeline {
    agent any

    environment {
        VENV_PATH = './venv'
        FRONTEND_DIR = './frontend'
        BACKEND_DIR = './backend'
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Checkout the code from version control (e.g., Git)
                git 'https://github.com/animshamura/Budget-Dashboard.git'
            }
        }

        stage('Set Up Python Environment') {
            steps {
                script {
                    // Create a virtual environment and activate it
                    sh 'python3 -m venv ${VENV_PATH}'
                    sh '${VENV_PATH}/bin/pip install -r ${BACKEND_DIR}/requirements.txt'
                }
            }
        }

        stage('Deploy Frontend') {
            steps {
                // If necessary, move or copy HTML, CSS, and JS to the right directory
                echo "Frontend is static, no build required"
            }
        }

        stage('Deploy Backend') {
            steps {
                script {
                    // Deploy your FastAPI backend (e.g., using Docker or similar)
                    echo "Deploying FastAPI backend"
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                script {
                    // Deployment steps for staging (adjust according to your setup)
                    sh 'docker-compose -f docker-compose.staging.yml up -d'
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                script {
                    // Deploy to production
                    sh 'docker-compose -f docker-compose.production.yml up -d'
                }
            }
        }

        stage('Clean Up') {
            steps {
                script {
                    // Clean up the environment, if needed
                    sh 'docker-compose down'
                    sh 'rm -rf ${VENV_PATH}'
                }
            }
        }
    }

    post {
        success {
            // Actions to take if the build was successful
            echo 'Build and Deployment successful!'
        }
        failure {
            // Actions to take if the build failed
            echo 'Build failed. Check the logs for errors.'
        }
    }
}
