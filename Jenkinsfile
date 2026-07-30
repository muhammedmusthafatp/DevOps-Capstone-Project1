pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = "369602465346"
        AWS_REGION = "ap-south-2"

        FRONTEND_REPO = "369602465346.dkr.ecr.ap-south-2.amazonaws.com/capstone-project-frontend"
        BACKEND_REPO  = "369602465346.dkr.ecr.ap-south-2.amazonaws.com/capstone-project-backend"

        IMAGE_TAG = "${BUILD_NUMBER}"
        SONARQUBE_ENV = "SonarQube"
    }

    stages {

        stage('Checkout Source') {
            steps {
                git branch: 'main',
                url: 'https://github.com/muhammedmusthafatp/DevOps-Capstone-Project1.git'
            }
        }

        stage('SonarQube Analysis') {
    steps {
        withSonarQubeEnv('SonarQube') {
            sh 'sonar-scanner'
        }
    }
}

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh """
                    docker build -t ${BACKEND_REPO}:${IMAGE_TAG} .
                    docker tag ${BACKEND_REPO}:${IMAGE_TAG} ${BACKEND_REPO}:latest
                    """
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh """
                    docker build -t ${FRONTEND_REPO}:${IMAGE_TAG} .
                    docker tag ${FRONTEND_REPO}:${IMAGE_TAG} ${FRONTEND_REPO}:latest
                    """
                }
            }
        }

        stage('Login to Amazon ECR') {
            steps {
                sh """
                aws ecr get-login-password --region ${AWS_REGION} | \
                docker login --username AWS --password-stdin \
                ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                """
            }
        }

        stage('Push Backend Image') {
            steps {
                sh """
                docker push ${BACKEND_REPO}:${IMAGE_TAG}
                docker push ${BACKEND_REPO}:latest
                """
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh """
                docker push ${FRONTEND_REPO}:${IMAGE_TAG}
                docker push ${FRONTEND_REPO}:latest
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                kubectl apply -f kubernetes/namespace.yaml
                kubectl apply -f kubernetes/configmap.yaml
                kubectl apply -f kubernetes/secret.yaml
                kubectl apply -f kubernetes/backend-deployment.yaml
                kubectl apply -f kubernetes/backend-service.yaml
                kubectl apply -f kubernetes/frontend-deployment.yaml
                kubectl apply -f kubernetes/frontend-service.yaml
                kubectl apply -f kubernetes/ingress.yaml
                """
            }
        }

        stage('Update Images') {
            steps {
                sh """
                kubectl set image deployment/backend \
                backend=${BACKEND_REPO}:${IMAGE_TAG} \
                -n production

                kubectl set image deployment/frontend \
                frontend=${FRONTEND_REPO}:${IMAGE_TAG} \
                -n production
                """
            }
        }

        stage('Verify Rollout') {
            steps {
                sh """
                kubectl rollout status deployment/backend -n production
                kubectl rollout status deployment/frontend -n production
                """
            }
        }

    }

    post {

        success {
            echo 'Pipeline executed successfully.'
        }

        failure {
            echo 'Pipeline execution failed.'
        }

        always {
            sh 'docker image prune -f'
        }

    }

}