export interface CircleUser {
  id: string;
  displayName: string;
  username: string;
  bio: string;
}

export interface CircleDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  privacy: "Public" | "Private" | "Invite Only";
  ownerId: string;
  members: string[];
  createdAt: string;
}

export interface CircleRequest {
  id: string;
  fromUserId: string;
  targetUsername: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface CircleMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface CircleChat {
  id: string;
  conversationId: string;
  participants: string[];
  messages: CircleMessage[];
}

export interface CircleAppState {
  users: CircleUser[];
  circles: CircleDefinition[];
  requests: CircleRequest[];
  blockedUsernames: string[];
  chats: CircleChat[];
}

export function claimUsername(users: CircleUser[], username: string) {
  const normalized = username.trim().toLowerCase();
  const existing = users.some((user) => user.username.toLowerCase() === normalized);
  return { available: !existing, username: normalized };
}

export function createCircle(state: CircleAppState, input: Omit<CircleDefinition, "id" | "members" | "createdAt">) {
  const timestamp = Date.now();
  const circleId = `circle-${timestamp}`;
  const chatId = `chat-${timestamp}`;

  return {
    ...state,
    circles: [
      ...state.circles,
      {
        id: circleId,
        name: input.name,
        description: input.description,
        category: input.category,
        privacy: input.privacy,
        ownerId: input.ownerId,
        members: [input.ownerId],
        createdAt: new Date().toISOString(),
      },
    ],
    chats: [
      ...state.chats,
      {
        id: chatId,
        conversationId: circleId,
        participants: [input.ownerId],
        messages: [],
      },
    ],
  };
}

export function createConnectionRequest(state: CircleAppState, input: { fromUserId: string; targetUsername: string }) {
  return {
    ...state,
    requests: [
      ...state.requests,
      {
        id: `request-${Date.now()}`,
        fromUserId: input.fromUserId,
        targetUsername: input.targetUsername.trim().toLowerCase(),
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

export function blockUser(state: CircleAppState, input: { currentUserId: string; targetUsername: string }) {
  const normalized = input.targetUsername.trim().toLowerCase();
  if (state.blockedUsernames.includes(normalized)) {
    return state;
  }

  return {
    ...state,
    blockedUsernames: [...state.blockedUsernames, normalized],
  };
}

export function unblockUser(state: CircleAppState, input: { targetUsername: string }) {
  const normalized = input.targetUsername.trim().toLowerCase();
  return {
    ...state,
    blockedUsernames: state.blockedUsernames.filter((username) => username !== normalized),
  };
}

export function sendCircleMessage(state: CircleAppState, input: { conversationId: string; senderId: string; content: string }) {
  const nextChats = state.chats.map((chat) => {
    if (chat.id !== input.conversationId) return chat;
    return {
      ...chat,
      messages: [
        ...chat.messages,
        {
          id: `message-${Date.now()}`,
          senderId: input.senderId,
          content: input.content,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  });

  return {
    ...state,
    chats: nextChats,
  };
}
