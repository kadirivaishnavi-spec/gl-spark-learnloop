import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="not-found-page">
            <h1>404</h1>
            <p>The page you're looking for doesn't exist.</p>
            <Link to="/dashboard" className="not-found-link">
                Back to Dashboard
            </Link>
        </div>
    );
}

export default NotFound;