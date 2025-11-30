import * as React from "react"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  className?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted ${className}`}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="aspect-square h-full w-full object-cover"
          />
        ) : fallback ? (
          fallback
        ) : (
          <AvatarFallback>{alt?.[0] || "?"}</AvatarFallback>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  className?: string;
}

export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ children, className = "", ...props }, ref) => (
    <span
      ref={ref}
      className={`flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground ${className}`}
      {...props}
    >
      {children}
    </span>
  )
);
AvatarFallback.displayName = "AvatarFallback";
