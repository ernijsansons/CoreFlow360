"use client"

import { Brain } from "lucide-react"

export function AIDashboard() {
 const aiMetrics = [
   { name: "Customer Health Score", value: 87 },
   { name: "Churn Prediction Accuracy", value: 94 },
   { name: "Deal Forecast Confidence", value: 91 },
   { name: "Cross-Dept Correlations", value: 156 },
 ]

 return (
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
     <div className="bg-white rounded-lg shadow p-6">
       <div className="flex items-center space-x-2">
         <Brain className="h-5 w-5 text-blue-500" />
         <h3 className="text-sm font-medium text-gray-900">AI Health Score</h3>
       </div>
       <p className="text-3xl font-bold text-gray-900 mt-2">87%</p>
       <p className="text-sm text-gray-500 mt-1">↑ 12% from last month</p>
     </div>
     
     <div className="bg-white rounded-lg shadow p-6">
       <h3 className="text-sm font-medium text-gray-900">AI Insights Generated</h3>
       <p className="text-3xl font-bold text-gray-900 mt-2">1,234</p>
       <p className="text-sm text-gray-500 mt-1">23% increase</p>
     </div>

     <div className="bg-white rounded-lg shadow p-6">
       <h3 className="text-sm font-medium text-gray-900">Active AI Agents</h3>
       <p className="text-3xl font-bold text-gray-900 mt-2">24</p>
       <div className="mt-4 space-y-2">
         {aiMetrics.map((metric) => (
           <div key={metric.name} className="flex justify-between text-sm">
             <span className="text-gray-600">{metric.name}</span>
             <span className="font-medium">{metric.value}</span>
           </div>
         ))}
       </div>
     </div>

     <div className="bg-white rounded-lg shadow p-6">
       <h3 className="text-sm font-medium text-gray-900">Automation Rate</h3>
       <p className="text-3xl font-bold text-gray-900 mt-2">73%</p>
       <p className="text-sm text-gray-500 mt-1">Manual tasks reduced by 73%</p>
     </div>
   </div>
 )
}
