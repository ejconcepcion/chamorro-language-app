import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FlashcardsPage from './pages/FlashcardsPage'
import LessonsPage from './pages/LessonsPage'
import QuizPage from './pages/QuizPage'

const tabs = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/flashcards', label: 'Cards', icon: '📚' },
  { to: '/lessons', label: 'Lessons', icon: '📖' },
  { to: '/quiz', label: 'Quiz', icon: '✏️' },
]

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-beige flex flex-col">
        {/* Page content */}
        <main className="flex-1 pb-20 overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/quiz" element={<QuizPage />} />
          </Routes>
        </main>

        {/* Bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
          <div className="max-w-lg mx-auto flex">
            {tabs.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
                    isActive ? 'text-teal' : 'text-gray-400 hover:text-gray-600'
                  }`
                }
              >
                <span className="text-xl mb-0.5">{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </BrowserRouter>
  )
}
