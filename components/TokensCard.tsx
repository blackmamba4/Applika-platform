"use client";

import { Zap, Clock, CreditCard } from "lucide-react";

interface TokensCardProps {
  plan: string;
  planQuotaRemaining: number;
  topupRemaining: number;
  planQuota: number;
}

export default function TokensCard({ 
  plan, 
  planQuotaRemaining = 0, 
  topupRemaining = 0,
  planQuota = 0
}: TokensCardProps) {
  // Calculate total tokens
  const totalTokens = planQuotaRemaining + topupRemaining;
  
  // Determine if user is on free plan
  const isFreePlan = plan === "Free";
  
  // Debug logging
  console.log('TokensCard props:', { plan, planQuotaRemaining, topupRemaining, planQuota, totalTokens });
  
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
        {/* Total Tokens */}
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {totalTokens}
          </div>
          <div className="text-xs text-gray-500">
            Total Available
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
