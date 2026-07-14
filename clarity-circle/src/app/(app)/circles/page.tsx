"use client";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Compass, MessageCircle, Search, ShieldOff, Sparkles, Users, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createSeedCommunities, getCommunityStats } from "@/lib/utils/communityData";
import {
  claimUsername,
  createCircle,
  createConnectionRequest,
  sendCircleMessage,
  unblockUser,
  type CircleAppState,
} from "@/lib/utils/circleData";

const initialState: CircleAppState = {
  users: [
    { id: "u1", displayName: "Maya", username: "maya", bio: "Growth guide" },
    { id: "u2", displayName: "Jordan", username: "jordan", bio: "Study buddy" },
  ],
  circles: [],
  requests: [],
  blockedUsernames: [],
  chats: [
    {
      id: "chat-1",
      conversationId: "circle-1",
      participants: ["u1", "u2"],
      messages: [],
    },
  ],
};

export default function CirclesPage() {
  const communities = useMemo(() => createSeedCommunities(), []);
  const stats = useMemo(() => getCommunityStats(communities), [communities]);
  const [state, setState] = useState<CircleAppState>(initialState);
  const [usernameInput, setUsernameInput] = useState("");
  const [circleName, setCircleName] = useState("");
  const [circleCategory, setCircleCategory] = useState("Study");
  const [activeChat, setActiveChat] = useState("chat-1");
  const [chatDraft, setChatDraft] = useState("");
  const [message, setMessage] = useState("");

  const usernameCheck = useMemo(() => claimUsername(state.users, usernameInput), [state.users, usernameInput]);
  const activeChatData = useMemo(
    () => state.chats.find((chat) => chat.id === activeChat) ?? state.chats[0],
    [state.chats, activeChat],
  );

  useEffect(() => {
    if (!state.chats.some((chat) => chat.id === activeChat) && state.chats.length > 0) {
      setActiveChat(state.chats[0].id);
    }
  }, [activeChat, state.chats]);

  const handleCreateCircle = () => {
    if (!circleName.trim()) return;
    setState((prev) => createCircle(prev, {
      name: circleName.trim(),
      description: "A new circle built by the community.",
      category: circleCategory,
      privacy: "Private",
      ownerId: "u1",
    }));
    setCircleName("");
    setMessage(`Your circle “${circleName.trim()}” is ready to invite people into.`);
  };

  const handleRequest = () => {
    const username = usernameInput.trim();
    if (!username) return;
    if (usernameCheck.available) return;
    setState((prev) => createConnectionRequest(prev, { fromUserId: "u1", targetUsername: username }));
    setUsernameInput("");
    setMessage(`A request to connect with @${username} has been sent.`);
  };

  const handleUnblock = (targetUsername: string) => {
    setState((prev) => unblockUser(prev, { targetUsername }));
  };

  const handleSendMessage = () => {
    if (!chatDraft.trim()) return;
    setState((prev) => sendCircleMessage(prev, { conversationId: activeChat, senderId: "u1", content: chatDraft.trim() }));
    setChatDraft("");
    setMessage("Your message is now in the circle chat.");
  };

  return (
    <div className="section-container py-6 space-y-6 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Circle</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          A single space for circles, requests, block lists, and member-to-member chat.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Communities</p>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{stats.totalCommunities}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Members</p>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{stats.totalMembers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Active circles</p>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{state.circles.length}</p>
        </Card>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <Card className="p-5 border border-lavender-200 bg-lavender-50">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Create a circle</p>
            <input
              value={circleName}
              onChange={(event) => setCircleName(event.target.value)}
              placeholder="Circle name"
              className="w-full rounded-2xl border border-lavender-200 bg-white px-3 py-2 text-sm"
            />
            <select value={circleCategory} onChange={(event) => setCircleCategory(event.target.value)} className="w-full rounded-2xl border border-lavender-200 bg-white px-3 py-2 text-sm">
              <option value="Study">Study</option>
              <option value="Wellness">Wellness</option>
              <option value="Creativity">Creativity</option>
              <option value="Parenting">Parenting</option>
            </select>
            <Button onClick={handleCreateCircle} leftIcon={<Sparkles className="w-4 h-4" />}>Create circle</Button>
          </div>
          <div className="space-y-3">
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Connect by username</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-lavender-500" />
                <input
                  value={usernameInput}
                  onChange={(event) => setUsernameInput(event.target.value)}
                  placeholder="@username"
                  className="w-full rounded-2xl border border-lavender-200 bg-white py-2 pl-9 pr-3 text-sm"
                />
              </div>
              <Button onClick={handleRequest} variant="secondary">Request</Button>
            </div>
            <div className="rounded-2xl border border-lavender-200 bg-white p-3 text-sm" style={{ color: "var(--text-muted)" }}>
              {usernameInput ? (
                usernameCheck.available ? <span className="text-emerald-600">That username is available.</span> : <span className="text-amber-600">That username is already taken.</span>
              ) : <span>Type a username to request or check availability.</span>}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          {communities.map((community) => (
            <Card key={community.id} className="overflow-hidden">
              <div className={`h-24 bg-gradient-to-r ${community.accent} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] opacity-80">{community.category}</p>
                    <h2 className="text-lg font-semibold">{community.name}</h2>
                  </div>
                  <Badge variant="gold">{community.privacy}</Badge>
                </div>
              </div>
              <div className="space-y-4 p-5">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{community.description}</p>
                <div className="flex flex-wrap gap-2">
                  {community.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-subtle px-2.5 py-1 text-xs" style={{ color: "var(--text-secondary)" }}>{tag}</span>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border p-3" style={{ borderColor: "var(--border-default)" }}>
                    <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      <Users className="w-4 h-4 text-lavender-500" />
                      {community.memberCount} members
                    </div>
                  </div>
                  <div className="rounded-2xl border p-3" style={{ borderColor: "var(--border-default)" }}>
                    <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      <CalendarDays className="w-4 h-4 text-emerald-500" />
                      {community.announcements.length} updates
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    <Compass className="w-4 h-4 text-emerald-500" />
                    Upcoming announcements
                  </div>
                  <ul className="space-y-1 text-sm" style={{ color: "var(--text-muted)" }}>
                    {community.announcements.map((announcement) => <li key={announcement}>• {announcement}</li>)}
                  </ul>
                </div>
                <Button variant="secondary" leftIcon={<PlusCircle className="w-4 h-4" />} onClick={() => setMessage(`You joined ${community.name}.`)}>
                  Join circle
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              <MessageCircle className="w-5 h-5 text-lavender-500" />
              Connection requests
            </div>
            {state.requests.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No requests yet.</p>
            ) : state.requests.map((request) => (
              <div key={request.id} className="rounded-2xl border p-3" style={{ borderColor: "var(--border-default)" }}>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{request.targetUsername}</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Pending request from {request.fromUserId}</p>
              </div>
            ))}
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              <ShieldOff className="w-5 h-5 text-amber-500" />
              Blocked usernames
            </div>
            {state.blockedUsernames.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No blocked usernames.</p>
            ) : state.blockedUsernames.map((blocked) => (
              <div key={blocked} className="flex items-center justify-between rounded-2xl border p-3" style={{ borderColor: "var(--border-default)" }}>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{blocked}</span>
                <Button variant="ghost" size="sm" onClick={() => handleUnblock(blocked)}>Unblock</Button>
              </div>
            ))}
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              <MessageCircle className="w-5 h-5 text-emerald-500" />
              Circle chat
            </div>
            <div className="space-y-2">
              {activeChatData?.messages?.length ? activeChatData.messages.map((message) => (
                <div key={message.id} className="rounded-2xl border p-3 text-sm" style={{ borderColor: "var(--border-default)" }}>
                  <p style={{ color: "var(--text-primary)" }}>{message.content}</p>
                </div>
              )) : <p className="text-sm" style={{ color: "var(--text-muted)" }}>Start the conversation.</p>}
            </div>
            <div className="flex gap-2">
              <input value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Write a message" className="flex-1 rounded-2xl border border-lavender-200 bg-white px-3 py-2 text-sm" />
              <Button onClick={handleSendMessage} variant="secondary">Send</Button>
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Circle capabilities
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ["Community creation", "Anyone can create circles around categories they care about"],
            ["Username-based networking", "Request, block, and chat using a shared username system"],
            ["Member chat", "Each circle has a built-in space for conversation"],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border p-3" style={{ borderColor: "var(--border-default)" }}>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>{title}</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
