import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

function Navbar() {
    const { userEmail, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <header className="navbar">
            <div className="navbar-brand-group">
                <Logo size={38} />
                <div className="navbar-brand-text">
                    <span className="navbar-brand">LearnLoop</span>
                    <span className="navbar-tagline">Skill Sharing Platform</span>
                </div>
            </div>

            <div className="navbar-right">
                {userEmail && (
                    <span className="navbar-user">
                        {userEmail}
                    </span>
                )}

                <button
                    type="button"
                    className="navbar-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Navbar;