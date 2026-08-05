import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserById } from "../services/userService";
import { getSkillsByUser } from "../services/skillService";
import { getErrorMessage } from "../services/api";
import type { User } from "../types/user";
import type { Skill } from "../types/skill";
import AppLayout from "../components/AppLayout";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Profile() {
    const { userId } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userId === null) {
            setLoading(false);
            setError("Could not determine your user ID from the session.");
            return;
        }

        async function loadProfile() {
            setLoading(true);
            setError(null);
            try {
                const [userData, skillData] = await Promise.all([
                    getUserById(userId!),
                    getSkillsByUser(userId!),
                ]);
                setUser(userData);
                setSkills(skillData);
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [userId]);

    // Group skills by category for the "top categories" summary
    const categoryCounts = skills.reduce<Record<string, number>>((acc, s) => {
        acc[s.category] = (acc[s.category] || 0) + 1;
        return acc;
    }, {});
    const topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    return (
        <AppLayout>
            <h1>My Profile</h1>

            {loading && <Loading text="Loading profile..." />}
            {error && <ErrorMessage message={error} />}

            {!loading && !error && user && (
                <>
                    <div className="profile-hero">
                        <div className="profile-hero-bg" />
                        <div className="profile-hero-content">
                            <div className="profile-avatar">{getInitials(user.name)}</div>
                            <div>
                                <h2 className="profile-name">{user.name}</h2>
                                <p className="profile-email">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="profile-stats-grid">
                        <div className="profile-stat-card">
                            <span className="profile-stat-value">{skills.length}</span>
                            <span className="profile-stat-label">Total Skills</span>
                        </div>
                        <div className="profile-stat-card">
                            <span className="profile-stat-value">{Object.keys(categoryCounts).length}</span>
                            <span className="profile-stat-label">Categories</span>
                        </div>
                        <div className="profile-stat-card">
                            <span className="profile-stat-value">#{user.id}</span>
                            <span className="profile-stat-label">User ID</span>
                        </div>
                    </div>

                    <div className="profile-detail-card">
                        <h3 className="section-title">Account Details</h3>
                        <div className="profile-row">
                            <span className="profile-label">Full Name</span>
                            <span>{user.name}</span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Email Address</span>
                            <span>{user.email}</span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">User ID</span>
                            <span>{user.id}</span>
                        </div>
                    </div>

                    {topCategories.length > 0 && (
                        <div className="profile-detail-card">
                            <h3 className="section-title">Skill Categories</h3>
                            <div className="profile-category-list">
                                {topCategories.map(([category, count]) => (
                                    <div key={category} className="profile-category-chip">
                                        <span>{category}</span>
                                        <span className="profile-category-count">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </AppLayout>
    );
}

export default Profile;