"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Send, Bot, User, Loader2, Zap } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { streamAIChat } from "@/services/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const suggestedPrompts = [
  "Generate a SMART goal for improving team velocity",
  "What's the risk level for Engineering this week?",
  "Summarize my productivity this month",
  "Which goals are at risk of missing deadline?",
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  streaming?: boolean;
}

export function AiChatPanel() {
  const { aiChatOpen, setAiChatOpen, activeRole } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm **AtomQuest AI** powered by Mistral on AWS Bedrock. Ask me anything about goals, productivity, or risk analysis.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<boolean>(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const assistantId = `msg_${Date.now() + 1}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);
    abortRef.current = false;

    // Build history for context (last 10 messages)
    const history = [...messages, userMsg]
      .filter((m) => !m.streaming)
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      let accumulated = "";

      for await (const chunk of streamAIChat({
        messages: history,
        userRole: activeRole,
        department: "Engineering",
        userId: "usr_1",
      })) {
        if (abortRef.current) break;
        accumulated += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulated } : m
          )
        );
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m
        )
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: `⚠️ ${errorMsg}\n\nMake sure your AWS credentials and BEDROCK_MODEL_ID are set in .env and restart the dev server.`,
                streaming: false,
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  // Simple markdown-like renderer for bold text
  const renderContent = (content: string) => {
    return content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <AnimatePresence>
      {aiChatOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => { abortRef.current = true; setAiChatOpen(false); }}
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 glass-panel border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center glow-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">AtomQuest AI</h2>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground">
                      Mistral · {activeRole}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { abortRef.current = true; setAiChatOpen(false); }}
                className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}
                >
                  <div className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    msg.role === "assistant" ? "bg-primary/20" : "bg-accent"
                  )}>
                    {msg.role === "assistant"
                      ? <Bot className="h-3.5 w-3.5 text-primary" />
                      : <User className="h-3.5 w-3.5" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    msg.role === "assistant"
                      ? "bg-accent/60 rounded-tl-sm"
                      : "bg-primary/15 border border-primary/20 rounded-tr-sm"
                  )}>
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {renderContent(msg.content)}
                      {msg.streaming && (
                        <span className="inline-block w-1.5 h-4 bg-primary/70 ml-0.5 animate-pulse rounded-sm" />
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">{msg.timestamp}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Suggested prompts — only show at start */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wider">
                  Suggested
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedPrompts.slice(0, 2).map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      disabled={isStreaming}
                      className="text-xs px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      <Zap className="h-2.5 w-2.5 inline mr-1" />
                      {p.length > 35 ? p.slice(0, 35) + "…" : p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-border">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder="Ask AtomQuest AI anything..."
                  disabled={isStreaming}
                  className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground disabled:opacity-60"
                />
                <Button
                  size="icon"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isStreaming}
                  className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shrink-0"
                >
                  {isStreaming
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Powered by Mistral on AWS Bedrock · Responses may vary
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
