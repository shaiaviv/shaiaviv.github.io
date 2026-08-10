export interface Screenshot {
  src: string
  caption?: string
}

export interface Project {
  name: string
  description: string
  language: string
  tags: string[]
  repo?: string
  live?: string
  /**
   * An easter-egg nudge, rendered mid-description by ProjectDescription so it
   * rewards someone actually reading rather than skimming.
   */
  hint?: string
  screenshots?: Screenshot[]
}

export const projects: Project[] = [
  {
    name: 'RecipeWizard',
    description:
      'iOS app that auto-extracts recipes from TikTok & Instagram Reels using AI. Share a video, Claude AI reads the caption and returns structured ingredients, steps, and cook time, saved instantly to your recipe book.',
    language: 'Swift',
    tags: ['Swift', 'iOS', 'Claude AI', 'Google Sign-In'],
    repo: 'https://github.com/shaiaviv/recipewizard',
    screenshots: [
      { src: 'https://raw.githubusercontent.com/shaiaviv/recipewizard/main/docs/screenshots/01_login.png', caption: 'Sign in with Google' },
      { src: 'https://raw.githubusercontent.com/shaiaviv/recipewizard/main/docs/screenshots/02_share_sheet.png', caption: 'Share from TikTok/Instagram' },
      { src: 'https://raw.githubusercontent.com/shaiaviv/recipewizard/main/docs/screenshots/03_share_loading.png', caption: 'AI extraction in progress' },
      { src: 'https://raw.githubusercontent.com/shaiaviv/recipewizard/main/docs/screenshots/04_share_done.png', caption: 'Recipe saved' },
      { src: 'https://raw.githubusercontent.com/shaiaviv/recipewizard/main/docs/screenshots/05_recipe_list.png', caption: 'Recipe book' },
      { src: 'https://raw.githubusercontent.com/shaiaviv/recipewizard/main/docs/screenshots/06_recipe_detail.png', caption: 'Recipe detail' },
      { src: 'https://raw.githubusercontent.com/shaiaviv/recipewizard/main/docs/screenshots/07_category_filter.png', caption: 'Smart category filters' },
      { src: 'https://raw.githubusercontent.com/shaiaviv/recipewizard/main/docs/screenshots/08_ai_image.png', caption: 'AI-generated illustrations' },
    ],
  },
  {
    name: 'Movie Match',
    description:
      'Real-time collaborative movie matching app where users in shared rooms swipe on movies and match when both like the same film. Built with Socket.io, React 18, and TMDB API.',
    language: 'JavaScript',
    tags: ['React', 'Socket.io', 'Node.js', 'Vercel'],
    repo: 'https://github.com/shaiaviv/movie-match',
    live: 'https://movie-match-flame.vercel.app',
    screenshots: [
      { src: 'https://raw.githubusercontent.com/shaiaviv/movie-match/main/docs/screenshot-home.png', caption: 'Home' },
      { src: 'https://raw.githubusercontent.com/shaiaviv/movie-match/main/docs/screenshot-filters.png', caption: 'Filters & Room Setup' },
      { src: 'https://raw.githubusercontent.com/shaiaviv/movie-match/main/docs/screenshot-join.png', caption: 'Join a Room' },
      { src: 'https://raw.githubusercontent.com/shaiaviv/movie-match/main/docs/screenshot-swiping.png', caption: 'Swiping' },
      { src: 'https://raw.githubusercontent.com/shaiaviv/movie-match/main/docs/screenshot-match.png', caption: "It's a Match" },
    ],
  },
  {
    name: 'AI-lbum',
    description:
      'Full-stack mobile app for AI-powered photo album generation using facial recognition. AI-lbum was built with Flutter (Dart), Node.js, Firebase, and face-api.js (TensorFlow.js).',
    hint: 'Reading closely earns rewards: Chase and click one of the colored background blobs.',
    language: 'Dart',
    tags: ['Flutter', 'Firebase', 'AI', 'Node.js'],
    repo: 'https://github.com/IditMedizada/AIlbum',
  },
  {
    name: 'Chat App',
    description:
      'Cross-platform real-time chat supporting both web and Android clients. Built with Express + Node.js, React.js, MongoDB, and converted to support Android.',
    language: 'JavaScript',
    tags: ['React', 'Node.js', 'MongoDB', 'WebSockets'],
    repo: 'https://github.com/shaiaviv/chatApp_3',
  },
  {
    name: 'Arkanoid Game',
    description:
      'Full Arkanoid game in Java applying OOP principles: inheritance, polymorphism, and design patterns, as a deep-dive into object-oriented game architecture.',
    language: 'Java',
    tags: ['Java', 'OOP', 'Design Patterns'],
  },
]
