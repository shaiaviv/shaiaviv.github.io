export interface Project {
  name: string
  description: string
  language: string
  tags: string[]
  repo?: string
  live?: string
}

export const projects: Project[] = [
  {
    name: 'Movie Match',
    description:
      'Real-time collaborative movie matching app where users in shared rooms swipe on movies and match when both like the same film. Built with Socket.io, React 18, and TMDB API.',
    language: 'JavaScript',
    tags: ['React', 'Socket.io', 'Node.js', 'Vercel'],
    repo: 'https://github.com/shaiaviv/movie-match',
    live: 'https://movie-match-flame.vercel.app',
  },
  {
    name: 'RecipeWizard',
    description:
      'iOS app that auto-extracts recipes from TikTok & Instagram Reels using AI. Share a video, Claude AI reads the caption and returns structured ingredients, steps, and cook time, saved instantly to your recipe book.',
    language: 'Swift',
    tags: ['Swift', 'iOS', 'Claude AI', 'Google Sign-In'],
    repo: 'https://github.com/shaiaviv/recipewizard',
  },
  {
    name: 'AI-lbum',
    description:
      'Full-stack mobile app for AI-powered photo album generation using facial recognition. Built with Flutter (Dart), Node.js, Firebase, and face-api.js (TensorFlow.js).',
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
