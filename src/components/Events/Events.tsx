import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import Link from "react-router-dom";
import { gsap, ScrollTrigger, createBatchScrollTrigger } from '../../lib/gsap-config'
import { CalendarDays, MapPin, Clock, X, Users, ArrowLeft, ClipboardClock } from 'lucide-react'
import { format } from 'date-fns'
// import { Footer } from '../Footer/Footer'

interface DiscordUser {
  id: string
  username: string
  avatar: string | null
  discriminator: string
}

interface DiscordEventCreator {
  id: string
  username: string
  avatar?: string | null
}

interface DiscordEventUserResponse {
  guild_scheduled_event_id: string
  user_id: string
  user: DiscordUser
  response: number
}

interface DiscordEvent {
  id: string
  name: string
  description?: string
  scheduled_start_time: string
  scheduled_end_time?: string
  status?: number
  entity_metadata?: { location?: string }
  image?: string
  creator?: DiscordEventCreator
  users?: DiscordUser[]
  user_responses?: DiscordEventUserResponse[]
}

// --- Helper to get status and color ---
const getEventStatus = (event: DiscordEvent) => {
  const start = new Date(event.scheduled_start_time)
  const now = new Date()
  const diffSec = Math.floor((start.getTime() - now.getTime()) / 1000)

  if (diffSec > 0 && diffSec <= 360) return { label: 'Starting Soon', color: 'bg-purple-500' }
  if (diffSec <= 0) return { label: 'Happening Now', color: 'bg-green-500' }
  return { label: 'Upcoming Event', color: 'bg-blue-500' }
}

// --- Helper to get relative time ---
const getRelativeTime = (event: DiscordEvent) => {
  const start = new Date(event.scheduled_start_time)
  const now = new Date()
  const diffSec = Math.floor((start.getTime() - now.getTime()) / 1000)

  if (diffSec <= 0) {
    const agoSec = Math.abs(diffSec)
    if (agoSec < 60) return `Started ${agoSec} second${agoSec !== 1 ? 's' : ''} ago`
    if (agoSec < 3600) return `Started ${Math.floor(agoSec / 60)} minute${Math.floor(agoSec / 60) !== 1 ? 's' : ''} ago`
    if (agoSec < 86400) return `Started ${Math.floor(agoSec / 3600)} hour${Math.floor(agoSec / 3600) !== 1 ? 's' : ''} ago`
    if (agoSec < 604800) return `Started ${Math.floor(agoSec / 86400)} day${Math.floor(agoSec / 86400) !== 1 ? 's' : ''} ago`
    if (agoSec < 2592000) return `Started ${Math.floor(agoSec / 604800)} week${Math.floor(agoSec / 604800) !== 1 ? 's' : ''} ago`
    if (agoSec < 31536000) return `Started ${Math.floor(agoSec / 2592000)} month${Math.floor(agoSec / 2592000) !== 1 ? 's' : ''} ago`
    return `Started ${Math.floor(agoSec / 31536000)} year${Math.floor(agoSec / 31536000) !== 1 ? 's' : ''} ago`
  }

  if (diffSec < 60) return `${diffSec} second${diffSec !== 1 ? 's' : ''}`
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minute${Math.floor(diffSec / 60) !== 1 ? 's' : ''}`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hour${Math.floor(diffSec / 3600) !== 1 ? 's' : ''}`
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} day${Math.floor(diffSec / 86400) !== 1 ? 's' : ''}`
  if (diffSec < 2592000) return `${Math.floor(diffSec / 604800)} week${Math.floor(diffSec / 604800) !== 1 ? 's' : ''}`
  if (diffSec < 31536000) return `${Math.floor(diffSec / 2592000)} month${Math.floor(diffSec / 2592000) !== 1 ? 's' : ''}`
  return `${Math.floor(diffSec / 31536000)} year${Math.floor(diffSec / 31536000) !== 1 ? 's' : ''}`
}

export const Events = () => {
  const [events, setEvents] = useState<DiscordEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<DiscordEvent | null>(null)
  const [userPopup, setUserPopup] = useState<DiscordUser[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [iconIndex, setIconIndex] = useState(0) // 0 = ClipboardClock, 1 = Clock
  const containerRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const icons = [<ClipboardClock size={20} />, <Clock size={20} />]

  // --- Fetch events ---
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/discord-events')
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        const data: DiscordEvent[] = await res.json()

        const activeEvents = data
          .filter((e) => [1, 2, 3].includes(e.status ?? 0))
          .map((event) => {
            const users: DiscordUser[] = event.user_responses?.map((u) => u.user) ?? []
            return { ...event, users }
          })

        setEvents(activeEvents)
      } catch (err) {
        console.error('Failed to fetch Discord events:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // --- Live timer update every second ---
  useEffect(() => {
    const interval = setInterval(() => setEvents((prev) => [...prev]), 1000)
    return () => clearInterval(interval)
  }, [])

  // --- GSAP animations ---
  useGSAP(() => {
    gsap.from(titleRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: titleRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    })

    createBatchScrollTrigger(
      '.event-card',
      { scale: 1, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power2.out' },
      { start: 'top 90%', toggleActions: 'play none none reverse' }
    )

    gsap.set('.event-card', { scale: 0, opacity: 0 })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger && containerRef.current?.contains(trigger.trigger as Element)) {
          trigger.kill()
        }
      })
    }
  }, { scope: containerRef })

  // --- Sorted events based on icon ---
  const sortedEvents = [...events]
  if (iconIndex === 1) {
    // Clock → sort by start time ascending
    sortedEvents.sort((a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime())
  } else {
    // ClipboardClock → newest first
    sortedEvents.reverse()
  }

  return (
    <>
      {/* Header */}
      <div className="bg-gta-graphite/90 backdrop-blur-sm border-b border-gta-medium sticky top-0 z-40">
        <div className="container-gta py-4 flex justify-between items-center">
          <Link to="/" className="inline-flex items-center gap-2 text-gta-light hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <button
            onClick={() => setIconIndex((prev) => (prev + 1) % icons.length)}
            className="text-gta-light hover:text-white transition-colors flex items-center gap-1"
          >
            {icons[iconIndex]}
          </button>
        </div>
      </div>

      {/* Event List Section */}
      <section ref={containerRef} id="events" className="relative py-20 overflow-hidden">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 ref={titleRef} className="text-4xl md:text-6xl font-gaming font-bold mb-4">
              <span className="gradient-text">Upcoming Server Events</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Stay updated with what’s happening on our server.
            </p>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 mt-10">Fetching events...</p>
          ) : sortedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedEvents.map((event) => {
                const status = getEventStatus(event)
                const relativeTime = getRelativeTime(event)

                return (
                  <div
                    key={event.id}
                    className="event-card relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-gta-black/40 backdrop-blur-sm p-5 group hover:border-gta-gold/40 transition-all duration-300"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${status.color}`}></span>
                        <span className="text-sm text-gray-300">{status.label}</span>
                      </div>
                      <span className="text-xs text-gray-400">{relativeTime}</span>
                    </div>

                    {event.image && (
                      <img
                        src={`https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.png?size=1024`}
                        alt={event.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        loading="lazy"
                      />
                    )}

                    <h3 className="text-2xl font-bebas text-white mb-2">{event.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{event.description || 'No description available.'}</p>

                    <div className="flex items-center text-gta-light gap-2 text-sm mb-1">
                      <Clock size={16} />
                      {format(new Date(event.scheduled_start_time), 'MMM dd, yyyy hh:mm a')}
                    </div>

                    {event.entity_metadata?.location && (
                      <div className="flex items-center text-gta-light gap-2 text-sm mb-1">
                        <MapPin size={16} />
                        {event.entity_metadata.location}
                      </div>
                    )}

                    {event.creator && (
                      <div className="flex items-center gap-2 text-gta-light text-sm mb-1">
                        <img
                          src={event.creator.avatar
                            ? `https://cdn.discordapp.com/avatars/${event.creator.id}/${event.creator.avatar}.png?size=64`
                            : '/default-avatar.png'}
                          alt={event.creator.username}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>Created by {event.creator.username}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <a
                        href={`https://discord.com/events/${event.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-lg shadow-neon hover:from-purple-600 hover:to-blue-500 transition-all duration-300"
                      >
                        View Event In Discord
                      </a>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setUserPopup(event.users ?? [])
                        }}
                        className="flex items-center gap-1 text-gta-gold text-sm hover:text-yellow-400 transition-colors"
                      >
                        <Users size={16} />
                        {event.users?.length ?? 0} Interested
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-10">No scheduled events found.</p>
          )}
        </div>
      </section>

      {/* Event Modal */}
      {selectedEvent && (() => {
        const status = getEventStatus(selectedEvent)
        const relativeTime = getRelativeTime(selectedEvent)

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-neon-cyan transition-colors"
            >
              <X size={24} />
            </button>

            <div
              className="max-w-3xl w-full bg-gta-black/80 p-6 rounded-lg border border-white/10 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${status.color}`}></span>
                  <span className="text-sm text-gray-300">{status.label}</span>
                </div>
                <span className="text-xs text-gray-400">{relativeTime}</span>
              </div>

              {selectedEvent.image && (
                <img
                  src={`https://cdn.discordapp.com/guild-events/${selectedEvent.id}/${selectedEvent.image}.png?size=1024`}
                  alt={selectedEvent.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}

              <h3 className="text-3xl font-bebas text-white mb-2">{selectedEvent.name}</h3>
              <p className="text-gray-300 mb-4 whitespace-pre-line">{selectedEvent.description || 'No description available.'}</p>

              {selectedEvent.creator && (
                <div className="flex items-center gap-2 text-sm mb-4">
                  <img
                    src={selectedEvent.creator.avatar
                      ? `https://cdn.discordapp.com/avatars/${selectedEvent.creator.id}/${selectedEvent.creator.avatar}.png?size=64`
                      : '/default-avatar.png'}
                    alt={selectedEvent.creator.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span>Created by {selectedEvent.creator.username}</span>
                </div>
              )}

              {/* Discord Link + Interested in Modal */}
              <div className="flex flex-col gap-2 text-gta-light text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  <span>Starts: {format(new Date(selectedEvent.scheduled_start_time), 'MMM dd, yyyy hh:mm a')}</span>
                </div>
                {selectedEvent.scheduled_end_time && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Ends: {format(new Date(selectedEvent.scheduled_end_time), 'MMM dd, yyyy hh:mm a')}</span>
                  </div>
                )}
                {selectedEvent.entity_metadata?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{selectedEvent.entity_metadata.location}</span>
                  </div>
                )}
              </div>
              <br />
              <div className="flex items-center justify-between mb-4">
                <a
                  href={`https://discord.com/events/${selectedEvent.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-lg shadow-neon hover:from-purple-600 hover:to-blue-500 transition-all duration-300"
                >
                  View Event In Discord
                </a>

                <button
                  onClick={() => setUserPopup(selectedEvent.users ?? [])}
                  className="flex items-center gap-1 text-gta-gold text-sm hover:text-yellow-400 transition-colors"
                >
                  <Users size={16} />
                  {selectedEvent.users?.length ?? 0} Interested
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Interested Users Popup */}
      {userPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setUserPopup(null)}
        >
          <button
            onClick={() => setUserPopup(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-neon-cyan transition-colors"
          >
            <X size={24} />
          </button>

          <div
            className="max-w-md w-full bg-gta-black/80 p-4 rounded-lg border border-white/10 text-white overflow-y-auto max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-xl font-semibold mb-4">Interested Users ({userPopup.length})</h4>
            <ul className="flex flex-col gap-3">
              {userPopup.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-md transition-colors"
                >
                  <img
                    src={user.avatar
                      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
                      : '/default-avatar.png'}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                  />
                  <span className="text-white font-medium">{user.username}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Footer
      <Footer /> */}

    </>
  )
}
