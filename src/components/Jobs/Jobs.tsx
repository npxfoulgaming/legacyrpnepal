import { useRef, useState, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../lib/gsap-config'
import { Briefcase, Shield, Users, DollarSign, ChevronRight, Globe } from 'lucide-react';
import siteConfig from '../../config/site.config.json'

const categoryIcons: Record<string, React.ReactNode> = {
  emergency: <Shield className="w-5 h-5" />,
  civilian: <Users className="w-5 h-5" />,
  criminal: <Briefcase className="w-5 h-5" />,
  business: <DollarSign className="w-5 h-5" />
}

export const Jobs = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hoveredJob, setHoveredJob] = useState<string | null>(null)
  const containerRef = useRef<HTMLElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)

  const filteredJobs = selectedCategory === 'all' 
    ? siteConfig.jobs.list 
    : siteConfig.jobs.list.filter(job => job.category === selectedCategory)

  // Initial animations for title and sidebar (only once)
  useGSAP(() => {
    // Title animation
    gsap.from(titleRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: titleRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    })
    
    // Sidebar animation
    gsap.from(sidebarRef.current, {
      x: -50,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      scrollTrigger: {
        trigger: sidebarRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    })

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger && containerRef.current?.contains(trigger.trigger as Element)) {
          trigger.kill()
        }
      })
    }
  }, { scope: containerRef }) // No dependencies - runs only once

  // Separate effect for animating job cards on category change
  useEffect(() => {
    // Animate job cards when category changes
    const cards = gsap.utils.toArray('.job-card') as Element[]
    
    // Set initial state
    gsap.set(cards, { opacity: 0, y: 20 })
    
    // Animate in with stagger
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: 'power2.out'
    })
  }, [selectedCategory])

  return (
    <section ref={containerRef} id="jobs" className="relative py-20 bg-gta-black">
      <div className="container-gta">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
          
          {/* Left Sidebar - GTA Menu Style */}
          <div ref={sidebarRef} className="lg:col-span-3">
            <div ref={titleRef} className="mb-8">
              <h2 className="text-5xl md:text-7xl font-bebas text-white mb-2">
                Available Jobs
              </h2>
              <p className="text-gta-light">
                Choose your career path
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full menu-item-gta text-left ${
                  selectedCategory === 'all' ? 'menu-item-active' : ''
                }`}
              >
                <span className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4" />
                  All Jobs
                </span>
              </button>
              {siteConfig.jobs.categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full menu-item-gta text-left ${
                    selectedCategory === category.id ? 'menu-item-active' : ''
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {categoryIcons[category.id]}
                    {category.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 p-4 bg-gta-graphite/50">
              <div className="stat-item mb-3">
                <p className="stat-label">Total Jobs</p>
                <p className="stat-value">{siteConfig.jobs.list.length}</p>
              </div>
              <div className="stat-item">
                <p className="stat-label">Active Workers</p>
                <p className="stat-value">{siteConfig.jobs.list.length * 4}</p>
              </div>
            </div>
          </div>

          {/* Right Content - Jobs Grid */}
          <div ref={contentRef} className="lg:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="job-card group relative"
                  onMouseEnter={() => setHoveredJob(job.id)}
                  onMouseLeave={() => setHoveredJob(null)}
                >
                  <div className="card-gta h-full flex flex-col">
                    {/* Job Header with Category */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bebas text-white mb-1">
                          {job.name}
                        </h3>
                        <p className="text-sm text-gta-gold uppercase tracking-wider">
                          {siteConfig.jobs.categories.find(c => c.id === job.category)?.name}
                        </p>
                      </div>
                      <div className="text-gta-green">
                        {categoryIcons[job.category]}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gta-light flex-1 mb-4">
                      {job.description}
                    </p>

                    {/* Requirements */}
                    <div className={`overflow-hidden transition-all duration-500 ${
                      hoveredJob === job.id ? 'max-h-40' : 'max-h-0'
                    }`}>
                      <div className="border-t border-gta-medium pt-4">
                        <p className="text-xs text-gta-gold uppercase tracking-wider mb-2">Requirements</p>
                        <ul className="space-y-1">
                          {job.requirements.map((req, index) => (
                            <li key={index} className="text-sm text-gta-light flex items-start gap-2">
                              <span className="text-gta-green mt-1">•</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Apply and Websites Buttons */}
                    <div className={`mt-4 flex gap-2 transition-all duration-500 ${
                      hoveredJob === job.id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      {/* Apply Now Button */}
                      <button
                        className="w-full btn-gta text-sm flex items-center justify-center gap-2"
                        onClick={() => window.open(job.apply_url, "_blank")}
                      >
                        <Briefcase /> Apply Now
                      </button>

                      {/* Websites Button */}
                      <button
                        className="w-full btn-gta text-sm flex items-center justify-center gap-2"
                        onClick={() => window.open(job.website, "_blank")}
                      >
                        <Globe />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}