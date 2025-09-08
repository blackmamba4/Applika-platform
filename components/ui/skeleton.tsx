import React from "react";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className || ""}`}
      {...props}
    />
  )
}

function WizardStepSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse" />
      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="h-20 w-full bg-gray-200 rounded-xl animate-pulse" />
    </div>
  )
}

function ButtonSkeleton() {
  return (
    <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
  )
}

export { Skeleton, WizardStepSkeleton, ButtonSkeleton }

