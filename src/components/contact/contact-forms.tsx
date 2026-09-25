"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { FeedbackForm } from "./feedback-form";
import { QueryForm } from "./query-form";

const TABS = [
  { id: "query", label: "Inquiry Form" },
  { id: "feedback", label: "Feedback" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/**
 * The two Contact Us forms behind an accessible tab control (spec #6). Both
 * panels stay mounted so each form keeps its state when the visitor switches;
 * the inactive panel is hidden from assistive tech and the tab order.
 */
export function ContactForms() {
  const [active, setActive] = useState<TabId>("query");
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

  function selectTab(id: TabId, focus = false) {
    setActive(id);
    if (focus) {
      tabRefs.current[id]?.focus();
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      selectTab(active === "query" ? "feedback" : "query", true);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectTab("query", true);
    } else if (event.key === "End") {
      event.preventDefault();
      selectTab("feedback", true);
    }
  }

  return (
    <div className="rounded-lg border border-ink-200 bg-white p-6 shadow-card sm:p-8">
      <div
        role="tablist"
        aria-label="Contact form"
        className="flex gap-1 rounded-lg border border-ink-200 bg-ink-50 p-1"
      >
        {TABS.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[tab.id] = element;
              }}
              id={`contact-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`contact-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectTab(tab.id)}
              onKeyDown={onKeyDown}
              className={cn(
                "flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-200",
                selected
                  ? "bg-white text-ink-950 shadow-soft"
                  : "text-ink-600 hover:text-ink-900",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        id="contact-panel-query"
        role="tabpanel"
        aria-labelledby="contact-tab-query"
        hidden={active !== "query"}
        className="mt-8"
      >
        <QueryForm />
      </div>

      <div
        id="contact-panel-feedback"
        role="tabpanel"
        aria-labelledby="contact-tab-feedback"
        hidden={active !== "feedback"}
        className="mt-8"
      >
        <FeedbackForm />
      </div>
    </div>
  );
}
