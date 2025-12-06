# Jenkins Pipeline Setup Checklist

Use this checklist to track your progress setting up the Jenkins automation pipeline.

## Pre-Setup
- [ ] AWS EC2 instance is running
- [ ] Security group allows:
  - [ ] Port 22 (SSH)
  - [ ] Port 8080 (Jenkins)
  - [ ] Port 5000 (Application - optional)
- [ ] SSH key file is available
- [ ] Can SSH into EC2 instance

## Step 1: Initial Server Setup
- [ ] Connected to EC2 via SSH
- [ ] System packages updated
- [ ] System upgraded

## Step 2: Java Installation
- [ ] Java 11 JDK installed
- [ ] Java version verified (`java -version`)

## Step 3: Jenkins Installation
- [ ] Jenkins repository added
- [ ] Jenkins installed
- [ ] Jenkins service started
- [ ] Jenkins enabled on boot
- [ ] Initial admin password retrieved
- [ ] Jenkins status verified

## Step 4: Docker Installation
- [ ] Old Docker versions removed
- [ ] Docker prerequisites installed
- [ ] Docker GPG key added
- [ ] Docker repository configured
- [ ] Docker CE installed
- [ ] Docker service started
- [ ] Docker enabled on boot
- [ ] Docker version verified

## Step 5: Docker-Jenkins Integration
- [ ] Jenkins user added to docker group
- [ ] Jenkins service restarted
- [ ] Docker access verified for jenkins user

## Step 6: Git Installation
- [ ] Git installed
- [ ] Git version verified

## Step 7: Jenkins Web Interface Setup
- [ ] Jenkins accessible at http://EC2-IP:8080
- [ ] Jenkins unlocked with initial password
- [ ] Suggested plugins installed
- [ ] Admin user created
- [ ] Jenkins URL configured
- [ ] Jenkins dashboard accessible

## Step 8: Jenkins Plugins
- [ ] Pipeline plugin installed
- [ ] Docker Pipeline plugin installed
- [ ] Git plugin installed
- [ ] GitHub plugin installed
- [ ] Jenkins restarted after plugin installation

## Step 9: GitHub Configuration
- [ ] GitHub repository is accessible
- [ ] For private repo: SSH key generated
- [ ] For private repo: SSH key added to GitHub
- [ ] SSH connection to GitHub tested (if private)

## Step 10: Pipeline Job Creation
- [ ] New pipeline job created
- [ ] Job name: "ToDoJenkins-Pipeline"
- [ ] Pipeline type selected
- [ ] GitHub repository URL configured
- [ ] Credentials configured (if private repo)
- [ ] Branch set to main/master
- [ ] Script path set to "Jenkinsfile"
- [ ] Job saved

## Step 11: First Pipeline Run
- [ ] Pipeline job triggered manually
- [ ] Build started successfully
- [ ] Console output accessible
- [ ] Checkout stage completed
- [ ] Docker image build stage completed
- [ ] Docker network created
- [ ] Application container started
- [ ] Selenium tests executed
- [ ] Cleanup stages completed
- [ ] Build status: SUCCESS

## Step 12: Verification
- [ ] All pipeline stages completed
- [ ] No errors in console output
- [ ] Docker containers created and removed
- [ ] Test results visible in console
- [ ] Pipeline visualization shows all stages

## Step 13: Optional - Automated Triggers
- [ ] GitHub webhook configured (if using)
- [ ] SCM polling configured (if using)
- [ ] Automatic builds working

## Troubleshooting (if needed)
- [ ] Checked Jenkins logs for errors
- [ ] Verified Docker permissions
- [ ] Tested Docker commands manually
- [ ] Verified GitHub access
- [ ] Checked port availability
- [ ] Reviewed security group settings

## Final Verification
- [ ] Pipeline runs successfully end-to-end
- [ ] Tests execute in Docker containers
- [ ] Application runs in container
- [ ] Cleanup works properly
- [ ] Can trigger builds manually
- [ ] Can trigger builds automatically (if configured)

---

## Quick Command Reference

### Check Services
```bash
sudo systemctl status jenkins
sudo systemctl status docker
```

### View Logs
```bash
sudo tail -f /var/log/jenkins/jenkins.log
docker logs <container-name>
```

### Restart Services
```bash
sudo systemctl restart jenkins
sudo systemctl restart docker
```

### Docker Commands
```bash
docker ps                    # List running containers
docker ps -a                 # List all containers
docker images               # List images
docker network ls           # List networks
docker system prune -a      # Clean up everything
```

---

## Success Criteria

✅ Jenkins is running and accessible
✅ Docker is installed and working
✅ Jenkins user can run Docker commands
✅ Pipeline job is created and configured
✅ Pipeline builds successfully
✅ All stages complete without errors
✅ Tests run in containerized environment
✅ Cleanup works properly

---

**Date Completed:** _______________

**Notes:**
_________________________________
_________________________________
_________________________________

