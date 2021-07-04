node {
    properties([disableConcurrentBuilds()])
    def app
    def rev_no = ""
    def build_arg = ""
    def registry_address = "https://registry.hub.docker.com"

    stage('Initialize'){
        def dockerHome = tool 'myDocker'
        env.PATH = "${dockerHome}/bin:${env.PATH}"
    }

    stage("Pull GIT Repo") {
        checkout scm
        echo "pull repo"
        dir('mediasoup') {
            git branch: 'v3',
                credentialsId: 'my_jenkins_private',
                url: 'https://github.com/sidgeek/mediasoup-demo.git';
                
            // ARES-1285 Create a version file in jenkins pipeline
            rev_no = sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()
        }
    }

    stage("Build and start test image") {
        echo "Build"
        // build_arg += "-f ./Dockerfile --build-arg REV_NO=${rev_no} ."
        // app = docker.build "sidshi/testdemo", build_arg;
    }

    stage('deploy image on machinice') {
        echo "deploy"
    }
}
