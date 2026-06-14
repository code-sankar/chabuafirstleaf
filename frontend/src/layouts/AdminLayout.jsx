import React from 'react';
import { LayoutDashboard, Box, ClipboardList, Users, Mail, ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children, currentTab, setCurrentTab }) {
  const menuItems = [
    { id: 'dashboard',   label: 'Matrix Control',    icon: LayoutDashboard },
    { id: 'inventory',   label: 'Inventory Control', icon: Box },
    { id: 'orders',      label: 'Order Logistics',   icon: ClipboardList },
    { id: 'customers',   label: 'Patron Registry',   icon: Users },
    { id: 'subscribers', label: 'Waitlist Vault',    icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-brand-cream flex text-brand-charcoal">
      {/* LEFT NAVIGATION PANEL */}
      <aside className="w-64 bg-brand-charcoal text-brand-cream border-r border-brand-gold/10 p-6 flex flex-col justify-between sticky top-0 h-screen shrink-0">
        <div className="space-y-12">
          <div className="border-b border-white/5 pb-4">
            <h2 className="font-serif text-md tracking-luxury text-brand-gold font-bold">CFL RESERVES</h2>
            <p className="font-sans text-[9px] uppercase tracking-widest text-brand-muted mt-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-brand-gold" /> Admin Gateway Authority
            </p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center gap-3 font-sans text-xs uppercase tracking-wider px-4 py-3.5 border transition-all duration-300 rounded-none cursor-pointer text-left focus:outline-none ${
                    isActive
                      ? 'border-brand-gold bg-brand-forest text-brand-gold font-bold shadow-md'
                      : 'border-transparent text-brand-cream/60 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <IconComp className="w-4 h-4 stroke-[1.5]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <footer className="font-sans text-[9px] uppercase tracking-widest text-brand-muted text-center border-t border-white/5 pt-4">
          Node Execution System 4.0
        </footer>
      </aside>

      {/* MAIN RENDER FRAME */}
      <main className="flex-1 p-12 overflow-y-auto max-w-5xl">
        {children}
      </main>
    </div>
  );
}