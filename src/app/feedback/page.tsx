/**
 * Customer Feedback Hub
 * Comprehensive feedback collection system with free templates
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Users, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Calendar,
  FileText,
  Video,
  Phone,
  Mail,
  Heart,
  Lightbulb,
  AlertTriangle,
  ThumbsUp
} from 'lucide-react'
import { GlowingButton } from '@/components/ui/GlowingButton'
import { useTrackEvent } from '@/components/analytics/AnalyticsProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const feedbackTypes = [
  {
    id: 'feature_request',
    title: 'Feature Request',
    description: 'Suggest new features or improvements',
    icon: Lightbulb,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-500/30'
  },
  {
    id: 'bug_report',
    title: 'Bug Report',
    description: 'Report issues or problems',
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-500/30'
  },
  {
    id: 'general_feedback',
    title: 'General Feedback',
    description: 'Share your thoughts and experiences',
    icon: MessageSquare,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'testimonial',
    title: 'Success Story',
    description: 'Share your success with CoreFlow360',
    icon: Heart,
    color: 'text-pink-400',
    bgColor: 'bg-pink-900/20',
    borderColor: 'border-pink-500/30'
  }
]

const interviewTypes = [
  {
    id: 'user_interview',
    title: 'User Experience Interview',
    duration: '30 minutes',
    description: 'Deep dive into your usage patterns and pain points',
    incentive: '$50 Amazon gift card',
    slots: 12
  },
  {
    id: 'feature_feedback',
    title: 'Feature Feedback Session',
    duration: '20 minutes', 
    description: 'Preview upcoming features and provide input',
    incentive: 'Early access to new features',
    slots: 8
  },
  {
    id: 'industry_expert',
    title: 'Industry Expert Interview',
    duration: '45 minutes',
    description: 'Share your industry expertise to shape our roadmap',
    incentive: '$100 Amazon gift card',
    slots: 5
  }
]

export default function FeedbackPage() {
  const { trackEvent } = useTrackEvent()
  const [activeTab, setActiveTab] = useState('feedback')

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-500/50 px-6 py-3 rounded-full mb-8">
              <Users className="w-5 h-5 text-violet-400" />
              <span className="text-violet-300 font-semibold">Your Voice Matters</span>
            </div>
            
            <h1 className="heading-hero gradient-text-ai mb-6">
              Help Shape the Future of
              <br />
              AI-Powered Business
            </h1>
            
            <p className="text-body-large text-gray-300 mb-12 max-w-3xl mx-auto">
              Your feedback directly influences our product roadmap. Share your insights, 
              report issues, request features, or join our research program to make 
              CoreFlow360 even better for your business.
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="flex space-x-1 bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('feedback')}
                className={`px-6 py-3 rounded-md transition-all duration-200 ${
                  activeTab === 'feedback'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Quick Feedback
              </button>
              <button
                onClick={() => setActiveTab('interview')}
                className={`px-6 py-3 rounded-md transition-all duration-200 ${
                  activeTab === 'interview'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Research Interviews
              </button>
              <button
                onClick={() => setActiveTab('survey')}
                className={`px-6 py-3 rounded-md transition-all duration-200 ${
                  activeTab === 'survey'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Surveys
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'feedback' && <FeedbackTab />}
            {activeTab === 'interview' && <InterviewTab />}
            {activeTab === 'survey' && <SurveyTab />}
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

function FeedbackTab() {
  const { trackEvent } = useTrackEvent()

  return (
    <div className="space-y-12">
      {/* Quick Feedback Options */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          What would you like to share?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {feedbackTypes.map((type) => (
            <FeedbackTypeCard key={type.id} type={type} />
          ))}
        </div>
      </div>

      {/* Feature Request Board */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-4">Public Feature Board</h3>
          <p className="text-gray-400">
            Vote on features, see what's coming next, and suggest new ideas
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="AI Voice Commands"
            description="Control CoreFlow360 with voice commands"
            votes={127}
            status="Under Review"
            statusColor="text-yellow-400"
          />
          <FeatureCard
            title="Mobile App"
            description="Native iOS and Android applications"
            votes={89}
            status="In Progress"
            statusColor="text-blue-400"
          />
          <FeatureCard
            title="Slack Integration"
            description="Get notifications and updates in Slack"
            votes={64}
            status="Planned"
            statusColor="text-gray-400"
          />
        </div>
        
        <div className="text-center mt-8">
          <GlowingButton 
            href="/feedback/features" 
            variant="outline"
            onClick={() => trackEvent('feature_board_clicked')}
          >
            View All Features →
          </GlowingButton>
        </div>
      </div>

      {/* Quick Rating */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-4">
          How would you rate CoreFlow360?
        </h3>
        <div className="flex justify-center space-x-2 mb-6">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => trackEvent('quick_rating_submitted', { rating })}
              className="w-12 h-12 rounded-full bg-gray-800 hover:bg-yellow-500 transition-colors duration-200 flex items-center justify-center"
            >
              <Star className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
          ))}
        </div>
        <p className="text-gray-400 text-sm">Your feedback helps us improve</p>
      </div>
    </div>
  )
}

function InterviewTab() {
  const { trackEvent } = useTrackEvent()

  return (
    <div className="space-y-12">
      {/* Interview Types */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Join Our Research Program
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Help us build better products by sharing your insights. All interviews 
          are conducted by our product team and come with thank-you incentives.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {interviewTypes.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      </div>

      {/* Why Participate */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          Why Participate in Our Research?
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BenefitCard
            icon={Lightbulb}
            title="Shape the Product"
            description="Your feedback directly influences our roadmap"
          />
          <BenefitCard
            icon={Heart}
            title="Thank You Rewards"
            description="Receive gift cards and early access"
          />
          <BenefitCard
            icon={Users}
            title="Meet the Team"
            description="Connect with our product and engineering teams"
          />
          <BenefitCard
            icon={Star}
            title="Early Access"
            description="Be first to try new features and improvements"
          />
        </div>
      </div>

      {/* Interview Schedule */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">
          Upcoming Interview Sessions
        </h3>
        
        <div className="space-y-4">
          <InterviewSlot
            date="January 15, 2024"
            time="2:00 PM - 2:30 PM PST"
            type="User Experience Interview"
            available={3}
          />
          <InterviewSlot
            date="January 18, 2024"
            time="10:00 AM - 10:45 AM PST"
            type="Industry Expert Interview"
            available={1}
          />
          <InterviewSlot
            date="January 22, 2024"
            time="3:00 PM - 3:20 PM PST"
            type="Feature Feedback Session"
            available={5}
          />
        </div>
      </div>
    </div>
  )
}

function SurveyTab() {
  const { trackEvent } = useTrackEvent()

  return (
    <div className="space-y-12">
      {/* Active Surveys */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Active Surveys
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SurveyCard
            title="Q1 2024 Product Priorities"
            description="Help us prioritize features for the next quarter"
            duration="3 minutes"
            responses={234}
            deadline="January 31, 2024"
            incentive="Entry to win iPad Pro"
            status="active"
          />
          <SurveyCard
            title="AI Feature Usage Survey"
            description="Tell us how you use our AI orchestration features"
            duration="5 minutes"
            responses={156}
            deadline="February 15, 2024"
            incentive="$25 gift card (guaranteed)"
            status="active"
          />
          <SurveyCard
            title="Industry-Specific Needs"
            description="Share your industry's unique requirements"
            duration="7 minutes"
            responses={89}
            deadline="February 28, 2024"
            incentive="Free premium month"
            status="active"
          />
        </div>
      </div>

      {/* Survey Templates */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          Survey Templates Library
        </h3>
        <p className="text-gray-400 text-center mb-8">
          Free survey templates you can use for your own customer research
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TemplateCard
            title="Net Promoter Score (NPS)"
            description="Measure customer loyalty and satisfaction"
            questions={3}
            downloadUrl="/templates/nps-survey.pdf"
          />
          <TemplateCard
            title="Feature Feedback Survey"
            description="Collect detailed feedback on specific features"
            questions={12}
            downloadUrl="/templates/feature-feedback.pdf"
          />
          <TemplateCard
            title="User Onboarding Survey"
            description="Understand the new user experience"
            questions={8}
            downloadUrl="/templates/onboarding-survey.pdf"
          />
          <TemplateCard
            title="Churn Prevention Survey"
            description="Identify why customers might leave"
            questions={10}
            downloadUrl="/templates/churn-survey.pdf"
          />
          <TemplateCard
            title="Beta Feedback Survey"
            description="Comprehensive beta testing feedback"
            questions={15}
            downloadUrl="/templates/beta-feedback.pdf"
          />
          <TemplateCard
            title="Industry Needs Assessment"
            description="Discover industry-specific requirements"
            questions={20}
            downloadUrl="/templates/industry-needs.pdf"
          />
        </div>
      </div>

      {/* Survey Best Practices */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">
          Survey Best Practices
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-white mb-4">Design Tips</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                Keep surveys under 10 questions when possible
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                Use a mix of multiple choice and open-ended questions
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                Test your survey with a small group first
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                Provide clear context for why you're asking
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Distribution Strategy</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                Send at optimal times (Tuesday-Thursday, 10am-2pm)
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                Follow up once after 1 week
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                Offer incentives for completion
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                Share results with participants
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeedbackTypeCard({ type }: { type: any }) {
  const { trackEvent } = useTrackEvent()

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={`${type.bgColor} border ${type.borderColor} rounded-xl p-6 cursor-pointer transition-all duration-200`}
      onClick={() => {
        trackEvent('feedback_type_selected', { type: type.id })
        // In production, this would navigate to the specific feedback form
      }}
    >
      <type.icon className={`w-8 h-8 ${type.color} mb-4`} />
      <h3 className="font-semibold text-white mb-2">{type.title}</h3>
      <p className="text-gray-400 text-sm mb-4">{type.description}</p>
      <div className="flex items-center text-violet-400 text-sm">
        Get Started <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </motion.div>
  )
}

function FeatureCard({ title, description, votes, status, statusColor }: any) {
  const { trackEvent } = useTrackEvent()

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-white">{title}</h4>
        <button 
          onClick={() => trackEvent('feature_voted', { feature: title })}
          className="flex items-center space-x-1 text-violet-400 hover:text-violet-300 transition-colors"
        >
          <ThumbsUp className="w-4 h-4" />
          <span className="text-sm">{votes}</span>
        </button>
      </div>
      <p className="text-gray-400 text-sm mb-3">{description}</p>
      <div className={`text-xs ${statusColor} font-medium`}>{status}</div>
    </div>
  )
}

function InterviewCard({ interview }: { interview: any }) {
  const { trackEvent } = useTrackEvent()

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-6"
    >
      <h3 className="font-semibold text-white mb-3">{interview.title}</h3>
      <div className="space-y-2 mb-6">
        <div className="flex items-center text-gray-400 text-sm">
          <Clock className="w-4 h-4 mr-2" />
          {interview.duration}
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <Users className="w-4 h-4 mr-2" />
          {interview.slots} slots available
        </div>
      </div>
      <p className="text-gray-300 text-sm mb-4">{interview.description}</p>
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-4">
        <div className="text-green-400 text-sm font-medium">Thank You:</div>
        <div className="text-green-300 text-sm">{interview.incentive}</div>
      </div>
      <GlowingButton 
        href={`/feedback/interview/${interview.id}`}
        className="w-full"
        onClick={() => trackEvent('interview_signup_clicked', { type: interview.id })}
      >
        Schedule Interview
      </GlowingButton>
    </motion.div>
  )
}

function BenefitCard({ icon: Icon, title, description }: any) {
  return (
    <div className="text-center">
      <Icon className="w-8 h-8 text-violet-400 mx-auto mb-3" />
      <h4 className="font-semibold text-white mb-2">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  )
}

function InterviewSlot({ date, time, type, available }: any) {
  return (
    <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
      <div>
        <div className="font-medium text-white">{type}</div>
        <div className="text-gray-400 text-sm">{date} • {time}</div>
      </div>
      <div className="text-right">
        <div className="text-green-400 text-sm">{available} spots left</div>
        <button className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
          Book Now →
        </button>
      </div>
    </div>
  )
}

function SurveyCard({ title, description, duration, responses, deadline, incentive, status }: any) {
  const { trackEvent } = useTrackEvent()

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-6"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-white">{title}</h3>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
        }`}>
          {status}
        </div>
      </div>
      
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Duration:</span>
          <span className="text-white">{duration}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Responses:</span>
          <span className="text-white">{responses}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Deadline:</span>
          <span className="text-white">{deadline}</span>
        </div>
      </div>
      
      <div className="bg-violet-900/20 border border-violet-500/30 rounded-lg p-3 mb-4">
        <div className="text-violet-400 text-sm font-medium">Reward:</div>
        <div className="text-violet-300 text-sm">{incentive}</div>
      </div>
      
      <GlowingButton 
        href={`/feedback/survey/${title.toLowerCase().replace(/\s+/g, '-')}`}
        className="w-full"
        onClick={() => trackEvent('survey_started', { survey: title })}
      >
        Take Survey
      </GlowingButton>
    </motion.div>
  )
}

function TemplateCard({ title, description, questions, downloadUrl }: any) {
  const { trackEvent } = useTrackEvent()

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h4 className="font-semibold text-white mb-2">{title}</h4>
      <p className="text-gray-400 text-sm mb-3">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-gray-500 text-xs">{questions} questions</span>
        <button 
          onClick={() => trackEvent('template_downloaded', { template: title })}
          className="text-violet-400 hover:text-violet-300 text-sm transition-colors"
        >
          Download →
        </button>
      </div>
    </div>
  )
}