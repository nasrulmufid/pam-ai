import { ArrowUp, Square } from "lucide-react";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  busy: boolean;
}

export function Composer({ value, onChange, onSubmit, onStop, busy }: ComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!busy && value.trim()) onSubmit();
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-6 sm:pb-5">
      <div className="rounded-2xl border border-border bg-card p-2 shadow-[0_12px_44px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_44px_rgba(0,0,0,0.28)]">
        <Textarea
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Tulis pertanyaan coding Anda…"
          rows={1}
          className="max-h-[180px] min-h-[48px] border-0 px-3 py-3 text-[15px] focus:ring-0"
          disabled={busy}
        />
        <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-1">
          <p className="hidden text-[11px] text-muted-foreground sm:block">Enter untuk kirim · Shift + Enter baris baru</p>
          <div className="ml-auto">
            {busy ? (
              <Button size="icon" variant="secondary" onClick={onStop} aria-label="Stop generating">
                <Square className="size-4 fill-current" />
              </Button>
            ) : (
              <Button size="icon" onClick={onSubmit} disabled={!value.trim()} aria-label="Send message">
                <ArrowUp />
              </Button>
            )}
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">PAM AI bisa keliru. Verifikasi informasi penting.</p>
    </div>
  );
}
