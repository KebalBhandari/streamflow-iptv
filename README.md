# StreamFlow IPTV 📺

StreamFlow is a modern, premium web-based IPTV player built with React and TypeScript. It aggregates thousands of free, publicly available TV channels from around the world into a sleek, Netflix-style interface featuring category organization, advanced filtering, and a resilient HLS video player.

![StreamFlow Preview](https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1000&auto=format&fit=crop)

## ✨ Features

### 🎥 Advanced Video Player
- **HLS Streaming**: Native support for `.m3u8` streams using `hls.js` with adaptive bitrate streaming.
- **Resizable Sidebar**: Draggable sidebar allowing users to adjust the player size relative to the channel grid while watching.
- **Theater Mode**: Expand the player to the full width of the browser window.
- **Picture-in-Picture & Fullscreen**: Standard playback controls including volume, mute, and quality selection (Auto/720p/1080p).
- **Error Handling**: Graceful error recovery and UI feedback for offline or geo-blocked streams.

### 🧭 Content Discovery
- **Smart Categorization**: Channels are automatically organized into categories like Sports, News, Movies, Music, Kids, and Documentaries.
- **Global Filters**: Filter content by Region (Europe, Asia, etc.) and specific Countries.
- **Live Search**: Instant search functionality for channel names and sport types (e.g., "Football", "Racing").
- **Featured Slider**: A dynamic hero section showcasing trending channels with auto-rotation.

### 👤 Personalization
- **Favorites**: Mark channels as favorites for quick access in a dedicated tab.
- **Hidden Channels**: Hide unwanted channels from the main feed; they remain accessible in a "Hidden" safety folder.
- **Persistence**: User preferences (favorites, hidden channels) are saved locally in the browser.

## 🛠️ Tech Stack

- **Frontend Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS (via CDN for rapid prototyping/portability)
- **Icons**: Lucide React
- **Video Engine**: hls.js
- **Data Source**: [iptv-org API](https://github.com/iptv-org/api)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/streamflow-iptv.git
   cd streamflow-iptv
   ```

2. **Install dependencies**
   *(Note: If you are using a standard Vite setup)*
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:5173` to view the app.

## 📂 Project Structure

```
├── components/
│   ├── ChannelGrid.tsx      # Grid layout for channel cards
│   ├── FeaturedSlider.tsx   # Hero carousel for trending channels
│   ├── Filters.tsx          # Dropdowns for Region/Country sorting
│   ├── Header.tsx           # Top navigation and search bar
│   ├── Sidebar.tsx          # Category navigation sidebar
│   ├── VideoPlayer.tsx      # HLS player with custom controls
│   └── ...
├── types.ts                 # TypeScript interfaces (Channel, API responses)
├── utils.ts                 # API fetching and data normalization logic
├── App.tsx                  # Main application layout and state management
├── index.tsx                # Entry point
└── index.html               # HTML root
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## ⚠️ Disclaimer

StreamFlow is a video player interface. It does not host any content. All streams are fetched from the publicly available [iptv-org](https://github.com/iptv-org) repository. We are not responsible for the availability or legality of streams in your specific region.