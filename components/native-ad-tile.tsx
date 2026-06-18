"use client"

import { Zap, ExternalLink } from "lucide-react"

interface NativeAdTileProps {
  isVisible: boolean
  adUrl?: string
  adTitle?: string
  adDescription?: string
}

export function NativeAdTile({ 
  isVisible, 
  adUrl = "https://www.shopify.com",
  adTitle = "Scale Your Business",
  adDescription = "Discover powerful e-commerce tools and resources. Find integrations that help you manage your store more efficiently."
}: NativeAdTileProps) {
  if (!isVisible) return null

  const handleClick = () => {
    if (adUrl) {
      window.open(adUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <a
      href={adUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group block bg-gradient-to-br from-purple-600 to-pink-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-300 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
    >
      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
        <Zap className="w-8 h-8" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-lg flex items-center gap-2 group-hover:gap-3 transition-all">
          {adTitle}
          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h4>
        <p className="text-white/80 text-sm leading-relaxed">
          {adDescription}
        </p>
      </div>
      <div className="px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold text-sm group-hover:bg-slate-100 transition-colors shrink-0">
        Visit
      </div>
    </a>
  )
}
