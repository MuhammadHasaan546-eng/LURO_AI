import type { LucideIcon } from "lucide-react";
import {
  Bot,
  CreditCard,
  FileStack,
  FileText,
  History,
  ImageIcon,
  Languages,
  LayoutDashboard,
  Mail,
  Settings,
  Share2,
} from "lucide-react";

type NavigationLink = { label: string; href: string; icon: LucideIcon };
type NavigationGroup = { label: string; links: NavigationLink[] };

export const SIDEBAR_GROUPS: NavigationGroup[] = [
  {
    label: "Workspace",
    links: [
      { label: "Overview", href: "/app", icon: LayoutDashboard },
      { label: "AI Chat", href: "/app/chat", icon: Bot },
      { label: "Images", href: "/app/image", icon: ImageIcon },
    ],
  },
  {
    label: "Create",
    links: [
      { label: "Social content", href: "/app/social", icon: Share2 },
      { label: "Email writer", href: "/app/email", icon: Mail },
      { label: "Translator", href: "/app/translator", icon: Languages },
      { label: "Chat with PDF", href: "/app/pdf", icon: FileText },
    ],
  },
  {
    label: "Manage",
    links: [
      { label: "History", href: "/app/history", icon: History },
      { label: "Settings", href: "/app/settings", icon: Settings },
      { label: "Billing", href: "/app/billing", icon: CreditCard },
    ],
  },
];

export const SIDEBAR_LINKS = SIDEBAR_GROUPS.flatMap((group) => group.links);

export const COMMAND_LINKS = [
  ...SIDEBAR_LINKS,
  { label: "New chat", href: "/app/chat", icon: Bot },
  { label: "Upload a PDF", href: "/app/pdf", icon: FileStack },
];
