import { ExternalLink, ShieldCheck } from "lucide-react";
import type { OfficialLink } from "@/lib/types";

export default function OfficialLinks({ links }: { links: OfficialLink[] }) {
  if (!links.length) return null;

  return (
    <div className="glass p-6 rounded-2xl animate-slide-up border border-emerald-500/10">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <p className="text-xs text-emerald-400 uppercase tracking-widest font-medium">
          Official Links
        </p>
        <span className="ml-auto text-xs text-white/25 bg-white/5 px-2 py-0.5 rounded-full">
          Verified sources
        </span>
      </div>

      <p className="text-xs text-white/35 mb-4 leading-relaxed">
        Everything mentioned in this reel — direct links, no engagement bait required.
      </p>

      <div className="flex flex-col gap-2">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/6 hover:border-emerald-500/20 transition-all group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">
                {link.label}
              </p>
              <p className="text-xs text-white/40 mt-0.5 leading-relaxed truncate">
                {link.description}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-white/25 hidden sm:block truncate max-w-[140px]">
                {link.url.replace(/^https?:\/\//, "").split("/")[0]}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-white/25 group-hover:text-emerald-400 transition-colors" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
