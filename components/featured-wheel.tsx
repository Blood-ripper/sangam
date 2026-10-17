"use client"

import { WorksWheel } from "@/components/ui/works-wheel"

const ITEMS = [
  {
    title: "Google India",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80",
    href: "/feed",
  },
  {
    title: "Razorpay",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80",
    href: "/feed",
  },
  {
    title: "Zepto",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
    href: "/feed",
  },
  {
    title: "Meesho",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80",
    href: "/feed",
  },
  {
    title: "CRED",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=80",
    href: "/feed",
  },
  {
    title: "Flipkart",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c6?w=900&q=80",
    href: "/feed",
  },
  {
    title: "HackShift 2026",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&q=80",
    href: "/feed",
  },
]

export function FeaturedWheel() {
  return (
    <div className="h-[80vh] w-full">
      <WorksWheel label="Hiring now" action="View" items={ITEMS} />
    </div>
  )
}
