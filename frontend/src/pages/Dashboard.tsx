/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSkillsByUser, getAllSkills, createSkill } from "../services/skillService";
import { getLearningRequestsByUser, createLearningRequest } from "../services/learningService";
import { getMatchesByUserId, getMatchesByMatchedUserId } from "../services/matchService";
import { getFeedbackByUser } from "../services/feedbackService";
import { getUserById } from "../services/userService";
import { getErrorMessage } from "../services/api";
import type { Skill } from "../types/skill";
import type { LearningRequest } from "../types/learningRequest";
import type { Match } from "../types/match";
import AppLayout from "../components/AppLayout";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

interface Counts {
    skills: number | null;
    requests: number | null;
    matches: number | null;
    feedback: number | null;
}

const howItWorks = [
    {
        step: "1",
        title: "Add your skills",
        text: "List what you know — from Java to guitar — so others can find and learn from you.",
    },
    {
        step: "2",
        title: "Explore & request",
        text: "Browse skills shared by the community and send a learning request to get started.",
    },
    {
        step: "3",
        title: "Get matched",
        text: "Once accepted, you're matched with your learning partner and can connect directly.",
    },
    {
        step: "4",
        title: "Exchange & review",
        text: "Learn together, then leave feedback to help others find great learning partners.",
    },
];

function Dashboard() {
    const { userEmail, userId } = useAuth();
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [counts, setCounts] = useState<Counts>({
        skills: null,
        requests: null,
        matches: null,
        feedback: null,
    });
    const [loadingCounts, setLoadingCounts] = useState(true);

    // Time-based greeting state
    const [greeting, setGreeting] = useState("Welcome back");

    // Tip of the day state
    const [tip, setTip] = useState("");

    // Quick-add skill form state
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [quickAddForm, setQuickAddForm] = useState({ name: "", category: "", level: "", description: "" });
    const [submittingQuickAdd, setSubmittingQuickAdd] = useState(false);
    const [quickAddError, setQuickAddError] = useState<string | null>(null);
    const [quickAddSuccess, setQuickAddSuccess] = useState(false);

    // Tabbed activity feed state
    const [activeTab, setActiveTab] = useState<"recommended" | "requests" | "matches">("recommended");
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [recommendedSkills, setRecommendedSkills] = useState<Skill[]>([]);
    const [recentRequests, setRecentRequests] = useState<LearningRequest[]>([]);
    const [recentMatches, setRecentMatches] = useState<Match[]>([]);
    const [activitiesError, setActivitiesError] = useState<string | null>(null);

    // Track which skills have been requested on the dashboard
    const [requestedSkillIds, setRequestedSkillIds] = useState<Record<number, boolean>>({});
    const [requestingSkillId, setRequestingSkillId] = useState<number | null>(null);

    // Load initial counts
    useEffect(() => {
        if (userId === null) {
            setLoadingCounts(false);
            return;
        }

        async function loadCounts() {
            setLoadingCounts(true);
            const results = await Promise.allSettled([
                getSkillsByUser(userId!),
                getLearningRequestsByUser(userId!),
                Promise.all([getMatchesByUserId(userId!), getMatchesByMatchedUserId(userId!)]).then(
                    ([asUser, asMatchedUser]) => {
                        const ids = new Set(asUser.map((m) => m.id));
                        let total = asUser.length;
                        for (const m of asMatchedUser) {
                            if (!ids.has(m.id)) total++;
                        }
                        return total;
                    }
                ),
                getFeedbackByUser(userId!),
            ]);

            setCounts({
                skills: results[0].status === "fulfilled" ? results[0].value.length : null,
                requests: results[1].status === "fulfilled" ? results[1].value.length : null,
                matches: results[2].status === "fulfilled" ? results[2].value : null,
                feedback: results[3].status === "fulfilled" ? results[3].value.length : null,
            });
            setLoadingCounts(false);
        }

        loadCounts();
    }, [userId]);

    // Fetch the user's real name to show a friendlier welcome message
    useEffect(() => {
        if (userId === null) return;

        async function loadName() {
            try {
                const user = await getUserById(userId!);
                setDisplayName(user.name);
            } catch {
                // If this fails, we silently fall back to showing the email instead
            }
        }

        loadName();
    }, [userId]);

    // Set time-based greeting and rotating tip of the day
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning");
        else if (hour < 18) setGreeting("Good afternoon");
        else setGreeting("Good evening");

        const tipsPool = [
            "Listing more skills increases your chance of getting matched by 3x!",
            "Use clear and detailed descriptions for your skills to help others understand what you can teach.",
            "Keep checking the Explore Skills tab to discover what others in the community are sharing.",
            "When sending a learning request, add a friendly message introducing yourself and what you want to learn.",
            "After finishing a learning exchange, remember to leave feedback to support the community!",
            "Teaching a skill is one of the best ways to master it even further. Give it a try!"
        ];
        const randomTip = tipsPool[Math.floor(Math.random() * tipsPool.length)];
        setTip(randomTip);
    }, []);

    // Load Hub Activities
    async function loadActivities() {
        if (userId === null) return;
        setLoadingActivities(true);
        setActivitiesError(null);
        try {
            const [allSkills, requestsData, matchesUser, matchesMatchedUser] = await Promise.all([
                getAllSkills(),
                getLearningRequestsByUser(userId),
                getMatchesByUserId(userId),
                getMatchesByMatchedUserId(userId),
            ]);

            // Recommended Skills: Skills belonging to other users that user hasn't already requested
            const otherUsersSkills = allSkills.filter((s) => s.userId !== userId);
            const requestedIds = new Set(requestsData.map((r) => r.skillId));
            const recommendations = otherUsersSkills
                .filter((s) => !requestedIds.has(s.id))
                .slice(0, 3); // Take top 3

            setRecommendedSkills(recommendations);

            // Recent Requests: Take top 3 recent requests
            setRecentRequests(requestsData.slice(0, 3));

            // Consolidated Recent Matches: Take top 3 matches
            const combinedMatches = [...matchesUser];
            for (const m of matchesMatchedUser) {
                if (!combinedMatches.some((existing) => existing.id === m.id)) {
                    combinedMatches.push(m);
                }
            }
            setRecentMatches(combinedMatches.slice(0, 3));
        } catch (err) {
            setActivitiesError(getErrorMessage(err));
        } finally {
            setLoadingActivities(false);
        }
    }

    useEffect(() => {
        if (userId !== null) {
            loadActivities();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Handle Quick Add Skill Submission
    async function handleQuickAddSkill(e: React.FormEvent) {
        e.preventDefault();
        setQuickAddError(null);
        setQuickAddSuccess(false);

        const { name, category, level, description } = quickAddForm;
        if (!name.trim() || !category.trim() || !level.trim() || !description.trim()) {
            setQuickAddError("Please fill in all fields.");
            return;
        }

        if (userId === null) {
            setQuickAddError("Could not determine your user ID.");
            return;
        }

        setSubmittingQuickAdd(true);
        try {
            await createSkill({
                name: name.trim(),
                category: category.trim(),
                level: level.trim(),
                description: description.trim(),
                userId,
            });

            setQuickAddSuccess(true);
            setQuickAddForm({ name: "", category: "", level: "", description: "" });
            
            setTimeout(() => {
                setShowQuickAdd(false);
                setQuickAddSuccess(false);
            }, 1500);

            // Update local count
            setCounts((prev) => ({
                ...prev,
                skills: prev.skills !== null ? prev.skills + 1 : 1,
            }));
        } catch (err) {
            setQuickAddError(getErrorMessage(err));
        } finally {
            setSubmittingQuickAdd(false);
        }
    }

    // Handle Quick Request from Recommendations
    async function handleQuickRequest(skillId: number) {
        if (userId === null) return;
        setRequestingSkillId(skillId);
        try {
            await createLearningRequest({
                learnerId: userId,
                skillId,
                message: "Hi! I saw your skill on the dashboard and would love to exchange knowledge and learn this from you.",
            });

            setRequestedSkillIds((prev) => ({ ...prev, [skillId]: true }));
            
            // Refresh counts to stay in sync
            const requestsData = await getLearningRequestsByUser(userId);
            setCounts((prev) => ({
                ...prev,
                requests: requestsData.length,
            }));
            
            // Refresh recommended and recent requests in the local states
            setRecentRequests(requestsData.slice(0, 3));
            setTimeout(() => {
                setRecommendedSkills((prev) => prev.filter((s) => s.id !== skillId));
            }, 1500);
        } catch (err) {
            alert(`Failed to send learning request: ${getErrorMessage(err)}`);
        } finally {
            setRequestingSkillId(null);
        }
    }

    function formatCount(value: number | null) {
        if (loadingCounts) return "…";
        if (value === null) return "—";
        return String(value);
    }

    const greetingName = displayName || userEmail;

    return (
        <AppLayout>
            <h1>{greeting}{greetingName ? `, ${greetingName}` : ""}!</h1>
            <p className="dashboard-subtitle">
                Here's a quick overview of your LearnLoop activity.
            </p>

            {/* Rotating Tip Card */}
            {tip && (
                <div className="dashboard-tip-card">
                    <div className="dashboard-tip-content">
                        <h4>Tip of the Day</h4>
                        <p>{tip}</p>
                    </div>
                </div>
            )}

            {/* Quick Actions Bar */}
            <div className="quick-actions-bar">
                <button
                    className={`quick-action-btn ${showQuickAdd ? "" : "quick-action-btn-primary"}`}
                    onClick={() => {
                        setShowQuickAdd(!showQuickAdd);
                        setQuickAddError(null);
                        setQuickAddSuccess(false);
                    }}
                >
                    {showQuickAdd ? "Close Form" : "＋ Share a Skill"}
                </button>
                <Link to="/explore" className="quick-action-btn" style={{ textDecoration: "none" }}>
                    🔍 Explore Community Skills
                </Link>
                <Link to="/matches" className="quick-action-btn" style={{ textDecoration: "none" }}>
                    🤝 View My Matches
                </Link>
            </div>

            {/* Quick Add Skill Form (Collapsible/Slide panel) */}
            <div className={`quick-add-section ${showQuickAdd ? "open" : ""}`}>
                <form className="inline-form" onSubmit={handleQuickAddSkill} style={{ marginBottom: 0 }}>
                    <h3>Quick Share a New Skill</h3>
                    {quickAddError && <ErrorMessage message={quickAddError} />}
                    {quickAddSuccess && (
                        <div className="success-message">Skill shared successfully! Form closing...</div>
                    )}
                    <div className="inline-form-grid">
                        <div>
                            <label htmlFor="quick-skill-name">Skill Name</label>
                            <input
                                id="quick-skill-name"
                                placeholder="e.g. Python Programming"
                                value={quickAddForm.name}
                                onChange={(e) => setQuickAddForm({ ...quickAddForm, name: e.target.value })}
                                disabled={submittingQuickAdd || quickAddSuccess}
                            />
                        </div>
                        <div>
                            <label htmlFor="quick-skill-category">Category</label>
                            <input
                                id="quick-skill-category"
                                placeholder="e.g. Technology"
                                value={quickAddForm.category}
                                onChange={(e) => setQuickAddForm({ ...quickAddForm, category: e.target.value })}
                                disabled={submittingQuickAdd || quickAddSuccess}
                            />
                        </div>
                        <div>
                            <label htmlFor="quick-skill-level">Level</label>
                            <input
                                id="quick-skill-level"
                                placeholder="e.g. Intermediate"
                                value={quickAddForm.level}
                                onChange={(e) => setQuickAddForm({ ...quickAddForm, level: e.target.value })}
                                disabled={submittingQuickAdd || quickAddSuccess}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="quick-skill-desc" style={{ marginTop: "1rem" }}>Description</label>
                        <textarea
                            id="quick-skill-desc"
                            placeholder="Describe what you can teach and your experience level..."
                            value={quickAddForm.description}
                            onChange={(e) => setQuickAddForm({ ...quickAddForm, description: e.target.value })}
                            disabled={submittingQuickAdd || quickAddSuccess}
                            rows={2}
                        />
                    </div>
                    <div className="inline-form-actions">
                        <button type="submit" disabled={submittingQuickAdd || quickAddSuccess}>
                            {submittingQuickAdd ? "Sharing..." : "Share Skill"}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setShowQuickAdd(false)}
                            disabled={submittingQuickAdd || quickAddSuccess}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* Main Count Cards */}
            <div className="dashboard-cards">
                <Link to="/skills" className="dashboard-card dashboard-card-link">
                    <h3>My Skills</h3>
                    <p className="dashboard-card-count">{formatCount(counts.skills)}</p>
                </Link>
                <Link to="/requests" className="dashboard-card dashboard-card-link">
                    <h3>Learning Requests</h3>
                    <p className="dashboard-card-count">{formatCount(counts.requests)}</p>
                </Link>
                <Link to="/matches" className="dashboard-card dashboard-card-link">
                    <h3>Matches</h3>
                    <p className="dashboard-card-count">{formatCount(counts.matches)}</p>
                </Link>
                <Link to="/feedback" className="dashboard-card dashboard-card-link">
                    <h3>Feedback</h3>
                    <p className="dashboard-card-count">{formatCount(counts.feedback)}</p>
                </Link>
            </div>

            {/* Interactive Activity & Community Hub */}
            <div className="dashboard-hub-section">
                <h2>Activity & Community Hub</h2>
                
                <div className="dashboard-tabs">
                    <button
                        className={`dashboard-tab-btn ${activeTab === "recommended" ? "dashboard-tab-btn-active" : ""}`}
                        onClick={() => setActiveTab("recommended")}
                    >
                        🌟 Recommended to Learn
                    </button>
                    <button
                        className={`dashboard-tab-btn ${activeTab === "requests" ? "dashboard-tab-btn-active" : ""}`}
                        onClick={() => setActiveTab("requests")}
                    >
                        📬 Recent Requests
                    </button>
                    <button
                        className={`dashboard-tab-btn ${activeTab === "matches" ? "dashboard-tab-btn-active" : ""}`}
                        onClick={() => setActiveTab("matches")}
                    >
                        🤝 My Matches
                    </button>
                </div>

                <div className="dashboard-tab-content">
                    {loadingActivities && <Loading text="Loading hub activity..." />}
                    {activitiesError && <ErrorMessage message={activitiesError} />}

                    {!loadingActivities && !activitiesError && (
                        <>
                            {activeTab === "recommended" && (
                                <>
                                    {recommendedSkills.length === 0 ? (
                                        <p className="empty-state">No new skills to recommend right now. Check back later!</p>
                                    ) : (
                                        <div className="dashboard-list-grid">
                                            {recommendedSkills.map((skill) => (
                                                <div key={skill.id} className="dashboard-list-card">
                                                    <div>
                                                        <div className="card-header-row">
                                                            <h4>{skill.name}</h4>
                                                            <span className="card-pill">{skill.level}</span>
                                                        </div>
                                                        <p style={{ marginTop: "0.5rem" }}>{skill.description}</p>
                                                    </div>
                                                    <div className="card-footer-row">
                                                        <span className="card-pill" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                                                            {skill.category}
                                                        </span>
                                                        {requestedSkillIds[skill.id] ? (
                                                            <span className="quick-request-success">Requested!</span>
                                                        ) : (
                                                            <button
                                                                className="btn-small"
                                                                onClick={() => handleQuickRequest(skill.id)}
                                                                disabled={requestingSkillId === skill.id}
                                                            >
                                                                {requestingSkillId === skill.id ? "Sending..." : "Quick Request"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === "requests" && (
                                <>
                                    {recentRequests.length === 0 ? (
                                        <p className="empty-state">No recent requests. Try requesting a skill from recommendations!</p>
                                    ) : (
                                        <div className="dashboard-list-grid">
                                            {recentRequests.map((req) => (
                                                <div key={req.id} className="dashboard-list-card">
                                                    <div>
                                                        <div className="card-header-row">
                                                            <h4>Request ID #{req.id}</h4>
                                                            <span className={`status-badge ${
                                                                req.status.toUpperCase() === "PENDING" ? "status-pending" :
                                                                req.status.toUpperCase() === "ACCEPTED" ? "status-accepted" :
                                                                req.status.toUpperCase() === "REJECTED" ? "status-rejected" : ""
                                                            }`}>
                                                                {req.status}
                                                            </span>
                                                        </div>
                                                        <p style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
                                                            "{req.message || "No message provided."}"
                                                        </p>
                                                    </div>
                                                    <div className="card-footer-row" style={{ justifyContent: "flex-end" }}>
                                                        <Link to="/requests" className="btn-small" style={{ textDecoration: "none" }}>
                                                            Manage
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === "matches" && (
                                <>
                                    {recentMatches.length === 0 ? (
                                        <p className="empty-state">No matches yet. Explore skills to send requests and get matched!</p>
                                    ) : (
                                        <div className="dashboard-list-grid">
                                            {recentMatches.map((m) => {
                                                return (
                                                    <div key={m.id} className="dashboard-list-card">
                                                        <div>
                                                            <div className="card-header-row">
                                                                <h4>Exchange Match</h4>
                                                                <span className="status-badge status-accepted">{m.status}</span>
                                                            </div>
                                                            <p style={{ marginTop: "0.5rem" }}>
                                                                Partner Email: {m.matchedUserEmail || "Shared partner details"}
                                                            </p>
                                                        </div>
                                                        <div className="card-footer-row" style={{ justifyContent: "flex-end" }}>
                                                            <Link to="/matches" className="btn-small" style={{ textDecoration: "none" }}>
                                                                Chat & Connect
                                                            </Link>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {userId !== null && <p className="dashboard-meta" style={{ marginTop: "2.5rem" }}>User ID: {userId}</p>}

            <div className="about-section">
                <div className="about-text">
                    <h2 className="about-title">What is LearnLoop?</h2>
                    <p>
                        LearnLoop is a collaborative learning and skill-exchange platform.
                        Instead of paying for courses, you trade knowledge directly with
                        other members — teach what you're good at, learn what you're
                        curious about, and build real connections along the way.
                    </p>
                </div>

                <div className="how-it-works">
                    <h3 className="section-title">How it works</h3>
                    <div className="steps-grid">
                        {howItWorks.map((item) => (
                            <div key={item.step} className="step-card">
                                <span className="step-number">{item.step}</span>
                                <h4 className="step-title">{item.title}</h4>
                                <p className="step-text">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default Dashboard;