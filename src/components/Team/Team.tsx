import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../lib/gsap-config'
import { MessageCircle, Crown, Shield, Wrench } from 'lucide-react'
import siteConfig from '../../config/site.config.json'
import { cn } from '../../utils/cn'
import { getAssetUrl } from '../../utils/assetUrl'

const roleIcons: Record<string, React.ReactNode> = {
  'Server Overwatcher': <Crown className="w-4 h-4" />,
  'Head Admin': <Shield className="w-4 h-4" />,
  'Developer': <Wrench className="w-4 h-4" />,
  'Moderator': <MessageCircle className="w-4 h-4" />
}

const roleColors: Record<string, string> = {
  'Server Overwatcher': 'from-yellow-400 to-orange-500',
  'Head Admin': 'from-red-400 to-pink-500',
  'Developer': 'from-blue-400 to-cyan-500',
  'Moderator': 'from-green-400 to-teal-500'
}

export const Team = () => {
  const containerRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Title animation
    gsap.from(titleRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: titleRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    })

    // Team cards animation
    const cards = gsap.utils.toArray('.team-card') as Element[]
    
    cards.forEach((card, index) => {
      // Entry animation
      gsap.from(card, {
        y: 100,
        opacity: 0,
        rotateY: -45,
        duration: 0.8,
        delay: index * 0.15,
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      })

      // 3D hover effect setup
      const inner = card.querySelector('.card-inner')
      const avatar = card.querySelector('.avatar-container')
      
      card.addEventListener('mouseenter', () => {
        gsap.to(inner, {
          rotateY: 5,
          rotateX: -5,
          duration: 0.4,
          ease: 'power2.out'
        })
        gsap.to(avatar, {
          scale: 1.1,
          duration: 0.4,
          ease: 'power2.out'
        })
      })

      card.addEventListener('mousemove', (e: Event) => {
        const mouseEvent = e as MouseEvent
        const rect = (card as HTMLElement).getBoundingClientRect()
        const x = (mouseEvent.clientX - rect.left) / rect.width
        const y = (mouseEvent.clientY - rect.top) / rect.height
        
        gsap.to(inner, {
          rotateY: (x - 0.5) * 20,
          rotateX: (0.5 - y) * 20,
          duration: 0.4,
          ease: 'power2.out'
        })
      })

      card.addEventListener('mouseleave', () => {
        gsap.to(inner, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.4,
          ease: 'power2.out'
        })
        gsap.to(avatar, {
          scale: 1,
          duration: 0.4,
          ease: 'power2.out'
        })
      })
    })

    // Floating animation for decorative elements
    gsap.to('.float-element', {
      y: -20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      stagger: 0.5
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

  return (
    <section ref={containerRef} id="team" className="relative py-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="float-element absolute top-20 left-10 w-20 h-20 bg-neon-cyan/10 rounded-full blur-xl" />
        <div className="float-element absolute bottom-20 right-10 w-32 h-32 bg-neon-magenta/10 rounded-full blur-xl" />
        <div className="float-element absolute top-1/2 left-1/3 w-24 h-24 bg-electric-blue/10 rounded-full blur-xl" />
      </div>

      <div className="section-container relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 
            ref={titleRef}
            className="text-4xl md:text-6xl font-gaming font-bold mb-4"
          >
            <span className="gradient-text">Our Team</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Meet the dedicated team behind the server
          </p>
        </div>

        {/* Team Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {siteConfig.team.map((member) => (
            <div
              key={member.id}
              className="team-card group"
              style={{ perspective: '1000px' }}
            >
              <div className="card-inner relative transform-gpu transition-transform duration-300">
                <div className="card-cyber h-full text-center relative overflow-hidden">
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-magenta/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Avatar */}
                  <div className="avatar-container mb-4 relative inline-block">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta p-[2px]">
                      <img 
                        src={getAssetUrl(member.avatar)}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    
                    {/* Role badge */}
                    <div className={cn(
                      "absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium",
                      "bg-gradient-to-r text-white flex items-center gap-1",
                      roleColors[member.role] || 'from-gray-400 to-gray-600'
                    )}>
                      {roleIcons[member.role]}
                      <span>{member.role}</span>
                    </div>
                  </div>

                  {/* Member info */}
                  <h3 className="text-lg font-gaming font-semibold mb-1 mt-4 text-neon-cyan">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {member.description}
                  </p>

                  {/* Socials icons */}
                  <div className="flex justify-center items-center gap-3 mt-2">
                    {/* Discord */}
                    {member.discord && (
                      <a
                        href={
                          /^\d{17,19}$/.test(member.discord)
                            ? `https://discord.com/users/${member.discord}`
                            : `https://discord.com/users/@${member.discord}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`@${member.discord}`}
                        className="text-gray-400 hover:text-neon-cyan transition-colors z-10 relative"
                        style={{ pointerEvents: 'auto' }} // Ensure click works
                      >
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      </a>
                    )}
          
                    {/* Github */}
                    {member.github && (
                      <a
                        href={`https://www.facebook.com/${member.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${member.github}`}
                        className="text-gray-400 hover:text-neon-cyan transition-colors z-10 relative"
                        style={{ pointerEvents: 'auto' }} // Ensure click works
                      >
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.26.82-.577v-2.234c-3.338.726-4.033-1.415-4.033-1.415-.546-1.386-1.334-1.756-1.334-1.756-1.089-.744.083-.729.083-.729 1.205.085 1.838 1.24 1.838 1.24 1.07 1.834 2.809 1.304 3.495.997.108-.775.419-1.305.762-1.604-2.665-.305-5.467-1.332-5.467-5.932 0-1.31.468-2.381 1.235-3.221-.124-.303-.536-1.527.117-3.176 0 0 1.008-.323 3.3 1.23a11.51 11.51 0 0 1 3.003-.404c1.019.005 2.047.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.654 1.649.242 2.873.118 3.176.77.84 1.234 1.911 1.234 3.221 0 4.61-2.807 5.624-5.479 5.921.431.372.815 1.104.815 2.225v3.293c0 .32.218.694.825.576C20.565 21.796 24 17.3 24 12c0-6.628-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    )}

                    {/* Facebook */}
                    {member.facebook && (
                      <a
                        href={`https://www.facebook.com/${member.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${member.facebook}`}
                        className="text-gray-400 hover:text-neon-cyan transition-colors z-10 relative"
                        style={{ pointerEvents: 'auto' }} // Ensure click works
                      >
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M22.675 0h-21.35C.595 0 0 .593 0 1.326v21.348C0 23.406.595 24 1.326 24H12v-9.294H9.294v-3.622H12V8.413c0-2.675 1.634-4.13 4.023-4.13 1.14 0 2.116.084 2.398.122v2.78l-1.646.001c-1.291 0-1.54.615-1.54 1.518v1.99h3.079l-.402 3.622h-2.677V24h5.254c.73 0 1.326-.594 1.326-1.326V1.326C24 .593 23.405 0 22.675 0z"/>
                        </svg>
                      </a>
                    )}
              
                    {/* Instagram */}
                    {member.instagram && (
                      <a
                        href={`https://www.instagram.com/${member.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${member.instagram}`}
                        className="text-gray-400 hover:text-neon-cyan transition-colors z-10 relative"
                        style={{ pointerEvents: 'auto' }} // Ensure click works
                      >
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.849.07 1.366.062 2.633.34 3.608 1.314.975.975 1.252 2.243 1.314 3.608.058 1.265.07 1.645.07 4.849s-.012 3.584-.07 4.849c-.062 1.366-.34 2.633-1.314 3.608-.975.975-2.243 1.252-3.608 1.314-1.265.058-1.645.07-4.849.07s-3.584-.012-4.849-.07c-1.366-.062-2.633-.34-3.608-1.314-.975-.975-1.252-2.243-1.314-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.849c.062-1.366.34-2.633 1.314-3.608.975-.975 2.243-1.252 3.608-1.314C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.012 7.052.07 5.78.127 4.602.43 3.68 1.352c-.922.922-1.225 2.1-1.282 3.372C2.012 5.668 2 6.077 2 9.335v5.33c0 3.258.012 3.667.07 4.948.057 1.272.36 2.45 1.282 3.372.922.922 2.1 1.225 3.372 1.282C8.332 23.988 8.741 24 12 24s3.667-.012 4.948-.07c1.272-.057 2.45-.36 3.372-1.282.922-.922 1.225-2.1 1.282-3.372.058-1.281.07-1.69.07-4.948v-5.33c0-3.258-.012-3.667-.07-4.948-.057-1.272-.36-2.45-1.282-3.372-.922-.922-2.1-1.225-3.372-1.282C15.667.012 15.258 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0-2.879 1.44 1.44 0 0 0 0 2.879z"/>
                        </svg>      
                      </a>
                    )}

                    {/* Youtube */}
                    {member.youtube && (
                      <a
                        href={`https://www.youtube.com/@${member.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`@${member.youtube}`}
                        className="text-gray-400 hover:text-neon-cyan transition-colors z-10 relative"
                        style={{ pointerEvents: 'auto' }} // Ensure click works
                      >
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M23.498 6.186a2.99 2.99 0 0 0-2.105-2.105C19.612 3.5 12 3.5 12 3.5s-7.612 0-9.393.581a2.99 2.99 0 0 0-2.105 2.105C0 7.967 0 12 0 12s0 4.033.502 5.814a2.99 2.99 0 0 0 2.105 2.105C4.388 20.5 12 20.5 12 20.5s7.612 0 9.393-.581a2.99 2.99 0 0 0 2.105-2.105C24 16.033 24 12 24 12s0-4.033-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    )}

                    {/* Tiktok */}
                    {member.tiktok && (
                      <a
                        href={`https://www.tiktok.com/@${member.tiktok}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`@${member.tiktok}`}
                        className="text-gray-400 hover:text-neon-cyan transition-colors z-10 relative"
                        style={{ pointerEvents: 'auto' }} // Ensure click works
                      >
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12.003 0C12.003 0 12 0 12 0v10.03c-1.354 0-2.457-.572-3.248-1.445a5.186 5.186 0 0 1-1.422-3.662h2.014c.037.936.39 1.812.958 2.507a3.109 3.109 0 0 0 2.412 1.602V0h3.016a6.63 6.63 0 0 0 0 1.796v3.663h-3.016V0z"/>
                        </svg>
                      </a>
                    )}

                    {/* Twitter */}
                    {member.twitter && (
                      <a
                        href={`https://www.x.com/${member.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${member.twitter}`}
                        className="text-gray-400 hover:text-neon-cyan transition-colors z-10 relative"
                        style={{ pointerEvents: 'auto' }} // Ensure click works
                      >
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M23.954 4.569c-.885.392-1.83.656-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.564-2.005.974-3.127 1.195-.897-.959-2.178-1.555-3.594-1.555-2.72 0-4.924 2.205-4.924 4.924 0 .386.043.762.127 1.124-4.092-.205-7.725-2.166-10.157-5.144-.424.727-.666 1.57-.666 2.465 0 1.701.867 3.203 2.185 4.084-.805-.026-1.564-.247-2.228-.616v.062c0 2.378 1.693 4.361 3.946 4.81-.413.111-.849.171-1.296.171-.317 0-.626-.03-.927-.088.627 1.956 2.445 3.377 4.6 3.417-1.68 1.318-3.809 2.105-6.115 2.105-.398 0-.79-.023-1.177-.069 2.179 1.397 4.768 2.211 7.548 2.211 9.051 0 14.002-7.496 14.002-13.986 0-.21-.005-.423-.014-.634.962-.693 1.8-1.562 2.46-2.549z"/>
                        </svg>
                      </a>
                    )}
              
                    {/* Twitch */}
                    {member.twitch && (
                      <a
                        href={`https://www.twitch.tv/${member.twitch}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${member.twitch}`}
                        className="text-gray-400 hover:text-neon-cyan transition-colors z-10 relative"
                        style={{ pointerEvents: 'auto' }} // Ensure click works
                      >
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M4 2L2 6v14h6v4l4-4h6l6-6V2H4zm16 10l-4 4h-5l-2 2v-2H4V4h16v8z"/>
                        </svg>      
                      </a>
                    )}

                    {/* Steam */}
                    {member.steam && (
                      <a
                        href={`https://steamcommunity.com/id/${member.steam}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${member.steam}`}
                        className="text-gray-400 hover:text-neon-cyan transition-colors z-10 relative"
                        style={{ pointerEvents: 'auto' }} // Ensure click works
                      >
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M21.809 10.547c-.112-.39-.375-.733-.738-.986c-.364-.253-.79-.374-1.214-.33c-.425.044-.813.213-1.123.48l-2.96-1.524c.09-.28.129-.573.116-.867c-.014-.292-.08-.581-.197-.852c-.434-1.01-1.556-1.507-2.56-1.097c-.78.31-1.323 1.04-1.383 1.88c-.006.103-.006.206 0 .308l-3.485 1.8c-.568-.32-1.23-.447-1.883-.353c-1.453.197-2.527 1.486-2.567 2.958c-.04 1.48 1.024 2.747 2.497 3.005c.653.094 1.31-.033 1.878-.352l3.467 1.793c-.024.097-.037.195-.037.294c0 1.207.978 2.186 2.184 2.186c1.206 0 2.184-.979 2.184-2.186c0-.23-.033-.457-.096-.678l2.967-1.532c.43.326.97.514 1.538.51c1.453-.008 2.635-1.196 2.643-2.65c.006-.48-.12-.95-.37-1.37zm-8.62 4.914c-.79 0-1.434-.644-1.434-1.434s.644-1.434 1.434-1.434s1.434.644 1.434 1.434s-.644 1.434-1.434 1.434z"/>
                        </svg>
                      </a>
                    )}

                    {/* Patreon */}
                    {member.patreon && (
                      <a
                        href={`https://www.patreon.com/cw/${member.patreon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${member.patreon}`}
                        className="text-gray-400 hover:text-neon-cyan transition-colors z-10 relative"
                        style={{ pointerEvents: 'auto' }} // Ensure click works
                      >
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M6 21H2V3h4v18zm16-10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"/>
                        </svg>
                      </a>
                    )}

                    {/* Website */}
                    {member.website && (
                      <a
                        href={`${member.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${member.website}`}
                        className="text-gray-400 hover:text-neon-cyan transition-colors z-10 relative"
                        style={{ pointerEvents: 'auto' }} // Ensure click works
                      >
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm5.93 6h-2.11a15.92 15.92 0 0 0-1.14-3.08A8.05 8.05 0 0 1 17.93 8zM12 4.07a13.51 13.51 0 0 1 1.56 3.73H10.44A13.51 13.51 0 0 1 12 4.07zM4.07 12a8.05 8.05 0 0 1 1.63-4.11A15.92 15.92 0 0 0 7.84 12H4.07zm1.63 4.11A8.05 8.05 0 0 1 4.07 12h3.77a15.92 15.92 0 0 0 1.14 3.08zM12 19.93a13.51 13.51 0 0 1-1.56-3.73h3.12A13.51 13.51 0 0 1 12 19.93zm3.46-3.73h3.77a8.05 8.05 0 0 1-1.63 4.11A15.92 15.92 0 0 0 15.46 16.2zm-6.92 0A15.92 15.92 0 0 0 5.2 20.31 8.05 8.05 0 0 1 7.54 16.2zm6.92-8.4h-3.12a13.51 13.51 0 0 1 1.56-3.73 13.51 13.51 0 0 1 1.56 3.73zm-6.92 0H5.2a8.05 8.05 0 0 1 1.63-4.11A15.92 15.92 0 0 0 7.54 7.8z"/>
                        </svg>
                      </a>
                    )}
              
                    {/* Linkedin */}
                    {member.linkedin && (
                      <a
                        href={`https://www.linkedin.com/in/${member.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${member.linkedin}`}
                        className="text-gray-400 hover:text-neon-cyan transition-colors z-10 relative"
                        style={{ pointerEvents: 'auto' }} // Ensure click works
                      >
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.22 8h4.56v16H.22V8zm7.44 0h4.37v2.18h.06c.61-1.16 2.11-2.38 4.34-2.38 4.63 0 5.48 3.05 5.48 7v8.2h-4.57v-7.26c0-1.73-.03-3.95-2.4-3.95-2.41 0-2.78 1.88-2.78 3.82v7.39H7.66V8z"/>
                        </svg>     
                      </a>
                    )}

                    {/* Kick */}
                    {member.kick && (
                      <a
                        href={`https://kick.com/${member.kick}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${member.kick}`}
                        className="text-gray-400 hover:text-neon-cyan transition-colors z-10 relative"
                        style={{ pointerEvents: 'auto' }} // Ensure click works
                      >
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.657 17.778h-2.578l-2.666-5.395-2.667 5.395H5.079l4.125-8.25h2.258l4.195 8.25z"/>
                        </svg>
                      </a>
                    )}

                  </div>

                  {/* Hover effect corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-cyan/50 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neon-cyan/50 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-neon-cyan/50 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-cyan/50 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Join Team CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block">
            <p className="text-gray-400 mb-4">Want to join our team?</p>
            <a 
              href={siteConfig.social.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Apply on Discord
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}