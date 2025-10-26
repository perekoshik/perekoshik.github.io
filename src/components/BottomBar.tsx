import { Home, User, ShoppingBag } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export default function BottomBar() {
  const link = 'flex-1 flex flex-col items-center justify-center py-2 text-[11px] text-txt/70'
  const active = 'text-brand'
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-bg/80 backdrop-blur border-t border-white/5">
      <div className="grid grid-cols-3">
        <NavLink to="/" className={({isActive}) => `${link} ${isActive ? active : ''}`}>
          <Home className="h-5 w-5" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => `${link} ${isActive ? active : ''}`}>
          <User className="h-5 w-5" />
          <span>Profile</span>
        </NavLink>
        <a className={link} href="#">
          <ShoppingBag className="h-5 w-5" />
          <span>Cart</span>
        </a>
      </div>
    </nav>
  )
}