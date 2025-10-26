import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])
  return (
    <button onClick={() => setDark(d => !d)} className="glass rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2">
      {dark ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
      <span className="hidden sm:inline">Theme</span>
    </button>
  )
}