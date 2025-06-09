#!/bin/bash

# YOLO Detection API Deployment Script
# This script helps deploy the FastAPI backend to various platforms

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing Python dependencies..."
    
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
        print_success "Dependencies installed successfully"
    else
        print_error "requirements.txt not found!"
        exit 1
    fi
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p uploads
    mkdir -p outputs
    mkdir -p models
    mkdir -p logs
    
    print_success "Directories created successfully"
}

# Function to check environment variables
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from template..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning "Please edit .env file with your configuration"
        else
            print_error "No .env.example file found!"
            exit 1
        fi
    fi
    
    print_success "Environment configuration checked"
}

# Function to test the application
test_application() {
    print_status "Testing application startup..."
    
    # Start the application in background for testing
    python -m uvicorn app:app --host 0.0.0.0 --port 8000 &
    APP_PID=$!
    
    # Wait a bit for startup
    sleep 5
    
    # Test health endpoint
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        print_success "Application is running correctly"
        kill $APP_PID
        wait $APP_PID 2>/dev/null || true
    else
        print_error "Application test failed"
        kill $APP_PID 2>/dev/null || true
        wait $APP_PID 2>/dev/null || true
        exit 1
    fi
}

# Function to deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    if ! command_exists railway; then
        print_error "Railway CLI not found. Install it first:"
        echo "npm install -g @railway/cli"
        exit 1
    fi
    
    railway login
    railway init
    railway up
    
    print_success "Deployed to Railway successfully"
}

# Function to deploy to Render
deploy_render() {
    print_status "Deploying to Render..."
    
    print_warning "For Render deployment, please:"
    echo "1. Connect your GitHub repository to Render"
    echo "2. Set the build command: pip install -r requirements.txt"
    echo "3. Set the start command: uvicorn app:app --host 0.0.0.0 --port \$PORT"
    echo "4. Configure environment variables in Render dashboard"
}

# Function to deploy with Docker
deploy_docker() {
    print_status "Building Docker image..."
    
    if ! command_exists docker; then
        print_error "Docker not found. Please install Docker first."
        exit 1
    fi
    
    # Build the image
    docker build -t yolo-detection-api .
    
    print_success "Docker image built successfully"
    
    print_status "Running Docker container..."
    docker run -d -p 8000:8000 --name yolo-api yolo-detection-api
    
    print_success "Docker container is running on port 8000"
}

# Function to deploy to VPS
deploy_vps() {
    print_status "Setting up for VPS deployment..."
    
    # Create systemd service file
    cat > yolo-detection.service << EOF
[Unit]
Description=YOLO Detection API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)
Environment=PATH=$(pwd)/venv/bin
ExecStart=$(pwd)/venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF
    
    print_status "Systemd service file created: yolo-detection.service"
    print_warning "To complete VPS deployment:"
    echo "1. Copy yolo-detection.service to /etc/systemd/system/"
    echo "2. Run: sudo systemctl daemon-reload"
    echo "3. Run: sudo systemctl enable yolo-detection"
    echo "4. Run: sudo systemctl start yolo-detection"
    echo "5. Configure nginx as reverse proxy (optional)"
}

# Function to setup nginx configuration
setup_nginx() {
    print_status "Creating nginx configuration..."
    
    cat > yolo-detection-nginx.conf << EOF
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Handle file uploads
        client_max_body_size 100M;
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }
}
EOF
    
    print_success "Nginx configuration created: yolo-detection-nginx.conf"
    print_warning "Copy this file to /etc/nginx/sites-available/ and enable it"
}

# Function to show usage
show_usage() {
    echo "YOLO Detection API Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  setup         - Setup local development environment"
    echo "  test          - Test the application"
    echo "  railway       - Deploy to Railway"
    echo "  render        - Show Render deployment instructions"
    echo "  docker        - Build and run Docker container"
    echo "  vps           - Setup for VPS deployment"
    echo "  nginx         - Create nginx configuration"
    echo "  production    - Full production setup (VPS)"
    echo "  help          - Show this help message"
    echo ""
}

# Function for full production setup
production_setup() {
    print_status "Starting production setup..."
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_error "Don't run this script as root for security reasons"
        exit 1
    fi
    
    # Setup virtual environment
    print_status "Setting up virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    
    # Install dependencies
    install_dependencies
    
    # Create directories
    create_directories
    
    # Check environment
    check_environment
    
    # Test application
    test_application
    
    # Setup systemd service
    deploy_vps
    
    # Setup nginx
    setup_nginx
    
    print_success "Production setup completed!"
    print_warning "Don't forget to:"
    echo "1. Edit .env file with production settings"
    echo "2. Configure firewall (ufw allow 8000)"
    echo "3. Setup SSL certificate (Let's Encrypt)"
    echo "4. Configure monitoring and logging"
}

# Main script logic
case "${1:-}" in
    setup)
        print_status "Setting up development environment..."
        install_dependencies
        create_directories
        check_environment
        print_success "Development environment setup completed!"
        ;;
    test)
        test_application
        ;;
    railway)
        deploy_railway
        ;;
    render)
        deploy_render
        ;;
    docker)
        deploy_docker
        ;;
    vps)
        deploy_vps
        ;;
    nginx)
        setup_nginx
        ;;
    production)
        production_setup
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        if [ -z "${1:-}" ]; then
            print_error "No option provided"
        else
            print_error "Unknown option: $1"
        fi
        echo ""
        show_usage
        exit 1
        ;;
esac

print_success "Script completed successfully!"