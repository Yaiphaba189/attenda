import * as React from "react"

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`rounded-lg border bg-white p-4 shadow-sm ${className}`} {...props} />
  )
)
Card.displayName = "Card"

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`mb-2 flex flex-col gap-1 ${className}`} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h2 ref={ref} className={`text-lg font-semibold leading-tight ${className}`} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`flex-1 ${className}`} {...props} />
  )
)
CardContent.displayName = "CardContent"
