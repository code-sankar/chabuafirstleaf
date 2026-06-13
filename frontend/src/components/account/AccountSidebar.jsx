import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { User, Package, MapPin, Heart, LogOut, Home } from 'lucide-react';

import { selectUser, selectWishlistCount } from '../../store';
import { signOut } from '../../services/authService';

const links = [
  { to: '/account',           label: 'Overview',  icon: Home,    end: true },
  { to: '/account/orders',    label: 'Orders',    icon: Package },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/wishlist',  label: 'Wishlist',  icon: Heart },
  { to: '/account/profile',   label: 'Profile',   icon: User },
];

export default function AccountSidebar() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const wishlistCount = useSelector(selectWishlistCount);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Patron';

  return (
    <aside className="bg-white border border-brand-forest/5 lg:sticky lg:top-32 self-start">
      {/* Patron header */}
      <header className="px-6 py-6 border-b border-brand-forest/5">
        <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gold/70 mb-1">
          Patron
        </p>
        <p className="font-serif text-lg text-brand-forest leading-tight truncate">
          {fullName}
        </p>
        {user?.email && (
          <p className="font-sans text-[11px] text-brand-muted truncate mt-1">
            {user.email}
          </p>
        )}
      </header>

      {/* Nav */}
      <nav className="py-2">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 px-6 py-3 font-sans text-[12px] tracking-wide transition-colors border-l-2 ${
                isActive
                  ? 'border-brand-gold bg-brand-cream/40 text-brand-forest'
                  : 'border-transparent text-brand-muted hover:text-brand-forest hover:bg-brand-cream/30'
              }`
            }
          >
            <span className="flex items-center gap-3">
              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{label}</span>
            </span>
            {label === 'Wishlist' && wishlistCount > 0 && (
              <span className="font-sans text-[10px] text-brand-gold tabular-nums">
                {wishlistCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center gap-3 px-6 py-4 font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-red-700 transition-colors border-t border-brand-forest/5 cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span>Sign Out</span>
      </button>
    </aside>
  );
}