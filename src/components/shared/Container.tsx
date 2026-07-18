import type { ReactNode } from "react";

type ContainerProps = {
  children?: ReactNode;
  className?: string;
  as?: "div" | "section" | "main" | "header" | "footer" | "nav";
};

export function Container({
  children,
  className = "",
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={`mx-auto w-full max-w-[var(--container-max)] px-[var(--container-padding)] ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
