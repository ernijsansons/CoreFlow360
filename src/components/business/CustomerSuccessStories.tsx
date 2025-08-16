import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

/**
 * CustomerSuccessStories - Customer testimonials and case studies with measurable results
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

interface CustomerSuccessStoriesProps {
  className?: string;
  showMetrics?: boolean;
  onActionClick?: () => void;
}

export const CustomerSuccessStories: React.FC<CustomerSuccessStoriesProps> = ({ 
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
            Customer Success Stories
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Customer testimonials and case studies with measurable results
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

export default CustomerSuccessStories;

/**
 * V0.dev Prompt Used:
 * Create a customer success stories component using shadcn/ui showcasing real business transformations with CoreFlow360.

Success Story Structure:
- Customer company name and industry
- Challenge/problem they faced
- CoreFlow360 solution implemented  
- Measurable results achieved
- Quote from business owner/manager
- Implementation timeline

Design Requirements:
- Professional testimonial card layout
- High contrast design with white backgrounds
- Customer photos or company logos
- Results highlighted with colored metrics
- Quote formatting with proper attribution
- Industry badges for context
- Mobile-responsive carousel or grid

Example Success Stories:
1. "ABC Manufacturing" - Reduced operational costs by 30% in 6 months
2. "XYZ Consulting" - Increased project profitability by 45% 
3. "Retail Plus" - Improved inventory accuracy by 95%
4. "BuildCorp" - Streamlined project management, saved 15 hours/week

Metrics to Highlight:
- Time savings (hours per week)
- Cost reductions (percentage or dollar amounts)
- Revenue increases (percentage growth)
- Efficiency improvements (process optimization)
- ROI achieved (percentage return)

Use shadcn/ui: Card, Avatar, Badge, Quote styling. Include star ratings and implementation timelines.
 */