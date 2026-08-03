import {
  LayoutDashboard,
  Sparkles,
  Bot,
  ImageIcon,
  FileText,
  CalendarClock,
  Clock3,
  BarChart3,
  FolderKanban,
  Database,
  MessageSquareText,
  Hash,
  WandSparkles,
  Globe,
  Bell,
  CreditCard,
  Users,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

export const SIDEBAR_LINKS = [
  // Dashboard
  {
    label: "Dashboard",
    href: "/app",
    icon: LayoutDashboard,
  },

  // AI Tools
  {
    label: "AI Generator",
    href: "/app/ai-generator",
    icon: Sparkles,
  },
  {
    label: "AI Assistant",
    href: "/app/assistant",
    icon: Bot,
  },
  {
    label: "AI Image",
    href: "/app/ai-image",
    icon: ImageIcon,
  },
  {
    label: "AI Writer",
    href: "/app/ai-writer",
    icon: FileText,
  },
  {
    label: "Caption Generator",
    href: "/app/caption-generator",
    icon: MessageSquareText,
  },
  {
    label: "Hashtag Generator",
    href: "/app/hashtag-generator",
    icon: Hash,
  },
  {
    label: "Content Improver",
    href: "/app/content-improver",
    icon: WandSparkles,
  },

  // Content
  {
    label: "Scheduler",
    href: "/app/scheduler",
    icon: CalendarClock,
  },
  {
    label: "Content History",
    href: "/app/history",
    icon: Clock3,
  },

  // Analytics
  {
    label: "Analytics",
    href: "/app/analytics",
    icon: BarChart3,
  },

  // Social Media
  {
    label: "Social Accounts",
    href: "/app/social-accounts",
    icon: Globe,
  },

  // Projects
  {
    label: "Projects",
    href: "/app/projects",
    icon: FolderKanban,
  },

  // Prompt Library
  {
    label: "Prompt Library",
    href: "/app/prompts",
    icon: Database,
  },

  // Team
  {
    label: "Team",
    href: "/app/team",
    icon: Users,
  },

  // Billing
  {
    label: "Billing",
    href: "/app/billing",
    icon: CreditCard,
  },

  // Notifications
  {
    label: "Notifications",
    href: "/app/notifications",
    icon: Bell,
  },

  // Settings
  {
    label: "Settings",
    href: "/app/settings",
    icon: Settings,
  },

  // Help
  {
    label: "Help Center",
    href: "/app/help",
    icon: HelpCircle,
  },
];
