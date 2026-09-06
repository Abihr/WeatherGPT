import { NavLink } from "react-router-dom";

import { Home, Users, Map, RefreshCw, User, Bot } from "lucide-react";

const links = [
    { to: "/", label: "Home", icon: Home, end: true },
    { to: "/friends", label: "Friends", icon: Users },
    { to: "/map", label: "Map", icon: Map },
    { to: "/compare", label: "Compare", icon: RefreshCw },
    { to: "/chatbot", label: "WeatherGPT", icon: Bot },
    { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-sky-100 px-2 py-1.5 flex items-center justify-between pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
            {links.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl2 text-[10.5px] font-medium transition-colors ${
                            isActive ? "text-sky-600" : "text-ink-400"
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <Icon
                                size={19}
                                strokeWidth={isActive ? 2.4 : 2}
                            />
                            {label}
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}