export interface CommunitySummary {
  id: string;
  name: string;
  description: string;
  category: string;
  privacy: "Public" | "Private" | "Invite Only";
  memberCount: number;
  tags: string[];
  accent: string;
  announcements: string[];
  goals: string[];
  challenges: string[];
  resources: string[];
}

export function createSeedCommunities(): CommunitySummary[] {
  return [
    {
      id: "growth-garden",
      name: "Growth Garden",
      description: "A calm circle for habits, reflection, and accountability.",
      category: "Personal Growth",
      privacy: "Public",
      memberCount: 184,
      tags: ["habits", "reflection", "accountability"],
      accent: "from-emerald-400 to-lavender-500",
      announcements: ["Weekly reflection tonight", "New challenge starts Monday"],
      goals: ["Read 20 minutes daily", "Journal three nights a week"],
      challenges: ["30 Days of Consistency", "Morning Calm Sprint"],
      resources: ["Weekly planner", "Reflection worksheet"],
    },
    {
      id: "study-spark",
      name: "Study Spark",
      description: "Support for students planning, studying, and staying consistent.",
      category: "Education",
      privacy: "Invite Only",
      memberCount: 92,
      tags: ["study", "coding", "exam prep"],
      accent: "from-sky-400 to-indigo-500",
      announcements: ["Prep session this Friday", "Shared notes folder updated"],
      goals: ["Finish two coding lessons", "Revise one chapter daily"],
      challenges: ["Exam Prep Sprint", "Focus Hour Challenge"],
      resources: ["Revision checklist", "Study guide PDF"],
    },
  ];
}

export function getCommunityById(id: string, communities: CommunitySummary[] = createSeedCommunities()) {
  return communities.find((community) => community.id === id) ?? null;
}

export function getCommunityStats(communities: CommunitySummary[] = createSeedCommunities()) {
  return {
    totalMembers: communities.reduce((sum, community) => sum + community.memberCount, 0),
    activeChallenges: communities.reduce((sum, community) => sum + community.challenges.length, 0),
    totalCommunities: communities.length,
  };
}
