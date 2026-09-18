import { Bot, Check, Copy, User } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage as ChatMessageType } from "../types";
import { Button } from "./ui/button";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function copyMessage() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <article className="group w-full py-5 sm:py-7">
      <div className="mx-auto flex w-full max-w-3xl gap-3 px-4 sm:gap-4 sm:px-6">
        <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${isUser ? "bg-secondary" : "bg-primary text-primary-foreground"}`}>
          {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">{isUser ? "Anda" : "PAM AI"}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
              onClick={copyMessage}
              aria-label="Copy message"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </Button>
          </div>
          {isUser ? (
            <div className="whitespace-pre-wrap break-words text-[15px] leading-7 text-foreground">{message.content}</div>
          ) : (
            <div className="markdown min-w-0 text-[15px] leading-7">
              {message.content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              ) : (
                <div className="flex gap-1.5 py-2">
                  <span className="typing-dot" />
                  <span className="typing-dot [animation-delay:120ms]" />
                  <span className="typing-dot [animation-delay:240ms]" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
