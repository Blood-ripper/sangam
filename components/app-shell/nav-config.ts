import {
  Briefcase,
  Building2,
  Clapperboard,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Lightbulb,
  type LucideIcon,
  Users,
} from "lucide-react"

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  roles?: string[]
  badge?: "ideas"
}

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Discover",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/feed", label: "Feed", icon: Briefcase },
      { href: "/idea-lab", label: "Idea Lab", icon: Lightbulb, badge: "ideas" },
      { href: "/mentors", label: "Mentors", icon: GraduationCap },
      { href: "/reels", label: "Reels", icon: Clapperboard },
      { href: "/community", label: "Community", icon: Users },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/applications", label: "My applications", icon: FileCheck2 },
      { href: "/recruiter", label: "Recruiter desk", icon: Building2, roles: ["recruiter", "admin"] },
      { href: "/faq", label: "Help & FAQ", icon: LifeBuoy },
    ],
  },
]

const SECTION_LABELS: Record<string, string> = {
  dashboard: "Overview",
  feed: "Feed",
  "idea-lab": "Idea Lab",
  mentors: "Mentors",
  reels: "Reels",
  community: "Community",
  applications: "My applications",
  recruiter: "Recruiter desk",
  faq: "Help & FAQ",
  p: "Post",
  opportunities: "Opportunity",
  "skill-gap": "Skill-Gap Coach",
}

export function sectionFor(pathname: string) {
  const seg = pathname.split("/").filter(Boolean)[0] ?? ""
  return SECTION_LABELS[seg] ?? "Sangam"
}

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
