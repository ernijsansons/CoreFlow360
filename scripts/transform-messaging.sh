#!/bin/bash

# CoreFlow360 Messaging Transformation Script
# From: Consciousness/Neural terminology 
# To: Business Intelligence/Empire Building

echo "========================================"
echo "CoreFlow360 MESSAGING TRANSFORMATION"
echo "From: Consciousness/Neural Terminology"
echo "To: Business Intelligence/Empire Building"
echo "========================================"
echo ""

# Create backup directory
BACKUP_DIR="messaging-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Created backup directory: $BACKUP_DIR"

# Define transformation patterns
declare -A transformations=(
    ["consciousness"]="business intelligence"
    ["Consciousness"]="Business Intelligence"
    ["CONSCIOUSNESS"]="BUSINESS INTELLIGENCE"
    ["neural network"]="smart automation"
    ["Neural Network"]="Smart Automation"
    ["synaptic"]="intelligent"
    ["Synaptic"]="Intelligent"
    ["transcendent"]="advanced"
    ["Transcendent"]="Advanced"
    ["organism"]="platform"
    ["Organism"]="Platform"
    ["singularity"]="scale"
    ["Singularity"]="Scale"
)

# Files to process
FILES_TO_PROCESS=(
    "src/components/consciousness/*.tsx"
    "src/components/marketing/*.tsx"
    "src/components/pricing/*.tsx"
    "src/lib/consciousness/*.ts"
    "src/lib/ai/*consciousness*.ts"
    "src/consciousness/**/*.ts"
)

TOTAL_FILES=0
UPDATED_FILES=0

# Process each file pattern
for pattern in "${FILES_TO_PROCESS[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ]; then
            TOTAL_FILES=$((TOTAL_FILES + 1))
            
            # Create backup
            cp "$file" "$BACKUP_DIR/$(basename $file)"
            
            # Apply transformations
            TEMP_FILE="${file}.tmp"
            cp "$file" "$TEMP_FILE"
            
            HAS_CHANGES=false
            for old_term in "${!transformations[@]}"; do
                new_term="${transformations[$old_term]}"
                if grep -q "$old_term" "$TEMP_FILE"; then
                    sed -i "s/${old_term}/${new_term}/g" "$TEMP_FILE"
                    HAS_CHANGES=true
                fi
            done
            
            if [ "$HAS_CHANGES" = true ]; then
                mv "$TEMP_FILE" "$file"
                UPDATED_FILES=$((UPDATED_FILES + 1))
                echo "✓ Updated: $file"
            else
                rm "$TEMP_FILE"
            fi
        fi
    done
done

echo ""
echo "========================================"
echo "TRANSFORMATION COMPLETE"
echo "Files Processed: $TOTAL_FILES"
echo "Files Updated: $UPDATED_FILES"
echo "Backup Location: $BACKUP_DIR"
echo "========================================"

# Generate report
cat > messaging-transformation-report.md << EOF
# Messaging Transformation Report
Generated: $(date '+%Y-%m-%d %H:%M:%S')

## Summary
- **Files Processed**: $TOTAL_FILES
- **Files Updated**: $UPDATED_FILES
- **Backup Directory**: $BACKUP_DIR

## Transformations Applied
- 'consciousness' → 'business intelligence'
- 'neural network' → 'smart automation'
- 'synaptic' → 'intelligent'
- 'transcendent' → 'advanced'
- 'organism' → 'platform'
- 'singularity' → 'scale'

## Next Steps
1. Review updated files for context accuracy
2. Test all components for proper rendering
3. Update SEO metadata and page titles
4. Update marketing materials and documentation
5. Deploy changes to staging for testing
EOF

echo "Report generated: messaging-transformation-report.md"