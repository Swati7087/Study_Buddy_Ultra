const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Curated lo-fi music playlists
const musicPlaylists = {
  focus: [
    {
      id: 1,
      title: "Lo-Fi Study Beats",
      artist: "ChillHop Music",
      url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
      duration: "24/7",
      genre: "Lo-Fi Hip Hop",
      description: "Relaxing beats for studying and focus"
    },
    {
      id: 2,
      title: "Study Music Alpha Waves",
      artist: "Mindful Movement",
      url: "https://www.youtube.com/watch?v=4b4X4jW5oHc",
      duration: "3:00:00",
      genre: "Alpha Waves",
      description: "Brain power focus music for studying"
    },
    {
      id: 3,
      title: "Deep Focus Music",
      artist: "Relaxing White Noise",
      url: "https://www.youtube.com/watch?v=1ZYbU82GVz4",
      duration: "2:00:00",
      genre: "Ambient",
      description: "Concentration music for deep work"
    },
    {
      id: 4,
      title: "Cafe Music for Study",
      artist: "Cafe Music BGM",
      url: "https://www.youtube.com/watch?v=7NOSDKb0HlU",
      duration: "11:54:59",
      genre: "Cafe Jazz",
      description: "Relaxing cafe music for studying"
    },
    {
      id: 5,
      title: "Classical Music for Studying",
      artist: "Classical Music",
      url: "https://www.youtube.com/watch?v=8iA5HSJXcvI",
      duration: "3:00:00",
      genre: "Classical",
      description: "Mozart for studying and concentration"
    }
  ],
  relaxation: [
    {
      id: 6,
      title: "Nature Sounds for Study",
      artist: "Nature Sounds",
      url: "https://www.youtube.com/watch?v=8iA5HSJXcvI",
      duration: "10:00:00",
      genre: "Nature",
      description: "Rain and thunder sounds for focus"
    },
    {
      id: 7,
      title: "Ocean Waves for Study",
      artist: "Ocean Sounds",
      url: "https://www.youtube.com/watch?v=8iA5HSJXcvI",
      duration: "8:00:00",
      genre: "Ocean",
      description: "Calming ocean waves for concentration"
    },
    {
      id: 8,
      title: "Forest Ambience",
      artist: "Forest Sounds",
      url: "https://www.youtube.com/watch?v=8iA5HSJXcvI",
      duration: "6:00:00",
      genre: "Forest",
      description: "Peaceful forest sounds for studying"
    }
  ],
  productivity: [
    {
      id: 9,
      title: "Productivity Music",
      artist: "Productivity Music",
      url: "https://www.youtube.com/watch?v=8iA5HSJXcvI",
      duration: "2:00:00",
      genre: "Productivity",
      description: "High-energy music for productivity"
    },
    {
      id: 10,
      title: "Workout Study Music",
      artist: "Workout Music",
      url: "https://www.youtube.com/watch?v=8iA5HSJXcvI",
      duration: "1:30:00",
      genre: "Workout",
      description: "Energetic music for active studying"
    }
  ]
};

// @route   GET /api/music/playlists
// @desc    Get all music playlists
// @access  Private
router.get('/playlists', auth, (req, res) => {
  try {
    res.json({
      playlists: musicPlaylists,
      totalPlaylists: Object.keys(musicPlaylists).length,
      totalTracks: Object.values(musicPlaylists).reduce((acc, playlist) => acc + playlist.length, 0)
    });
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/music/playlists/:category
// @desc    Get music playlists by category
// @access  Private
router.get('/playlists/:category', auth, (req, res) => {
  try {
    const { category } = req.params;
    const playlist = musicPlaylists[category];

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist category not found' });
    }

    res.json({
      category,
      tracks: playlist,
      totalTracks: playlist.length
    });
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/music/tracks
// @desc    Get all music tracks
// @access  Private
router.get('/tracks', auth, (req, res) => {
  try {
    const allTracks = [];
    Object.entries(musicPlaylists).forEach(([category, tracks]) => {
      tracks.forEach(track => {
        allTracks.push({ ...track, category });
      });
    });

    res.json({
      tracks: allTracks,
      totalTracks: allTracks.length
    });
  } catch (error) {
    console.error('Get tracks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/music/tracks/:id
// @desc    Get specific music track by ID
// @access  Private
router.get('/tracks/:id', auth, (req, res) => {
  try {
    const { id } = req.params;
    let foundTrack = null;
    let foundCategory = null;

    // Search through all categories
    Object.entries(musicPlaylists).forEach(([category, tracks]) => {
      const track = tracks.find(t => t.id === parseInt(id));
      if (track) {
        foundTrack = track;
        foundCategory = category;
      }
    });

    if (!foundTrack) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({
      track: { ...foundTrack, category: foundCategory }
    });
  } catch (error) {
    console.error('Get track error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/music/categories
// @desc    Get all music categories
// @access  Private
router.get('/categories', auth, (req, res) => {
  try {
    const categories = Object.keys(musicPlaylists).map(category => ({
      name: category,
      displayName: category.charAt(0).toUpperCase() + category.slice(1),
      trackCount: musicPlaylists[category].length,
      description: getCategoryDescription(category)
    }));

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/music/random
// @desc    Get a random music track
// @access  Private
router.get('/random', auth, (req, res) => {
  try {
    const allTracks = [];
    Object.entries(musicPlaylists).forEach(([category, tracks]) => {
      tracks.forEach(track => {
        allTracks.push({ ...track, category });
      });
    });

    const randomTrack = allTracks[Math.floor(Math.random() * allTracks.length)];

    res.json({
      track: randomTrack
    });
  } catch (error) {
    console.error('Get random track error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to get category descriptions
function getCategoryDescription(category) {
  const descriptions = {
    focus: "Music specifically curated for deep focus and concentration during study sessions",
    relaxation: "Calming sounds and ambient music to reduce stress and improve focus",
    productivity: "High-energy tracks to boost motivation and productivity"
  };
  return descriptions[category] || "Curated music for optimal study experience";
}

module.exports = router; 