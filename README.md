# Beatr - Web Audio Drum Machine

![License](https://img.shields.io/badge/License-MIT-green)
![Platform](https://img.shields.io/badge/Platform-Web-blue)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

> A powerful drum sequencer built with Web Audio API. Create beats in your browser with synthesized drum sounds - no samples required.

**BeatR** is a modern, browser-based drum machine that uses the Web Audio API to synthesize drum sounds in real-time. With an intuitive grid interface and precise timing, you can create professional-sounding beats without any external audio files.

## ✨ Features

- 🎵 **6 Synthesized Instruments** - Kick, Snare, Hi-Hat, Tom, Clap, and Rim Shot
- 🎹 **16-Step Sequencer** - Classic drum machine grid interface
- 🎨 **Modern Design** - Clean, responsive UI with dark/light theme support
- 📊 **Audio Visualizer** - Real-time waveform visualization
- ⚡ **Precise Timing** - Web Audio API scheduler for tight, accurate playback
- 💾 **Pattern Storage** - Save and load your beats with localStorage
- 🎲 **Pattern Generator** - Create random patterns for inspiration
- 🌐 **Zero Dependencies** - Pure vanilla JavaScript, no frameworks required
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Online Demo

Simply open `index.html` in a modern web browser. No build process or installation required!

### Local Development

```bash
# Clone the repository
git clone https://github.com/SamSeenX/beatr.git
cd beatr

# Open in browser
open index.html

# OR run a local server (recommended)
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## 🎮 How to Use

### Basic Controls

1. **Play/Stop** - Click the play button to start/stop playback
2. **Tempo** - Adjust BPM (60-200) with the slider
3. **Grid** - Click cells to toggle drum hits on/off
4. **Theme** - Toggle between dark and light modes

### Buttons

| Button | Action |
|--------|--------|
| 🔄 Clear | Remove all beats from the grid |
| 🎲 Random | Generate a random pattern |
| 💾 Save | Save current pattern to browser storage |
| 📥 Load | Load previously saved pattern |

### Instruments

- **KICK** - Deep bass drum
- **SNARE** - Crisp snare with noise
- **HI-HAT** - Bright metallic cymbal
- **TOM** - Mid-range drum
- **CLAP** - Hand clap sound
- **RIM** - Rim shot

### Tips

- Start with a simple kick pattern (every 4 steps)
- Add snare on steps 5 and 13 for a classic beat
- Use hi-hats for rhythm (every 2-4 steps)
- Experiment with the random generator for inspiration
- Save your favorite patterns before closing the browser

## 🏗️ Project Structure

```
beatr/
├── index.html          # Main application page
├── css/
│   └── style.css       # Styles with theme support
├── js/
│   ├── audio-engine.js # Web Audio API synthesis
│   └── app.js          # Application logic
├── assets/             # Images and icons
├── LICENSE             # MIT License
└── README.md           # This file
```

## 🎵 How It Works

### Web Audio API Synthesis

Unlike traditional drum machines that use audio samples, this sequencer **synthesizes** all sounds using the Web Audio API:

- **Kick** - Oscillator with exponential frequency decay
- **Snare** - White noise + triangle wave oscillator
- **Hi-Hat** - Filtered white noise burst
- **Tom** - Oscillator with frequency sweep
- **Clap** - Bandpass-filtered noise with envelope
- **Rim** - Square wave with bandpass filter

### Precise Timing

The sequencer uses a **look-ahead scheduler** to ensure tight, accurate timing:

1. Schedules notes slightly ahead of playback time
2. Uses Web Audio API's precise timing (not setTimeout)
3. Updates UI independently of audio scheduling
4. Maintains consistent tempo even under heavy load

## 🛠️ Technical Details

### Browser Compatibility

- Chrome/Edge 89+
- Firefox 88+
- Safari 14.1+
- Opera 75+

Requires Web Audio API support.

### Performance

- **Zero latency** - Direct audio synthesis
- **Low CPU usage** - Efficient Web Audio API implementation
- **No network requests** - All sounds generated in-browser
- **Small footprint** - ~15KB total (uncompressed)

## 🎨 Customization

### Modifying Sounds

Edit `js/audio-engine.js` to customize drum sounds:

```javascript
playKick(time) {
    // Adjust frequency, gain, or envelope
    osc.frequency.setValueAtTime(150, time); // Change pitch
    gain.gain.setValueAtTime(1, time);       // Change volume
}
```

### Adding Instruments

1. Add synthesis method to `AudioEngine` class
2. Add instrument name to `INSTRUMENTS` array in `app.js`
3. Update `playSound()` switch statement

### Changing Grid Size

Modify the `STEPS` constant in `app.js`:

```javascript
const STEPS = 32; // For a 32-step sequencer
```

## 🗺️ Roadmap

- [ ] Export patterns as MIDI files
- [ ] Additional drum sounds (cowbell, conga, etc.)
- [ ] Swing/groove control
- [ ] Individual instrument volume controls
- [ ] Pattern chaining
- [ ] Audio recording/export
- [ ] Keyboard shortcuts
- [ ] Multiple pattern banks

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by classic drum machines like the Roland TR-808
- Built with the powerful [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- Design inspired by modern music production tools

## ☕ Support

If you find this project useful:

- ⭐ Star the repository
- 🐛 Report issues
- 💡 Suggest improvements
- ☕ [Buy me a coffee](https://buymeacoffee.com/samseen)

---

Created with ❤️ by [SamSeen](https://samseen.dev)
# beatr
