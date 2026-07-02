"use client";
import { useState, useEffect, useRef } from "react";
import { Send, Search, MessageCircle, Plus, ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/context/AuthContext";
import { getUserConversations, sendMessage, subscribeToMessages, markConversationRead } from "@/lib/firebase/chat";
import { timeAgo } from "@/lib/utils/format";
import type { Conversation, Message } from "@/lib/types";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const convs = await getUserConversations(user.uid);
      setConversations(convs);
      const requestedConversationId = searchParams.get("conversation");
      if (requestedConversationId) {
        const requestedConversation = convs.find((conv) => conv.id === requestedConversationId);
        if (requestedConversation) setSelectedConv(requestedConversation);
      }
      setLoading(false);
    };
    load();
  }, [user, searchParams]);

  useEffect(() => {
    if (!selectedConv) return;
    const unsub = subscribeToMessages(selectedConv.id, setMessages);
    if (user) markConversationRead(selectedConv.id, user.uid);
    return unsub;
  }, [selectedConv, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!user || !profile || !selectedConv || !input.trim()) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    await sendMessage(
      selectedConv.id,
      user.uid,
      { uid: user.uid, displayName: profile.displayName, photoURL: profile.photoURL },
      text,
      selectedConv.participants
    );
    setSending(false);
  };

  const getOtherParticipant = (conv: Conversation) =>
    conv.participantProfiles.find((p) => p.uid !== user?.uid);

  const renderConversationList = () => (
    <div className="h-full flex flex-col" style={{ borderRight: "1px solid var(--border-default)" }}>
      <div className="p-4 border-b" style={{ borderColor: "var(--border-default)" }}>
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Messages</h1>
          <button className="btn-ghost p-2 rounded-xl">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <Input placeholder="Search conversations…" leftElement={<Search className="w-4 h-4" />} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
            <MessageCircle className="w-10 h-10 text-lavender-300" />
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>No messages yet</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Connect with community members from their profiles.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            const unread = user ? (conv.unreadCounts[user.uid] ?? 0) : 0;
            const active = selectedConv?.id === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`w-full flex items-center gap-3 p-4 text-left transition-all ${active ? "bg-lavender-50 dark:bg-lavender-900/20" : "hover:bg-subtle"}`}
              >
                <Avatar src={other?.photoURL || null} name={other?.displayName || conv.name || "Group"} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                      {other?.displayName || conv.name}
                    </p>
                    <p className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                      {timeAgo(conv.lastMessageAt)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {conv.lastMessage || "Start a conversation"}
                    </p>
                    {unread > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-lavender-500 text-white text-xs flex items-center justify-center font-bold">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  const renderMessagePane = () => {
    if (!selectedConv) {
      return (
        <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-3">
          <MessageCircle className="w-12 h-12 text-lavender-200" />
          <p className="font-medium" style={{ color: "var(--text-muted)" }}>Select a conversation</p>
        </div>
      );
    }
    const other = getOtherParticipant(selectedConv);
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: "var(--border-default)" }}>
          <button className="md:hidden btn-ghost p-1.5 rounded-xl" onClick={() => setSelectedConv(null)}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar src={other?.photoURL || null} name={other?.displayName || "Chat"} size="sm" />
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{other?.displayName || selectedConv.name}</p>
            <p className="text-xs text-emerald-500">Active now</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} className={`flex gap-2 items-end ${isMe ? "flex-row-reverse" : ""}`}>
                {!isMe && <Avatar src={msg.senderProfile.photoURL} name={msg.senderProfile.displayName} size="xs" />}
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-gradient-to-br from-lavender-500 to-lavender-600 text-white rounded-br-sm"
                      : "rounded-bl-sm"
                  }`}
                  style={isMe ? {} : { backgroundColor: "var(--bg-subtle)", color: "var(--text-primary)" }}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t flex gap-3" style={{ borderColor: "var(--border-default)" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message…"
            className="input-base flex-1"
          />
          <Button onClick={handleSend} loading={sending} disabled={!input.trim()} className="flex-shrink-0 px-4">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen flex overflow-hidden" style={{ backgroundColor: "var(--bg-card)" }}>
      <div className={`${selectedConv ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 flex-col`}>
        {renderConversationList()}
      </div>
      <div className={`${selectedConv ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
        {renderMessagePane()}
      </div>
    </div>
  );
}
