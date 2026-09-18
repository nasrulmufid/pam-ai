import { MessageSquarePlus, Search, Trash2, X } from "lucide-react";
import type { Conversation } from "../types";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SidebarProps {
  conversations: Conversation[];
  currentId: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  conversations,
  currentId,
  query,
  onQueryChange,
  onSelect,
  onNew,
  onDelete,
  mobileOpen,
  onCloseMobile
}: SidebarProps) {
  const filtered = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-[310px] flex-col border-r border-sidebar-border bg-sidebar p-3 transition-transform duration-200 md:static md:w-[290px] md:max-w-none md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2 px-1 py-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <span className="text-xs font-semibold">PAM</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">PAM AI</p>
            <p className="truncate text-xs text-muted-foreground">Programer Asisten Manager</p>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onCloseMobile}>
            <X />
          </Button>
        </div>

        <Button className="mt-2 w-full justify-start" onClick={onNew}>
          <MessageSquarePlus /> Chat baru
        </Button>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Cari chat"
            className="pl-9"
          />
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">Belum ada percakapan.</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-xl pr-1 transition-colors",
                    currentId === conversation.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/70"
                  )}
                >
                  <button
                    className="min-w-0 flex-1 px-3 py-2.5 text-left"
                    onClick={() => {
                      onSelect(conversation.id);
                      onCloseMobile();
                    }}
                  >
                    <p className="truncate text-sm font-medium">{conversation.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {new Date(conversation.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    aria-label={`Delete ${conversation.title}`}
                    onClick={() => onDelete(conversation.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-sidebar-border px-2 pt-3 text-[11px] leading-5 text-muted-foreground">
          Riwayat chat disimpan hanya di local storage browser ini.
        </div>
      </aside>
    </>
  );
}
