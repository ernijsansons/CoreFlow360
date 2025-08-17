import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { 
  RealTimePrivacyMonitor,
  DataSubjectRequestHandler,
  AIPrivacyRiskEngine,
  MultiJurisdictionCompliance
} from '@/lib/security/privacy-audit';
import { z } from 'zod';

const PrivacyEventSchema = z.object({
  eventType: z.enum(['consent_change', 'data_access', 'data_export', 'data_deletion', 'consent_violation', 'policy_update', 'breach_detection']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  metadata: z.record(z.any()).optional(),
  complianceImpact: z.enum(['none', 'minor', 'major', 'critical']),
  autoResolved: z.boolean().default(false),
  requiresAction: z.boolean().default(false)
});

const DataSubjectRequestSchema = z.object({
  type: z.enum(['access', 'export', 'delete', 'correction', 'restrict', 'object']),
  email: z.string().email(),
  jurisdiction: z.enum(['gdpr', 'ccpa', 'lgpd', 'pipeda']).optional(),
  dataCategories: z.array(z.string()).optional(),
  reason: z.string().optional(),
  verificationMethod: z.enum(['email', 'sms', 'identity_document']).optional()
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = session.user.tenantId || 'default';

    switch (action) {
      case 'metrics':
        return await getPrivacyMetrics(tenantId);
      
      case 'alerts':
        return await getPrivacyAlerts(tenantId);
      
      case 'risk-assessment':
        return await getPrivacyRiskAssessment(tenantId);
      
      case 'compliance-status':
        const jurisdictions = searchParams.get('jurisdictions')?.split(',') || ['gdpr'];
        return await getComplianceStatus(tenantId, jurisdictions);
      
      case 'data-flow-activity':
        const hours = parseInt(searchParams.get('hours') || '24');
        return await getDataFlowActivity(tenantId, hours);
      
      case 'user-behavior':
        const userId = searchParams.get('userId');
        const timeWindow = parseInt(searchParams.get('timeWindow') || '30');
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }
        return await getUserBehaviorAnalysis(tenantId, userId, timeWindow);
      
      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Privacy API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = session.user.tenantId || 'default';
    const userId = session.user.id;

    switch (action) {
      case 'track-event':
        return await trackPrivacyEvent(request, tenantId, userId);
      
      case 'submit-request':
        return await submitDataSubjectRequest(request, tenantId, userId);
      
      case 'verify-request':
        return await verifyDataSubjectRequest(request, tenantId);
      
      case 'predict-incidents':
        return await predictPrivacyIncidents(request, tenantId);
      
      case 'compliance-report':
        return await generateComplianceReport(request, tenantId);
      
      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Privacy API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getPrivacyMetrics(tenantId: string) {
  const monitor = new RealTimePrivacyMonitor(tenantId);
  const metrics = await monitor.getRealtimeMetrics();
  return NextResponse.json({ metrics });
}

async function getPrivacyAlerts(tenantId: string) {
  const monitor = new RealTimePrivacyMonitor(tenantId);
  const alerts = await monitor.getActiveAlerts();
  return NextResponse.json({ alerts });
}

async function getPrivacyRiskAssessment(tenantId: string) {
  const riskEngine = new AIPrivacyRiskEngine(tenantId);
  const assessment = await riskEngine.assessPrivacyRisks();
  return NextResponse.json({ assessment });
}

async function getComplianceStatus(tenantId: string, jurisdictions: string[]) {
  const compliance = new MultiJurisdictionCompliance(tenantId);
  
  // Mock data subject and business locations for assessment
  const dataSubjectLocations = ['EU', 'California', 'Brazil'];
  const businessLocations = ['United States', 'EU'];
  const dataProcessing = ['analytics', 'marketing', 'customer_support'];
  
  const assessment = await compliance.assessMultiJurisdictionCompliance(
    dataSubjectLocations,
    businessLocations,
    dataProcessing
  );
  
  return NextResponse.json({ compliance: assessment });
}

async function getDataFlowActivity(tenantId: string, hours: number) {
  const monitor = new RealTimePrivacyMonitor(tenantId);
  const activity = await monitor.getDataFlowActivity(hours);
  return NextResponse.json({ activity });
}

async function getUserBehaviorAnalysis(tenantId: string, userId: string, timeWindow: number) {
  const riskEngine = new AIPrivacyRiskEngine(tenantId);
  const analysis = await riskEngine.analyzeUserBehavior(userId, timeWindow);
  return NextResponse.json({ analysis });
}

async function trackPrivacyEvent(request: NextRequest, tenantId: string, userId: string) {
  const body = await request.json();
  const validatedEvent = PrivacyEventSchema.parse(body);
  
  const monitor = new RealTimePrivacyMonitor(tenantId);
  await monitor.trackPrivacyEvent({
    ...validatedEvent,
    tenantId,
    userId
  });
  
  return NextResponse.json({ success: true, message: 'Privacy event tracked successfully' });
}

async function submitDataSubjectRequest(request: NextRequest, tenantId: string, userId: string) {
  const body = await request.json();
  const validatedRequest = DataSubjectRequestSchema.parse(body);
  
  const requestHandler = new DataSubjectRequestHandler(tenantId);
  const requestId = await requestHandler.submitRequest({
    ...validatedRequest,
    userId
  });
  
  return NextResponse.json({ 
    success: true, 
    requestId, 
    message: 'Data subject request submitted successfully. You will receive a verification email shortly.' 
  });
}

async function verifyDataSubjectRequest(request: NextRequest, tenantId: string) {
  const body = await request.json();
  const { requestId, verificationCode } = body;
  
  if (!requestId || !verificationCode) {
    return NextResponse.json({ error: 'requestId and verificationCode are required' }, { status: 400 });
  }
  
  const requestHandler = new DataSubjectRequestHandler(tenantId);
  const verified = await requestHandler.verifyRequest(requestId, verificationCode);
  
  if (verified) {
    return NextResponse.json({ 
      success: true, 
      message: 'Request verified successfully. Processing will begin shortly.' 
    });
  } else {
    return NextResponse.json({ 
      error: 'Invalid verification code or request ID' 
    }, { status: 400 });
  }
}

async function predictPrivacyIncidents(request: NextRequest, tenantId: string) {
  const body = await request.json();
  const { timeframe } = body;
  
  if (!['week', 'month', 'quarter'].includes(timeframe)) {
    return NextResponse.json({ error: 'Invalid timeframe. Must be week, month, or quarter' }, { status: 400 });
  }
  
  const riskEngine = new AIPrivacyRiskEngine(tenantId);
  const prediction = await riskEngine.predictPrivacyIncidents(timeframe);
  
  return NextResponse.json({ prediction });
}

async function generateComplianceReport(request: NextRequest, tenantId: string) {
  const body = await request.json();
  const { jurisdictions } = body;
  
  if (!Array.isArray(jurisdictions) || jurisdictions.length === 0) {
    return NextResponse.json({ error: 'jurisdictions array is required' }, { status: 400 });
  }
  
  const compliance = new MultiJurisdictionCompliance(tenantId);
  const report = await compliance.generateComplianceReport(jurisdictions);
  
  return NextResponse.json({ report });
}