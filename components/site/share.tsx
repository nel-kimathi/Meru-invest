"use client";

import { useState } from "react";
import { Check, Link2, Mail, Share2 } from "lucide-react";

const btn = "grid size-12 place-items-center rounded-full bg-mint text-ink transition hover:bg-forest hover:text-white";

export function Share({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => window.location.href;
  return (
    <div className="mt-3 flex gap-2">
      <button aria-label="Share on LinkedIn" className={btn} onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url())}`, "_blank", "noopener")}>
        <Share2 className="size-5" />
      </button>
      <button aria-label="Share by email" className={btn} onClick={() => (window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url())}`)}>
        <Mail className="size-5" />
      </button>
      <button
        aria-label="Copy link"
        className={btn}
        onClick={async () => {
          await navigator.clipboard?.writeText(url());
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
      >
        {copied ? <Check className="size-5" /> : <Link2 className="size-5" />}
      </button>
    </div>
  );
}
