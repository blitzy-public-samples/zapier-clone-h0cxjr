#!/bin/bash

# Requirement Addressed: Cluster Initialization
# Location: Technical Specification/Infrastructure/Deployment Architecture
# Description: Automates the initialization of the Kubernetes cluster and applies essential configurations
# such as namespaces, RBAC policies, and service accounts.

# Human Tasks:
# 1. Set the KUBECONFIG environment variable to point to your cluster's kubeconfig file
# 2. Replace <namespace_name> in the YAML files with your actual namespace name
# 3. Replace <application_label> with your actual application identifier
# 4. Replace <environment_label> with your deployment environment (e.g., dev, staging, prod)
# 5. Configure proper SSL/TLS certificates for ingress in production environment

# Exit on any error
set -e

# Function to check if kubectl is installed
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        echo "Error: kubectl is not installed"
        exit 1
    fi
}

# Function to check if KUBECONFIG is set
check_kubeconfig() {
    if [ -z "$KUBECONFIG" ]; then
        echo "Error: KUBECONFIG environment variable is not set"
        exit 1
    fi
}

# Function to apply a Kubernetes resource file
apply_resource() {
    local resource_file=$1
    local resource_name=$(basename "$resource_file")
    
    echo "Applying $resource_name..."
    kubectl apply -f "$resource_file"
    
    if [ $? -eq 0 ]; then
        echo "✓ Successfully applied $resource_name"
    else
        echo "✗ Failed to apply $resource_name"
        exit 1
    fi
}

# Main initialization function
initialize_cluster() {
    local base_dir="infrastructure/kubernetes/base"
    
    # Array of resource files to apply in order
    local resources=(
        "namespace.yaml"
        "configmap.yaml"
        "secrets.yaml"
        "service-accounts.yaml"
        "rbac.yaml"
        "ingress.yaml"
    )
    
    echo "Starting cluster initialization..."
    
    # Check prerequisites
    check_kubectl
    check_kubeconfig
    
    # Apply each resource file
    for resource in "${resources[@]}"; do
        apply_resource "$base_dir/$resource"
        # Add a small delay between applications to prevent rate limiting
        sleep 2
    done
    
    echo "Cluster initialization completed successfully"
}

# Function to verify the cluster state
verify_cluster() {
    echo "Verifying cluster state..."
    
    # Check namespace
    kubectl get namespace workflow-platform &> /dev/null || {
        echo "Error: Namespace verification failed"
        exit 1
    }
    
    # Check configmaps
    kubectl get configmap workflow-platform-config -n workflow-platform &> /dev/null || {
        echo "Error: ConfigMap verification failed"
        exit 1
    }
    
    # Check secrets
    kubectl get secret workflow-platform-credentials -n workflow-platform &> /dev/null || {
        echo "Error: Secrets verification failed"
        exit 1
    }
    
    # Check service accounts
    kubectl get serviceaccount workflow-engine -n workflow-platform &> /dev/null || {
        echo "Error: ServiceAccount verification failed"
        exit 1
    }
    
    echo "✓ Cluster verification completed successfully"
}

# Main execution
main() {
    echo "=== Workflow Automation Platform Cluster Initialization ==="
    echo "Starting initialization process..."
    
    # Initialize the cluster
    initialize_cluster
    
    # Verify the cluster state
    verify_cluster
    
    echo "=== Initialization completed successfully ==="
}

# Execute main function
main

```

This script implements the cluster initialization requirements by:

1. Checking prerequisites (kubectl and KUBECONFIG)
2. Applying essential Kubernetes resources in the correct order:
   - Namespaces for logical separation
   - ConfigMaps for configuration data
   - Secrets for sensitive information
   - Service Accounts for pod identities
   - RBAC policies for access control
   - Ingress resources for traffic routing

3. Verifying the cluster state after initialization

The script includes error handling, logging, and verification steps to ensure proper cluster setup. It also includes comments for human tasks that need to be completed before running the script in production.

Remember to make the script executable with:
```bash
chmod +x infrastructure/scripts/init-cluster.sh