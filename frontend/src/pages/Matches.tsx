import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    getMatchesByUserId,
    getMatchesByMatchedUserId,
    updateMatchStatus,
} from "../services/matchService";
import { getUserById } from "../services/userService";
import { getAllSkills } from "../services/skillService";
import { getErrorMessage } from "../services/api";
import type { Match } from "../types/match";
import type { User } from "../types/user";
import type { Skill } from "../types/skill";
import AppLayout from "../components/AppLayout";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

function statusClass(status: string) {
    switch (status.toUpperCase()) {
        case "PENDING":
            return "status-badge status-pending";
        case "ACCEPTED":
            return "status-badge status-accepted";
        case "REJECTED":
            return "status-badge status-rejected";
        case "COMPLETED":
            return "status-badge status-completed";
        default:
            return "status-badge";
    }
}

function Matches() {
    const { userId } = useAuth();

    const [matches, setMatches] = useState<Match[]>([]);
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    // Cache of userId -> User details, so we don't re-fetch the same person twice
    const [userCache, setUserCache] = useState<Record<number, User>>({});
    const [loadingUsers, setLoadingUsers] = useState<Record<number, boolean>>({});

    async function loadMatchesAndSkills() {
        if (userId === null) {
            setLoading(false);
            setError("Could not determine your user ID from the session.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [asUser, asMatchedUser, skillsData] = await Promise.all([
                getMatchesByUserId(userId),
                getMatchesByMatchedUserId(userId),
                getAllSkills(),
            ]);

            const combined = [...asUser];
            for (const m of asMatchedUser) {
                if (!combined.some((existing) => existing.id === m.id)) {
                    combined.push(m);
                }
            }
            setMatches(combined);
            setAllSkills(skillsData);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMatchesAndSkills();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Whenever matches change, fetch details for the "other user" of any
    // ACCEPTED match we don't already have cached.
    useEffect(() => {
        const idsToFetch = new Set<number>();
        for (const match of matches) {
            if (match.status.toUpperCase() !== "ACCEPTED") continue;
            const otherUserId = match.userId === userId ? match.matchedUserId : match.userId;
            if (!userCache[otherUserId] && !loadingUsers[otherUserId]) {
                idsToFetch.add(otherUserId);
            }
        }

        if (idsToFetch.size === 0) return;

        idsToFetch.forEach(async (id) => {
            setLoadingUsers((prev) => ({ ...prev, [id]: true }));
            try {
                const user = await getUserById(id);
                setUserCache((prev) => ({ ...prev, [id]: user }));
            } catch {
                // Silently skip — we'll just fall back to showing the user ID
            } finally {
                setLoadingUsers((prev) => ({ ...prev, [id]: false }));
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matches, userId]);

    async function handleStatusChange(matchId: number, newStatus: string) {
        setUpdatingId(matchId);
        setError(null);
        try {
            await updateMatchStatus(matchId, newStatus);
            await loadMatchesAndSkills();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setUpdatingId(null);
        }
    }

    return (
        <AppLayout>
            <h1>Matches ⚡</h1>
            <p className="dashboard-subtitle">
                People you've been matched with for skill exchange. Let's connect and share knowledge! 🚀💡
            </p>

            {loading && <Loading text="Loading matches..." />}
            {error && <ErrorMessage message={error} />}

            {!loading && !error && matches.length === 0 && (
                <p className="empty-state">You don't have any matches yet. Explore skills to send requests and get matched! 🧭✨</p>
            )}
             {!loading && !error && matches.length > 0 && (
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>🔢 Match ID</th>
                        <th>🤝 Matched With</th>
                        <th>📚 Skill</th>
                        <th>🚦 Status</th>
                        <th>✨ Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {matches.map((match) => {
                        const otherUserId =
                            match.userId === userId ? match.matchedUserId : match.userId;
                        const isPending = match.status.toUpperCase() === "PENDING";
                        const isAccepted = match.status.toUpperCase() === "ACCEPTED";
                        const otherUser = userCache[otherUserId];

                        return (
                            <tr key={match.id}>
                                <td>{match.id}</td>
                                <td>
                                    {isAccepted ? (
                                        otherUser ? (
                                            <div className="match-contact">
                                                <span className="match-contact-name">👤 {otherUser.name}</span>
                                                <a href={`mailto:${otherUser.email}`} className="match-contact-email">
                                                    📧 {otherUser.email}
                                                </a>
                                            </div>
                                        ) : (
                                            <span className="match-contact-loading">
                          ⏳ Loading contact info...
                        </span>
                                        )
                                    ) : (
                                        <span className="match-contact-hidden">
                        🔒 User #{otherUserId} (accept to view contact info)
                      </span>
                                    )}
                                </td>
                                <td>
                                    {(() => {
                                        const found = allSkills.find((s) => s.id === match.skillId);
                                        return found ? `${found.name} (${found.level})` : `Skill #${match.skillId}`;
                                    })()}
                                </td>
                                <td>
                                    <span className={statusClass(match.status)}>
                                        {match.status}
                                    </span>
                                </td>
                                <td className="table-actions">
                                    {isPending ? (
                                        <>
                                            <button
                                                className="btn-small btn-accept"
                                                disabled={updatingId === match.id}
                                                onClick={() => handleStatusChange(match.id, "ACCEPTED")}
                                            >
                                                {updatingId === match.id ? "..." : "Accept"}
                                            </button>
                                            <button
                                                className="btn-small btn-danger"
                                                disabled={updatingId === match.id}
                                                onClick={() => handleStatusChange(match.id, "REJECTED")}
                                            >
                                                {updatingId === match.id ? "..." : "Reject"}
                                            </button>
                                        </>
                                    ) : (
                                        <span className="no-action">—</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            )}
        </AppLayout>
    );
}

export default Matches;