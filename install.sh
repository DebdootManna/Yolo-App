#!/bin/bash

# YOLO Detection Full-Stack Application
# Quick Installation Script
# 
# This script automates the setup process for both frontend and backend
# Usage: ./install.sh [option]
# Options: all, backend, frontend, dev, production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print colored output
print_header() {
    echo -e "${PURPLE}=================================${NC}"
    echo -e "${PURPLE}  YOLO Detection Setup Script    ${NC}"
    echo -e "${PURPLE}=================================${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
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

# Function to check system requirements
check_requirements() {
    print_step "Checking system requirements..."
    
    local requirements_met=true
    
    # Check Node.js
    if command_exists node; then
        local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -ge 16 ]; then
            print_info "Node.js: $(node --version) ✓"
        else
            print_error "Node.js version 16+ required. Current: $(node --version)"
            requirements_met=false
        fi
    else
        print_error "Node.js not found. Please install Node.js 16+"
        requirements_met=false
    fi
    
    # Check npm
    if command_exists npm; then
        print_info "npm: $(npm --version) ✓"
    else
        print_error "npm not found"
        requirements_met=false
    fi
    
    # Check Python
    if command_exists python3; then
        local python_version=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1-2)
        print_info "Python: $(python3 --version) ✓"
    elif command_exists python; then
        local python_version=$(python --version | cut -d' ' -f2 | cut -d'.' -f1-2)
        print_info "Python: $(python --version) ✓"
    else
        print_error "Python 3.9+ not found"
        requirements_met=false
    fi
    
    # Check pip
    if command_exists pip3; then
        print_info "pip: $(pip3 --version | cut -d' ' -f2) ✓"
    elif command_exists pip; then
        print_info "pip: $(pip --version | cut -d' ' -f2) ✓"
    else
        print_error "pip not found"
        requirements_met=false
    fi
    
    # Check git
    if command_exists git; then
        print_info "Git: $(git --version | cut -d' ' -f3) ✓"
    else
        print_warning "Git not found (optional for development)"
    fi
    
    if [ "$requirements_met" = true ]; then
        print_success "All requirements met!"
    else
        print_error "Please install missing requirements and try again"
        exit 1
    fi
    
    echo ""
}

# Function to setup backend
setup_backend() {
    print_step "Setting up backend..."
    
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found!"
        exit 1
    fi
    
    cd backend
    
    # Create virtual environment
    print_info "Creating Python virtual environment..."
    python3 -m venv venv || python -m venv venv
    
    # Activate virtual environment
    print_info "Activating virtual environment..."
    source venv/bin/activate || . venv/Scripts/activate
    
    # Upgrade pip
    print_info "Upgrading pip..."
    pip install --upgrade pip
    
    # Install requirements
    print_info "Installing Python dependencies..."
    if [ "$INSTALL_MODE" = "production" ]; then
        if [ -f "requirements-production.txt" ]; then
            pip install -r requirements-production.txt
        else
            pip install -r requirements.txt
        fi
    elif [ "$INSTALL_MODE" = "dev" ]; then
        if [ -f "requirements-dev.txt" ]; then
            pip install -r requirements-dev.txt
        else
            pip install -r requirements.txt
        fi
    else
        pip install -r requirements.txt
    fi
    
    # Create necessary directories
    print_info "Creating necessary directories..."
    mkdir -p uploads outputs models logs
    
    # Copy environment file
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_info "Creating .env file from template..."
            cp .env.example .env
            print_warning "Please edit backend/.env file with your configuration"
        else
            print_warning ".env.example not found. You may need to create .env manually"
        fi
    else
        print_info ".env file already exists"
    fi
    
    # Make scripts executable
    if [ -f "start.sh" ]; then
        chmod +x start.sh
    fi
    if [ -f "deploy.sh" ]; then
        chmod +x deploy.sh
    fi
    
    cd ..
    print_success "Backend setup completed!"
    echo ""
}

# Function to setup frontend
setup_frontend() {
    print_step "Setting up frontend..."
    
    if [ ! -d "frontend" ]; then
        print_error "Frontend directory not found!"
        exit 1
    fi
    
    cd frontend
    
    # Install npm dependencies
    print_info "Installing npm dependencies..."
    npm install
    
    # Copy environment file
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.local.example" ]; then
            print_info "Creating .env.local file from template..."
            cp .env.local.example .env.local
            print_warning "Please edit frontend/.env.local file with your configuration"
        else
            print_warning ".env.local.example not found. You may need to create .env.local manually"
        fi
    else
        print_info ".env.local file already exists"
    fi
    
    cd ..
    print_success "Frontend setup completed!"
    echo ""
}

# Function to run tests
run_tests() {
    print_step "Running tests..."
    
    # Test backend
    print_info "Testing backend..."
    cd backend
    source venv/bin/activate || . venv/Scripts/activate
    
    # Quick import test
    python3 -c "
import sys
try:
    import fastapi
    import uvicorn
    import torch
    import cv2
    import ultralytics
    print('✓ All backend dependencies imported successfully')
except ImportError as e:
    print(f'✗ Import error: {e}')
    sys.exit(1)
"
    
    cd ..
    
    # Test frontend
    print_info "Testing frontend dependencies..."
    cd frontend
    npm list --depth=0 > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_info "✓ Frontend dependencies verified"
    else
        print_warning "Some frontend dependencies may have issues"
    fi
    
    cd ..
    print_success "Tests completed!"
    echo ""
}

# Function to display startup instructions
show_startup_instructions() {
    print_step "Setup completed! Here's how to start the application:"
    echo ""
    echo -e "${CYAN}Backend (Terminal 1):${NC}"
    echo "  cd backend"
    echo "  source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
    echo "  python -m uvicorn app:app --reload"
    echo ""
    echo -e "${CYAN}Frontend (Terminal 2):${NC}"
    echo "  cd frontend"
    echo "  npm run dev"
    echo ""
    echo -e "${CYAN}Access URLs:${NC}"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:8000"
    echo "  API Docs: http://localhost:8000/docs"
    echo ""
    echo -e "${YELLOW}Important:${NC}"
    echo "  - Edit backend/.env for backend configuration"
    echo "  - Edit frontend/.env.local for frontend configuration"
    echo "  - Make sure backend is running before starting frontend"
    echo ""
}

# Function to show usage
show_usage() {
    echo "YOLO Detection Installation Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  all         - Setup both frontend and backend (default)"
    echo "  backend     - Setup backend only"
    echo "  frontend    - Setup frontend only"
    echo "  dev         - Setup with development dependencies"
    echo "  production  - Setup with production dependencies"
    echo "  test        - Run dependency tests"
    echo "  clean       - Clean installation (remove node_modules, venv)"
    echo "  help        - Show this help message"
    echo ""
}

# Function to clean installation
clean_installation() {
    print_step "Cleaning installation..."
    
    print_info "Removing backend virtual environment..."
    if [ -d "backend/venv" ]; then
        rm -rf backend/venv
        print_info "✓ Removed backend/venv"
    fi
    
    print_info "Removing frontend node_modules..."
    if [ -d "frontend/node_modules" ]; then
        rm -rf frontend/node_modules
        print_info "✓ Removed frontend/node_modules"
    fi
    
    print_info "Removing frontend package-lock.json..."
    if [ -f "frontend/package-lock.json" ]; then
        rm frontend/package-lock.json
        print_info "✓ Removed frontend/package-lock.json"
    fi
    
    print_info "Removing temporary files..."
    find . -name "*.pyc" -delete
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name ".DS_Store" -delete 2>/dev/null || true
    
    print_success "Clean completed!"
    echo ""
}

# Function to detect OS and provide specific instructions
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    
    print_info "Detected OS: $OS"
    
    if [ "$OS" = "windows" ]; then
        print_warning "Windows detected. You may need to:"
        print_warning "- Use 'python' instead of 'python3'"
        print_warning "- Use 'venv\\Scripts\\activate' to activate virtual environment"
        print_warning "- Install Visual C++ Build Tools for some Python packages"
    fi
    echo ""
}

# Main script execution
main() {
    print_header
    detect_os
    
    local mode="${1:-all}"
    export INSTALL_MODE="$mode"
    
    case "$mode" in
        all)
            check_requirements
            setup_backend
            setup_frontend
            run_tests
            show_startup_instructions
            ;;
        backend)
            check_requirements
            setup_backend
            print_success "Backend setup completed!"
            ;;
        frontend)
            check_requirements
            setup_frontend
            print_success "Frontend setup completed!"
            ;;
        dev)
            export INSTALL_MODE="dev"
            check_requirements
            setup_backend
            setup_frontend
            run_tests
            show_startup_instructions
            ;;
        production)
            export INSTALL_MODE="production"
            check_requirements
            setup_backend
            setup_frontend
            print_success "Production setup completed!"
            ;;
        test)
            run_tests
            ;;
        clean)
            clean_installation
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown option: $mode"
            echo ""
            show_usage
            exit 1
            ;;
    esac
    
    print_success "Installation script completed!"
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi