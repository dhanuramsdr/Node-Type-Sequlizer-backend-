pipeline {
  agent any
  triggers {
        githubPush()  
    }
  stages {
    stage('Checkout Scm') {
      steps {
        git(credentialsId: '944d8d1a-a4bb-423a-8a11-76981d5e5f2d', url: 'https://github.com/dhanuramsdr/Node-Type-Sequlizer-backend-.git')
      }
    }

    stage('Shell script 0') {
      steps {
        withCredentials([string(credentialsId: 'DEV_DB_PASSWORD', variable: 'DB_PASSWORD')]) {
          sh '''echo $PATH
whoami
node -v
npm -v'''
        }

      }
    }

    stage('Shell script 1') {
      steps {
        withCredentials([string(credentialsId: 'DEV_DB_PASSWORD', variable: 'DB_PASSWORD')]) {
          sh '''echo "Installing dependencies"
npm install'''
        }

      }
    }

    stage('Shell script 2') {
      steps {
        withCredentials([string(credentialsId: 'DEV_DB_PASSWORD', variable: 'DB_PASSWORD')]) {
          sh '''echo "Compiling TypeScript"
npm run build'''
        }

      }
    }

    stage('Shell script 3') {
      steps {
        withCredentials([string(credentialsId: 'DEV_DB_PASSWORD', variable: 'DB_PASSWORD')]) {
          sh '''echo "Running Lint"
npm run lint'''
        }

      }
    }

    stage('Shell script 4') {
      steps {
        withCredentials([string(credentialsId: 'DEV_DB_PASSWORD', variable: 'DB_PASSWORD')]) {
          sh '''echo "Running Tests"
npm test'''
        }

      }
    }

    stage('Shell script 5') {
      steps {
        withCredentials([string(credentialsId: 'DEV_DB_PASSWORD', variable: 'DB_PASSWORD')]) {
          sh '''echo "Generating coverage report"
npm run test:coverage'''
        }

      }
    }

    stage('Shell script 6') {
      steps {
        withCredentials([string(credentialsId: 'DEV_DB_PASSWORD', variable: 'DB_PASSWORD')]) {
          sh '''echo "Creating Production Build"
npm run build'''
        }

      }
    }

  }
}
