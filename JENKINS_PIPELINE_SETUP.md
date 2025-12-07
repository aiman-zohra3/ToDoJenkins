# Jenkins Pipeline Setup Guide - Part II: Automation Pipeline with Test Stage

This guide provides complete instructions for setting up Jenkins on AWS EC2 and configuring the automation pipeline with Docker containerized test execution.

## 📋 Assignment Requirements

✅ Store automated test case code in GitHub repository  
✅ Create Jenkins pipeline that fetches code from GitHub  
✅ Execute tests in containerized environment using Docker  
✅ Use Docker image with Chrome, ChromeDriver, and testing framework  

## 🏗️ Project Structure

```
ToDoJenkins/
├── Dockerfile              # Container image with Node.js + Chrome + ChromeDriver
├── Jenkinsfile            # Jenkins pipeline configuration
├── .dockerignore          # Files to exclude from Docker build
├── package.json           # Node.js dependencies
├── app.js                 # Express application
├── tests/
│   ├── selenium.test.js    # Selenium automated tests
│   └── selenium.config.js # Test configuration
└── ... (other app files)
```

## 🚀 Quick Setup Commands for EC2

### Step 1: Install Java (Required for Jenkins)

```bash
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk
java -version
```

### Step 2: Install Jenkins

```bash
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get install -y jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

### Step 3: Get Jenkins Initial Password

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

**Save this password!** You'll need it to unlock Jenkins.

### Step 4: Install Docker

```bash
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

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
docker --version
```

### Step 5: Configure Docker for Jenkins User

```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins to apply changes
sudo systemctl restart jenkins

# Verify Docker access
sudo -u jenkins docker ps
```

### Step 6: Install Git

```bash
sudo apt-get install -y git
git --version
```

## 🌐 Access Jenkins Web Interface

1. **Open browser** and navigate to:
   ```
   http://YOUR-EC2-IP-ADDRESS:8080
   ```

2. **Unlock Jenkins:**
   - Enter the initial admin password (from Step 3)
   - Click "Continue"

3. **Install Suggested Plugins:**
   - Click "Install suggested plugins"
   - Wait for installation

4. **Create Admin User:**
   - Fill in the form
   - Click "Save and Continue"

5. **Configure Jenkins URL:**
   - Use default: `http://YOUR-EC2-IP:8080`
   - Click "Save and Finish"

6. **Start using Jenkins:**
   - Click "Start using Jenkins"

## 🔌 Install Required Jenkins Plugins

1. Go to **Manage Jenkins** → **Manage Plugins**

2. Click **Available** tab and search for:
   - ✅ **Pipeline** (usually pre-installed)
   - ✅ **Docker Pipeline** (for Docker integration)
   - ✅ **Git** (usually pre-installed)
   - ✅ **GitHub** (for GitHub integration)

3. Check boxes and click **Install without restart**

4. After installation, click **Restart Jenkins when installation is complete**

## 📦 Create Jenkins Pipeline Job

1. **Click "New Item"** in Jenkins dashboard

2. **Enter item name:** `ToDoJenkins-Pipeline`

3. **Select "Pipeline"** and click **OK**

4. **Configure Pipeline:**
   - **Description:** "Automation pipeline with Docker containerized test stage"
   - **Pipeline section:**
     - **Definition:** Pipeline script from SCM
     - **SCM:** Git
     - **Repository URL:** `https://github.com/aiman-zohra3/ToDoJenkins.git`
     - **Branch:** `*/main`
     - **Script Path:** `Jenkinsfile`
   - Click **Save**

## ▶️ Run the Pipeline

1. Go to your pipeline job: **ToDoJenkins-Pipeline**

2. Click **Build Now**

3. **Monitor the build:**
   - Click on the build number (#1)
   - Click **Console Output** to see real-time logs

## 📊 Pipeline Stages Explained

### Stage 1: Checkout
- Fetches code from GitHub repository
- Clones the `main` branch

### Stage 2: Build Docker Image
- Builds Docker image with:
  - Node.js 18
  - Google Chrome
  - ChromeDriver
  - All application dependencies

### Stage 3: Start Application Container
- Starts the Todo application in a Docker container
- Exposes port 5000
- Waits for application to be ready

### Stage 4: Run Selenium Tests
- Runs Selenium tests in a separate containerized environment
- Tests connect to the application running in the other container
- Executes all automated test cases

### Stage 5: Stop Application Container
- Stops and removes the application container
- Cleans up resources

## ✅ Verification Checklist

- [ ] Jenkins is running and accessible on port 8080
- [ ] Docker is installed and jenkins user has permissions
- [ ] Git is installed
- [ ] Pipeline job is created
- [ ] GitHub repository is accessible
- [ ] Pipeline builds successfully
- [ ] Docker image builds without errors
- [ ] Application container starts successfully
- [ ] Selenium tests execute in container
- [ ] All tests pass
- [ ] Cleanup stages complete successfully

## 🔧 Troubleshooting

### Issue: Cannot connect to Docker daemon

**Solution:**
```bash
# Verify Docker is running
sudo systemctl status docker

# Ensure jenkins user is in docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Test Docker access
sudo -u jenkins docker ps
```

### Issue: Port 8080 not accessible

**Solution:**
1. Check EC2 Security Group - allow inbound on port 8080
2. Check if Jenkins is running:
   ```bash
   sudo systemctl status jenkins
   ```
3. Check firewall:
   ```bash
   sudo ufw allow 8080
   ```

### Issue: Tests fail to connect to application

**Solution:**
- Verify application container is running: `docker ps`
- Check application logs: `docker logs todo-app-container`
- Ensure TEST_BASE_URL is set correctly in Jenkinsfile

### Issue: Chrome/ChromeDriver not found

**Solution:**
- The Dockerfile installs Chrome automatically
- ChromeDriver is installed via npm package
- Verify in Docker build logs that Chrome installed successfully

## 📝 Key Features

✅ **Containerized Testing:** All tests run in isolated Docker containers  
✅ **Automated Execution:** Pipeline runs automatically on code changes  
✅ **GitHub Integration:** Fetches latest code from repository  
✅ **Chrome + ChromeDriver:** Pre-installed in Docker image  
✅ **Clean Architecture:** Separate containers for app and tests  
✅ **Automatic Cleanup:** Resources are cleaned up after execution  

## 🎯 Assignment Completion

Upon completion, you will have:

✅ Automated test cases using Selenium  
✅ Jenkins pipeline for test phase  
✅ Containerized test execution using Docker  
✅ Integration with GitHub repository  
✅ Complete CI/CD automation setup  

## 📚 Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [Selenium WebDriver](https://www.selenium.dev/documentation/)
- [Node.js Documentation](https://nodejs.org/docs/)

---

**Repository:** https://github.com/aiman-zohra3/ToDoJenkins  
**Pipeline:** Jenkinsfile  
**Docker Image:** Dockerfile  

