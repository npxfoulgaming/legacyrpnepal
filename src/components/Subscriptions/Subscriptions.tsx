import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  Crown,
  Gem,
  X,
  Briefcase,
  Music,
  Skull
} from 'lucide-react'
import siteConfig from '../../config/site.config.json'

interface DonationPackage {
  name: string
  price: number
  image: string
  smallimage?: string
  description: string
  perks: string[]
  category: string
  new?: boolean
  discount?: boolean
  discount_percentage?: number
  button: {
    checkout_label: string
    checkout_url: string
    view_label: string
    view_url: string
  }
}

export const Subscriptions: React.FC = () => {
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedPackage, setSelectedPackage] = useState<DonationPackage | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { donations } = siteConfig as {
    donations: {
      enabled: boolean
      currency: string
      packages: DonationPackage[]
    }
  }

  const packageIcons: Record<string, React.ReactElement> = {
    Supporter: <Star className="w-6 h-6 text-gta-green" />,
    VIP: <Crown className="w-6 h-6 text-gta-gold" />,
    Elite: <Gem className="w-6 h-6 text-gta-purple" />,
  }

  const categoryIcons: Record<string, React.ReactElement> = {
    business: <Briefcase className="w-6 h-6 text-gta-blue" />,
    edm: <Music className="w-6 h-6 text-gta-pink" />,
    gang: <Skull className="w-6 h-6 text-gta-red" />,
  }

  const getIconForPackage = (pkg: DonationPackage) =>
    packageIcons[pkg.name] || categoryIcons[pkg.category] || <Star className="w-6 h-6 text-white" />

  const categoryColors: Record<string, string> = {
    business: 'bg-gta-blue text-white',
    edm: 'bg-gta-pink text-white',
    gang: 'bg-gta-red text-white',
  }

  const getFinalPrice = (pkg: DonationPackage) => {
    if (pkg.discount && pkg.discount_percentage) {
      return pkg.price - (pkg.price * pkg.discount_percentage) / 100
    }
    return pkg.price
  }

  const filteredPackages = donations.packages.filter((pkg) => {
    const matchesCategory = category === 'all' || pkg.category === category
    const matchesSearch = pkg.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gta-black to-gta-graphite">
      {/* Header */}
      <div className="bg-gta-graphite/90 backdrop-blur-sm border-b border-gta-medium sticky top-0 z-40">
        <div className="container-gta py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gta-light hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </Link>
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search packages..."
              className="px-4 py-2 rounded-lg bg-gta-black text-white border border-gta-medium flex-1 shadow-sm focus:ring-2 focus:ring-gta-gold focus:outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Category Select */}
            <select
              className="px-4 py-2 rounded-lg bg-gta-black text-white border border-gta-medium shadow-sm focus:ring-2 focus:ring-gta-gold focus:outline-none transition-all"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="edm">EDM</option>
              <option value="business">Business</option>
              <option value="gang">Gang</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-gta py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-bebas text-white mb-4">Support the Server</h1>
            <p className="text-xl text-gta-light">Help us keep the server running and growing!</p>
          </div>

          {/* Subscriptions Links Above Packages Grid */}
          <div className="mb-8 flex flex-col md:flex-row gap-8 justify-center border-b border-gta-medium">
            <Link
              to="/subscriptions"
              className={`px-2 py-1 text-center text-lg font-semibold transition-colors ${
                location.pathname === '/subscriptions'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gta-light hover:text-white border-b-2 border-transparent'
              }`}
            >
              Legacy Fivem Server
            </Link>
            <Link
              to="/subscriptions-rdr"
              className={`px-2 py-1 text-center text-lg font-semibold transition-colors ${
                location.pathname === '/subscriptions-rdr'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gta-light hover:text-white border-b-2 border-transparent'
              }`}
            >
              Legacy RDR Server
            </Link>
          </div>

          {/* Packages Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.name + pkg.category}
                className="relative bg-gta-graphite/80 rounded-xl p-6 cursor-pointer hover:scale-105 transition-transform shadow-lg"
                onClick={() => setSelectedPackage(pkg)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getIconForPackage(pkg)}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bebas text-white">{pkg.name}</h2>
                        <span
                          className={`text-xs uppercase tracking-wider px-2 py-1 rounded-md ${
                            categoryColors[pkg.category] || 'bg-gta-medium text-white'
                          }`}
                        >
                          {pkg.category}
                        </span>
                        {pkg.new && (
                          <span className="text-xs uppercase tracking-wider px-2 py-1 rounded-md bg-red-600 text-white font-bold animate-bounce duration-1000">
                            NEW
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {pkg.discount ? (
                    <div className="relative text-lg font-bebas inline-block">
                      {/* Old price */}
                      <span
                        className="text-gta-light line-through absolute left-0 top-0"
                        style={{
                          zIndex: 10,
                          animation: 'frontToBack 60s linear infinite', // full 60s cycle
                        }}
                      >
                        {donations.currency} {pkg.price}
                      </span>

                      {/* Discounted price */}
                      <span
                        className="text-gta-gold relative z-20"
                        style={{
                          opacity: 0,
                          animation: 'fadeInDiscount 60s linear infinite',
                        }}
                      >
                        {donations.currency} {getFinalPrice(pkg)}
                      </span>

                      <style>
                        {`
                          @keyframes frontToBack {
                            0%, 7% { /* first 4.2s old price fully in front */
                              transform: rotate(0deg) translateY(0px) scale(1);
                              opacity: 1;
                              z-index: 10;
                            }
                            10% { /* slides behind */
                              transform: rotate(-30deg) translateY(-5px) scale(1);
                              opacity: 0.6;
                              z-index: 0;
                            }
                            100% { /* stays behind for the rest of cycle */
                              transform: rotate(-30deg) translateY(-5px) scale(1);
                              opacity: 0.6;
                              z-index: 0;
                            }
                          }

                          @keyframes fadeInDiscount {
                            0%, 7% { /* hidden during old price front */
                              opacity: 0;
                            }
                            10%, 100% { /* visible after old price slides behind */
                              opacity: 1;
                            }
                          }
                        `}
                      </style>
                    </div>
                  ) : (
                    <span className="text-lg font-bebas text-gta-gold">
                      {donations.currency} {pkg.price}
                    </span>
                  )}
                </div>

                <p className="text-gta-light mb-2">{pkg.description}</p>

                <div className="flex items-start gap-4 relative">
                  <ul className="list-disc list-inside text-gta-light mb-2 ml-6 flex-1">
                    {pkg.perks.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>
                  {pkg.smallimage && (
                    <img
                      src={pkg.smallimage}
                      alt={`${pkg.name} small`}
                      className="w-20 h-20 object-contain rounded -ml-4 transition-transform duration-200 hover:scale-105"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-gta-light">
            <p>
              All donations are voluntary and help support server maintenance, development, and new content creation.
            </p>
            <p className="mt-2">Thank you for your support!</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedPackage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-auto"
          onClick={() => setSelectedPackage(null)}
        >
          <div
            className="bg-gta-graphite rounded-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <X
              className="absolute top-4 right-4 w-6 h-6 cursor-pointer text-white transition transform duration-200 ease-in-out hover:text-red-500 hover:scale-110"
              onClick={() => setSelectedPackage(null)}
            />

            <div className="flex items-center gap-2 mb-2">
              {getIconForPackage(selectedPackage)}
              <h2 className="text-3xl font-bebas text-white">{selectedPackage.name}</h2>
              <span
                className={`text-xs uppercase tracking-wider px-2 py-1 rounded-md ${
                  categoryColors[selectedPackage.category] || 'bg-gta-medium text-white'
                }`}
              >
                {selectedPackage.category}
              </span>
              {selectedPackage.new && (
                <span className="text-xs uppercase tracking-wider px-2 py-1 rounded-md bg-red-600 text-white font-bold animate-bounce duration-1000">
                  NEW
                </span>
              )}
            </div>

            <p className="text-gta-light mb-4">{selectedPackage.description}</p>

            {/* Media Display */}
            {(() => {
              const mediaUrl = selectedPackage.image
              if (!mediaUrl) return null

              if (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) {
                const videoIdMatch = mediaUrl.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]+)/)
                const videoId = videoIdMatch ? videoIdMatch[1] : null
                if (videoId) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      className="w-full h-64 md:h-80 rounded mb-4"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  )
                }
              }

              if (/\.(mp4|webm|ogg)$/i.test(mediaUrl)) {
                return (
                  <video
                    src={mediaUrl}
                    controls
                    className="w-full h-64 md:h-80 object-cover rounded mb-4"
                  />
                )
              }

              return (
                <img
                  src={mediaUrl}
                  alt={selectedPackage.name}
                  className="w-full h-64 md:h-80 object-cover rounded mb-4"
                />
              )
            })()}

            {/* Perks + Price */}
            <div className="flex flex-col md:flex-row gap-6 mb-4">
              <ul className="list-disc list-inside text-gta-light flex-1 ml-6">
                {selectedPackage.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>

              {/* Price Section */}
              <div className="flex flex-col justify-start text-right">
                {selectedPackage.discount ? (
                  <div className="relative text-lg font-bebas inline-block">
                    {/* Old price */}
                    <span
                      className="text-gta-light line-through block"
                    >
                      {donations.currency} {selectedPackage.price}
                    </span>
                    {/* Discounted price */}
                    <span className="text-gta-gold block">
                      {donations.currency} {getFinalPrice(selectedPackage)}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bebas text-gta-gold">
                    {donations.currency} {selectedPackage.price}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-row gap-3">
              <a
                href={selectedPackage.button.checkout_url}
                className="btn-gta-gold flex-1 text-center py-2 rounded transition duration-300 ease-in-out hover:bg-yellow-500 hover:text-black"
              >
                {selectedPackage.button.checkout_label}
              </a>
              <a
                href={selectedPackage.button.view_url}
                className="btn-gta-light flex-1 text-center py-2 rounded transition duration-300 ease-in-out hover:bg-gray-300 hover:text-black"
              >
                {selectedPackage.button.view_label}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
