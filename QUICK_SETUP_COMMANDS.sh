#!/bin/bash
# Quick Setup Commands for Jenkins Pipeline on AWS EC2
# Copy and paste these commands in order

# ============================================
# STEP 1: Update System
# ============================================
sudo apt-get update
sudo apt-get upgrade -y

# ============================================
# STEP 2: Install Java
# ============================================
sudo apt-get install -y openjdk-11-jdk
java -version

# ============================================
# STEP 3: Install Jenkins
# ============================================
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get install -y jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
sudo systemctl status jenkins

# Get initial admin password
echo "=== JENKINS INITIAL ADMIN PASSWORD ==="
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
echo "======================================"

# ============================================
# STEP 4: Install Docker
# ============================================
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

# Verify Docker
docker --version

# ============================================
# STEP 5: Configure Docker for Jenkins
# ============================================
# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Verify Docker access
sudo -u jenkins docker ps

# ============================================
# STEP 6: Install Git
# ============================================
sudo apt-get install -y git
git --version

# ============================================
# STEP 7: Configure GitHub SSH (For Private Repos)
# ============================================
# Switch to jenkins user
sudo su - jenkins

# Generate SSH key (run these as jenkins user)
ssh-keygen -t rsa -b 4096 -C "jenkins@ec2"
# Press Enter twice (no passphrase)

# Display public key
cat ~/.ssh/id_rsa.pub

# Exit jenkins user
exit

# ============================================
# STEP 8: Verify All Services
# ============================================
echo "=== SERVICE STATUS ==="
sudo systemctl status jenkins --no-pager
sudo systemctl status docker --no-pager
echo "====================="

# ============================================
# STEP 9: Useful Commands
# ============================================
# View Jenkins logs
# sudo tail -f /var/log/jenkins/jenkins.log

# Restart Jenkins
# sudo systemctl restart jenkins

# Check Docker containers
# docker ps -a

# Clean up Docker
# docker system prune -a

# ============================================
# STEP 10: Access Jenkins
# ============================================
# Open browser and go to:
# http://YOUR-EC2-IP-ADDRESS:8080
# 
# Use the initial admin password from Step 3

