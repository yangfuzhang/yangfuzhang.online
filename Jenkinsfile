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
          // 请修改 dockerServer、dockerPath、imageName
          dockerServer = 'limepietech-docker.pkg.coding.net'
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
          def remote = [:]
          remote.name = 'web-server'
          remote.allowAnyHosts = true
          remote.host = ${env.REMOTE_HOST_IP}
          remote.port = 22
          remote.user = ${env.REMOTE_USER}
 
          // 把「CODING 凭据管理」中的「凭据 ID」填入 credentialsId，而 id_rsa 无需修改
          withCredentials([sshUserPrivateKey(credentialsId: ${env.SSH_CREDENTIALS_ID}, keyFileVariable: 'id_rsa')]) {
            remote.identityFile = id_rsa
 
            // SSH 登录到服务器，拉取 Docker 镜像
            // 请在持续集成的环境变量中配置 DOCKER_USER 和 DOCKER_PASSWORD
            sshCommand remote: remote, sudo: true, command: "apt-get install -y gnupg2 pass"
            sshCommand remote: remote, command: "docker login -u ${env.DOCKER_USER} -p ${env.DOCKER_PASSWORD} $DOCKER_SERVER"
            sshCommand remote: remote, command: "docker pull ${imageName}"
            sshCommand remote: remote, command: "docker stop web | true"
            sshCommand remote: remote, command: "docker rm web | true"
            sshCommand remote: remote, command: "docker run --name web -d ${imageName}"
          }
        }
      }
    }
  }
}
