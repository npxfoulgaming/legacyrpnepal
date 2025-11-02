"use client";

import { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger, smoothScrollTo } from "../../lib/gsap-config";
import { Home, Briefcase, Shield, Users, User, Image, ScrollText } from "lucide-react";
import siteConfig from "../../config/site.config.json";
import { BottomNavigation } from "./BottomNavigation";

const navItems = [
  { id: "home", label: "Home", href: "#home", icon: <Home className="w-5 h-5" /> },
  { id: "features", label: "Features", href: "#features", icon: <Shield className="w-5 h-5" /> },
  { id: "jobs", label: "Jobs", href: "#jobs", icon: <Briefcase className="w-5 h-5" /> },
  { id: "rules", label: "Rules", href: "#rules", icon: <ScrollText className="w-5 h-5" /> },
  { id: "team", label: "Team", href: "#team", icon: <Users className="w-5 h-5" /> },
  { id: "gallery", label: "Gallery", href: "#gallery", icon: <Image className="w-5 h-5" /> },
];

export const Navigation = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile ? <BottomNavigation /> : <DesktopNavigation />;
};

const DesktopNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; avatar_url?: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Fetch logged-in user from backend
  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await fetch(`/api/user?access_token=${token}`);
        if (res.ok) {
          const data = await res.json();
          setUser({ username: data.user.username, avatar_url: data.user.avatar_url });
        } else {
          localStorage.removeItem("access_token");
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    }
    fetchUser();
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // GSAP scroll triggers
  useGSAP(() => {
    navItems.forEach((item) => {
      ScrollTrigger.create({
        id: `nav-${item.id}`,
        trigger: `#${item.id}`,
        start: "top top+=80",
        end: "bottom top+=80",
        onEnter: () => setActiveSection(item.id),
        onEnterBack: () => setActiveSection(item.id),
      });
    });
    ScrollTrigger.refresh();
    ScrollTrigger.sort();

    return () =>
      navItems.forEach((item) => {
        const trigger = ScrollTrigger.getById(`nav-${item.id}`);
        if (trigger) trigger.kill();
      });
  });

  // Smooth scroll on click
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) smoothScrollTo(target, -80);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    window.location.reload();
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "glass-gta shadow-gta"
          : "bg-gta-black/80 backdrop-blur-sm border-b border-white/10"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3 opacity-100 animate-fade-in">
          {siteConfig.server.logo.type === "text" ? (
            <div className="w-9 h-9 md:w-10 md:h-10 bg-gta-green flex items-center justify-center">
              <span className="font-bebas text-lg md:text-xl text-white">{siteConfig.server.logo.content}</span>
            </div>
          ) : (
            <div className="w-9 h-9 md:w-10 md:h-10 overflow-hidden">
              <img src={siteConfig.server.logo.content} alt="Server Logo" className="w-full h-full object-contain" />
            </div>
          )}
          <span className="font-bebas text-xl md:text-2xl text-white">
            <span className="hidden sm:inline">{siteConfig.server.name}</span>
            <span className="sm:hidden">
              {siteConfig.server.name.split(" ").map((w) => w[0]).join("")}
            </span>
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={`relative px-4 py-2 text-sm font-inter font-medium transition-all duration-300 opacity-100 animate-fade-in ${
                activeSection === item.id ? "text-gta-gold" : "text-white/80 hover:text-white"
              }`}
            >
              {item.label}
              {activeSection === item.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gta-gold" />}
            </a>
          ))}
        </div>

        {/* CTA + User Dropdown */}
        <div className="flex items-center gap-4 opacity-100 animate-fade-in relative">
          <a
            href={`fivem://connect/${siteConfig.api.serverCode}`}
            className="px-6 py-2 text-sm font-inter font-medium uppercase tracking-wider bg-gta-green text-white hover:bg-gta-green/90 transition-all duration-300 inline-block text-center"
          >
            Connect
          </a>

          <a
            href={siteConfig.social.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 text-sm font-inter font-medium uppercase tracking-wider border border-gta-gold text-gta-gold hover:bg-gta-gold hover:text-gta-black transition-all duration-300"
          >
            Discord
          </a>

          {/* User Dropdown */}
          <div ref={dropdownRef} className="relative">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 border border-white/20 hover:border-gta-green cursor-pointer transition-colors duration-300 rounded-md"
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} className="w-5 h-5 rounded-full" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gta-black text-white border border-white/10 shadow-lg py-2 z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2 font-medium border-b border-white/10">{user.username}</div>
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gta-green hover:text-black transition-colors duration-200"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <a
                    href="/login"
                    className="w-full block px-4 py-2 text-left hover:bg-gta-green hover:text-black transition-colors duration-200"
                  >
                    Login
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
