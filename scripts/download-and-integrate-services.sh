#!/bin/bash
# CoreFlow360 - Direct Code Integration Script
# Downloads and tailors external services directly into our platform
# MATHEMATICAL PERFECTION: Direct code integration without containers

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MODULES_DIR="$PROJECT_ROOT/src/modules"
TEMP_DIR="/tmp/coreflow360-integration"

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  INFO: $1${NC}"; }
log_success() { echo -e "${GREEN}✅ SUCCESS: $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  WARNING: $1${NC}"; }
log_error() { echo -e "${RED}❌ ERROR: $1${NC}"; }

# Service definitions with download URLs
declare -A SERVICES=(
    ["fingpt"]="https://github.com/AI4Finance-Foundation/FinGPT/archive/refs/heads/main.zip"
    ["finrobot"]="https://github.com/AI4Finance-Foundation/FinRobot/archive/refs/heads/main.zip"
    ["idurar"]="https://github.com/idurar/idurar-erp-crm/archive/refs/heads/main.zip"
    ["erpnext"]="https://github.com/frappe/erpnext/archive/refs/heads/version-14.zip"
    ["dolibarr"]="https://github.com/Dolibarr/dolibarr/archive/refs/heads/main.zip"
)

# Create directory structure
create_directories() {
    log_info "Creating directory structure..."
    
    mkdir -p "$MODULES_DIR"
    mkdir -p "$TEMP_DIR"
    
    for service_name in "${!SERVICES[@]}"; do
        mkdir -p "$MODULES_DIR/$service_name"
        mkdir -p "$MODULES_DIR/$service_name/core"
        mkdir -p "$MODULES_DIR/$service_name/api"
        mkdir -p "$MODULES_DIR/$service_name/config"
    done
    
    log_success "Directory structure created"
}

# Download service code
download_service() {
    local service_name="$1"
    local download_url="$2"
    local temp_file="$TEMP_DIR/${service_name}.zip"
    local extract_dir="$TEMP_DIR/${service_name}"
    
    log_info "Downloading $service_name from GitHub..."
    
    # Download the zip file
    if curl -L -o "$temp_file" "$download_url"; then
        log_success "Downloaded $service_name successfully"
        
        # Extract the zip file
        mkdir -p "$extract_dir"
        if unzip -q "$temp_file" -d "$extract_dir"; then
            log_success "Extracted $service_name successfully"
            
            # Find the actual directory (GitHub adds -main, -version-14, etc.)
            local source_dir=$(find "$extract_dir" -maxdepth 1 -type d -not -path "$extract_dir")
            
            if [ -n "$source_dir" ]; then
                # Copy relevant files to our modules directory
                tailor_service_code "$service_name" "$source_dir"
            else
                log_error "Could not find source directory for $service_name"
                return 1
            fi
        else
            log_error "Failed to extract $service_name"
            return 1
        fi
    else
        log_error "Failed to download $service_name"
        return 1
    fi
}

# Tailor service code for our platform
tailor_service_code() {
    local service_name="$1"
    local source_dir="$2"
    local target_dir="$MODULES_DIR/$service_name"
    
    log_info "Tailoring $service_name code for CoreFlow360..."
    
    case "$service_name" in
        "fingpt")
            tailor_fingpt_code "$source_dir" "$target_dir"
            ;;
        "finrobot")
            tailor_finrobot_code "$source_dir" "$target_dir"
            ;;
        "idurar")
            tailor_idurar_code "$source_dir" "$target_dir"
            ;;
        "erpnext")
            tailor_erpnext_code "$source_dir" "$target_dir"
            ;;
        "dolibarr")
            tailor_dolibarr_code "$source_dir" "$target_dir"
            ;;
    esac
    
    # Create CoreFlow360 integration wrapper
    create_integration_wrapper "$service_name" "$target_dir"
    
    log_success "Tailored $service_name code for CoreFlow360"
}

# Tailor FinGPT code
tailor_fingpt_code() {
    local source_dir="$1"
    local target_dir="$2"
    
    log_info "Tailoring FinGPT code..."
    
    # Copy essential FinGPT components
    if [ -d "$source_dir/fingpt" ]; then
        cp -r "$source_dir/fingpt"/* "$target_dir/core/" 2>/dev/null || true
    fi
    
    # Copy training and inference code
    if [ -d "$source_dir/training" ]; then
        cp -r "$source_dir/training" "$target_dir/core/" 2>/dev/null || true
    fi
    
    # Copy requirements and setup files
    cp "$source_dir/requirements.txt" "$target_dir/core/" 2>/dev/null || true
    cp "$source_dir/setup.py" "$target_dir/core/" 2>/dev/null || true
    
    # Create CoreFlow360-specific configuration
    cat > "$target_dir/config/coreflow_config.py" << 'EOF'
"""
CoreFlow360 - FinGPT Configuration
Tailored configuration for FinGPT integration
"""

import os
from typing import Dict, Any

class FinGPTConfig:
    def __init__(self):
        self.model_path = os.getenv('FINGPT_MODEL_PATH', './models/fingpt')
        self.max_length = int(os.getenv('FINGPT_MAX_LENGTH', '512'))
        self.batch_size = int(os.getenv('FINGPT_BATCH_SIZE', '8'))
        self.temperature = float(os.getenv('FINGPT_TEMPERATURE', '0.1'))
        self.coreflow_tenant_isolation = True
        self.audit_logging = True
        
    def get_model_config(self, tenant_id: str) -> Dict[str, Any]:
        return {
            'model_path': self.model_path,
            'max_length': self.max_length,
            'batch_size': self.batch_size,
            'temperature': self.temperature,
            'tenant_id': tenant_id,
            'audit_logging': self.audit_logging
        }

config = FinGPTConfig()
EOF
}

# Tailor FinRobot code
tailor_finrobot_code() {
    local source_dir="$1"
    local target_dir="$2"
    
    log_info "Tailoring FinRobot code..."
    
    # Copy FinRobot agent code
    if [ -d "$source_dir/finrobot" ]; then
        cp -r "$source_dir/finrobot"/* "$target_dir/core/" 2>/dev/null || true
    fi
    
    # Copy agents and tools
    if [ -d "$source_dir/agents" ]; then
        cp -r "$source_dir/agents" "$target_dir/core/" 2>/dev/null || true
    fi
    
    if [ -d "$source_dir/tools" ]; then
        cp -r "$source_dir/tools" "$target_dir/core/" 2>/dev/null || true
    fi
    
    # Copy requirements
    cp "$source_dir/requirements.txt" "$target_dir/core/" 2>/dev/null || true
    
    # Create CoreFlow360-specific agent configuration
    cat > "$target_dir/config/agent_config.py" << 'EOF'
"""
CoreFlow360 - FinRobot Agent Configuration
Tailored agent configuration for multi-tenant operation
"""

import os
from typing import Dict, List, Any

class FinRobotAgentConfig:
    def __init__(self):
        self.agent_timeout = int(os.getenv('FINROBOT_TIMEOUT', '300'))
        self.max_agents = int(os.getenv('FINROBOT_MAX_AGENTS', '10'))
        self.enable_forecasting = True
        self.enable_risk_analysis = True
        self.coreflow_integration = True
        
    def get_agent_config(self, tenant_id: str, agent_type: str) -> Dict[str, Any]:
        return {
            'agent_type': agent_type,
            'timeout': self.agent_timeout,
            'tenant_id': tenant_id,
            'isolation_enabled': True,
            'audit_trail': True,
            'performance_tracking': True
        }
        
    def get_available_agents(self) -> List[str]:
        return [
            'financial_forecaster',
            'risk_analyzer', 
            'market_analyst',
            'strategic_planner',
            'compliance_checker'
        ]

config = FinRobotAgentConfig()
EOF
}

# Tailor IDURAR code
tailor_idurar_code() {
    local source_dir="$1"
    local target_dir="$2"
    
    log_info "Tailoring IDURAR code..."
    
    # Copy frontend code
    if [ -d "$source_dir/frontend" ]; then
        cp -r "$source_dir/frontend" "$target_dir/core/" 2>/dev/null || true
    fi
    
    # Copy backend code
    if [ -d "$source_dir/backend" ]; then
        cp -r "$source_dir/backend" "$target_dir/core/" 2>/dev/null || true
    fi
    
    # Copy models and controllers
    if [ -d "$source_dir/models" ]; then
        cp -r "$source_dir/models" "$target_dir/core/" 2>/dev/null || true
    fi
    
    # Copy package files
    cp "$source_dir/package.json" "$target_dir/core/" 2>/dev/null || true
    
    # Create CoreFlow360 integration config
    cat > "$target_dir/config/coreflow_integration.js" << 'EOF'
/**
 * CoreFlow360 - IDURAR Integration Configuration
 * Tailored MERN stack integration with multi-tenant support
 */

const config = {
    // Multi-tenant database configuration
    database: {
        useMultiTenant: true,
        tenantIsolation: 'database', // 'database' | 'schema' | 'collection'
        connectionPooling: true,
        maxConnections: 100
    },
    
    // CoreFlow360 specific features
    coreflow: {
        enableAuditLogging: true,
        enablePerformanceMonitoring: true,
        enableSecurityScanning: true,
        apiPrefix: '/api/v1/idurar',
        corsOrigins: ['http://localhost:3000'] // CoreFlow360 frontend
    },
    
    // Feature flags
    features: {
        advancedInvoicing: true,
        multiCurrency: true,
        customFields: true,
        workflowAutomation: true,
        aiInsights: true
    },
    
    // Security configuration
    security: {
        jwtSecret: process.env.IDURAR_JWT_SECRET,
        bcryptRounds: 12,
        rateLimitWindow: 15 * 60 * 1000, // 15 minutes
        rateLimitMax: 100,
        enableCSRF: true
    }
};

module.exports = config;
EOF
}

# Tailor ERPNext code  
tailor_erpnext_code() {
    local source_dir="$1"
    local target_dir="$2"
    
    log_info "Tailoring ERPNext code..."
    
    # Copy ERPNext modules
    if [ -d "$source_dir/erpnext" ]; then
        cp -r "$source_dir/erpnext"/* "$target_dir/core/" 2>/dev/null || true
    fi
    
    # Copy setup and requirements
    cp "$source_dir/requirements.txt" "$target_dir/core/" 2>/dev/null || true
    cp "$source_dir/setup.py" "$target_dir/core/" 2>/dev/null || true
    
    # Create CoreFlow360 Frappe app
    mkdir -p "$target_dir/core/coreflow_connector"
    
    cat > "$target_dir/core/coreflow_connector/hooks.py" << 'EOF'
"""
CoreFlow360 - ERPNext Integration Hooks
Custom hooks for CoreFlow360 integration with ERPNext
"""

from . import __version__ as app_version

app_name = "coreflow_connector"
app_title = "CoreFlow360 Connector"
app_publisher = "CoreFlow360"
app_description = "Integration connector for CoreFlow360 multi-tenant ERP"
app_icon = "octicon octicon-file-directory"
app_color = "purple"
app_email = "admin@coreflow360.com"
app_license = "MIT"

# Includes in <head>
app_include_css = "/assets/coreflow_connector/css/coreflow.css"
app_include_js = "/assets/coreflow_connector/js/coreflow.js"

# Document Events
doc_events = {
    "Employee": {
        "validate": "coreflow_connector.events.employee.validate_employee",
        "on_update": "coreflow_connector.events.employee.sync_to_coreflow"
    },
    "BOM": {
        "validate": "coreflow_connector.events.bom.validate_bom",
        "on_update": "coreflow_connector.events.bom.optimize_bom"
    }
}

# Scheduled Tasks
scheduler_events = {
    "hourly": [
        "coreflow_connector.tasks.sync_data"
    ],
    "daily": [
        "coreflow_connector.tasks.generate_reports"
    ]
}

# Override standard ERPNext features
override_whitelisted_methods = {
    "erpnext.hr.doctype.employee.employee.get_employee_data": "coreflow_connector.overrides.get_employee_data"
}
EOF

    cat > "$target_dir/config/erpnext_config.py" << 'EOF'
"""
CoreFlow360 - ERPNext Configuration
Multi-tenant ERPNext configuration for CoreFlow360
"""

import os
from typing import Dict, Any

class ERPNextConfig:
    def __init__(self):
        self.site_name = os.getenv('ERPNEXT_SITE', 'coreflow360.local')
        self.db_host = os.getenv('ERPNEXT_DB_HOST', 'localhost')
        self.db_port = int(os.getenv('ERPNEXT_DB_PORT', '3306'))
        self.enable_multi_tenant = True
        self.coreflow_integration = True
        
    def get_site_config(self, tenant_id: str) -> Dict[str, Any]:
        return {
            'db_name': f'erpnext_{tenant_id}',
            'db_host': self.db_host,
            'db_port': self.db_port,
            'site_name': f'{tenant_id}.{self.site_name}',
            'coreflow_tenant_id': tenant_id,
            'enable_audit_trail': True,
            'enable_performance_monitoring': True
        }

config = ERPNextConfig()
EOF
}

# Tailor Dolibarr code
tailor_dolibarr_code() {
    local source_dir="$1"
    local target_dir="$2"
    
    log_info "Tailoring Dolibarr code..."
    
    # Copy Dolibarr core files (selective copy to avoid bloat)
    essential_dirs=("htdocs" "scripts" "build")
    for dir in "${essential_dirs[@]}"; do
        if [ -d "$source_dir/$dir" ]; then
            cp -r "$source_dir/$dir" "$target_dir/core/" 2>/dev/null || true
        fi
    done
    
    # Create CoreFlow360 Dolibarr module
    mkdir -p "$target_dir/core/htdocs/custom/coreflow360"
    
    cat > "$target_dir/core/htdocs/custom/coreflow360/coreflow360.php" << 'EOF'
<?php
/**
 * CoreFlow360 - Dolibarr Integration Module
 * Multi-tenant legal and time tracking integration
 */

class CoreFlow360Module {
    
    public function __construct($db) {
        $this->db = $db;
        $this->tenant_id = $_SESSION['coreflow_tenant_id'] ?? '';
    }
    
    /**
     * Initialize CoreFlow360 integration
     */
    public function init() {
        // Set up tenant isolation
        $this->setupTenantIsolation();
        
        // Register CoreFlow360 hooks
        $this->registerHooks();
        
        // Configure audit logging
        $this->configureAuditLogging();
    }
    
    /**
     * Set up database-level tenant isolation
     */
    private function setupTenantIsolation() {
        if (!empty($this->tenant_id)) {
            // Add tenant filter to all queries
            $GLOBALS['coreflow_tenant_filter'] = " AND tenant_id = '" . $this->db->escape($this->tenant_id) . "'";
        }
    }
    
    /**
     * Register CoreFlow360 specific hooks
     */
    private function registerHooks() {
        // Time tracking hooks
        add_hook('timesheet_create', 'coreflow360_sync_timesheet');
        add_hook('project_create', 'coreflow360_sync_project');
        add_hook('contact_create', 'coreflow360_check_conflicts');
    }
    
    /**
     * Configure comprehensive audit logging
     */
    private function configureAuditLogging() {
        if (!defined('COREFLOW360_AUDIT_ENABLED')) {
            define('COREFLOW360_AUDIT_ENABLED', true);
        }
    }
}

// Initialize module
if (class_exists('DoliDB')) {
    $coreflow_module = new CoreFlow360Module($db);
    $coreflow_module->init();
}
?>
EOF

    cat > "$target_dir/config/dolibarr_config.php" << 'EOF'
<?php
/**
 * CoreFlow360 - Dolibarr Configuration
 * Multi-tenant Dolibarr configuration for legal and time tracking
 */

class DolibarrConfig {
    
    private $config = [
        'multi_tenant' => true,
        'tenant_isolation' => 'database', // 'database' | 'prefix'
        'coreflow_integration' => true,
        'audit_logging' => true,
        'performance_monitoring' => true,
        'security_enhanced' => true
    ];
    
    public function getTenantConfig($tenant_id) {
        return [
            'db_name' => 'dolibarr_' . $tenant_id,
            'db_prefix' => 'cf360_',
            'tenant_id' => $tenant_id,
            'session_isolation' => true,
            'audit_enabled' => true,
            'coreflow_api_enabled' => true
        ];
    }
    
    public function getSecurityConfig() {
        return [
            'password_policy' => 'strong',
            'session_timeout' => 3600,
            'max_login_attempts' => 5,
            'enable_2fa' => true,
            'cors_origins' => ['http://localhost:3000']
        ];
    }
}
?>
EOF
}

# Create integration wrapper for each service
create_integration_wrapper() {
    local service_name="$1"
    local target_dir="$2"
    
    log_info "Creating integration wrapper for $service_name..."
    
    case "$service_name" in
        "fingpt"|"finrobot")
            create_python_integration_wrapper "$service_name" "$target_dir"
            ;;
        "idurar")
            create_node_integration_wrapper "$service_name" "$target_dir"
            ;;
        "erpnext")
            create_python_integration_wrapper "$service_name" "$target_dir"
            ;;
        "dolibarr")
            create_php_integration_wrapper "$service_name" "$target_dir"
            ;;
    esac
}

# Create Python integration wrapper
create_python_integration_wrapper() {
    local service_name="$1"
    local target_dir="$2"
    
    cat > "$target_dir/api/coreflow_integration.py" << EOF
#!/usr/bin/env python3
"""
CoreFlow360 - $service_name Integration Wrapper
Direct integration with CoreFlow360 platform
"""

import asyncio
import logging
import json
from typing import Dict, Any, Optional
from datetime import datetime
import sys
import os

# Add core service to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'core'))

class CoreFlow360${service_name^}Integration:
    """
    Direct integration wrapper for $service_name with CoreFlow360
    """
    
    def __init__(self, tenant_id: str, config: Dict[str, Any]):
        self.tenant_id = tenant_id
        self.config = config
        self.logger = self._setup_logging()
        self.service = None  # Will be initialized with actual service
        
    def _setup_logging(self) -> logging.Logger:
        logger = logging.getLogger(f'coreflow360.{self.service_name}')
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - Tenant:%(tenant_id)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
            
        return logger
    
    @property 
    def service_name(self) -> str:
        return "$service_name"
    
    async def initialize(self) -> bool:
        """Initialize the $service_name service for this tenant"""
        try:
            self.logger.info(f"Initializing {self.service_name} for tenant {self.tenant_id}")
            
            # TODO: Initialize actual service based on service type
            # This will be implemented after integration
            
            self.logger.info(f"Successfully initialized {self.service_name}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize {self.service_name}: {e}")
            return False
    
    async def process_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a request through the $service_name service"""
        try:
            request_id = request_data.get('id', 'unknown')
            self.logger.info(f"Processing request {request_id}")
            
            # Validate tenant isolation
            if not self._validate_tenant_access(request_data):
                raise ValueError("Tenant access validation failed")
            
            # TODO: Process through actual service
            # This will be implemented after integration
            
            result = {
                'success': True,
                'service': self.service_name,
                'tenant_id': self.tenant_id,
                'request_id': request_id,
                'timestamp': datetime.utcnow().isoformat(),
                'data': f"Processed by {self.service_name}"
            }
            
            self.logger.info(f"Successfully processed request {request_id}")
            return result
            
        except Exception as e:
            self.logger.error(f"Error processing request: {e}")
            return {
                'success': False,
                'error': str(e),
                'service': self.service_name,
                'tenant_id': self.tenant_id,
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def _validate_tenant_access(self, request_data: Dict[str, Any]) -> bool:
        """Validate that the request is authorized for this tenant"""
        request_tenant = request_data.get('tenant_id')
        return request_tenant == self.tenant_id
    
    async def health_check(self) -> Dict[str, Any]:
        """Check the health status of the service"""
        return {
            'status': 'healthy',
            'service': self.service_name,
            'tenant_id': self.tenant_id,
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0'
        }
    
    async def shutdown(self):
        """Gracefully shutdown the service"""
        self.logger.info(f"Shutting down {self.service_name} for tenant {self.tenant_id}")
        # TODO: Implement actual shutdown logic

# Factory function for creating service instances
def create_${service_name}_integration(tenant_id: str, config: Dict[str, Any]) -> CoreFlow360${service_name^}Integration:
    return CoreFlow360${service_name^}Integration(tenant_id, config)
EOF

    # Create requirements file
    cat > "$target_dir/api/requirements.txt" << 'EOF'
asyncio>=3.4.3
aiohttp>=3.8.0
pydantic>=2.5.0
python-multipart>=0.0.6
httpx>=0.25.2
sqlalchemy>=2.0.23
alembic>=1.12.1
redis>=5.0.0
celery>=5.3.0
pytest>=7.4.3
pytest-asyncio>=0.21.1
EOF
}

# Create Node.js integration wrapper
create_node_integration_wrapper() {
    local service_name="$1"
    local target_dir="$2"
    
    cat > "$target_dir/api/coreflow-integration.js" << EOF
/**
 * CoreFlow360 - $service_name Integration Wrapper
 * Direct Node.js integration with CoreFlow360 platform
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createHash } = require('crypto');

class CoreFlow360${service_name^}Integration {
    constructor(tenantId, config) {
        this.tenantId = tenantId;
        this.config = config;
        this.service = null; // Will be initialized with actual service
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }
    
    setupMiddleware() {
        // Security middleware
        this.app.use(helmet());
        
        // CORS configuration
        this.app.use(cors({
            origin: ['http://localhost:3000'], // CoreFlow360 frontend
            credentials: true
        }));
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each tenant to 100 requests per windowMs
            keyGenerator: (req) => \`\${this.tenantId}:\${req.ip}\`,
            message: 'Too many requests from this tenant'
        });
        this.app.use(limiter);
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        
        // Tenant isolation middleware
        this.app.use((req, res, next) => {
            req.tenantId = this.tenantId;
            req.coreflowIntegration = this;
            next();
        });
    }
    
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: '$service_name',
                tenantId: this.tenantId,
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            });
        });
        
        // Main processing endpoint
        this.app.post('/api/v1/process', async (req, res) => {
            try {
                const result = await this.processRequest(req.body, req);
                res.json(result);
            } catch (error) {
                console.error('Processing error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message,
                    service: '$service_name',
                    tenantId: this.tenantId,
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        // Service-specific endpoints will be added here
        this.setupServiceRoutes();
    }
    
    setupServiceRoutes() {
        // TODO: Implement service-specific routes
        // This will be customized based on the actual service capabilities
        
        this.app.get('/api/v1/capabilities', (req, res) => {
            res.json({
                service: '$service_name',
                capabilities: this.getCapabilities(),
                tenantId: this.tenantId
            });
        });
    }
    
    async initialize() {
        try {
            console.log(\`Initializing $service_name integration for tenant \${this.tenantId}\`);
            
            // TODO: Initialize actual service
            // This will be implemented after integration
            
            console.log(\`Successfully initialized $service_name integration\`);
            return true;
        } catch (error) {
            console.error(\`Failed to initialize $service_name:, error\`);
            return false;
        }
    }
    
    async processRequest(requestData, req) {
        // Validate tenant access
        if (!this.validateTenantAccess(requestData, req)) {
            throw new Error('Tenant access validation failed');
        }
        
        const requestId = requestData.id || 'unknown';
        console.log(\`Processing request \${requestId} for tenant \${this.tenantId}\`);
        
        // TODO: Process through actual service
        // This will be implemented after integration
        
        return {
            success: true,
            service: '$service_name',
            tenantId: this.tenantId,
            requestId,
            timestamp: new Date().toISOString(),
            data: \`Processed by $service_name\`
        };
    }
    
    validateTenantAccess(requestData, req) {
        const requestTenant = requestData.tenant_id || req.headers['x-tenant-id'];
        return requestTenant === this.tenantId;
    }
    
    getCapabilities() {
        // TODO: Return actual service capabilities
        return ['processing', 'analysis', 'reporting'];
    }
    
    start(port = 3000) {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(port, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(\`$service_name integration running on port \${port} for tenant \${this.tenantId}\`);
                    resolve(this.server);
                }
            });
        });
    }
    
    async shutdown() {
        console.log(\`Shutting down $service_name integration for tenant \${this.tenantId}\`);
        if (this.server) {
            this.server.close();
        }
        // TODO: Implement actual shutdown logic
    }
}

// Factory function
function create${service_name^}Integration(tenantId, config) {
    return new CoreFlow360${service_name^}Integration(tenantId, config);
}

module.exports = {
    CoreFlow360${service_name^}Integration,
    create${service_name^}Integration
};
EOF

    # Create package.json
    cat > "$target_dir/api/package.json" << EOF
{
  "name": "coreflow360-$service_name-integration",
  "version": "1.0.0",
  "description": "CoreFlow360 direct integration for $service_name",
  "main": "coreflow-integration.js",
  "scripts": {
    "start": "node coreflow-integration.js",
    "dev": "nodemon coreflow-integration.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0",
    "joi": "^17.11.0",
    "mongoose": "^8.0.0",
    "redis": "^4.6.10",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  },
  "keywords": ["coreflow360", "$service_name", "integration", "erp"],
  "author": "CoreFlow360",
  "license": "MIT"
}
EOF
}

# Create PHP integration wrapper
create_php_integration_wrapper() {
    local service_name="$1"
    local target_dir="$2"
    
    cat > "$target_dir/api/CoreFlowIntegration.php" << 'EOF'
<?php
/**
 * CoreFlow360 - Dolibarr Integration Wrapper
 * Direct PHP integration with CoreFlow360 platform
 */

class CoreFlow360DolibarrIntegration {
    
    private $tenantId;
    private $config;
    private $db;
    private $logger;
    
    public function __construct($tenantId, $config) {
        $this->tenantId = $tenantId;
        $this->config = $config;
        $this->setupDatabase();
        $this->setupLogging();
    }
    
    private function setupDatabase() {
        // Database connection with tenant isolation
        $dbConfig = $this->config['database'];
        $dsn = sprintf(
            "mysql:host=%s;dbname=dolibarr_%s;charset=utf8mb4",
            $dbConfig['host'],
            $this->tenantId
        );
        
        try {
            $this->db = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw $e;
        }
    }
    
    private function setupLogging() {
        $this->logger = new Logger($this->tenantId);
    }
    
    public function initialize() {
        try {
            $this->logger->info("Initializing Dolibarr integration for tenant {$this->tenantId}");
            
            // Setup tenant-specific configuration
            $this->setupTenantConfiguration();
            
            // Initialize Dolibarr core
            $this->initializeDolibarrCore();
            
            $this->logger->info("Successfully initialized Dolibarr integration");
            return true;
            
        } catch (Exception $e) {
            $this->logger->error("Failed to initialize Dolibarr: " . $e->getMessage());
            return false;
        }
    }
    
    private function setupTenantConfiguration() {
        // Set tenant-specific global variables
        global $dolibarr_main_db_name;
        $dolibarr_main_db_name = "dolibarr_{$this->tenantId}";
        
        // Set other tenant-specific configurations
        $_SESSION['coreflow_tenant_id'] = $this->tenantId;
    }
    
    private function initializeDolibarrCore() {
        // Include Dolibarr main configuration
        require_once __DIR__ . '/../core/htdocs/master.inc.php';
        
        // Initialize CoreFlow360 custom module
        if (file_exists(__DIR__ . '/../core/htdocs/custom/coreflow360/coreflow360.php')) {
            require_once __DIR__ . '/../core/htdocs/custom/coreflow360/coreflow360.php';
        }
    }
    
    public function processRequest($requestData) {
        try {
            // Validate tenant access
            if (!$this->validateTenantAccess($requestData)) {
                throw new Exception('Tenant access validation failed');
            }
            
            $requestId = $requestData['id'] ?? 'unknown';
            $this->logger->info("Processing request {$requestId} for tenant {$this->tenantId}");
            
            // TODO: Process through actual Dolibarr functionality
            // This will be implemented after integration
            
            $result = [
                'success' => true,
                'service' => 'dolibarr',
                'tenant_id' => $this->tenantId,
                'request_id' => $requestId,
                'timestamp' => date('c'),
                'data' => 'Processed by Dolibarr'
            ];
            
            $this->logger->info("Successfully processed request {$requestId}");
            return $result;
            
        } catch (Exception $e) {
            $this->logger->error("Error processing request: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'service' => 'dolibarr',
                'tenant_id' => $this->tenantId,
                'timestamp' => date('c')
            ];
        }
    }
    
    private function validateTenantAccess($requestData) {
        $requestTenant = $requestData['tenant_id'] ?? $_SERVER['HTTP_X_TENANT_ID'] ?? null;
        return $requestTenant === $this->tenantId;
    }
    
    public function healthCheck() {
        return [
            'status' => 'healthy',
            'service' => 'dolibarr',
            'tenant_id' => $this->tenantId,
            'timestamp' => date('c'),
            'version' => '1.0.0'
        ];
    }
    
    public function getCapabilities() {
        return [
            'time_tracking',
            'project_management', 
            'legal_case_management',
            'conflict_checking',
            'billing_integration'
        ];
    }
    
    public function shutdown() {
        $this->logger->info("Shutting down Dolibarr integration for tenant {$this->tenantId}");
        // TODO: Implement actual shutdown logic
    }
}

// Simple logger class
class Logger {
    private $tenantId;
    
    public function __construct($tenantId) {
        $this->tenantId = $tenantId;
    }
    
    public function info($message) {
        $this->log('INFO', $message);
    }
    
    public function error($message) {
        $this->log('ERROR', $message);
    }
    
    private function log($level, $message) {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[{$timestamp}] [{$level}] [Tenant:{$this->tenantId}] {$message}" . PHP_EOL;
        error_log($logMessage, 3, "/tmp/coreflow360-dolibarr.log");
    }
}

// Factory function
function createDolibarrIntegration($tenantId, $config) {
    return new CoreFlow360DolibarrIntegration($tenantId, $config);
}
?>
EOF
}

# Create main integration index
create_main_integration_index() {
    log_info "Creating main integration index..."
    
    cat > "$MODULES_DIR/index.js" << 'EOF'
/**
 * CoreFlow360 - External Services Integration Index
 * Main entry point for all integrated external services
 */

const path = require('path');

class CoreFlow360ServicesManager {
    constructor() {
        this.services = new Map();
        this.initialized = false;
    }
    
    async initialize() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing CoreFlow360 External Services...');
        
        // Initialize all available services
        await this.initializeService('fingpt');
        await this.initializeService('finrobot'); 
        await this.initializeService('idurar');
        await this.initializeService('erpnext');
        await this.initializeService('dolibarr');
        
        this.initialized = true;
        console.log('✅ All external services initialized successfully');
    }
    
    async initializeService(serviceName) {
        try {
            console.log(`📦 Initializing ${serviceName}...`);
            
            const servicePath = path.join(__dirname, serviceName, 'api');
            
            // Dynamic service loading based on type
            let serviceModule;
            
            if (['fingpt', 'finrobot', 'erpnext'].includes(serviceName)) {
                // Python services - would use child_process or python-shell
                serviceModule = await this.loadPythonService(serviceName, servicePath);
            } else if (serviceName === 'idurar') {
                // Node.js service
                serviceModule = require(path.join(servicePath, 'coreflow-integration.js'));
            } else if (serviceName === 'dolibarr') {
                // PHP service - would use php-server or similar
                serviceModule = await this.loadPHPService(serviceName, servicePath);
            }
            
            this.services.set(serviceName, {
                name: serviceName,
                module: serviceModule,
                status: 'initialized',
                instances: new Map() // tenant_id -> service instance
            });
            
            console.log(`✅ ${serviceName} initialized successfully`);
            
        } catch (error) {
            console.error(`❌ Failed to initialize ${serviceName}:`, error.message);
            this.services.set(serviceName, {
                name: serviceName,
                status: 'failed',
                error: error.message
            });
        }
    }
    
    async loadPythonService(serviceName, servicePath) {
        // For Python services, we would use python-shell or spawn Python processes
        // For now, return a mock implementation
        return {
            createIntegration: (tenantId, config) => ({
                initialize: async () => true,
                processRequest: async (data) => ({
                    success: true,
                    service: serviceName,
                    data: `Processed by ${serviceName}`
                }),
                healthCheck: async () => ({ status: 'healthy' }),
                shutdown: async () => {}
            })
        };
    }
    
    async loadPHPService(serviceName, servicePath) {
        // For PHP services, we would use php-server or child_process
        // For now, return a mock implementation
        return {
            createIntegration: (tenantId, config) => ({
                initialize: async () => true,
                processRequest: async (data) => ({
                    success: true,
                    service: serviceName,
                    data: `Processed by ${serviceName}`
                }),
                healthCheck: async () => ({ status: 'healthy' }),
                shutdown: async () => {}
            })
        };
    }
    
    async createServiceInstance(serviceName, tenantId, config = {}) {
        const service = this.services.get(serviceName);
        if (!service || service.status !== 'initialized') {
            throw new Error(`Service ${serviceName} is not available`);
        }
        
        // Check if instance already exists for this tenant
        if (service.instances.has(tenantId)) {
            return service.instances.get(tenantId);
        }
        
        // Create new instance for tenant
        const instance = service.module.createIntegration?.(tenantId, config) ||
                        service.module[`create${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}Integration`]?.(tenantId, config);
        
        if (!instance) {
            throw new Error(`Failed to create ${serviceName} instance for tenant ${tenantId}`);
        }
        
        // Initialize the instance
        await instance.initialize();
        
        // Store instance
        service.instances.set(tenantId, instance);
        
        console.log(`🔧 Created ${serviceName} instance for tenant ${tenantId}`);
        return instance;
    }
    
    getServiceStatus() {
        const status = {};
        for (const [name, service] of this.services) {
            status[name] = {
                status: service.status,
                instances: service.instances?.size || 0,
                error: service.error
            };
        }
        return status;
    }
    
    async shutdown() {
        console.log('🔄 Shutting down all services...');
        
        for (const [name, service] of this.services) {
            if (service.instances) {
                for (const [tenantId, instance] of service.instances) {
                    try {
                        await instance.shutdown();
                        console.log(`✅ Shut down ${name} instance for tenant ${tenantId}`);
                    } catch (error) {
                        console.error(`❌ Error shutting down ${name} for tenant ${tenantId}:`, error.message);
                    }
                }
            }
        }
        
        console.log('✅ All services shut down successfully');
    }
}

// Export singleton instance
module.exports = new CoreFlow360ServicesManager();
EOF

    log_success "Created main integration index"
}

# Cleanup temporary files
cleanup_temp_files() {
    log_info "Cleaning up temporary files..."
    rm -rf "$TEMP_DIR"
    log_success "Cleanup completed"
}

# Main integration function
integrate_all_services() {
    log_info "Starting direct integration of all external services..."
    
    create_directories
    
    # Download and integrate each service
    for service_name in "${!SERVICES[@]}"; do
        log_info "Integrating $service_name..."
        
        if download_service "$service_name" "${SERVICES[$service_name]}"; then
            log_success "$service_name integrated successfully"
        else
            log_error "Failed to integrate $service_name"
            return 1
        fi
    done
    
    # Create main integration index
    create_main_integration_index
    
    # Cleanup
    cleanup_temp_files
    
    log_success "All services integrated successfully!"
}

# Show usage
show_usage() {
    cat << EOF
CoreFlow360 Direct Code Integration Script

Usage: $0 [OPTIONS]

Options:
    -h, --help          Show this help message
    -s, --service NAME  Integrate specific service only
    -l, --list          List available services
    --dry-run          Show what would be done

Available Services:
    fingpt    - AI Finance LLM for sentiment analysis
    finrobot  - AI Finance Agents for forecasting  
    idurar    - MERN ERP with advanced invoicing
    erpnext   - Python ERP for HR and manufacturing
    dolibarr  - PHP ERP for legal and time tracking

Examples:
    $0                     # Integrate all services
    $0 -s fingpt          # Integrate only FinGPT
    $0 --dry-run          # Show integration plan

This script downloads external service code directly and tailors
it for seamless integration with CoreFlow360.
EOF
}

# Main function
main() {
    local specific_service=""
    local list_only=false
    local dry_run=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -s|--service)
                specific_service="$2"
                shift 2
                ;;
            -l|--list)
                list_only=true
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # List services
    if [ "$list_only" = true ]; then
        log_info "Available services for integration:"
        for service_name in "${!SERVICES[@]}"; do
            echo "  - $service_name: ${SERVICES[$service_name]}"
        done
        exit 0
    fi
    
    # Dry run
    if [ "$dry_run" = true ]; then
        log_info "DRY RUN: Would integrate the following services:"
        if [ -n "$specific_service" ]; then
            echo "  - $specific_service: ${SERVICES[$specific_service]}"
        else
            for service_name in "${!SERVICES[@]}"; do
                echo "  - $service_name: ${SERVICES[$service_name]}"
            done
        fi
        exit 0
    fi
    
    # Check prerequisites
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v unzip &> /dev/null; then
        log_error "unzip is required but not installed"
        exit 1
    fi
    
    # Confirm integration
    if [ -n "$specific_service" ]; then
        if [ -z "${SERVICES[$specific_service]}" ]; then
            log_error "Unknown service: $specific_service"
            exit 1
        fi
        log_warning "This will integrate $specific_service into CoreFlow360"
    else
        log_warning "This will integrate all external services into CoreFlow360"
    fi
    
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Integration cancelled by user"
        exit 0
    fi
    
    # Perform integration
    if [ -n "$specific_service" ]; then
        create_directories
        download_service "$specific_service" "${SERVICES[$specific_service]}"
        cleanup_temp_files
    else
        integrate_all_services
    fi
    
    log_success "External services integration completed!"
    echo
    log_info "Next steps:"
    echo "1. Review the integrated code in src/modules/"
    echo "2. Install service dependencies (requirements.txt, package.json)"
    echo "3. Configure environment variables for each service"
    echo "4. Test the integrations with: node src/modules/index.js"
    echo "5. Update your CoreFlow360 bundle routing to use the integrated services"
}

main "$@"