import { NavLink } from "react-router-dom";

const links = [
    { to: "/dashboard", label: "Dashboard", icon: "▦" },
    { to: "/profile", label: "Profile", icon: "◉" },
    { to: "/skills", label: "My Skills", icon: "★" },
    { to: "/explore", label: "Explore Skills", icon: "◈" },
    { to: "/requests", label: "Learning Requests", icon: "✉" },
    { to: "/matches", label: "Matches", icon: "⚡" },
    { to: "/feedback", label: "Feedback", icon: "♥" },
];

function Sidebar() {
    return (
        <nav className="sidebar">
            {links.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link sidebar-link-active"
                            : "sidebar-link"
                    }
                >
                    <span>{link.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}

export default Sidebar;