import { ExternalLink, CheckCircle, AlertTriangle, TrendingDown, Search } from "lucide-react";
import type { MentionedProduct } from "@/lib/types";

const PLAUSIBILITY_CONFIG = {
  plausible: {
    icon: CheckCircle,
    color: "#00D48A",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    label: "Price looks real",
  },
  low: {
    icon: TrendingDown,
    color: "#F5C842",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    label: "Suspiciously cheap",
  },
  suspicious: {
    icon: AlertTriangle,
    color: "#FF3B5C",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    label: "Price likely fake",
  },
};

const CATEGORY_ICONS: Record<string, string> = {
  watch: "⌚",
  phone: "📱",
  clothing: "👕",
  accessories: "👜",
  electronics: "💡",
  home: "🏠",
  beauty: "💄",
  other: "📦",
};

export default function ProductCard({ product }: { product: MentionedProduct }) {
  const plausibility = PLAUSIBILITY_CONFIG[product.price_plausibility] ?? PLAUSIBILITY_CONFIG.low;
  const PlausibilityIcon = plausibility.icon;

  return (
    <div className="glass p-5 rounded-xl flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">
          {CATEGORY_ICONS[product.category] ?? "📦"}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-snug">{product.name}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {product.claimed_price && (
              <span className="text-xs px-2 py-0.5 rounded bg-white/8 text-white/70 border border-white/8 font-medium">
                {product.claimed_price}
              </span>
            )}
            {product.claimed_platform && (
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                on {product.claimed_platform}
              </span>
            )}
          </div>
        </div>

        <div
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium ${plausibility.bg} border ${plausibility.border}`}
          style={{ color: plausibility.color }}
        >
          <PlausibilityIcon className="w-3 h-3" />
          {plausibility.label}
        </div>
      </div>

      {/* Visual details */}
      {product.visual_details && (
        <div className="flex items-start gap-2 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/5">
          <Search className="w-3 h-3 text-white/25 mt-0.5 shrink-0" />
          <p className="text-xs text-white/50 leading-relaxed">{product.visual_details}</p>
        </div>
      )}

      {/* Price note */}
      {product.price_note && (
        <p className="text-xs text-white/45 leading-relaxed -mt-1">{product.price_note}</p>
      )}

      {/* Search links */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-white/30 uppercase tracking-wider font-medium">
          Find this product
        </p>
        <div className="flex gap-2 flex-wrap">
          {product.flipkart_search_url && (
            <a
              href={product.flipkart_search_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F9A11B]/10 hover:bg-[#F9A11B]/18 border border-[#F9A11B]/20 hover:border-[#F9A11B]/40 transition-all group"
            >
              <span className="text-sm">🛒</span>
              <span className="text-xs font-medium text-[#F9A11B]">Flipkart</span>
              <ExternalLink className="w-3 h-3 text-[#F9A11B]/50 group-hover:text-[#F9A11B] transition-colors" />
            </a>
          )}
          {product.amazon_search_url && (
            <a
              href={product.amazon_search_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FF9900]/10 hover:bg-[#FF9900]/18 border border-[#FF9900]/20 hover:border-[#FF9900]/40 transition-all group"
            >
              <span className="text-sm">📦</span>
              <span className="text-xs font-medium text-[#FF9900]">Amazon</span>
              <ExternalLink className="w-3 h-3 text-[#FF9900]/50 group-hover:text-[#FF9900] transition-colors" />
            </a>
          )}
          {product.google_shopping_url && (
            <a
              href={product.google_shopping_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 hover:border-blue-400/40 transition-all group"
            >
              <span className="text-sm">🛍️</span>
              <span className="text-xs font-medium text-blue-400">Google Shopping</span>
              <ExternalLink className="w-3 h-3 text-blue-400/50 group-hover:text-blue-400 transition-colors" />
            </a>
          )}
        </div>
        <p className="text-xs text-white/20 mt-1">
          💡 For exact match — screenshot the product from the reel and search with Google Lens
        </p>
      </div>
    </div>
  );
}
