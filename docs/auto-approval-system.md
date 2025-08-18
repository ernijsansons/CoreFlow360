# CoreFlow360 Auto-Approval System

The auto-approval system eliminates the need for manual confirmation prompts during automated operations, making it perfect for CI/CD pipelines and unattended operations.

## Quick Start - No More "1- yes" or "2 yes all" Prompts

Instead of manually typing "yes" or pressing "1" for confirmations, you can now:

### Option 1: Use Auto-Confirm Flag
```bash
# Instead of: npm run dr:recover-db
npm run dr:recover-db:auto

# Instead of: npm run dr:full-recovery  
npm run dr:full-recovery:auto
```

### Option 2: Set Environment Variables
```bash
# Auto-approve all operations
export COREFLOW_AUTO_APPROVE=1
npm run dr:recover-db

# Auto-approve only database operations
export COREFLOW_AUTO_APPROVE_DB=1
npm run dr:recover-db

# Auto-approve only application operations
export COREFLOW_AUTO_APPROVE_APP=1
npm run dr:recover-app
```

### Option 3: Use Configuration File
Edit `.coreflow-auto-approval.json` to set environment-specific defaults.

## Available Scripts

### Manual Confirmation (Original)
- `npm run dr:assess` - Assess system status
- `npm run dr:recover-db` - Recover database (asks for confirmation)
- `npm run dr:recover-app` - Recover application (asks for confirmation)
- `npm run dr:full-recovery` - Full disaster recovery (asks for confirmation)
- `npm run dr:verify` - Verify system after recovery

### Auto-Approved Versions (New)
- `npm run dr:assess:auto` - Assess system status (no prompts)
- `npm run dr:recover-db:auto` - Recover database (no confirmation)
- `npm run dr:recover-app:auto` - Recover application (no confirmation)
- `npm run dr:full-recovery:auto` - Full disaster recovery (no confirmation)
- `npm run dr:verify:auto` - Verify system (no prompts)

## Environment Variables

### Global Auto-Approval
```bash
COREFLOW_AUTO_APPROVE=1          # Auto-approve ALL operations
CI=true                          # Automatically enables auto-approval
AUTO_CONFIRM=1                   # Legacy variable (still supported)
```

### Operation-Specific Auto-Approval
```bash
COREFLOW_AUTO_APPROVE_DB=1       # Auto-approve database operations only
COREFLOW_AUTO_APPROVE_APP=1      # Auto-approve application operations only
COREFLOW_AUTO_APPROVE_DEPLOY=1   # Auto-approve deployment operations only
```

## Configuration File

The `.coreflow-auto-approval.json` file allows you to set different auto-approval behaviors for different environments:

```json
{
  "environments": {
    "development": {
      "auto_approve_all": false,
      "auto_approve_database": false,
      "require_explicit_confirmation": true
    },
    "staging": {
      "auto_approve_all": false,
      "auto_approve_database": true,
      "auto_approve_application": true
    },
    "production": {
      "auto_approve_all": false,
      "require_explicit_confirmation": true,
      "confirmation_delay_seconds": 10
    },
    "ci": {
      "auto_approve_all": true
    }
  }
}
```

## Safety Features

### Audit Logging
All auto-approved operations are logged to `logs/auto-approval-audit.log`:
```
[2024-01-15 14:30:25] AUTO_APPROVAL: operation=recover-db, user=developer, env=development, session=12345, context=backup_file=backup_20240115.sql
```

### Environment Detection
- `development` - Requires explicit confirmation by default
- `staging` - Auto-approves non-destructive operations
- `production` - Requires explicit confirmation with delays
- `ci` - Auto-approves all operations when `CI=true`

### Destructive Operation Warnings
Even with auto-approval, destructive operations still log warnings:
```bash
Auto-approval enabled for FULL DISASTER RECOVERY - proceeding without confirmation
This is a destructive operation that may cause data loss!
```

## Usage in CI/CD

### GitHub Actions
```yaml
- name: Recover Database in CI
  run: npm run dr:recover-db:auto
  env:
    COREFLOW_AUTO_APPROVE_DB: 1
```

### Local Development
```bash
# Load auto-approval settings for current environment
source scripts/auto-approval-helper.sh

# Check current auto-approval status
bash scripts/auto-approval-helper.sh
```

## Migration from Manual Prompts

If you've been manually typing "yes" or selecting "1" for confirmations:

### Before (Manual)
```bash
$ npm run dr:recover-db
� This will replace your current database with backup data!
Are you sure you want to continue? (yes/no): yes  # ← You had to type this
```

### After (Auto-Approved)
```bash
$ npm run dr:recover-db:auto
Auto-approval enabled for database recovery - proceeding without confirmation
✅ Database recovery completed successfully
```

## Troubleshooting

### Auto-Approval Not Working
1. Check environment variables: `env | grep COREFLOW_AUTO`
2. Verify script version: `bash scripts/disaster-recovery.sh --help`
3. Check audit logs: `tail -f logs/auto-approval-audit.log`

### Still Getting Prompts
- Make sure you're using the `:auto` versions of scripts
- Verify environment variables are exported: `export COREFLOW_AUTO_APPROVE=1`
- Check that you're not running in production mode with safety overrides

### Configuration Not Loading
- Ensure `.coreflow-auto-approval.json` exists and is valid JSON
- Install `jq` for configuration parsing: `sudo apt-get install jq`
- Run the helper script: `bash scripts/auto-approval-helper.sh`

## Security Considerations

- Auto-approval is disabled by default in production
- All auto-approved operations are audited
- Destructive operations still log warnings
- Emergency contact information is maintained in the config
- Rollback mechanisms are preserved

## Command Reference

### Direct Script Usage
```bash
# With auto-confirm flag
bash scripts/disaster-recovery.sh --auto-confirm recover-db

# With environment variable
COREFLOW_AUTO_APPROVE=1 bash scripts/disaster-recovery.sh recover-db

# Load configuration helper
source scripts/auto-approval-helper.sh
```

This system eliminates the need to manually respond to "1- yes" or "2 yes all" prompts while maintaining safety and auditability.