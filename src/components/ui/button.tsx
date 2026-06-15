import * as React from "react"
import { cn } from "@/lib/utils"

function Button({ className, variant = "solid", size, asChild, ref, ...props }: React.ComponentProps<"button"> & { variant?: "default" | "solid" | "outline" | "ghost" | "link"; size?: "sm" | "md" | "lg" | "icon"; asChild?: boolean }) {
  const sizeClass = size === "sm" ? "h-8 px-3 text-xs" : size === "lg" ? "h-12 px-8 text-base" : size === "icon" ? "h-9 w-9" : "h-10 px-4 py-2"
  const resolvedVariant = variant === "default" ? "solid" : variant

  if (asChild) {
    const child = React.Children.only(props.children) as React.ReactElement<{ className?: string; children?: React.ReactNode }>
    return React.cloneElement(child, {
      className: cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        sizeClass,
        resolvedVariant === "solid" && "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50",
        resolvedVariant === "outline" && "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        resolvedVariant === "ghost" && "hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        resolvedVariant === "link" && "text-primary underline-offset-4 hover:underline",
        className
      ),
    })
  }
  return (
    <button
      ref={ref}
      data-slot="button"
      data-variant={resolvedVariant}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        sizeClass,
        resolvedVariant === "solid" && "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50",
        resolvedVariant === "outline" && "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        resolvedVariant === "ghost" && "hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        resolvedVariant === "link" && "text-primary underline-offset-4 hover:underline",
        className
      )}
      {...props}
    />
  )
}

export { Button }
