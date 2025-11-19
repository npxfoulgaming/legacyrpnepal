import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger, createBatchScrollTrigger } from '../../lib/gsap-config'
import { CalendarDays, MapPin, Clock, X, Users, ArrowLeft, ClipboardClock } from 'lucide-react'
import { format } from 'date-fns'

// 🛠️ Ensure plugin is registered BEFORE using GSAP anywhere
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Force React to use layout calculation before animation
gsap.defaults({ lazy: false }) // Fixes production lazy bug

interface DiscordUser {
  id: string
  username: string
  avatar: string | null
}

interface DiscordEventCreator {
  id: string
  username: string
  avatar?: string | null
}

interface DiscordEventUserResponse {
  user: DiscordUser
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

  if (diffSec <= 0) return `Started ${Math.abs(diffSec)}s ago`
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`
  return `${Math.floor(diffSec / 3600)}h`
}

export const Events = () => {
  const [events, setEvents] = useState<DiscordEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<DiscordEvent | null>(null)
  const [userPopup, setUserPopup] = useState<DiscordUser[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [iconIndex, setIconIndex] = useState(0)
  const containerRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const icons = [<ClipboardClock size={20} />, <Clock size={20} />]

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/discord-events')
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        const data: DiscordEvent[] = await res.json()

        const activeEvents = data
          .filter((e) => [1, 2, 3].includes(e.status ?? 0))
          .map((event) => ({
            ...event,
            users: event.user_responses?.map((u) => u.user) ?? []
          }))

        setEvents(activeEvents)
      } catch (err) {
        console.error('Failed to fetch events:', err)
      } finally {
        setLoading(false)
        ScrollTrigger.refresh() // 🔥 Recalculate after load
      }
    }

    fetchEvents()
  }, [])

  // Live updates
  useEffect(() => {
    const interval = setInterval(() => setEvents((prev) => [...prev]), 1000)
    return () => clearInterval(interval)
  }, [])

  // GSAP animations
  useGSAP(
    () => {
      if (!titleRef.current) return

      gsap.from(titleRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 80%',
        }
      })

      gsap.set('.event-card', { scale: 0.9, opacity: 0 })

      createBatchScrollTrigger(
        '.event-card',
        { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
        { start: 'top 85%' }
      )

      return () => ScrollTrigger.getAll().forEach((t) => t.kill())
    },
    { scope: containerRef }
  )

  // Sorting
  const sortedEvents = [...events]
  iconIndex === 1
    ? sortedEvents.sort((a, b) => +new Date(a.scheduled_start_time) - +new Date(b.scheduled_start_time))
    : sortedEvents.reverse()

  return (
    <>
      {/* Header */}
      <div className="bg-gta-graphite/90 backdrop-blur-sm border-b border-gta-medium sticky top-0 z-40">
        <div className="container-gta py-4 flex justify-between items-center">
          <Link to="/" className="inline-flex items-center gap-2 text-gta-light hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </Link>

          <button onClick={() => setIconIndex((i) => (i + 1) % icons.length)}
            className="text-gta-light hover:text-white flex items-center gap-1">
            {icons[iconIndex]}
          </button>
        </div>
      </div>

      {/* Events */}
      <section ref={containerRef} className="py-20">
        <div className="section-container text-center mb-12">
          <h2 ref={titleRef} className="text-4xl md:text-6xl font-bold">
            <span className="gradient-text">Upcoming Server Events</span>
          </h2>
          <p className="text-xl text-gray-400">Stay updated with what’s happening.</p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Fetching events...</p>
        ) : sortedEvents.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event) => {
              const status = getEventStatus(event)
              const relativeTime = getRelativeTime(event)

              return (
                <div
                  key={event.id}
                  className="event-card cursor-pointer bg-gta-black/40 border rounded-xl p-5 transition-all duration-300 hover:border-gta-gold/40"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex justify-between mb-2">
                    <span className={`${status.color} w-3 h-3 rounded-full`}></span>
                    <span className="text-xs">{relativeTime}</span>
                  </div>

                  {event.image && (
                    <img
                      src={`https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.png?size=1024`}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      loading="lazy"
                    />
                  )}

                  <h3 className="text-2xl text-white mb-2">{event.name}</h3>

                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {event.description || 'No description'}
                  </p>

                  <a
                    href={`https://discord.com/events/${event.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-sm"
                  >
                    View on Discord
                  </a>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">No events found.</p>
        )}
      </section>
    </>
  )
}
