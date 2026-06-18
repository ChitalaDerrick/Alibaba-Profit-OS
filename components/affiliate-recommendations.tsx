'use client'

import { ExternalLink } from 'lucide-react'

interface AffiliateLink {
  name: string
  url: string
  description: string
  icon: string
  category: string
}

export function AffiliateRecommendations() {
  const affiliates: AffiliateLink[] = [
    {
      name: 'Shopify',
      url: '', // User will provide this
      description: 'Build your online store and start selling online',
      icon: '🛍️',
      category: 'ecommerce',
    },
    {
      name: 'More partners coming soon',
      url: '#',
      description: 'Curated partners to grow your business',
      icon: '🤝',
      category: 'partners',
    },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 mb-6">
        Connect with trusted partners to scale your e-commerce business. Click on any partner to get started.
      </p>
      
      <div className="grid grid-cols-1 gap-4">
        {affiliates.map((affiliate) => (
          <a
            key={affiliate.name}
            href={affiliate.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 rounded-2xl border border-slate-200 hover:border-primary hover:shadow-lg transition-all duration-300 hover:bg-primary/5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <span className="text-2xl">{affiliate.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {affiliate.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {affiliate.description}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0" />
            </div>
          </a>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-xs text-blue-900">
          <span className="font-semibold">💡 Tip:</span> Use these tools to optimise your e-commerce business.
        </p>
      </div>
    </div>
  )
}
