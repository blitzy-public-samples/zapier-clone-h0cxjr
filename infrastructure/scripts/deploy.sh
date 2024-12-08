#!/bin/bash

# Requirement Addressed: Automated Deployment
# Location: Technical Specification/Development & Deployment/CI/CD Pipeline
# Description: Automates the deployment process for infrastructure and applications across all environments.

# Human Tasks:
# 1. Ensure AWS credentials are properly configured for each environment
# 2. Verify Terraform state bucket exists and is accessible
# 3. Configure Kubernetes context and credentials
# 4. Set up environment-specific secrets and configurations
# 5. Review and adjust resource limits for each environment

# Exit on any error
set -e

# Default environment if not specified
DEPLOY_ENV=${DEPLOY_ENV:-"dev"}

# Relative paths to required files
INIT_CLUSTER_SCRIPT="./init-cluster.sh"
NAMESPACE_FILE="../kubernetes/base/namespace.yaml"
SECRETS_FILE="../kubernetes/base/secrets.yaml"
BACKEND_DEPLOYMENT="../kubernetes/apps/backend/deployment.yaml"
FRONTEND_DEPLOYMENT="../kubernetes/apps/frontend/deployment.yaml"

# Function to validate environment
validate_environment() {
    case "$DEPLOY_ENV" in
        dev|staging|prod)
            echo "Deploying to $DEPLOY_ENV environment"
            ;;
        *)
            echo "Error: Invalid environment. Must be one of: dev, staging, prod"
            exit 1
            ;;
    esac
}

# Function to deploy infrastructure using Terraform
deploy_infrastructure() {
    local env=$1
    echo "Deploying infrastructure for $env environment..."

    # Navigate to appropriate Terraform environment directory
    cd "../terraform/environments/$env"

    # Initialize Terraform
    terraform init -backend=true \
        -backend-config="bucket=terraform-state-$env" \
        -backend-config="key=state/$env/terraform.tfstate" \
        -backend-config="region=${AWS_REGION:-us-west-2}"

    # Apply Terraform configuration
    terraform apply -auto-approve \
        -var="environment=$env" \
        -var="aws_region=${AWS_REGION:-us-west-2}"

    if [ $? -eq 0 ]; then
        echo "✓ Infrastructure deployment successful"
        return 0
    else
        echo "✗ Infrastructure deployment failed"
        return 1
    fi
}

# Function to deploy applications to Kubernetes
deploy_applications() {
    echo "Deploying applications..."

    # Initialize Kubernetes cluster
    if [ -f "$INIT_CLUSTER_SCRIPT" ]; then
        chmod +x "$INIT_CLUSTER_SCRIPT"
        ./"$INIT_CLUSTER_SCRIPT"
    else
        echo "Error: init-cluster.sh script not found"
        exit 1
    fi

    # Apply namespace configuration
    if [ -f "$NAMESPACE_FILE" ]; then
        kubectl apply -f "$NAMESPACE_FILE"
        echo "✓ Namespace configuration applied"
    else
        echo "Error: namespace.yaml not found"
        exit 1
    fi

    # Apply secrets configuration
    if [ -f "$SECRETS_FILE" ]; then
        kubectl apply -f "$SECRETS_FILE"
        echo "✓ Secrets configuration applied"
    else
        echo "Error: secrets.yaml not found"
        exit 1
    fi

    # Deploy backend application
    if [ -f "$BACKEND_DEPLOYMENT" ]; then
        kubectl apply -f "$BACKEND_DEPLOYMENT"
        echo "✓ Backend deployment successful"
    else
        echo "Error: backend-deployment.yaml not found"
        exit 1
    fi

    # Deploy frontend application
    if [ -f "$FRONTEND_DEPLOYMENT" ]; then
        kubectl apply -f "$FRONTEND_DEPLOYMENT"
        echo "✓ Frontend deployment successful"
    else
        echo "Error: frontend-deployment.yaml not found"
        exit 1
    fi

    # Wait for deployments to be ready
    kubectl wait --for=condition=available --timeout=300s deployment -l app=backend
    kubectl wait --for=condition=available --timeout=300s deployment -l app=frontend

    echo "✓ All applications deployed successfully"
}

# Function to verify deployment
verify_deployment() {
    echo "Verifying deployment..."

    # Check backend health
    backend_status=$(kubectl get deployment -l app=backend -o jsonpath='{.items[0].status.availableReplicas}')
    if [ "$backend_status" -gt 0 ]; then
        echo "✓ Backend deployment verified"
    else
        echo "✗ Backend deployment verification failed"
        return 1
    fi

    # Check frontend health
    frontend_status=$(kubectl get deployment -l app=frontend -o jsonpath='{.items[0].status.availableReplicas}')
    if [ "$frontend_status" -gt 0 ]; then
        echo "✓ Frontend deployment verified"
    else
        echo "✗ Frontend deployment verification failed"
        return 1
    fi

    echo "✓ Deployment verification completed successfully"
    return 0
}

# Main execution
main() {
    echo "=== Workflow Automation Platform Deployment ==="
    echo "Starting deployment process for $DEPLOY_ENV environment..."

    # Validate environment
    validate_environment

    # Deploy infrastructure
    if deploy_infrastructure "$DEPLOY_ENV"; then
        echo "Infrastructure deployment completed successfully"
    else
        echo "Infrastructure deployment failed"
        exit 1
    fi

    # Deploy applications
    if deploy_applications; then
        echo "Application deployment completed successfully"
    else
        echo "Application deployment failed"
        exit 1
    fi

    # Verify deployment
    if verify_deployment; then
        echo "Deployment verification completed successfully"
    else
        echo "Deployment verification failed"
        exit 1
    fi

    echo "=== Deployment completed successfully ==="
}

# Execute main function
main

```

This script implements the deployment requirements by:

1. Validating the deployment environment (dev, staging, prod)
2. Deploying infrastructure using Terraform with environment-specific configurations
3. Deploying applications to Kubernetes using the provided manifests
4. Verifying the deployment status of both backend and frontend applications

The script includes error handling, logging, and verification steps to ensure proper deployment. It also includes comments for human tasks that need to be completed before running the script in production.

Remember to make the script executable with:
```bash
chmod +x infrastructure/scripts/deploy.sh