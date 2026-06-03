import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-muted-foreground/45 bg-input/55 px-2.5 py-1 text-base outline-none transition-[border-color,background-color] file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-primary/55 focus-visible:bg-input/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-muted-foreground/25 disabled:bg-input/35 disabled:opacity-60 aria-invalid:border-destructive md:text-sm dark:border-muted-foreground/50 dark:bg-input/65 dark:focus-visible:border-primary/60 dark:disabled:bg-input/40 dark:aria-invalid:border-destructive/70",
        className
      )}
      {...props}
    />
  )
}

export { Input }
