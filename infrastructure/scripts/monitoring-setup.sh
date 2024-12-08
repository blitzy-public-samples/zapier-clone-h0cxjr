#!/bin/bash

# Human Tasks:
# 1. Ensure kubectl is installed (v1.27+) and properly configured
# 2. Verify cluster admin access is available for RBAC operations
# 3. Replace placeholder values in YAML files:
#    - <namespace_name> with actual namespace
#    - <environment_label> with deployment environment
#    - <application_label> with application identifier
# 4. Configure Grafana admin credentials in secrets
# 5. Set up external alert notification channels (e.g., Slack webhook URLs)

# Requirement Addressed: Monitoring and Observability
# Location: Technical Specification/Cross-Cutting Concerns/Monitoring and Observability
# Description: Automates the deployment and configuration of monitoring tools to ensure 
# system metrics, logs, and alerts are collected and visualized.

set -euo pipefail

# Define relative paths to resource files
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="${SCRIPT_DIR}/../kubernetes"
MONITORING_DIR="${BASE_DIR}/monitoring"
BASE_RESOURCES_DIR="${BASE_DIR}/base"

# Define the monitoring namespace
export MONITORING_NAMESPACE="monitoring"

# Function to check if kubectl is installed with correct version
check_prerequisites() {
    echo "Checking prerequisites..."
    
    # Check kubectl installation
    if ! command -v kubectl &> /dev/null; then
        echo "Error: kubectl is not installed"
        exit 1
    }
    
    # Check kubectl version
    KUBECTL_VERSION=$(kubectl version --client -o json | grep -o '"major":"[^"]*","minor":"[^"]*"' | cut -d'"' -f4)
    if [[ "${KUBECTL_VERSION}" < "1.27" ]]; then
        echo "Error: kubectl version must be 1.27 or higher"
        exit 1
    }
}

# Function to create and verify namespace
setup_namespace() {
    echo "Setting up monitoring namespace..."
    
    # Apply namespace configuration
    kubectl apply -f "${BASE_RESOURCES_DIR}/namespace.yaml"
    
    # Wait for namespace to be active
    kubectl wait --for=condition=Active namespace/${MONITORING_NAMESPACE} --timeout=30s
}

# Function to apply ConfigMaps
setup_configmaps() {
    echo "Applying ConfigMaps..."
    kubectl apply -f "${BASE_RESOURCES_DIR}/configmap.yaml"
}

# Function to apply Secrets
setup_secrets() {
    echo "Applying Secrets..."
    kubectl apply -f "${BASE_RESOURCES_DIR}/secrets.yaml"
}

# Function to deploy Prometheus
deploy_prometheus() {
    echo "Deploying Prometheus..."
    kubectl apply -f "${MONITORING_DIR}/prometheus.yaml"
    
    # Wait for Prometheus deployment
    kubectl -n ${MONITORING_NAMESPACE} wait --for=condition=available deployment/prometheus-server --timeout=300s
}

# Function to deploy Grafana
deploy_grafana() {
    echo "Deploying Grafana..."
    kubectl apply -f "${MONITORING_DIR}/grafana.yaml"
    
    # Wait for Grafana deployment
    kubectl -n ${MONITORING_NAMESPACE} wait --for=condition=available deployment/grafana --timeout=300s
}

# Function to deploy Alertmanager
deploy_alertmanager() {
    echo "Deploying Alertmanager..."
    kubectl apply -f "${MONITORING_DIR}/alertmanager.yaml"
    
    # Wait for Alertmanager deployment
    kubectl -n ${MONITORING_NAMESPACE} wait --for=condition=available deployment/alertmanager --timeout=300s
}

# Function to verify monitoring stack health
verify_monitoring_stack() {
    echo "Verifying monitoring stack health..."
    
    # Check all pods are running
    if ! kubectl -n ${MONITORING_NAMESPACE} wait --for=condition=ready pod -l app=prometheus --timeout=60s; then
        echo "Error: Prometheus pods are not ready"
        return 1
    }
    
    if ! kubectl -n ${MONITORING_NAMESPACE} wait --for=condition=ready pod -l app=grafana --timeout=60s; then
        echo "Error: Grafana pods are not ready"
        return 1
    }
    
    if ! kubectl -n ${MONITORING_NAMESPACE} wait --for=condition=ready pod -l app=alertmanager --timeout=60s; then
        echo "Error: Alertmanager pods are not ready"
        return 1
    }
    
    return 0
}

# Main setup function
setup_monitoring() {
    echo "Starting monitoring setup..."
    
    check_prerequisites
    
    # Create monitoring namespace and base resources
    setup_namespace
    setup_configmaps
    setup_secrets
    
    # Deploy monitoring components
    deploy_prometheus
    deploy_grafana
    deploy_alertmanager
    
    # Verify monitoring stack
    if verify_monitoring_stack; then
        echo "Monitoring setup completed successfully"
        return 0
    else
        echo "Error: Monitoring setup failed"
        return 1
    fi
}

# Execute the setup
setup_monitoring