import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    let variantClasses = "bg-primary text-white hover:bg-primary/90";
    if (variant === "outline") variantClasses = "border border-gray-300 bg-white text-gray-900 hover:bg-gray-100";
    if (variant === "ghost") variantClasses = "bg-transparent hover:bg-gray-100 text-gray-900";
    if (variant === "link") variantClasses = "bg-transparent underline text-primary hover:text-primary/80";
    let sizeClasses = "px-4 py-2 text-sm";
    if (size === "sm") sizeClasses = "px-3 py-1 text-xs";
    if (size === "lg") sizeClasses = "px-6 py-3 text-lg";
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
