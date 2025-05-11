// Mock data for the chat app

// Chat user interface
export interface ChatUser {
  id: string;
  avatarUrl: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  lastMessage: string;
  lastSeen: string;
  isOnline: boolean;
}

// All users interface
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl: string;
}

// Message interface
export interface Message {
  id: string;
  senderId: string;
  type: "text" | "image";
  content: string;
  caption?: string; // Optional caption for image messages
  imageUri?: string; // For combined image+text messages
  timestamp: string;
  status: "sent" | "read";
  replyTo?: string; // ID of the message being replied to
  createdAt?: Date; // Full date object for date separators
  isDateSeparator?: boolean; // Flag to identify date separator items
  isUploading?: boolean; // Flag to indicate if the message is currently uploading
}

// Mock chats data
export const mockChats: ChatUser[] = [
  {
    id: "1",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    firstName: "Ahmed",
    lastName: "Hassan",
    phoneNumber: "+20-101-234-5678",
    lastMessage: "Hey, how are you doing?",
    lastSeen: "Last seen 5 minutes ago",
    isOnline: true,
  },
  {
    id: "2",
    avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    firstName: "Sara",
    lastName: "Mohamed",
    phoneNumber: "+20-111-987-6543",
    lastMessage: "Can we meet tomorrow?",
    lastSeen: "Last seen 2 hours ago",
    isOnline: false,
  },
  {
    id: "3",
    avatarUrl: "https://randomuser.me/api/portraits/men/86.jpg",
    firstName: "Omar",
    lastName: "Ali",
    phoneNumber: "+20-122-456-7890",
    lastMessage: "Thanks for the help!",
    lastSeen: "Last seen yesterday",
    isOnline: false,
  },
  {
    id: "4",
    avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
    firstName: "Layla",
    lastName: "Ibrahim",
    phoneNumber: "+20-128-765-4321",
    lastMessage: "Did you see the news?",
    lastSeen: "Last seen 3 hours ago",
    isOnline: true,
  },
  {
    id: "5",
    avatarUrl: "https://randomuser.me/api/portraits/men/36.jpg",
    firstName: "Karim",
    lastName: "Mahmoud",
    phoneNumber: "+20-100-123-4567",
    lastMessage: "Let me know when you arrive",
    lastSeen: "Last seen just now",
    isOnline: true,
  },
  {
    id: "6",
    avatarUrl: "https://randomuser.me/api/portraits/women/33.jpg",
    firstName: "Nour",
    lastName: "Ahmed",
    phoneNumber: "+20-109-876-5432",
    lastMessage: "I sent you the files",
    lastSeen: "Last seen 1 day ago",
    isOnline: false,
  },
  {
    id: "7",
    avatarUrl: "https://randomuser.me/api/portraits/men/91.jpg",
    firstName: "Youssef",
    lastName: "Samir",
    phoneNumber: "+20-112-345-6789",
    lastMessage: "Are you coming to the event?",
    lastSeen: "Last seen 30 minutes ago",
    isOnline: true,
  },
  {
    id: "8",
    avatarUrl: "https://randomuser.me/api/portraits/women/12.jpg",
    firstName: "Hana",
    lastName: "Khaled",
    phoneNumber: "+20-115-678-9012",
    lastMessage: "Check out this link",
    lastSeen: "Last seen 4 hours ago",
    isOnline: false,
  },
];

// Mock all users data (includes users not in chats)
export const mockAllUsers: User[] = [
  ...mockChats.map((chat) => ({
    id: chat.id,
    firstName: chat.firstName,
    lastName: chat.lastName,
    phoneNumber: chat.phoneNumber,
    avatarUrl: chat.avatarUrl,
  })),
  {
    id: "9",
    firstName: "Amr",
    lastName: "Tarek",
    phoneNumber: "+20-120-111-2222",
    avatarUrl: "https://randomuser.me/api/portraits/men/42.jpg",
  },
  {
    id: "10",
    firstName: "Dina",
    lastName: "Fouad",
    phoneNumber: "+20-106-333-4444",
    avatarUrl: "https://randomuser.me/api/portraits/women/22.jpg",
  },
  {
    id: "11",
    firstName: "Mostafa",
    lastName: "Gamal",
    phoneNumber: "+20-114-555-6666",
    avatarUrl: "https://randomuser.me/api/portraits/men/55.jpg",
  },
  {
    id: "12",
    firstName: "Rana",
    lastName: "Adel",
    phoneNumber: "+20-103-777-8888",
    avatarUrl: "https://randomuser.me/api/portraits/women/35.jpg",
  },
];

// Mock messages for a chat
export const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1-1",
      senderId: "1",
      type: "text",
      content: "Hi there! How are you?",
      timestamp: "09:30",
      status: "read",
    },
    {
      id: "1-2",
      senderId: "me",
      type: "text",
      content: "I'm good, thanks! How about you?",
      timestamp: "09:32",
      status: "read",
    },
    {
      id: "1-3",
      senderId: "1",
      type: "image",
      content:
        "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1600&auto=format&fit=crop",
      timestamp: "09:33",
      status: "read",
    },
    {
      id: "1-4",
      senderId: "me",
      type: "text",
      content: "Wow, that's a beautiful landscape! Where is this?",
      timestamp: "09:34",
      status: "read",
      replyTo: "1-3", // Replying to the image
    },
    {
      id: "1-5",
      senderId: "1",
      type: "text",
      content:
        "It's from my trip to the mountains last weekend. Are you coming to the meeting today?",
      timestamp: "09:35",
      status: "read",
    },
    {
      id: "1-6",
      senderId: "me",
      type: "text",
      content: "Yes, I'll be there at 2 PM.",
      timestamp: "09:36",
      status: "read",
    },
    {
      id: "1-7",
      senderId: "1",
      type: "text",
      content: "Great! See you then.",
      timestamp: "09:37",
      status: "read",
    },
    {
      id: "1-8",
      senderId: "me",
      type: "image",
      content:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop",
      timestamp: "09:40",
      status: "read",
    },
    {
      id: "1-9",
      senderId: "me",
      type: "text",
      content:
        "By the way, I found this nice cafe for lunch after the meeting.",
      timestamp: "09:41",
      status: "sent",
    },
  ],
  "2": [
    {
      id: "2-1",
      senderId: "2",
      type: "text",
      content: "Hello! Are we still meeting tomorrow?",
      timestamp: "14:20",
      status: "read",
    },
    {
      id: "2-2",
      senderId: "me",
      type: "text",
      content: "Yes, at the usual place at 10 AM.",
      timestamp: "14:25",
      status: "read",
    },
    {
      id: "2-3",
      senderId: "2",
      type: "image",
      content:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop",
      timestamp: "14:30",
      status: "read",
    },
    {
      id: "2-4",
      senderId: "me",
      type: "text",
      content: "That looks delicious! Is that from the new restaurant?",
      timestamp: "14:32",
      status: "read",
      replyTo: "2-3", // Replying to the food image
    },
    {
      id: "2-5",
      senderId: "2",
      type: "text",
      content: "Yes, we should try it sometime!",
      timestamp: "14:35",
      status: "read",
    },
    {
      id: "2-6",
      senderId: "me",
      type: "text",
      content: "Definitely! How about next week?",
      timestamp: "14:40",
      status: "sent",
    },
  ],
  "3": [
    {
      id: "3-1",
      senderId: "me",
      type: "text",
      content: "Hi Omar, did you get the files I sent?",
      timestamp: "11:15",
      status: "read",
    },
    {
      id: "3-2",
      senderId: "3",
      type: "text",
      content: "Yes, I got them. Thanks!",
      timestamp: "11:20",
      status: "read",
    },
    {
      id: "3-3",
      senderId: "3",
      type: "image",
      content:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1600&auto=format&fit=crop",
      timestamp: "11:25",
      status: "read",
    },
    {
      id: "3-4",
      senderId: "3",
      type: "text",
      content: "I've already started working on the project.",
      timestamp: "11:26",
      status: "read",
    },
    {
      id: "3-5",
      senderId: "me",
      type: "text",
      content: "That's great! Let me know if you need any help.",
      timestamp: "11:30",
      status: "sent",
    },
    {
      id: "3-6",
      senderId: "3",
      type: "text",
      content: "I'll send you a progress update tomorrow.",
      timestamp: "11:35",
      status: "read",
    },
    {
      id: "3-7",
      senderId: "me",
      type: "text",
      content: "Perfect! Looking forward to seeing your progress.",
      timestamp: "11:40",
      status: "sent",
      replyTo: "3-6",
    },
  ],
  "4": [
    {
      id: "4-1",
      senderId: "4",
      type: "text",
      content: "Have you seen the news today?",
      timestamp: "16:05",
      status: "read",
    },
    {
      id: "4-2",
      senderId: "me",
      type: "text",
      content: "Not yet. What happened?",
      timestamp: "16:10",
      status: "read",
    },
    {
      id: "4-3",
      senderId: "4",
      type: "image",
      content:
        "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1600&auto=format&fit=crop",
      timestamp: "16:15",
      status: "read",
    },
    {
      id: "4-4",
      senderId: "4",
      type: "text",
      content: "There's a new tech exhibition coming to town next month.",
      timestamp: "16:16",
      status: "read",
    },
    {
      id: "4-5",
      senderId: "me",
      type: "text",
      content: "That sounds interesting! We should go.",
      timestamp: "16:20",
      status: "sent",
    },
    {
      id: "4-6",
      senderId: "4",
      type: "image",
      content:
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1600&auto=format&fit=crop",
      timestamp: "16:25",
      status: "read",
    },
    {
      id: "4-7",
      senderId: "me",
      type: "text",
      content: "Wow, that looks amazing! Is this from last year's exhibition?",
      timestamp: "16:30",
      status: "sent",
      replyTo: "4-6",
    },
  ],
};
