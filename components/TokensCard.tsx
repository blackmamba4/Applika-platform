"use client";

import { Zap, Clock, CreditCard } from "lucide-react";

interface TokensCardProps {
  plan: string;
  planQuotaRemaining?: number;
  topupRemaining: number;
  planQuota: number;
}

// Simple semi-circle progress component
const SemiCircleProgress = ({ 
  value, 
  max, 
  size = 100, 
  strokeWidth = 8,
  planQuotaRemaining = 0,
  topupRemaining = 0
}: { 
  value: number; 
  max: number; 
  size?: number; 
  strokeWidth?: number;
  planQuotaRemaining?: number;
  topupRemaining?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  
  // Simple logic: 100% if tokens >= plan amount, otherwise show percentage
  const isFull = value >= max;
  const progress = isFull ? 1 : value / max;
  
  // Color coding based on token source
  const getColor = () => {
    // If only top-up tokens, use purple
    if (planQuotaRemaining === 0 && topupRemaining > 0) {
      return "#8b5cf6"; // Purple - same as top-up text below
    }
    // If only plan tokens, use blue  
    if (topupRemaining === 0 && planQuotaRemaining > 0) {
      return "#3b82f6"; // Blue - same as monthly text below
    }
    // If mixed, use purple (top-up takes priority)
    if (topupRemaining > 0) {
      return "#8b5cf6"; // Purple
    }
    // Default to blue for plan tokens
    return "#3b82f6"; // Blue
  };
  
  const color = getColor();
  
  return (
    <div className="relative" style={{ width: size, height: size / 2 + 10 }}>
      <svg
        width={size}
        height={size / 2 + 10}
        className="overflow-visible"
      >
        {/* Background semi-circle */}
        <path
          d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress semi-circle - always show full if tokens >= plan */}
        <path
          d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={isFull ? "none" : `${progress * radius * Math.PI} ${radius * Math.PI}`}
          className="transition-all duration-500 ease-in-out"
          style={{ 
            transform: 'rotate(0deg)', 
            transformOrigin: `${size/2}px ${size/2}px`
          }}
        />
      </svg>
    </div>
  );
};

export default function TokensCard({ 
  plan, 
  planQuotaRemaining = 0, 
  topupRemaining = 0,
  planQuota = 0
}: TokensCardProps) {
  // Calculate total tokens
  const totalTokens = planQuotaRemaining + topupRemaining;
  
  // Calculate a reasonable max for the progress bar
  const getProgressMax = () => {
    // If user has top-up tokens, use a higher scale
    if (topupRemaining > 0) {
      return Math.max(totalTokens * 1.2, 50); // 20% above current tokens, minimum 50
    }
    // Otherwise use plan quota
    return Math.max(planQuota, 10);
  };

  const progressMax = getProgressMax();
  
  // Determine if user is on free plan
  const isFreePlan = plan === "Free";
  
  
  return (
    <div className="rounded-lg border bg-white p-4 hover-lift">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Tokens
        </h3>
        <div className="text-xs text-gray-500">
          {plan} Plan
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Total Tokens with Semi-circle Progress */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <SemiCircleProgress 
              value={totalTokens} 
              max={planQuota} // Use plan quota as the max
              size={100}
              strokeWidth={8}
              planQuotaRemaining={planQuotaRemaining}
              topupRemaining={topupRemaining}
            />
            <div className="absolute inset-0 flex items-center justify-center" style={{ top: '15px' }}>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {totalTokens}
                </div>
                <div className="text-xs text-gray-500">
                  tokens
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">
              Total Available
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {planQuota > 0 ? `of ${planQuota} monthly` : 'No monthly limit'}
            </div>
          </div>
        </div>
        
        {/* Breakdown */}
        <div className="space-y-2">
          {/* Monthly Plan Tokens */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-blue-500" />
              <span className="text-gray-600">Monthly</span>
            </div>
            <span className="font-medium text-blue-600">
              {planQuotaRemaining}/{planQuota}
            </span>
          </div>
          
          {/* Top-up Tokens */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CreditCard className="h-3 w-3 text-purple-500" />
              <span className="text-gray-600">Top-up</span>
            </div>
            <span className="font-medium text-purple-600">
              {topupRemaining}
            </span>
          </div>
          
          {/* No tokens message */}
          {totalTokens === 0 && (
            <div className="text-center py-2">
              <div className="text-sm text-gray-500 mb-2">
                No tokens remaining
              </div>
              <a 
                href="/pricing" 
                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <Zap className="h-3 w-3" />
                Get more tokens
              </a>
            </div>
          )}
        </div>
        
        {/* Usage info for free plan */}
        {isFreePlan && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center">
              Free plan tokens reset monthly
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
