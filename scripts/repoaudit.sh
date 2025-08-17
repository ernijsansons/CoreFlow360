#!/bin/bash

# RepoAudit Local Script for CoreFlow360
# Run security and compliance audits locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONFIG_FILE=".repoaudit.yaml"
REPORTS_DIR="reports/audit"
AUDIT_TYPES=("security" "compliance" "dependencies" "secrets" "quality" "infrastructure")

# Function to print colored output
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

# Function to check if RepoAudit is installed
check_repoaudit() {
    if ! command -v repoaudit &> /dev/null; then
        print_error "RepoAudit CLI is not installed."
        echo "Installing RepoAudit CLI..."
        npm install -g @repoaudit/cli
        if [ $? -ne 0 ]; then
            print_error "Failed to install RepoAudit CLI. Please install manually:"
            echo "npm install -g @repoaudit/cli"
            exit 1
        fi
    fi
    print_success "RepoAudit CLI is available"
}

# Function to create reports directory
setup_reports_dir() {
    if [ ! -d "$REPORTS_DIR" ]; then
        mkdir -p "$REPORTS_DIR"
        print_status "Created reports directory: $REPORTS_DIR"
    fi
}

# Function to run a specific audit
run_audit() {
    local audit_type=$1
    local output_file="$REPORTS_DIR/${audit_type}-report.json"
    
    print_status "Running $audit_type audit..."
    
    if repoaudit "$audit_type" \
        --config "$CONFIG_FILE" \
        --output "$output_file" \
        --format json; then
        print_success "$audit_type audit completed"
        
        # Count issues by severity
        if [ -f "$output_file" ]; then
            local critical=$(jq '.issues[] | select(.severity == "critical") | .id' "$output_file" 2>/dev/null | wc -l)
            local high=$(jq '.issues[] | select(.severity == "high") | .id' "$output_file" 2>/dev/null | wc -l)
            local medium=$(jq '.issues[] | select(.severity == "medium") | .id' "$output_file" 2>/dev/null | wc -l)
            local low=$(jq '.issues[] | select(.severity == "low") | .id' "$output_file" 2>/dev/null | wc -l)
            
            echo "  🔴 Critical: $critical"
            echo "  🟠 High: $high"
            echo "  🟡 Medium: $medium"
            echo "  🟢 Low: $low"
        fi
    else
        print_warning "$audit_type audit failed or returned issues"
    fi
}

# Function to generate summary report
generate_summary() {
    print_status "Generating summary report..."
    
    local summary_file="$REPORTS_DIR/audit-summary.md"
    local html_file="$REPORTS_DIR/audit-report.html"
    
    # Generate markdown summary
    if repoaudit report \
        --input "$REPORTS_DIR"/*.json \
        --output "$summary_file" \
        --format markdown; then
        print_success "Markdown summary generated: $summary_file"
    fi
    
    # Generate HTML report
    if repoaudit report \
        --input "$REPORTS_DIR"/*.json \
        --output "$html_file" \
        --format html; then
        print_success "HTML report generated: $html_file"
    fi
}

# Function to display summary
display_summary() {
    print_status "Audit Summary:"
    echo ""
    
    local total_critical=0
    local total_high=0
    local total_medium=0
    local total_low=0
    
    for audit_type in "${AUDIT_TYPES[@]}"; do
        local report_file="$REPORTS_DIR/${audit_type}-report.json"
        if [ -f "$report_file" ]; then
            local critical=$(jq '.issues[] | select(.severity == "critical") | .id' "$report_file" 2>/dev/null | wc -l)
            local high=$(jq '.issues[] | select(.severity == "high") | .id' "$report_file" 2>/dev/null | wc -l)
            local medium=$(jq '.issues[] | select(.severity == "medium") | .id' "$report_file" 2>/dev/null | wc -l)
            local low=$(jq '.issues[] | select(.severity == "low") | .id' "$report_file" 2>/dev/null | wc -l)
            
            total_critical=$((total_critical + critical))
            total_high=$((total_high + high))
            total_medium=$((total_medium + medium))
            total_low=$((total_low + low))
            
            echo "📊 $audit_type:"
            echo "  🔴 Critical: $critical"
            echo "  🟠 High: $high"
            echo "  🟡 Medium: $medium"
            echo "  🟢 Low: $low"
            echo ""
        fi
    done
    
    echo "🎯 Overall Summary:"
    echo "  🔴 Total Critical: $total_critical"
    echo "  🟠 Total High: $total_high"
    echo "  🟡 Total Medium: $total_medium"
    echo "  🟢 Total Low: $total_low"
    echo ""
    
    if [ $total_critical -gt 0 ]; then
        print_error "Critical issues found! Please review and fix immediately."
        exit 1
    elif [ $total_high -gt 0 ]; then
        print_warning "High priority issues found. Consider addressing these issues."
    else
        print_success "No critical or high priority issues found."
    fi
}

# Function to show help
show_help() {
    echo "RepoAudit Local Script for CoreFlow360"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -a, --all           Run all audits (default)"
    echo "  -s, --security      Run security audit only"
    echo "  -c, --compliance    Run compliance audit only"
    echo "  -d, --dependencies  Run dependencies audit only"
    echo "  -e, --secrets       Run secrets audit only"
    echo "  -q, --quality       Run code quality audit only"
    echo "  -i, --infrastructure Run infrastructure audit only"
    echo "  --summary-only      Show summary of existing reports only"
    echo ""
    echo "Examples:"
    echo "  $0                  # Run all audits"
    echo "  $0 -s               # Run security audit only"
    echo "  $0 --summary-only   # Show summary of existing reports"
}

# Main script
main() {
    echo "🔍 RepoAudit Security & Compliance Scanner"
    echo "=========================================="
    echo ""
    
    # Parse command line arguments
    local audit_type="all"
    local summary_only=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -a|--all)
                audit_type="all"
                shift
                ;;
            -s|--security)
                audit_type="security"
                shift
                ;;
            -c|--compliance)
                audit_type="compliance"
                shift
                ;;
            -d|--dependencies)
                audit_type="dependencies"
                shift
                ;;
            -e|--secrets)
                audit_type="secrets"
                shift
                ;;
            -q|--quality)
                audit_type="quality"
                shift
                ;;
            -i|--infrastructure)
                audit_type="infrastructure"
                shift
                ;;
            --summary-only)
                summary_only=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Check if config file exists
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Configuration file not found: $CONFIG_FILE"
        exit 1
    fi
    
    # Check RepoAudit installation
    check_repoaudit
    
    # Setup reports directory
    setup_reports_dir
    
    if [ "$summary_only" = true ]; then
        display_summary
        exit 0
    fi
    
    # Run audits
    if [ "$audit_type" = "all" ]; then
        print_status "Running all audits..."
        for audit in "${AUDIT_TYPES[@]}"; do
            run_audit "$audit"
            echo ""
        done
    else
        print_status "Running $audit_type audit..."
        run_audit "$audit_type"
    fi
    
    # Generate summary reports
    generate_summary
    
    # Display summary
    display_summary
    
    print_success "Audit completed! Check reports in: $REPORTS_DIR"
    echo ""
    echo "📋 Available reports:"
    echo "  📄 HTML Report: $REPORTS_DIR/audit-report.html"
    echo "  📝 Summary: $REPORTS_DIR/audit-summary.md"
    echo "  📊 Individual reports: $REPORTS_DIR/*-report.json"
}

# Run main function
main "$@"
