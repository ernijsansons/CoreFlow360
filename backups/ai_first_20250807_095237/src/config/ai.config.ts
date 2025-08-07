// AI Configuration for CoreFlow360
export const AI_CONFIG = {
 providers: {
   openai: {
     apiKey: process.env.OPENAI_API_KEY!,
     defaultModel: 'gpt-4-turbo-preview',
     temperature: 0.7,
   },
   anthropic: {
     apiKey: process.env.ANTHROPIC_API_KEY!,
     defaultModel: 'claude-3-opus-20240229',
   },
 },
 features: {
   streaming: true,
   tokenTracking: true,
   costMonitoring: true,
   crossDeptCorrelation: true,
 },
 limits: {
   maxTokensPerRequest: 4000,
   maxRequestsPerMinute: 60,
   maxCostPerDay: 100,
 },
}
