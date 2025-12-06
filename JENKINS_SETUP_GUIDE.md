# Jenkins Pipeline Setup Guide - Part II: Automation Pipeline with Test Stage

This guide provides complete commands and steps to set up Jenkins on AWS EC2 and configure the automation pipeline with Docker containerized test stage.

## Prerequisites
- AWS EC2 instance running (Ubuntu 20.04/22.04 recommended)
- SSH access to the EC2 instance
- Security group configured to allow:
  - Port 22 (SSH)
  - Port 8080 (Jenkins)
  - Port 5000 (Application - optional, for testing)

---

## Step 1: Connect to Your EC2 Instance

```bash
# Replace with your EC2 instance details
ssh -i your-key.pem ubuntu@your-ec2-ip-address
# or
ssh -i your-key.pem ec2-user@your-ec2-ip-address  # For Amazon Linux
```

---

## Step 2: Update System Packages

```bash
# For Ubuntu/Debian
sudo apt-get update
sudo apt-get upgrade -y

# For Amazon Linux
sudo yum update -y
```

---

## Step 3: Install Java (Required for Jenkins)

```bash
# For Ubuntu/Debian
sudo apt-get install -y openjdk-11-jdk

# For Amazon Linux
sudo yum install -y java-11-amazon-corretto-devel

# Verify installation
java -version
```

---

## Step 4: Install Jenkins

```bash
# For Ubuntu/Debian
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get install -y jenkins

# For Amazon Linux
sudo wget -O /etc/yum.repos.d/jenkins.repo \
    https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
sudo yum upgrade -y
sudo yum install jenkins -y
```

---

## Step 5: Start Jenkins Service

```bash
# Start Jenkins
sudo systemctl start jenkins

# Enable Jenkins to start on boot
sudo systemctl enable jenkins

# Check Jenkins status
sudo systemctl status jenkins

# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

**Save this password!** You'll need it to unlock Jenkins.

---

## Step 6: Install Docker

```bash
# For Ubuntu/Debian
# Remove old versions
sudo apt-get remove -y docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# For Amazon Linux
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
```

---

## Step 7: Configure Docker for Jenkins User

```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins to apply changes
sudo systemctl restart jenkins

# Verify Docker installation
docker --version
docker ps
```

---

## Step 8: Install Git (if not already installed)

```bash
# For Ubuntu/Debian
sudo apt-get install -y git

# For Amazon Linux
sudo yum install -y git

# Verify installation
git --version
```

---

## Step 9: Access Jenkins Web Interface

1. Open your browser and navigate to:
   ```
   http://your-ec2-ip-address:8080
   ```
   or
   ```
   http://your-ec2-public-dns:8080
   ```

2. Unlock Jenkins:
   - Enter the initial admin password (from Step 5)
   - Click "Continue"

3. Install Suggested Plugins:
   - Click "Install suggested plugins"
   - Wait for installation to complete

4. Create Admin User:
   - Fill in the form with your details
   - Click "Save and Continue"

5. Configure Jenkins URL:
   - Use default: `http://your-ec2-ip-address:8080`
   - Click "Save and Finish"

6. Click "Start using Jenkins"

---

## Step 10: Install Required Jenkins Plugins

1. Go to **Manage Jenkins** → **Manage Plugins**

2. Click on **Available** tab and search for:
   - **Pipeline** (usually pre-installed)
   - **Docker Pipeline** (for Docker integration)
   - **Git** (usually pre-installed)
   - **GitHub** (for GitHub integration)

3. Check the boxes and click **Install without restart**

4. Wait for installation, then click **Restart Jenkins when installation is complete**

---

## Step 11: Configure Jenkins for GitHub Access

### Option A: Public Repository (No Authentication Needed)
If your repository is public, you can skip this step.

### Option B: Private Repository (SSH Key Method)

```bash
# Switch to jenkins user
sudo su - jenkins

# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "jenkins@ec2"
# Press Enter to accept default location
# Press Enter twice for no passphrase (or set one)

# Display public key
cat ~/.ssh/id_rsa.pub
```

**Copy the public key** and add it to your GitHub account:
1. Go to GitHub → Settings → SSH and GPG keys
2. Click "New SSH key"
3. Paste the public key and save

### Option C: Private Repository (Personal Access Token)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Copy the token (you'll use it in Jenkins)

---

## Step 12: Create Jenkins Pipeline Job

1. In Jenkins dashboard, click **New Item**

2. Enter item name: `ToDoJenkins-Pipeline`

3. Select **Pipeline** and click **OK**

4. Configure the pipeline:

   **General Section:**
   - Description: "Automation pipeline with Docker containerized test stage"
   - (Optional) Check "GitHub project" and enter: `https://github.com/aiman-zohra3/ToDoJenkins`

   **Pipeline Section:**
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/aiman-zohra3/ToDoJenkins.git`
     - For private repo, use: `git@github.com:aiman-zohra3/ToDoJenkins.git`
   - Credentials: 
     - If public repo: **None**
     - If private repo: Add credentials (SSH key or username/password with token)
   - Branches to build: `*/main` (or `*/master`)
   - Script Path: `Jenkinsfile`
   - Click **Save**

---

## Step 13: Run the Pipeline

1. Go to your pipeline job: **ToDoJenkins-Pipeline**

2. Click **Build Now**

3. Monitor the build:
   - Click on the build number (#1)
   - Click **Console Output** to see real-time logs

4. The pipeline will:
   - Checkout code from GitHub
   - Build Docker image
   - Create Docker network
   - Start application container
   - Run Selenium tests
   - Clean up containers

---

## Step 14: Verify Pipeline Execution

### Check Build Status:
- Blue ball = Success
- Red ball = Failed
- Yellow ball = Unstable

### View Test Results:
- Click on build number
- Check **Console Output** for detailed logs
- Look for test execution results

### Common Issues and Solutions:

#### Issue 1: Docker Permission Denied
```bash
# Fix: Ensure jenkins user is in docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

#### Issue 2: Cannot Connect to Docker Daemon
```bash
# Fix: Check Docker service
sudo systemctl status docker
sudo systemctl start docker
```

#### Issue 3: Port Already in Use
```bash
# Fix: Check if port 5000 is in use
sudo lsof -i :5000
# Kill the process if needed
sudo kill -9 <PID>
```

#### Issue 4: GitHub Authentication Failed
```bash
# Fix: Test SSH connection as jenkins user
sudo su - jenkins
ssh -T git@github.com
# If it fails, check SSH key configuration
```

#### Issue 5: Chrome/ChromeDriver Issues
```bash
# The Dockerfile handles this, but if issues persist:
# Check Docker build logs in Jenkins console output
```

---

## Step 15: Configure Automatic Builds (Optional)

### Trigger on GitHub Push:

1. In pipeline configuration, go to **Build Triggers**
2. Check **GitHub hook trigger for GITScm polling**
3. In GitHub repository:
   - Go to Settings → Webhooks
   - Add webhook:
     - Payload URL: `http://your-ec2-ip:8080/github-webhook/`
     - Content type: `application/json`
     - Events: `Just the push event`
     - Click **Add webhook**

### Poll SCM (Alternative):

1. In pipeline configuration, go to **Build Triggers**
2. Check **Poll SCM**
3. Schedule: `H/5 * * * *` (every 5 minutes)
4. Click **Save**

---

## Step 16: View Pipeline Visualization

1. Go to your pipeline job
2. Click **Pipeline Syntax** (left sidebar)
3. Or view **Pipeline Steps** in build details

---

## Useful Jenkins Commands

```bash
# View Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log

# Restart Jenkins
sudo systemctl restart jenkins

# Stop Jenkins
sudo systemctl stop jenkins

# Check Jenkins status
sudo systemctl status jenkins

# View Jenkins home directory
sudo ls -la /var/lib/jenkins

# Backup Jenkins configuration
sudo tar -czf jenkins-backup.tar.gz /var/lib/jenkins
```

---

## Docker Commands for Troubleshooting

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# View container logs
docker logs <container-name>

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused networks
docker network prune

# Clean up everything
docker system prune -a
```

---

## Verification Checklist

- [ ] Jenkins is running and accessible on port 8080
- [ ] Docker is installed and jenkins user has permissions
- [ ] Git is installed
- [ ] Pipeline job is created
- [ ] GitHub repository is accessible
- [ ] Pipeline builds successfully
- [ ] Docker image builds without errors
- [ ] Application container starts successfully
- [ ] Selenium tests execute in container
- [ ] Cleanup stages complete successfully

---

## Next Steps After Successful Setup

1. **Monitor Pipeline**: Set up email notifications for build failures
2. **Add More Stages**: Extend pipeline with deployment stages
3. **Parallel Testing**: Run multiple test suites in parallel
4. **Artifact Storage**: Archive test reports and screenshots
5. **Integration**: Connect with other CI/CD tools

---

## Support and Troubleshooting

If you encounter issues:

1. Check Jenkins console output for detailed error messages
2. Verify all prerequisites are installed
3. Check Docker and Jenkins logs
4. Ensure security groups allow necessary ports
5. Verify GitHub repository access

---

## Summary

Your Jenkins pipeline is now configured to:
✅ Fetch code from GitHub automatically
✅ Build Docker image with Chrome and ChromeDriver
✅ Run application in containerized environment
✅ Execute Selenium tests in separate container
✅ Clean up resources after completion

The pipeline follows CI/CD best practices and provides a solid foundation for automated testing in your development workflow.

