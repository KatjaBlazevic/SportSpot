import type { ReactNode } from "react";

type AuthLayoutProps = {
  variant: "login" | "register";
  title: string;
  description: string;
  children: ReactNode;
};

export default function AuthLayout({
  variant,
  title,
  description,
  children,
}: AuthLayoutProps) {
  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-[52px] items-center justify-center rounded-[14px] bg-brand-gradient">
            {variant === "login" ? (
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            ) : (
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            )}
          </div>

          <h1 className="m-0 font-sans text-[26px] font-extrabold text-text-primary">
            {title}
          </h1>

          <p className="mt-2 text-[15px] text-text-secondary">{description}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
