"use client";
import { forwardRef, type ComponentProps } from "react";
import { cls } from "@/lib/utils";

export type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", className, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        {...rest}
        className={cls(
          "transition",
          variant === "primary" && "rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600",
          variant === "secondary" &&
            "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
          variant === "ghost" &&
            "rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/60",
          variant === "danger" &&
            "rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700",
          className
        )}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
