import { Menu, Moon, Plus, Sparkles, Sun } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Conversation } from "../types";
import type { Theme } from "../lib/storage";
import { Button } from "./ui/button";
import { ChatMessage } from "./ChatMessage";
import { Composer } from "./Composer";

const suggestions = [
  "Jelaskan konsep koding ini dengan sederhana",
  "Bantu saya merancang struktur project software",
  "Review dan perbaiki kode saya",
  "Bantu cari penyebab error di kode saya"
];

interface ChatShellProps {
  conversation: Conversation | null;
  input: string;
  onInputChange: (value: string) => void;
  onSend: (prompt?: string) => void;
  onStop: () => void;
  busy: boolean;
  error: string | null;
  onOpenSidebar: () => void;
  onNew: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function ChatShell({
  conversation,
  input,
  onInputChange,
  onSend,
  onStop,
  busy,
  error,
  onOpenSidebar,
  onNew,
  theme,
  onToggleTheme
}: ChatShellProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const messageCount = conversation?.messages.length ?? 0;
  const lastContent = conversation?.messages.at(-1)?.content;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: busy ? "auto" : "smooth", block: "end" });
  }, [messageCount, lastContent, busy]);

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/70 px-3 sm:px-5">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenSidebar} aria-label="Open sidebar">
          <Menu />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{conversation?.title || "PAM AI"}</p>
          <p className="text-[11px] text-muted-foreground">Programer Asisten Manager</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onNew} aria-label="Chat baru" className="sm:hidden">
          <Plus />
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!conversation || conversation.messages.length === 0 ? (
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-5 py-10 sm:px-8">
            <div className="mb-8">
              <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Sparkles className="size-5" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Halo, saya PAM AI — Programer Asisten Manager Anda
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Kirim pertanyaan seputar coding, debugging, arsitektur, database, testing, atau deployment.
                Saya jawab pakai konteks percakapan ini dan selalu dalam Bahasa Indonesia.
              </p>
              <div className="mt-4 rounded-xl border border-border bg-card px-4 py-3 text-xs leading-5 text-muted-foreground">
                <span className="font-medium text-foreground">Lingkup kerja:</span> hanya seputar pemrograman
                dan rekayasa perangkat lunak. Pertanyaan di luar itu (resep, cerita, saran umum) akan saya
                tolak dan saya arahkan kembali ke topik teknis.
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className="rounded-2xl border border-border bg-card p-4 text-left text-sm font-medium transition hover:bg-accent"
                  onClick={() => onSend(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="pb-6">
            {conversation.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {error && (
              <div className="mx-auto my-2 max-w-3xl px-4 sm:px-6">
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 bg-gradient-to-t from-background via-background to-background/70 pt-2">
        <Composer
          value={input}
          onChange={onInputChange}
          onSubmit={() => onSend()}
          onStop={onStop}
          busy={busy}
        />
      </div>
    </main>
  );
}
