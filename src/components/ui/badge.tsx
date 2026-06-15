import * as React from "react"
import { cn } from "@/lib/utils"

function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" | "outline" }) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
        variant === "default" && "bg-primary text-primary-foreground shadow-xs",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "outline" && "border text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Badge }
