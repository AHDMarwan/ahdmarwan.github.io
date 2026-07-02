# LOOP - Portfolio Website

A modern, interactive portfolio website built with cutting-edge web technologies. Featuring smooth animations, 3D graphics, and scroll-triggered effects that showcase a design studio's creative vision.

## 🎨 Features

- **3D Graphics**: Interactive 3D visualizations powered by Three.js
- **Smooth Scrolling**: Advanced scroll animations using GSAP and ScrollTrigger
- **Responsive Design**: Fully responsive layout with Bootstrap
- **Audio Integration**: Background audio that syncs with user interactions
- **Custom Animations**: Bloom effects, skew animations, and particle effects
- **Mobile Menu**: Accessible hamburger navigation with smooth transitions
- **Image Gallery**: Horizontal scroll galleries with scroll-triggered animations
- **Loading Animation**: Progress-based loader that displays while content loads

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup structure
- **CSS3**: Custom styling with animations and effects
- **JavaScript**: Vanilla JS for interactivity (51.7% of codebase)
- **Bootstrap 5**: Responsive grid and components

### Libraries & Frameworks
- **Three.js**: 3D graphics and WebGL rendering
- **GSAP**: Advanced animation library (with plugins)
  - ScrollTrigger for scroll-based animations
  - ScrollSmoother for smooth scrolling
  - Draggable for interactive elements
  - CustomEase for custom animation easing
  - InertiaPlugin for inertia effects
- **jQuery**: DOM manipulation (legacy support)
- **ScrollMagic**: Additional scroll control features
- **ImagesLoaded**: Image loading detection

### Effects & Shaders
- **EffectComposer**: Post-processing effects
- **UnrealBloomPass**: Bloom glow effects
- **ShaderPass**: Custom shader effects
- **BokehPass**: Depth-of-field bokeh effects

## 📁 Project Structure

```
ahdmarwan.github.io/
├── index.html              # Main homepage
├── about.html              # About page
├── main.js                 # Primary JavaScript logic
├── script.js               # Secondary script (22.9 KB)
├── script2.js              # Tertiary script (9.4 KB)
├── style.css               # Main stylesheet
├── BokehPass.js            # Bokeh effect shader
├── helvetiker_bold.typeface.json  # 3D font data
├── assets/
│   ├── icps26.png          # Gallery images
│   ├── tex.jpg             # Texture file
│   ├── loop.webp           # Logo animation
│   ├── logo.svg            # SVG logo
│   └── sound.mp3           # Background audio
├── st.mp3                  # Sound effect
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or server setup required

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AHDMarwan/ahdmarwan.github.io.git
   cd ahdmarwan.github.io
   ```

2. **Open in browser**
   - Double-click `index.html` to open locally, or
   - Use a local development server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js http-server
     npx http-server
     ```
   - Visit `http://localhost:8000` in your browser

3. **Deploy to GitHub Pages** (already configured)
   - The site is automatically deployed when pushing to the `main` branch
   - Visit: `https://ahdmarwan.github.io`

## 📖 Usage

### Main Sections

- **Header**: Fixed navigation with infinity logo and mobile hamburger menu
- **Hero Section**: Animated introduction with call-to-action button
- **About Section**: Studio story and values
- **Gallery Section**: Horizontal scrolling image galleries with scroll animations
- **Footer**: Contact info, navigation links, and social integration

### Interactive Elements

- **Hamburger Menu**: Click to toggle fullscreen navigation
- **Logo Animation**: SVG infinity loop responds to interactions
- **Scroll Animations**: Elements animate as you scroll down the page
- **Background Audio**: Starts playing on user interaction

## ⚙️ Configuration

### Customize Content

Edit `index.html` to update:
- Hero title: Line 216
- About section: Lines 248-250
- Contact info: Lines 483-488
- Footer links: Lines 493-496

### Modify Styles

Edit `style.css` to customize:
- Color scheme (primary: `#a1ff14`)
- Typography and fonts
- Animation timing
- Responsive breakpoints

### Adjust Animations

Edit `script.js` and `script2.js` to modify:
- GSAP animation timelines
- ScrollTrigger configurations
- 3D object rotations
- Bloom effect intensity

## 🎬 Animation Details

### Scroll Animations
- Text rotates into view with skew effects
- Images slide horizontally based on scroll position
- Gallery items appear progressively

### 3D Effects
- Bloom pass creates glowing elements
- Bokeh effect adds depth perception
- Custom shaders for visual polish

### Loading Screen
- Displays percentage progress
- Waits for all images to load
- Smooth fade transition to content

## 🔧 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | Latest  | ✅ Full |
| Firefox | Latest  | ✅ Full |
| Safari  | Latest  | ✅ Full |
| Edge    | Latest  | ✅ Full |
| IE 11   | N/A     | ❌ None |

## 📱 Responsive Design

- **Desktop**: Full animations and 3D effects
- **Tablet**: Optimized touch interactions
- **Mobile**: Simplified animations, full-screen mobile menu

## 🎵 Audio

The site includes background audio (`sound.mp3`) that:
- Auto-plays on first user interaction (due to browser autoplay policies)
- Can be controlled via browser audio controls
- Enhances immersive experience

## 🔐 Performance Optimization

- Images are preloaded with progress tracking
- Lazy loading support for images
- Optimized GSAP animations for smooth 60fps
- Minimal dependencies - most functionality is vanilla JS
- CDN-hosted libraries for faster loading

## 🐛 Troubleshooting

### Audio not playing
- Check browser autoplay policy settings
- Ensure `sound.mp3` file exists in root directory
- Allow audio permissions in browser

### Animations stuttering
- Update your browser to the latest version
- Disable browser extensions that may interfere
- Check GPU acceleration is enabled

### Images not loading
- Verify image paths in `index.html`
- Check file permissions on server
- Ensure `icps26.png` exists

## 📝 License

This project is open source. Feel free to use it as a template for your own portfolio.

## 👤 Author

**AHDMarwan**
- GitHub: [@AHDMarwan](https://github.com/AHDMarwan)
- Website: [ahdmarwan.github.io](https://ahdmarwan.github.io)

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📚 Resources & References

- [Three.js Documentation](https://threejs.org/docs/)
- [GSAP Documentation](https://greensock.com/gsap/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/)
- [ScrollTrigger Guide](https://greensock.com/docs/v3/Plugins/ScrollTrigger)

## 📞 Support

For issues, questions, or suggestions, please:
- Open an [issue](https://github.com/AHDMarwan/ahdmarwan.github.io/issues)
- Contact: hello@yourdomain.com

---

**Made with rhythm and intention** ✨
