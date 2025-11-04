import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import siteConfig from '../../config/site.config.json';

type ServerRule = {
  srid: string;
  srtitle: string;
  srdescription?: string;
  srroleplayContext?: string;
  srenforcement?: string;
  srexamples?: string[];
  srcommonMistakes?: string[];
  srnotes?: string;
  sricon?: keyof typeof Icons;
};

export const ServerRules = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [search, setSearch] = useState('');

  const rules: ServerRule[] = (siteConfig.serverrules || []).map((r) => ({
    ...r,
    sricon: r.sricon && r.sricon in Icons ? (r.sricon as keyof typeof Icons) : undefined,
  }));

  const filteredRules = rules.filter(
    (rule) =>
      rule.srtitle.toLowerCase().includes(search.toLowerCase()) ||
      (rule.srdescription?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (rule.srroleplayContext?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const getIcon = (iconName?: keyof typeof Icons) => {
    const icon = iconName && Icons[iconName] ? Icons[iconName] : Icons.AlertCircle;
    return icon as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gradient-to-b from-gta-black to-gta-graphite' },
    // Header
    React.createElement(
      'div',
      { className: 'bg-gta-graphite/90 backdrop-blur-sm border-b border-gta-medium sticky top-0 z-40' },
      React.createElement(
        'div',
        { className: 'container-gta py-4 flex flex-col md:flex-row items-center justify-between gap-4' },
        React.createElement(
          Link,
          { to: '/', className: 'inline-flex items-center gap-2 text-gta-light hover:text-white transition-colors' },
          React.createElement(getIcon('ArrowLeft'), { className: 'w-5 h-5' }),
          'Back to Home'
        ),
        React.createElement(
          'div',
          { className: 'relative w-full md:w-64' },
          React.createElement(getIcon('Search'), { className: 'absolute left-3 top-1/2 -translate-y-1/2 text-gta-light' }),
          React.createElement('input', {
            type: 'text',
            value: search,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
            placeholder: 'Search rules...',
            className: 'w-full pl-10 pr-3 py-2 rounded bg-gta-dark border border-gta-medium text-gta-light focus:outline-none focus:border-gta-gold',
          })
        )
      )
    ),
    // Main content
    React.createElement(
      'div',
      { className: 'container-gta py-12' },
      React.createElement(
        'div',
        { className: 'max-w-4xl mx-auto' },
        // Title
        React.createElement(
          'div',
          { className: 'text-center mb-12' },
          React.createElement(getIcon('Shield'), { className: 'w-16 h-16 text-gta-gold mx-auto mb-4' }),
          React.createElement('h1', { className: 'text-5xl md:text-7xl font-bebas text-white mb-4' }, 'Server Rules'),
          React.createElement('p', { className: 'text-xl text-gta-light' }, 'Please follow these rules to ensure fair and immersive roleplay.')
        ),
        // Table of Contents
        rules.length > 0 &&
          React.createElement(
            'div',
            { className: 'card-gta mb-12' },
            React.createElement('h2', { className: 'text-2xl font-bebas text-gta-gold mb-4' }, 'Table of Contents'),
            React.createElement(
              'div',
              { className: 'grid md:grid-cols-2 gap-2' },
              ...rules.map((rule) =>
                React.createElement(
                  'a',
                  {
                    key: rule.srid,
                    href: `#${rule.srid}`,
                    className: 'flex items-center gap-3 p-3 hover:bg-gta-dark/50 transition-colors rounded',
                  },
                  React.createElement(getIcon(rule.sricon), { className: 'text-gta-green' }),
                  React.createElement('span', { className: 'text-white' }, rule.srtitle)
                )
              )
            )
          ),
        // Rules Content
        React.createElement(
          'div',
          { className: 'space-y-8' },
          ...filteredRules.map((rule) =>
            React.createElement(
              'section',
              { key: rule.srid, id: rule.srid, className: 'card-gta' },
              React.createElement('h2', { className: 'text-3xl font-bebas text-white mb-4' }, rule.srtitle),
              React.createElement(
                'div',
                { className: 'space-y-4 text-gta-light' },
                rule.srdescription &&
                  React.createElement('p', null, rule.srdescription),
                rule.srroleplayContext &&
                  React.createElement('p', null, rule.srroleplayContext),
                rule.srenforcement &&
                React.createElement(
                    'p',
                    { className: 'bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-100 p-3 rounded-md' },
                    React.createElement('strong', null, 'Enforcement / Penalties'),
                    React.createElement('br'),
                    rule.srenforcement
                ),
                rule.srexamples && rule.srexamples.length > 0 &&
                React.createElement(
                    'div',
                    { className: 'bg-green-900/20 border-l-4 border-green-500 p-3 rounded-md' },
                    React.createElement('strong', { className: 'text-green-300' }, 'Examples'),
                    React.createElement(
                    'ul',
                    { className: 'list-disc list-inside space-y-2 ml-4 text-green-100' },
                    ...rule.srexamples.map((ex: string, idx: number) => React.createElement('li', { key: idx }, ex))
                    )
                ),
                rule.srcommonMistakes && rule.srcommonMistakes.length > 0 &&
                React.createElement(
                    'div',
                    { className: 'bg-red-900/20 border-l-4 border-red-500 p-3 rounded-md' },
                    React.createElement('strong', { className: 'text-red-300' }, 'Common Mistakes'),
                    React.createElement(
                    'ul',
                    { className: 'list-disc list-inside space-y-2 ml-4 text-red-100' },
                    ...rule.srcommonMistakes.map((mistake: string, idx: number) => React.createElement('li', { key: idx }, mistake))
                    )
                ),
                rule.srnotes &&
                React.createElement(
                    'p',
                    { className: 'bg-blue-900/30 border-l-4 border-blue-500 text-blue-100 p-3 rounded-md italic' },
                    React.createElement('strong', null, 'Notes: '),
                    rule.srnotes
                )
              )
            )
          ),
          filteredRules.length === 0 &&
            React.createElement('div', { className: 'text-center text-gta-light' }, 'No rules matched your search.')
        )
      )
    )
  );
};
