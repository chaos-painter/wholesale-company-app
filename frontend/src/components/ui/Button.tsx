import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#1a1a1a] text-[#e5e5e5] hover:bg-[#333] active:scale-[0.98]",
  ghost:
    "border border-gray-300 text-[#1a1a1a] hover:border-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)]",
  danger:
    "bg-[rgba(239,68,68,0.08)] text-[#dc2626] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.15)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[13px] rounded-lg",
  md: "px-4.5 py-2 text-sm rounded-lg",
  lg: "px-8 py-3.5 text-base rounded-[10px]",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-200
                 disabled:opacity-55 disabled:cursor-not-allowed
                 ${variantClasses[variant]}
                 ${sizeClasses[size]}
                 ${fullWidth ? "w-full" : ""}
                 ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "..." : children}
    </button>
  );
}
