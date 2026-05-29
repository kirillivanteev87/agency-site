"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AI_CHAT_MAX_MESSAGES, trimMessagesForApi } from "@/lib/ai-chat-messages";
import { DEFAULT_BUTTON_LABELS } from "@/lib/button-labels";
import { replyImpliesLeadForm } from "@/lib/ai-chat-system-prompt";
import type { ButtonLabels } from "@/lib/site-data";

const STORAGE_KEY = "redline-ai-chat-messages";
const PROACTIVE_KEY = "redline-ai-chat-proactive-done";
const FAB_PULSE_DELAY_MS = 30_000;
const PANEL_AUTO_OPEN_DELAY_MS = 60_000;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Доброе утро";
  if (h < 18) return "Добрый день";
  return "Добрый вечер";
}

function proactiveMessage() {
  return `${getTimeGreeting()}! Нужен сайт или лендинг под вашу нишу? Кратко опишите задачу — предложу формат и созвон на 15 минут.`;
}

function loadStoredMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: ChatMessage[]) {
  try {
    const trimmed = messages.slice(-AI_CHAT_MAX_MESSAGES);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AiChatWidget({ buttonLabels = DEFAULT_BUTTON_LABELS }: { buttonLabels?: ButtonLabels }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [fabAttention, setFabAttention] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hydrated = useRef(false);
  const proactiveTriggered = useRef(false);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const stored = loadStoredMessages();
    if (stored.length > 0) {
      setMessages(stored.slice(-AI_CHAT_MAX_MESSAGES));
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(PROACTIVE_KEY)) return;

    const pulseTimer = window.setTimeout(() => {
      if (!proactiveTriggered.current) setFabAttention(true);
    }, FAB_PULSE_DELAY_MS);

    const openTimer = window.setTimeout(() => {
      if (proactiveTriggered.current) return;
      proactiveTriggered.current = true;
      sessionStorage.setItem(PROACTIVE_KEY, "1");
      setFabAttention(true);
      setOpen(true);
      setMessages((prev) => {
        if (prev.length > 0) return prev;
        return [
          {
            id: newId(),
            role: "assistant",
            content: proactiveMessage(),
          },
        ];
      });
    }, PANEL_AUTO_OPEN_DELAY_MS);

    return () => {
      window.clearTimeout(pulseTimer);
      window.clearTimeout(openTimer);
    };
  }, []);

  function ensureProactiveGreeting() {
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [
        {
          id: newId(),
          role: "assistant",
          content: proactiveMessage(),
        },
      ];
    });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, open, showLeadForm, scrollToBottom]);

  async function sendUserMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { id: newId(), role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: trimMessagesForApi(nextMessages),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        showLeadForm?: boolean;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "Не удалось отправить сообщение");
      }

      const reply = data.reply?.trim() || "Спасибо за сообщение! Сейчас уточню и отвечу.";
      setMessages((prev) => [...prev, { id: newId(), role: "assistant", content: reply }]);
      if (data.showLeadForm || replyImpliesLeadForm(reply)) setShowLeadForm(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сети");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void sendUserMessage(input);
  }

  async function handleLeadSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLeadLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const transcript = messages.map((m) => `${m.role === "user" ? "Клиент" : "Менеджер"}: ${m.content}`).join("\n");

    try {
      const res = await fetch("/api/ai-chat/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          phone: fd.get("phone"),
          email: fd.get("email") || "",
          transcript,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Не удалось отправить");

      setLeadDone(true);
      setShowLeadForm(false);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          content:
            "Принял. Перезвоним в течение 2 часов в рабочее время и согласуем созвон.",
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setLeadLoading(false);
    }
  }

  function openChat() {
    proactiveTriggered.current = true;
    try {
      sessionStorage.setItem(PROACTIVE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(true);
    setFabAttention(false);
    ensureProactiveGreeting();
  }

  function closeChat() {
    setOpen(false);
  }

  function resetChat() {
    setMessages([
      {
        id: newId(),
        role: "assistant",
        content: proactiveMessage(),
      },
    ]);
    setShowLeadForm(false);
    setLeadDone(false);
    setError("");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="ai-chat-root" aria-live="polite">
      {open ? (
        <div className="ai-chat-panel" role="dialog" aria-label="Чат с менеджером">
          <header className="ai-chat-header">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Алексей · REDLINE</p>
              <p className="text-xs text-white/75">Обычно отвечает за минуту</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className="ai-chat-icon-btn text-xs"
                onClick={resetChat}
                aria-label="Начать диалог заново"
                title="Начать заново"
              >
                ↺
              </button>
              <button type="button" className="ai-chat-icon-btn" onClick={closeChat} aria-label="Закрыть чат">
                <X size={18} />
              </button>
            </div>
          </header>

          <div ref={listRef} className="ai-chat-messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`ai-chat-bubble ${m.role === "user" ? "ai-chat-bubble--user" : "ai-chat-bubble--bot"}`}
              >
                {m.content}
              </div>
            ))}
            {loading ? (
              <div className="ai-chat-bubble ai-chat-bubble--bot ai-chat-typing">
                <span />
                <span />
                <span />
              </div>
            ) : null}
          </div>

          {showLeadForm && !leadDone ? (
            <form className="ai-chat-lead" onSubmit={handleLeadSubmit}>
              <p className="mb-2 text-xs font-medium text-[var(--text)]">Оставьте контакты для созвона</p>
              <input name="name" required placeholder="Имя" className="form-field mb-2 text-sm" />
              <input name="phone" required type="tel" placeholder="Телефон" className="form-field mb-2 text-sm" />
              <input name="email" type="email" placeholder="Email (необязательно)" className="form-field mb-2 text-sm" />
              <button type="submit" className="btn-primary w-full text-sm" disabled={leadLoading}>
                <span data-button-field={leadLoading ? "aiChatLeadLoading" : "aiChatLead"}>
                  {leadLoading ? buttonLabels.aiChatLeadLoading : buttonLabels.aiChatLead}
                </span>
              </button>
            </form>
          ) : null}

          {error ? <p className="ai-chat-error">{error}</p> : null}

          {!showLeadForm && !leadDone && messages.length >= 2 ? (
            <button
              type="button"
              className="mx-4 mb-1 text-left text-xs font-medium text-accent hover:underline"
              onClick={() => setShowLeadForm(true)}
            >
              Записаться на бесплатный созвон →
            </button>
          ) : null}

          <form className="ai-chat-input-row" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendUserMessage(input);
                }
              }}
              rows={1}
              placeholder="Напишите сообщение…"
              className="form-field min-h-[44px] resize-none py-2.5 text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              className="ai-chat-send"
              disabled={loading || !input.trim()}
              aria-label="Отправить"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      ) : null}

      {!open ? (
        <button
          type="button"
          className={`ai-chat-fab ${fabAttention ? "ai-chat-fab--attention" : ""}`}
          onClick={openChat}
          aria-label="Открыть чат"
        >
          <MessageCircle size={24} />
          {fabAttention ? <span className="ai-chat-fab-badge" aria-hidden /> : null}
        </button>
      ) : null}
    </div>
  );
}
