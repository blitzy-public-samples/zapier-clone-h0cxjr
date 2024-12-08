#!/bin/bash

# Human Tasks:
# 1. Ensure kubectl is installed (v1.27+) and properly configured
# 2. Verify cluster has sufficient resources for the logging stack
# 3. Ensure persistent volume provisioner is configured for Elasticsearch storage
# 4. Review and adjust resource limits in manifest files if needed
# 5. Configure appropriate authentication credentials in secrets

# Requirement Addressed: Centralized Logging
# Location: Technical Specification/System Architecture/Monitoring and Observability
# Description: Automates the setup of a centralized logging stack to collect, store, 
# and visualize logs from various components of the Workflow Automation Platform.

# Set error handling
set -euo pipefail

# Global variables
LOGGING_NAMESPACE="logging"
ELASTICSEARCH_MANIFEST="../kubernetes/logging/elasticsearch.yaml"
FLUENTD_MANIFEST="../kubernetes/logging/fluentd.yaml"
KIBANA_MANIFEST="../kubernetes/logging/kibana.yaml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if kubectl is installed with correct version
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    }

    local version=$(kubectl version --client -o json | grep -o '"major":"[^"]*","minor":"[^"]*"' | grep -o '[0-9.]*' | head -1)
    if (( $(echo "$version < 1.27" | bc -l) )); then
        log_error "kubectl version must be 1.27 or higher. Current version: $version"
        exit 1
    }
}

# Function to create and verify namespace
create_namespace() {
    log_info "Creating logging namespace..."
    
    if kubectl get namespace "$LOGGING_NAMESPACE" &> /dev/null; then
        log_warn "Namespace $LOGGING_NAMESPACE already exists"
    else
        kubectl create namespace "$LOGGING_NAMESPACE"
        log_info "Namespace $LOGGING_NAMESPACE created successfully"
    fi
}

# Function to deploy the logging stack
deploy_logging_stack() {
    log_info "Deploying logging stack..."

    # Deploy Elasticsearch
    log_info "Deploying Elasticsearch..."
    kubectl apply -f "$ELASTICSEARCH_MANIFEST" -n "$LOGGING_NAMESPACE"

    # Wait for Elasticsearch to be ready
    log_info "Waiting for Elasticsearch StatefulSet to be ready..."
    kubectl rollout status statefulset/elasticsearch -n "$LOGGING_NAMESPACE" --timeout=600s

    # Deploy Fluentd
    log_info "Deploying Fluentd..."
    kubectl apply -f "$FLUENTD_MANIFEST" -n "$LOGGING_NAMESPACE"

    # Wait for Fluentd to be ready
    log_info "Waiting for Fluentd DaemonSet to be ready..."
    kubectl rollout status daemonset/fluentd -n "$LOGGING_NAMESPACE" --timeout=300s

    # Deploy Kibana
    log_info "Deploying Kibana..."
    kubectl apply -f "$KIBANA_MANIFEST" -n "$LOGGING_NAMESPACE"

    # Wait for Kibana to be ready
    log_info "Waiting for Kibana Deployment to be ready..."
    kubectl rollout status deployment/kibana -n "$LOGGING_NAMESPACE" --timeout=300s
}

# Function to verify the logging stack
verify_logging_stack() {
    log_info "Verifying logging stack components..."

    # Check Elasticsearch
    local es_status=$(kubectl get statefulset elasticsearch -n "$LOGGING_NAMESPACE" -o jsonpath='{.status.readyReplicas}')
    if [ "$es_status" -gt 0 ]; then
        log_info "Elasticsearch is running with $es_status ready replicas"
    else
        log_error "Elasticsearch is not ready"
        return 1
    fi

    # Check Fluentd
    local fluentd_status=$(kubectl get daemonset fluentd -n "$LOGGING_NAMESPACE" -o jsonpath='{.status.numberReady}')
    if [ "$fluentd_status" -gt 0 ]; then
        log_info "Fluentd is running on $fluentd_status nodes"
    else
        log_error "Fluentd is not ready"
        return 1
    fi

    # Check Kibana
    local kibana_status=$(kubectl get deployment kibana -n "$LOGGING_NAMESPACE" -o jsonpath='{.status.readyReplicas}')
    if [ "$kibana_status" -gt 0 ]; then
        log_info "Kibana is running with $kibana_status ready replicas"
    else
        log_error "Kibana is not ready"
        return 1
    fi

    # Verify service endpoints
    log_info "Verifying service endpoints..."
    kubectl get svc -n "$LOGGING_NAMESPACE"

    log_info "Logging stack verification completed successfully"
}

# Main execution
main() {
    log_info "Starting logging stack deployment..."

    # Check prerequisites
    check_prerequisites

    # Create namespace
    create_namespace

    # Deploy logging stack
    deploy_logging_stack

    # Verify deployment
    verify_logging_stack

    log_info "Logging stack deployment completed successfully"
    log_info "Kibana dashboard will be available at: http://localhost:5601 (after port-forwarding)"
    log_info "To access Kibana, run: kubectl port-forward svc/kibana 5601:5601 -n $LOGGING_NAMESPACE"
}

# Execute main function
main "$@"