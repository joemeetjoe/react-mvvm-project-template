
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from '@/shared/lib/utils'

const checkboxVariants = cva(
    "grid place-content-center peer shrink-0 rounded-sm border shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    {
      variants: {
        variant: {
          default:
              "border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          destructive:
              "border-destructive data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground",
          outline:
              "border-input data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          secondary:
              "border-secondary data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground",
          skeleton: "skeleton"
        },
        size: {
          default: "h-4 w-4",
          sm: "h-3.5 w-3.5",
          lg: "h-5 w-5",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "default",
      },
    }
)

const checkIconVariants = cva("", {
  variants: {
    size: {
      default: "h-4 w-4",
      sm: "h-3.5 w-3.5",
      lg: "h-5 w-5",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export interface CheckboxProps
    extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
        VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    CheckboxProps
>(({ className, variant, size, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(checkboxVariants({ variant, size }), className)}
        {...props}
    >
      <CheckboxPrimitive.Indicator
          className={cn("grid place-content-center text-current")}
      >
        <Check className={checkIconVariants({ size })} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox, checkboxVariants }
