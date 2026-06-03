import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-muted-foreground/45 bg-input/55 px-2.5 py-2 text-base outline-none transition-[border-color,background-color] placeholder:text-muted-foreground focus-visible:border-primary/55 focus-visible:bg-input/70 disabled:cursor-not-allowed disabled:border-muted-foreground/25 disabled:bg-input/35 disabled:opacity-60 aria-invalid:border-destructive md:text-sm dark:border-muted-foreground/50 dark:bg-input/65 dark:focus-visible:border-primary/60 dark:disabled:bg-input/40 dark:aria-invalid:border-destructive/70",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
