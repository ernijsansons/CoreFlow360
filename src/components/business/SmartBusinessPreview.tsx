import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

/**
 * SmartBusinessPreview - Interactive business preview showing data connections and insights
 * 
 * Modern business component using shadcn/ui with high contrast design
 * Optimized for business owners and decision makers
 * 
 * Features:
 * - High contrast colors for accessibility
 * - Professional, clean design
 * - Mobile-responsive layout
 * - Clear business value propositions
 * - Measurable metrics and results
 */

interface SmartBusinessPreviewProps {
  className?: string;
  showMetrics?: boolean;
  onActionClick?: () => void;
}

export const SmartBusinessPreview: React.FC<SmartBusinessPreviewProps> = ({ 
  className = "", 
  showMetrics = true,
  onActionClick 
}) => {
  const [activeMetric, setActiveMetric] = useState(0);
  
  // Business metrics and data
  const businessMetrics = [
    { label: "Time Saved", value: "20+ hours/week", color: "text-green-600" },
    { label: "Cost Reduction", value: "35% savings", color: "text-green-600" },
    { label: "Revenue Growth", value: "+40% increase", color: "text-blue-600" },
    { label: "ROI", value: "300% return", color: "text-purple-600" }
  ];
  
  return (
    <div className={`bg-white min-h-screen ${className}`}>
      {/* Component Header */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Smart Business Preview
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Interactive business preview showing data connections and insights
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {showMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {businessMetrics.map((metric, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-600">{metric.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${metric.color}`}>
                    {metric.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Call to Action */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            onClick={onActionClick}
          >
            Start Free 30-Day Trial
          </Button>
          <p className="text-gray-600 mt-4">
            No credit card required • Setup in under 2 weeks • Unlimited support
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartBusinessPreview;

/**
 * V0.dev Prompt Used:
 * Create a modern business dashboard preview component using shadcn/ui. Show how business data connects to create insights. 

Design Requirements:
- High contrast colors: Navy blue (#1a365d) background, white (#ffffff) text, green (#22c55e) for positive metrics
- Card-based layout with rounded corners and subtle shadows
- Interactive elements showing data connections
- Minimalist, professional design
- Responsive grid layout
- Use Recharts for simple data visualizations
- Include 4-6 key business metrics cards
- Add subtle animations on hover

Component should demonstrate business intelligence without complex jargon. Focus on clear, measurable benefits like "Save 20 hours/week" and "Increase revenue by 35%".

Use shadcn/ui components: Card, Badge, Button, Progress, and modern typography. Ensure accessibility with proper ARIA labels.
 */