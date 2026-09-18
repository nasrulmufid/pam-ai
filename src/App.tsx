import { useEffect, useMemo, useRef, useState } from "react";
import { ChatShell } from "./components/ChatShell";
import { Sidebar } from "./components/Sidebar";
import { streamChat } from "./lib/api";
import { getInitialTheme, loadConversations, saveConversations, saveTheme, type Theme } from "./lib/storage";
import { newId, titleFromMessage } from "./lib/utils";
import type { ChatMessage, Conversation } from "./types";

function makeConversation(): Conversation {
  const now = new Date().toISOString();
  return { id: newId(), title: "Chat baru", createdAt: now, updatedAt: now, messages: [] };
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [currentId, setCurrentId] = useState<string | null>(() => loadConversations()[0]?.id ?? null);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const abortRef = useRef<AbortController | null>(null);

  const currentConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === currentId) ?? null,
    [conversations, currentId]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => saveConversations(conversations), 200);
    return () => window.clearTimeout(timer);
  }, [conversations]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    saveTheme(theme);
  }, [theme]);

  useEffect(() => () => abortRef.current?.abort(), []);

  function createNewChat() {
    if (busy) abortRef.current?.abort();
    const conversation = makeConversation();
    setConversations((items) => [conversation, ...items]);
    setCurrentId(conversation.id);
    setInput("");
    setError(null);
    setMobileOpen(false);
  }

  function deleteConversation(id: string) {
    if (id === currentId && busy) abortRef.current?.abort();
    setConversations((items) => {
      const next = items.filter((item) => item.id !== id);
      if (id === currentId) setCurrentId(next[0]?.id ?? null);
      return next;
    });
  }

  function updateConversation(id: string, updater: (conversation: Conversation) => Conversation) {
    setConversations((items) =>
      items
        .map((conversation) => (conversation.id === id ? updater(conversation) : conversation))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    );
  }

  async function sendMessage(prefilled?: string) {
    const prompt = (prefilled ?? input).trim();
    if (!prompt || busy) return;

    setBusy(true);
    setError(null);
    setInput("");

    let conversation = currentConversation;
    if (!conversation) {
      conversation = makeConversation();
      setConversations((items) => [conversation!, ...items]);
      setCurrentId(conversation.id);
    }

    const conversationId = conversation.id;
    const now = new Date().toISOString();
    const userMessage: ChatMessage = { id: newId(), role: "user", content: prompt, createdAt: now };
    const modelMessage: ChatMessage = { id: newId(), role: "model", content: "", createdAt: now };
    const requestMessages = [...conversation.messages, userMessage];
    const nextTitle = conversation.messages.length === 0 ? titleFromMessage(prompt) : conversation.title;

    updateConversation(conversationId, (item) => ({
      ...item,
      title: nextTitle,
      updatedAt: now,
      messages: [...item.messages, userMessage, modelMessage]
    }));

    const controller = new AbortController();
    abortRef.current = controller;
    let generated = "";

    try {
      await streamChat(
        requestMessages,
        (chunk) => {
          generated += chunk;
          updateConversation(conversationId, (item) => ({
            ...item,
            updatedAt: new Date().toISOString(),
            messages: item.messages.map((message) =>
              message.id === modelMessage.id ? { ...message, content: generated } : message
            )
          }));
        },
        controller.signal
      );
    } catch (cause) {
      if (controller.signal.aborted) {
        if (!generated) {
          updateConversation(conversationId, (item) => ({
            ...item,
            messages: item.messages.filter((message) => message.id !== modelMessage.id)
          }));
        }
        return;
      }
      const message = cause instanceof Error ? cause.message : "Terjadi kesalahan.";
      setError(message);
      updateConversation(conversationId, (item) => ({
        ...item,
        messages: item.messages.filter((message) => message.id !== modelMessage.id || message.content.length > 0)
      }));
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setBusy(false);
    }
  }

  function stopGenerating() {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar
        conversations={conversations}
        currentId={currentId}
        query={query}
        onQueryChange={setQuery}
        onSelect={setCurrentId}
        onNew={createNewChat}
        onDelete={deleteConversation}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <ChatShell
        conversation={currentConversation}
        input={input}
        onInputChange={setInput}
        onSend={sendMessage}
        onStop={stopGenerating}
        busy={busy}
        error={error}
        onOpenSidebar={() => setMobileOpen(true)}
        onNew={createNewChat}
        theme={theme}
        onToggleTheme={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
      />
    </div>
  );
}
