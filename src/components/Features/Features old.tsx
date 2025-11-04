import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../lib/gsap-config'
import * as Icons from 'lucide-react'
import siteConfig from '../../config/site.config.json'

export const Features = () => {
  const containerRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Title animation without scrub for cleaner effect
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

    // Cards animation with scrub
    const cards = gsap.utils.toArray('.feature-card') as Element[]
    
    cards.forEach((card, index) => {
      // Clean entrance animation
      gsap.from(card, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.1,
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      })
      
      // Setup hover effects separately
      const icon = card.querySelector('.feature-icon')
      if (icon) {
        card.addEventListener('mouseenter', () => {
          gsap.to(icon, {
            scale: 1.1,
            duration: 0.3,
            ease: 'power2.out'
          })
        })
        
        card.addEventListener('mouseleave', () => {
          gsap.to(icon, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          })
        })
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
  }, { scope: containerRef })

  const getIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as React.FC<{ size?: number }>
    return Icon ? <Icon size={28} /> : <Icons.Box size={28} />
  }

  return (
    <section ref={containerRef} id="features" className="section-padding bg-gradient-to-b from-gta-black to-gta-graphite">
      <div className="container-gta">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 
            ref={titleRef}
            className="text-5xl md:text-7xl font-bebas text-white mb-4"
          >
            Server Features
          </h2>
          <p className="text-xl text-gta-light max-w-2xl mx-auto">
            Everything you need for the ultimate roleplay experience
          </p>
        </div>

        {/* Features Grid */}
        <div ref={cardsRef} className="grid-gta">
          {siteConfig.features.map((feature) => (
            <div
              key={feature.id}
              className="feature-card card-gta group"
            >
              {/* Icon */}
              <div className="mb-4">
                <div className="feature-icon inline-flex p-3 bg-gta-green/10 text-gta-green">
                  {getIcon(feature.icon)}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bebas text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gta-light">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}