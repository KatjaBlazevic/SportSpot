import type { ReactNode } from "react";
import type { ProfileRole, ProfileTab } from "./profileConfig";
import { profileTabs } from "./profileConfig";

interface ProfileContentProps {
  uloga: ProfileRole;
  aktivnaTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  content: Partial<Record<ProfileTab, ReactNode>>;
}

export default function ProfileContent({
  uloga,
  aktivnaTab,
  onTabChange,
  content,
}: ProfileContentProps) {
  const tabs = profileTabs[uloga];

  return (
    <section>
      {/* Navigacija između tabova */}
      <nav
        aria-label="Navigacija korisničkog profila"
        className="mb-6 flex flex-wrap gap-2"
      >
        {tabs.map((tab) => {
          const isActive = aktivnaTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={`cursor-pointer rounded-control px-5 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-primary text-text-inverse shadow-sport-primary"
                  : "bg-surface text-text-primary shadow-sport-sm hover:bg-primary-soft"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Sadržaj aktivnog taba */}
      <div>{content[aktivnaTab] ?? null}</div>
    </section>
  );
}
