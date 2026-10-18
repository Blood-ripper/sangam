import Link from "next/link"
import { Mail, MessageCircleQuestion } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const SUPPORT_EMAIL = "gcollab749@gmail.com"

type FaqItem = {
  q: string
  a: string
}

type FaqGroup = {
  title: string
  items: FaqItem[]
}

const FAQ_GROUPS: FaqGroup[] = [
  {
    title: "Getting started",
    items: [
      {
        q: "What is Sangam?",
        a: "Sangam is a verified job and startup network. We match seekers to real internships, jobs and hackathons based on skills and goals, and give every profile a Hire-Proof Score so recruiters know who's genuinely ready.",
      },
      {
        q: "How do I sign in?",
        a: "Use the Sign in button in the top-right and continue with your Google account. After your first sign-in you'll be asked to complete a short onboarding (role, skills, goal) so your feed can be personalised.",
      },
      {
        q: "I signed in but the feed says 'Could not load the feed.'",
        a: "Do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R). If it still fails, sign out and sign back in once — your session may have expired. If the problem continues, contact us below with a screenshot.",
      },
    ],
  },
  {
    title: "Hire-Proof Score & matching",
    items: [
      {
        q: "What is the Hire-Proof Score?",
        a: "It's a 0-100 score computed from your verified skills, completed challenges and activity on Sangam. Recruiters use it alongside skill match to shortlist candidates faster.",
      },
      {
        q: "Why don't I see many opportunities in my feed?",
        a: "The feed ranks opportunities by how well your skills and stated goal match each listing. Keep your profile and skills up to date in onboarding/profile settings to get better matches.",
      },
      {
        q: "Can I use my own resume builder on Sangam?",
        a: "Yes — open the ATS Resume Builder panel on the feed page to build or tailor your resume without leaving Sangam.",
      },
    ],
  },
  {
    title: "Idea Lab & Mentors",
    items: [
      {
        q: "What is Idea Lab for?",
        a: "Idea Lab is where founders post startup ideas and get a 'pulse' (community reaction) and feedback, useful for early validation before pitching.",
      },
      {
        q: "How do I talk to a mentor?",
        a: "Go to Mentors from the navbar, browse profiles and reach out to the ones whose expertise matches what you need.",
      },
    ],
  },
  {
    title: "Reels & Community posts",
    items: [
      {
        q: "Who can post a recruiter reel?",
        a: "Only accounts with the recruiter or admin role can post to Reels. If you're hiring and should have this access but don't see a 'Post a reel' button, contact us to get your account upgraded.",
      },
      {
        q: "What can I upload in Community?",
        a: "Images, videos, PDFs and PPT/PPTX files, up to 10 MB each. Anyone signed in can post; only recruiters/admins can post Reels (video).",
      },
      {
        q: "My upload failed / says file too large.",
        a: "Files must be under 10 MB and one of: JPEG/PNG/WEBP/GIF images, MP4/WEBM/MOV video, PDF, or PPT/PPTX. Compress the file or export a smaller version and try again.",
      },
      {
        q: "How do I share a post or reel?",
        a: "Tap the share icon on any post — it opens your device's share sheet, or copies a direct link (sangam-six-pearl.vercel.app/p/<id>) to your clipboard if sharing isn't supported.",
      },
    ],
  },
  {
    title: "Account & privacy",
    items: [
      {
        q: "Who can see my posts and profile?",
        a: "Posts and Reels are public by link so they're easy to share; your profile skills/goal are only used to power your own feed matching.",
      },
      {
        q: "How do I delete a post I made?",
        a: "Open the post and use the delete option if you're the author. If you don't see it or need a comment removed, email us and we'll handle it.",
      },
      {
        q: "I found a bug or something looks broken.",
        a: "Please reach out below with a screenshot and what page you were on — this is a hackathon build (Triple IT HackShift 2026) and we're actively fixing issues.",
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <main className="flex w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">FAQ & Support</h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Answers to common questions about Sangam. Can&apos;t find what
          you&apos;re looking for? Contact us directly below.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {FAQ_GROUPS.map((group) => (
          <section key={group.title} className="flex flex-col gap-3">
            <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {group.title}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {group.items.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border bg-card/80 p-4 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 font-medium">
                    <span className="flex items-center gap-2">
                      <MessageCircleQuestion className="text-primary size-4 shrink-0" />
                      {item.q}
                    </span>
                    <span className="text-muted-foreground text-xs transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </summary>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-5" />
            Still stuck? Contact us
          </CardTitle>
          <CardDescription>
            Report a bug, ask about your account, or request a recruiter
            role upgrade — we usually reply fast during the hackathon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
              "Sangam support request"
            )}`}
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition hover:opacity-90"
          >
            <Mail className="size-4" />
            {SUPPORT_EMAIL}
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
