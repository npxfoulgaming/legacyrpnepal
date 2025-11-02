# 🚀 Swisser-Web-01 - Premium FiveM RP Server Website Template

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7.1-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
</div>

<div align="center">
  <h3>Transform Your FiveM Server's Online Presence</h3>
  <p>The ultimate modern website template crafted specifically for FiveM roleplay servers</p>
  <a href="https://swisser.dev/discord"><strong>Get Support on Discord »</strong></a>
</div>

---

## 🎯 Why Choose Swisser-Web-01?

Running a successful FiveM server isn't just about great gameplay—it's about creating an immersive experience from the moment players discover your community. **Swisser-Web-01** delivers a stunning first impression that converts visitors into dedicated players.

Built with the latest web technologies and optimized for performance, this template gives your server the professional edge it deserves. No more outdated designs or clunky interfaces—welcome to the future of FiveM server websites.

## ✨ Key Features That Set You Apart

### 🎨 **Stunning Visual Design**
- Cyberpunk-inspired aesthetic with customizable themes
- Smooth GSAP animations that captivate visitors
- Fully responsive design that looks amazing on all devices
- Dark mode optimized for those late-night gaming sessions

### ⚡ **Lightning-Fast Performance**
- Built on Vite for blazing-fast load times
- Optimized images and lazy loading
- SEO-ready structure to boost your server's visibility
- Progressive Web App capabilities

### 🛠️ **Developer-Friendly Architecture**
- Clean, modular React components
- TypeScript for rock-solid reliability
- Tailwind CSS for effortless customization
- Well-documented codebase that's easy to modify

### 📱 **Complete Feature Set**
- **Hero Section** - Captivating landing with server status integration
- **Features Showcase** - Highlight what makes your server unique
- **Jobs System Display** - Present available roles and factions
- **Rules Section** - Clear, organized server guidelines
- **Team Showcase** - Introduce your staff with style
- **Media Gallery** - Show off your server's best moments
- **Legal Pages** - Professional terms of service and privacy policy
- **Discord Integration** - Connect your community seamlessly

## 🚀 Quick Start Guide

Get your server website up and running in minutes:

```bash
# Clone the repository
git clone https://github.com/yourusername/swisser-web-01.git

# Navigate to the project
cd swisser-web-01/fivem-rp-template

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:5173` and watch your vision come to life!

## 🎨 Customization Made Simple

### 1. **Server Configuration**
Edit `src/config/site.config.json` to personalize:
- Server name and branding
- Connection details
- Social media links
- Feature descriptions
- Team members
- Rules and requirements

### 🎮 **FiveM Server Integration**

#### Live Player Count & Direct Connect
The template now supports live player data and direct server connection through the CFX.re API:

1. **Find Your Server Code**:
   - Go to [servers.fivem.net](https://servers.fivem.net)
   - Search for your server by IP (e.g., `45.131.108.179`)
   - Your server URL will be: `https://servers.fivem.net/servers/detail/abc123`
   - Copy `abc123` (your server code)

2. **Configure in `site.config.json`**:
```json
"api": {
  "serverCode": "abc123",  // Replace with your server code
  "cfxApiUrl": "https://servers-frontend.fivem.net/api/servers/single/",
  "refreshInterval": 30000
}
```

3. **Features Enabled**:
   - ✅ **Live Player Count** - Updates every 30 seconds from CFX.re API
   - ✅ **Server Status** - Shows ONLINE/OFFLINE based on API response
   - ✅ **Direct Connect** - "Connect to Server" button uses `fivem://connect/abc123`
   - ✅ **No CORS Issues** - CFX.re API has proper CORS headers

The Connect button will automatically use the FiveM protocol (`fivem://connect/`) with your server code, allowing players to join directly from their browser!

### 2. **Visual Theming**
Modify the color scheme in `tailwind.config.js`:
- Primary and accent colors
- Typography settings
- Spacing and layouts
- Animation preferences

### 3. **Content Updates**
Replace placeholder images in `/public/images/`:
- Hero backgrounds
- Gallery screenshots
- Team avatars
- Feature icons

## 🛠️ Technology Stack

Built with modern tools developers love:

- **React 19.1** - Industry-standard UI library
- **TypeScript** - Type-safe development experience
- **Vite 7.1** - Next-generation build tooling
- **Tailwind CSS 3.4** - Utility-first styling
- **GSAP 3.13** - Professional-grade animations
- **Framer Motion 12** - Declarative animations
- **React Router 7** - Seamless navigation

## 📦 Project Structure

```
swisser-web-01/
├── fivem-rp-template/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── config/         # Configuration files
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── styles/         # Global styles
│   │   └── utils/          # Utility functions
│   ├── public/            # Static assets
│   └── package.json       # Dependencies
```

## 🌟 What Makes This Template Special?

### For Server Owners
- **Professional appearance** that builds trust instantly
- **Increased player retention** through engaging design
- **Easy maintenance** with clear documentation
- **Mobile-first approach** for players on-the-go

### For Developers
- **Clean codebase** following best practices
- **Modular architecture** for easy extensions
- **Type safety** preventing runtime errors
- **Modern tooling** for efficient development

## 🤝 Professional Support

Created with passion by **Swisser Development** - we understand what FiveM communities need because we're part of the ecosystem ourselves.

### Get Help & Connect
- 💬 **Discord Support**: [swisser.dev/discord](https://swisser.dev/discord)
- 📧 **Email**: support@swisser.dev
- 🌐 **Website**: [swisser.dev](https://swisser.dev)

Join our Discord community for:
- Direct support from our development team
- Template updates and new features
- Customization tips and tricks
- Network with other server owners
- Exclusive resources and guides

## 📄 License

This template is provided as open-source software. Feel free to modify and use it for your FiveM server. We'd appreciate a credit, but it's not required!

## 💝 Show Your Support

If Swisser-Web-01 helps your server grow, consider:
- ⭐ Starring this repository
- 🔄 Sharing with other server owners
- 💬 Joining our Discord community
- ☕ Supporting future development

---

<div align="center">
  <h3>Ready to Transform Your Server's Online Presence?</h3>
  <p>Join hundreds of successful FiveM servers using Swisser templates</p>
  <a href="https://swisser.dev/discord"><strong>Get Started Today →</strong></a>
  <br><br>
  <i>Built with ❤️ by Swisser Development Team</i>
</div>