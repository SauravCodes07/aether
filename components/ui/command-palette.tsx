"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  FolderOpen,
  Settings,
  Plus,
  FileText,
  Zap,
  Rocket,
  Users,
  CreditCard,
  BarChart3,
  LogOut,
  Command as CommandIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COMMAND_PALETTE_VARIANTS, COMMAND_ITEM_VARIANTS } from "@/lib/motion";

type CommandItem = {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: "navigation" | "action" | "workspace" | "settings";
  shortcut?: string;
};

type CommandPaletteProps = {
  workspaces?: { id: string; name: string }[];
};

export function CommandPalette({ workspaces = [] }: CommandPaletteProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items: CommandItem[] = [
    {
      id: "dashboard",
      label: "Go to Dashboard",
      description: "View your overview and metrics",
      icon: LayoutDashboard,
      action: () => router.push("/dashboard"),
      category: "navigation",
      shortcut: "G D",
    },
    {
      id: "new-workspace",
      label: "Create New Workspace",
      description: "Start a new collaborative workspace",
      icon: Plus,
      action: () => router.push("/dashboard?create-workspace=true"),
      category: "action",
      shortcut: "N W",
    },
    {
      id: "new-project",
      label: "Create New Project",
      description: "Add a project to your workspace",
      icon: FileText,
      action: () => router.push("/dashboard?create-project=true"),
      category: "action",
      shortcut: "N P",
    },
    {
      id: "ai-assistant",
      label: "AI Copilot",
      description: "Open the AI assistant chat",
      icon: Zap,
      action: () => router.push("/dashboard?ai=true"),
      category: "action",
      shortcut: "A I",
    },
    {
      id: "deployments",
      label: "Deployments",
      description: "View deployment status and logs",
      icon: Rocket,
      action: () => router.push("/dashboard?tab=deployments"),
      category: "navigation",
      shortcut: "D E",
    },
    {
      id: "team",
      label: "Team Members",
      description: "Manage collaborators and roles",
      icon: Users,
      action: () => router.push("/dashboard?tab=team"),
      category: "settings",
      shortcut: "T M",
    },
    {
      id: "billing",
      label: "Billing & Plans",
      description: "Manage subscription and payments",
      icon: CreditCard,
      action: () => router.push("/dashboard?tab=billing"),
      category: "settings",
      shortcut: "B L",
    },
    {
      id: "analytics",
      label: "Analytics",
      description: "View usage and cost analytics",
      icon: BarChart3,
      action: () => router.push("/dashboard?tab=analytics"),
      category: "settings",
      shortcut: "A N",
    },
    {
      id: "settings",
      label: "Settings",
      description: "Account and profile settings",
      icon: Settings,
      action: () => router.push("/dashboard?tab=settings"),
      category: "settings",
      shortcut: "S E",
    },
    {
      id: "sign-out",
      label: "Sign Out",
      description: "Sign out of your account",
      icon: LogOut,
      action: () => router.push("/api/auth/signout"),
      category: "action",
      shortcut: "Q",
    },
    ...workspaces.map((ws) => ({
      id: `workspace-${ws.id}`,
      label: ws.name,
      description: "Open workspace",
      icon: FolderOpen,
      action: () => router.push(`/workspace/${ws.id}`),
      category: "workspace" as const,
    })),
  ];

  const filteredItems = query.trim()
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()),
      )
    : items;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        filteredItems[selectedIndex].action();
        setIsOpen(false);
        setQuery("");
      }
    },
    [isOpen, filteredItems, selectedIndex],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[selectedIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const categories = ["navigation", "action", "workspace", "settings"] as const;
  const categoryLabels: Record<string, string> = {
    navigation: "Navigate",
    action: "Actions",
    workspace: "Workspaces",
    settings: "Settings",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="flex items-start justify-center pt-[15vh]">
            <motion.div
              className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-black/90 shadow-2xl"
              variants={COMMAND_PALETTE_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-label="Command palette"
              aria-modal="true"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <Search className="h-5 w-5 shrink-0 text-white/40" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Search commands, workspaces, settings..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
                  aria-label="Search commands"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setIsOpen(false);
                    }
                  }}
                />
                <kbd className="hidden rounded-md border border-white/20 px-1.5 py-0.5 text-[10px] text-white/40 sm:inline-block">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
                {filteredItems.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-white/40">
                    No results found for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  categories.map((category) => {
                    const categoryItems = filteredItems.filter(
                      (item) => item.category === category,
                    );
                    if (categoryItems.length === 0) return null;

                    return (
                      <div key={category} className="mb-1">
                        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                          {categoryLabels[category]}
                        </div>
                        {categoryItems.map((item) => {
                          const Icon = item.icon;
                          const isSelected =
                            filteredItems.indexOf(item) === selectedIndex;

                          return (
                            <motion.button
                              key={item.id}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                                isSelected
                                  ? "bg-white/10 text-white"
                                  : "text-white/70 hover:bg-white/5 hover:text-white",
                              )}
                              onClick={() => {
                                item.action();
                                setIsOpen(false);
                                setQuery("");
                              }}
                              onMouseEnter={() =>
                                setSelectedIndex(
                                  filteredItems.indexOf(item),
                                )
                              }
                              variants={COMMAND_ITEM_VARIANTS}
                              initial="hidden"
                              animate="visible"
                              aria-label={item.label}
                              tabIndex={0}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {item.label}
                                </div>
                                <div className="text-xs text-white/40 truncate">
                                  {item.description}
                                </div>
                              </div>
                              {item.shortcut && (
                                <kbd className="hidden shrink-0 rounded-md border border-white/15 px-1.5 py-0.5 text-[10px] text-white/30 sm:inline-block">
                                  {item.shortcut}
                                </kbd>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-white/10 px-4 py-2">
                <div className="flex items-center gap-3 text-[10px] text-white/30">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded-md border border-white/20 px-1 py-0.5">↑↓</kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded-md border border-white/20 px-1 py-0.5">↵</kbd>
                    <span>Select</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white/30">
                  <CommandIcon className="h-3 w-3" />
                  <span>+ K to toggle</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}