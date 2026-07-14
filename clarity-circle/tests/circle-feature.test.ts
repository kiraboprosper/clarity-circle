import { describe, expect, it } from "vitest";
import {
  claimUsername,
  createCircle,
  createConnectionRequest,
  blockUser,
  unblockUser,
  sendCircleMessage,
  type CircleAppState,
} from "../src/lib/utils/circleData";

describe("Circle social features", () => {
  const baseState: CircleAppState = {
    users: [
      { id: "u1", displayName: "Maya", username: "maya", bio: "" },
      { id: "u2", displayName: "Jordan", username: "jordan", bio: "" },
    ],
    circles: [],
    requests: [],
    blockedUsernames: [],
    chats: [],
  };

  it("prevents duplicate usernames", () => {
    const first = claimUsername(baseState.users, "maya");
    const second = claimUsername(baseState.users, "newname");

    expect(first.available).toBe(false);
    expect(second.available).toBe(true);
  });

  it("creates a circle and initializes chat", () => {
    const next = createCircle(baseState, {
      name: "Focus Circle",
      description: "A calm study group",
      category: "Study",
      privacy: "Private",
      ownerId: "u1",
    });

    expect(next.circles).toHaveLength(1);
    expect(next.circles[0].name).toBe("Focus Circle");
    expect(next.chats).toHaveLength(1);
    expect(next.chats[0].participants).toContain("u1");
  });

  it("queues a request, blocks a user, and stores a chat message", () => {
    const requested = createConnectionRequest(baseState, { fromUserId: "u1", targetUsername: "jordan" });
    const blocked = blockUser(requested, { currentUserId: "u1", targetUsername: "jordan" });
    const withMessage = sendCircleMessage(blocked, { conversationId: "chat-1", senderId: "u1", content: "Hello" });

    expect(requested.requests).toHaveLength(1);
    expect(requested.requests[0].targetUsername).toBe("jordan");
    expect(blocked.blockedUsernames).toContain("jordan");
    expect(withMessage.chats[0].messages[0].content).toBe("Hello");
  });

  it("removes a blocked username when unblocking", () => {
    const blocked = blockUser(baseState, { currentUserId: "u1", targetUsername: "jordan" });
    const unblocked = unblockUser(blocked, { targetUsername: "jordan" });

    expect(blocked.blockedUsernames).toContain("jordan");
    expect(unblocked.blockedUsernames).not.toContain("jordan");
  });
});
