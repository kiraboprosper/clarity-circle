export interface ConnectionContact {
  id: string;
  name: string;
  relationship: string;
  lastContact: string;
  nextReminder: string;
  favorite: boolean;
  priority: boolean;
}

export interface ConnectionReminder {
  id: string;
  title: string;
  contactId: string;
  due: string;
  completed: boolean;
}

export interface ConnectionGoal {
  id: string;
  title: string;
  contactId: string;
  cadence: string;
  progress: number;
}

export function createSeedContacts(): ConnectionContact[] {
  return [
    {
      id: "maya",
      name: "Maya",
      relationship: "Best Friend",
      lastContact: "2 hours ago",
      nextReminder: "Tonight at 8:30 PM",
      favorite: true,
      priority: true,
    },
    {
      id: "darius",
      name: "Darius",
      relationship: "Mentor",
      lastContact: "Yesterday",
      nextReminder: "Friday at 10:00 AM",
      favorite: false,
      priority: true,
    },
    {
      id: "nina",
      name: "Nina",
      relationship: "Sibling",
      lastContact: "3 days ago",
      nextReminder: "Sunday",
      favorite: true,
      priority: false,
    },
  ];
}

export function createSeedReminders(): ConnectionReminder[] {
  return [
    { id: "rem-1", title: "Check in with Maya", contactId: "maya", due: "Today", completed: false },
    { id: "rem-2", title: "Send weekend voice note", contactId: "darius", due: "Friday", completed: false },
  ];
}

export function createSeedGoals(): ConnectionGoal[] {
  return [
    { id: "goal-1", title: "Weekly catch-up", contactId: "maya", cadence: "Weekly", progress: 62 },
    { id: "goal-2", title: "Mentor check-in", contactId: "darius", cadence: "Monthly", progress: 33 },
  ];
}

export function getPriorityContacts(
  contacts: ConnectionContact[] = createSeedContacts(),
  reminders: ConnectionReminder[] = createSeedReminders(),
  goals: ConnectionGoal[] = createSeedGoals()
) {
  return contacts.filter((contact) => contact.priority || reminders.some((reminder) => reminder.contactId === contact.id) || goals.some((goal) => goal.contactId === contact.id));
}
