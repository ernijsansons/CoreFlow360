# External Module Integration

This directory contains integration adapters for external ERP/CRM systems. 

## Architecture

CoreFlow360 integrates with external systems through:

1. **Plugin Adapters** (`/src/integrations/`) - TypeScript plugins that translate between CoreFlow360 and external APIs
2. **API Routes** (`/src/app/api/ai/`) - REST/GraphQL endpoints for external service communication
3. **Service Manager** (`/src/lib/external-services/`) - Health monitoring and circuit breakers
4. **Module Manager** (`/src/services/subscription/`) - Subscription-based module activation

## Supported Integrations

### Accounting & Finance
- **Bigcapital** - Open-source accounting (via REST API)
- **FinGPT** - Financial AI analysis (Python service)
- **FinRobot** - AI-powered financial forecasting

### CRM & Sales
- **Twenty** - Modern CRM (via GraphQL)
- **IDURAR** - ERP/CRM hybrid

### ERP Systems
- **Dolibarr** - Full ERP suite
- **ERPNext** - Enterprise resource planning

### Operations
- **Inventory** - Inventory management
- **Plane** - Project management

### Low-Code Platform
- **NocoBase** - Plugin orchestration framework

## Integration Methods

1. **Docker Containers**: Services like FinGPT run as separate containers
2. **REST APIs**: Most services communicate via REST
3. **GraphQL**: Modern services like Twenty use GraphQL
4. **Event Bus**: Cross-module communication via pub/sub

## Module Activation

Modules are activated based on tenant subscriptions:
```typescript
const activeModules = await moduleManager.getActiveModules(tenantId)
```

## Security

- All integrations maintain tenant isolation
- API keys/OAuth tokens stored encrypted
- Circuit breakers prevent cascade failures
- Health checks ensure service availability

## Development

To add a new integration:
1. Create a plugin in `/src/integrations/[service-name]/`
2. Add API routes in `/src/app/api/ai/[service-name]/`
3. Register in service manager
4. Update module mappings

Note: This directory should NOT contain full source code copies of external projects. Only integration adapters and minimal configuration files should be stored here.