import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import siteConfig from '../../config/site.config.json';

export const Footer = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${siteConfig.server.connecttext} ${siteConfig.server.ip}:${siteConfig.server.port}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <footer className="relative bg-gta-graphite border-t border-gta-medium">
      <div className="container-gta py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Server Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gta-green flex items-center justify-center">
                <span className="font-bebas text-xl text-white">RP</span>
              </div>
              <span className="font-bebas text-2xl text-white">
                {siteConfig.server.name}
              </span>
            </div>
            <p className="text-gta-light leading-relaxed">
              {siteConfig.server.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bebas text-xl text-gta-gold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-gta-light hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#jobs" className="text-gta-light hover:text-white transition-colors">
                  Jobs
                </a>
              </li>
              <li>
                <a href="#rules" className="text-gta-light hover:text-white transition-colors">
                  Rules
                </a>
              </li>
              <li>
                <a href="#team" className="text-gta-light hover:text-white transition-colors">
                  Team
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-bebas text-xl text-gta-gold mb-4">Connect With Us</h3>
            <div className="flex gap-3 mb-4">
              <a
                href={siteConfig.social.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gta-dark hover:bg-gta-medium flex items-center justify-center transition-colors"
                aria-label="Discord"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>

              {/* Other socials (Optional) */}
              {siteConfig.social.twitter && (
                <a
                  href={siteConfig.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gta-dark hover:bg-gta-medium flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </a>
              )}

              {siteConfig.social.youtube && (
                <a
                  href={siteConfig.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gta-dark hover:bg-gta-medium flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
            </div>

            {/* Server IP with Copy Button */}
            <div className="p-3 bg-gta-dark relative group flex items-center justify-between rounded">
              <div>
                <p className="text-xs text-gta-light uppercase tracking-wider mb-1">Server IP</p>
                <p className="text-white font-mono">
                  {siteConfig.server.connecttext} {siteConfig.server.ip}:{siteConfig.server.port}
                </p>
              </div>

              <button
                onClick={handleCopy}
                className={`absolute right-3 p-1 rounded transition-all duration-300 ${
                  copied ? 'text-green-500' : 'text-gta-light group-hover:text-white'
                } ${!copied ? 'opacity-0 group-hover:opacity-100' : ''}`}
                title={copied ? 'Copied!' : 'Copy to clipboard'}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="divider-gta" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gta-light text-sm">
          <p>
            © {siteConfig.legal.copyrightYear} {siteConfig.server.name}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gta-medium">|</span>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
