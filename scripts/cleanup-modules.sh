#!/bin/bash

# CoreFlow360 Module Cleanup Script
# Removes wholesale copied external module code while preserving integrations

echo "CoreFlow360 External Module Cleanup"
echo "==================================="
echo ""
echo "This script will remove wholesale copied external module source code"
echo "while preserving the integration adapters in src/integrations/"
echo ""

# Create backup directory
BACKUP_DIR=".backup_modules_$(date +%Y%m%d_%H%M%S)"
echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# List of modules to clean up
MODULES=(
    "bigcapital"
    "nocobase"
    "plane"
    "twenty"
    "dolibarr"
    "erpnext"
    "fingpt"
    "finrobot"
    "idurar"
    "inventory"
)

# Backup and clean each module
for MODULE in "${MODULES[@]}"; do
    MODULE_PATH="src/modules/$MODULE"
    
    if [ -d "$MODULE_PATH" ]; then
        echo ""
        echo "Processing module: $MODULE"
        
        # Check for integration files that should be preserved
        INTEGRATION_FILES=()
        
        # Common integration file patterns
        if [ -f "$MODULE_PATH/api/integration.js" ]; then
            INTEGRATION_FILES+=("api/integration.js")
        fi
        if [ -f "$MODULE_PATH/api/integration.py" ]; then
            INTEGRATION_FILES+=("api/integration.py")
        fi
        if [ -f "$MODULE_PATH/api/integration.php" ]; then
            INTEGRATION_FILES+=("api/integration.php")
        fi
        if [ -f "$MODULE_PATH/api/integration.ts" ]; then
            INTEGRATION_FILES+=("api/integration.ts")
        fi
        
        # Backup the entire module
        echo "  - Backing up to $BACKUP_DIR/$MODULE"
        cp -r "$MODULE_PATH" "$BACKUP_DIR/"
        
        # Remove the module directory
        echo "  - Removing wholesale copied code"
        rm -rf "$MODULE_PATH"
        
        # Recreate with only integration files
        if [ ${#INTEGRATION_FILES[@]} -gt 0 ]; then
            echo "  - Preserving integration files:"
            mkdir -p "$MODULE_PATH"
            
            for FILE in "${INTEGRATION_FILES[@]}"; do
                FILE_DIR=$(dirname "$FILE")
                mkdir -p "$MODULE_PATH/$FILE_DIR"
                cp "$BACKUP_DIR/$MODULE/$FILE" "$MODULE_PATH/$FILE"
                echo "    • $FILE"
            done
            
            # Create a README for the module
            cat > "$MODULE_PATH/README.md" << EOF
# $MODULE Integration

This directory contains only the integration adapter for $MODULE.

The full $MODULE source code is not included in CoreFlow360. Instead, we integrate with $MODULE through:

1. **Plugin Adapter**: See \`/src/integrations/$MODULE/\`
2. **API Routes**: See \`/src/app/api/ai/$MODULE/\`
3. **External Service**: Deploy $MODULE separately and configure the connection

## Configuration

Set the following environment variables:
- \`${MODULE^^}_API_URL\`: API endpoint for $MODULE service
- \`${MODULE^^}_API_KEY\`: Authentication key (if required)

## Deployment

$MODULE should be deployed as a separate service. Options:
1. Docker container (recommended)
2. Cloud service
3. Self-hosted instance

Refer to the official $MODULE documentation for deployment instructions.
EOF
        else
            echo "  - No integration files to preserve"
        fi
    else
        echo "Module not found: $MODULE_PATH"
    fi
done

echo ""
echo "Cleanup complete!"
echo ""
echo "Summary:"
echo "- Backup created at: $BACKUP_DIR"
echo "- Integration files preserved in src/modules/"
echo "- Full source code removed"
echo ""
echo "Next steps:"
echo "1. Review the backup if you need to reference any code"
echo "2. Ensure all integrations still work properly"
echo "3. Update documentation as needed"
echo "4. Delete the backup when you're confident: rm -rf $BACKUP_DIR"