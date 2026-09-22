// Hand-written, not shadcn-generated. shadcn ships typography only as docs
// (https://ui.shadcn.com/docs/components/typography), so this file turns
// those recipes into components. It is the only place text styling lives:
// screens and shared components never put text-*/font-* classes on plain
// elements, they render <Heading> and <Text> instead.
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const headingVariants = cva("scroll-m-20 tracking-tight", {
  variants: {
    level: {
      h1: "text-2xl font-semibold",
      h2: "text-xl font-semibold",
      h3: "text-lg font-semibold",
      h4: "text-base font-semibold",
    },
  },
  defaultVariants: {
    level: "h1",
  },
})

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & {
    asChild?: boolean
  }

/** Renders the element named by `level` (h1–h4) with matching styling. */
const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = "h1", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : (level ?? "h1")
    return (
      <Comp
        ref={ref}
        className={cn(headingVariants({ level }), className)}
        {...props}
      />
    )
  }
)
Heading.displayName = "Heading"

const textVariants = cva("", {
  variants: {
    variant: {
      body: "text-sm",
      muted: "text-sm text-muted-foreground",
      label: "text-sm font-medium text-muted-foreground",
      small: "text-xs text-muted-foreground",
      destructive: "text-sm text-destructive",
    },
  },
  defaultVariants: {
    variant: "body",
  },
})

type TextProps = React.HTMLAttributes<HTMLParagraphElement> &
  VariantProps<typeof textVariants> & {
    asChild?: boolean
  }

/** Renders a <p> by default; pass `asChild` to style a span, dt, dd, etc. */
const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "p"
    return (
      <Comp
        ref={ref}
        className={cn(textVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Text.displayName = "Text"

export { Heading, Text }
