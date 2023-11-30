pipeline {
  agent any
  stages {
    stage('检出') {
      steps {
        checkout([$class: 'GitSCM', branches: [[name: env.GIT_BUILD_REF]],
        userRemoteConfigs: [[url: env.GIT_REPO_URL, credentialsId: env.CREDENTIALS_ID]]])
      }
    }
    stage('构建') {
      steps {
        echo '构建中...'
        script {
          dockerServer = env.DOCKER_SERVER
          dockerPath = '/gerenwangzhan/docker'
          imageName = "${dockerServer}${dockerPath}/astro-blog:1.0.0"
          def customImage = docker.build(imageName)
 
          // 推送 Docker 镜像到仓库
          docker.withRegistry("https://${dockerServer}", CODING_ARTIFACTS_CREDENTIALS_ID) {
            customImage.push()
          }
        }
      }
    }
    stage('部署') {
      steps {
        echo '部署中...'
        script {
          // 声明服务器信息
          def remoteConfig = [:]
          remoteConfig.name = 'web-server'
          remoteConfig.allowAnyHosts = true
          remoteConfig.host = "${REMOTE_HOST_IP}"
          remoteConfig.port = "${REMOTE_HOST_PORT}".toInteger()
          remoteConfig.user = "${REMOTE_USER}"
 
          // 腾讯云持续集成需要在服务器设置允许SSL以RSA密钥登录，否则会报错Auth fail
          withCredentials([sshUserPrivateKey(credentialsId: env.SSH_CREDENTIALS_ID, keyFileVariable: 'id_rsa')]) {
            remoteConfig.identityFile = id_rsa

            sshCommand(
              remote: remoteConfig,
              command: "docker login -u ${env.DOCKER_USER} -p ${env.DOCKER_PASSWORD} ${env.DOCKER_SERVER}",
              sudo: true,
            )

            sshCommand(
              remote: remoteConfig,
              command: "docker pull ${imageName}",
              sudo: true,
            )

            sshCommand(
              remote: remoteConfig,
              command: "docker stop web | true",
              sudo: true,
            )

            sshCommand(
              remote: remoteConfig,
              command: "docker rm web | true",
              sudo: true,
            )

            sshCommand(
              remote: remoteConfig,
              command: "docker rmi ${imageName}",
              sudo: true,
            )

            sshCommand(
              remote: remoteConfig,
              command: "docker run --name web -p 3000:3000 -d --restart=always ${imageName}",
              sudo: true,
            )
          }
        }
      }
    }
  }
}
