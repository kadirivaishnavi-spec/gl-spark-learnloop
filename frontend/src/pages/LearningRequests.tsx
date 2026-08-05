import { useEffect, useState, useRef, useMemo } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
    createLearningRequest,
    getLearningRequestsByUser,
    getAllLearningRequests,
} from "../services/learningService";
import { getAllSkills } from "../services/skillService";
import { getUserById } from "../services/userService";
import { getErrorMessage } from "../services/api";
import type { LearningRequest } from "../types/learningRequest";
import type { Skill } from "../types/skill";
import type { User } from "../types/user";
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

function rowStatusClass(status: string) {
    switch (status.toUpperCase()) {
        case "PENDING":
            return "row-pending";
        case "ACCEPTED":
            return "row-accepted";
        case "REJECTED":
            return "row-rejected";
        case "COMPLETED":
            return "row-completed";
        default:
            return "";
    }
}

function LearningRequests() {
    const { userId } = useAuth();

    const [requests, setRequests] = useState<LearningRequest[]>([]);
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [skillId, setSkillId] = useState("");
    const [message, setMessage] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownSearch, setDropdownSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [selectedSkillKey, setSelectedSkillKey] = useState("");
    const [allPendingRequests, setAllPendingRequests] = useState<LearningRequest[]>([]);
    const [userCache, setUserCache] = useState<Record<number, User>>({});

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    async function loadRequestsAndSkills() {
        if (userId === null) {
            setLoading(false);
            setLoadError("Could not determine your user ID from the session.");
            return;
        }
        setLoading(true);
        setLoadError(null);
        try {
            const [requestsData, skillsData, allRequestsData] = await Promise.all([
                getLearningRequestsByUser(userId),
                getAllSkills(),
                getAllLearningRequests(),
            ]);
            setRequests(requestsData);
            setAllSkills(skillsData);
            setAllPendingRequests(allRequestsData.filter((r) => r.status.toUpperCase() === "PENDING"));
        } catch (err) {
            setLoadError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRequestsAndSkills();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const partners = useMemo(() => {
        if (!selectedSkillKey || userId === null) return [];
        const [selectedName, selectedLevel] = selectedSkillKey.split("|");
        
        const mySkills = allSkills.filter((s) => s.userId === userId);
        const mySkillNames = mySkills.map((s) => s.name.toLowerCase());
        const availableSkills = allSkills.filter((s) => s.userId !== userId);

        const list: Array<{
            skill: Skill;
            percentage: number;
            label: string;
            userId: number;
        }> = [];

        const sameNameSkills = availableSkills.filter(
            (s) => s.name.toLowerCase() === selectedName.toLowerCase()
        );

        sameNameSkills.forEach((s) => {
            const userBRequests = allPendingRequests.filter((r) => r.learnerId === s.userId);
            const wantsWhatITeach = userBRequests.some((r) => {
                const wantedSkill = allSkills.find((sk) => sk.id === r.skillId);
                return wantedSkill && mySkillNames.includes(wantedSkill.name.toLowerCase());
            });

            let percentage = 0;
            let label = "";

            if (s.level.toLowerCase() === selectedLevel.toLowerCase()) {
                if (wantsWhatITeach) {
                    percentage = 100;
                    label = "Perfect learning partner";
                } else {
                    percentage = 30;
                    label = "Can teach you";
                }
            } else {
                if (wantsWhatITeach) {
                    percentage = 70;
                    label = "Reciprocal learning only";
                }
            }

            if (percentage > 0) {
                list.push({
                    skill: s,
                    percentage,
                    label,
                    userId: s.userId,
                });
            }
        });

        return list.sort((a, b) => b.percentage - a.percentage);
    }, [selectedSkillKey, allSkills, allPendingRequests, userId]);

    useEffect(() => {
        if (partners.length === 0) return;
        const missingUserIds = partners
            .map((p) => p.userId)
            .filter((id) => id !== null && !userCache[id]);

        if (missingUserIds.length === 0) return;

        missingUserIds.forEach(async (id) => {
            try {
                const userData = await getUserById(id);
                setUserCache((prev) => ({ ...prev, [id]: userData }));
            } catch (err) {
                console.error("Failed to load user details for partner matching", err);
            }
        });
    }, [partners, userCache]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);
        setSuccess(false);
 
        const skillIdNum = Number(skillId);
        if (!skillId.trim() || isNaN(skillIdNum) || skillIdNum <= 0) {
            setFormError("Please select a skill and a learning partner.");
            return;
        }
        if (!message.trim()) {
            setFormError("Please enter a message.");
            return;
        }
        if (userId === null) {
            setFormError("Could not determine your user ID.");
            return;
        }

        setSubmitting(true);
        try {
            await createLearningRequest({
                learnerId: userId,
                skillId: skillIdNum,
                message: message.trim(),
            });
            setSkillId("");
            setSelectedSkillKey("");
            setMessage("");
            setSuccess(true);
            await loadRequestsAndSkills();
        } catch (err) {
            setFormError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    const availableSkills = allSkills.filter((s) => s.userId !== userId);

    // Group availableSkills by name + level (case-insensitive) to get unique skills for dropdown
    const uniqueSkills = useMemo(() => {
        const map = new Map<string, Skill>();
        availableSkills.forEach((s) => {
            const key = `${s.name.toLowerCase()}|${s.level.toLowerCase()}`;
            if (!map.has(key)) {
                map.set(key, s);
            }
        });
        return Array.from(map.values());
    }, [availableSkills]);

    // Filter unique skills based on dropdownSearch
    const filteredUniqueSkills = uniqueSkills.filter((s) =>
        s.name.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
        s.category.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
        s.level.toLowerCase().includes(dropdownSearch.toLowerCase())
    );

    return (
        <AppLayout>
            <h1>Learning Requests</h1>
            <p className="dashboard-subtitle">
                Ask to learn a skill from another user by selecting a skill name.
            </p>

            <form className="inline-form" onSubmit={handleSubmit}>
                <h3>Create a Learning Request</h3>

                {formError && <ErrorMessage message={formError} />}
                {success && (
                    <div className="success-message">Learning request submitted!</div>
                )}

                <div className="inline-form-grid">
                    <div ref={dropdownRef} className="custom-dropdown">
                        <label htmlFor="skillId">Skill Name</label>
                        <button
                            type="button"
                            id="skillId"
                            className={`custom-dropdown-trigger ${isDropdownOpen ? "custom-dropdown-trigger-open" : ""}`}
                            onClick={() => {
                                if (!submitting) {
                                    setIsDropdownOpen(!isDropdownOpen);
                                    setDropdownSearch("");
                                }
                            }}
                            disabled={submitting}
                        >
                            <span>
                                {selectedSkillKey
                                    ? (() => {
                                          const [name, lvl] = selectedSkillKey.split("|");
                                          return `${name} (${lvl.toUpperCase()})`;
                                      })()
                                    : "-- Select a Skill --"}
                            </span>
                            <span className={`custom-dropdown-arrow ${isDropdownOpen ? "custom-dropdown-arrow-rotated" : ""}`}>
                                ▼
                            </span>
                        </button>

                        {isDropdownOpen && (
                            <div className="custom-dropdown-menu">
                                <div className="custom-dropdown-search-container">
                                    <input
                                        type="text"
                                        className="custom-dropdown-search"
                                        placeholder="Search skills (e.g. Java, Programming)..."
                                        value={dropdownSearch}
                                        onChange={(e) => setDropdownSearch(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                    />
                                </div>
                                <ul className="custom-dropdown-list">
                                    {filteredUniqueSkills.length === 0 ? (
                                        <li className="custom-dropdown-no-results">
                                            No matching skills found
                                        </li>
                                    ) : (
                                        filteredUniqueSkills.map((s) => {
                                            const key = `${s.name.toLowerCase()}|${s.level.toLowerCase()}`;
                                            const isSelected = selectedSkillKey.toLowerCase() === key;
                                            return (
                                                <li
                                                    key={s.id}
                                                    className={`custom-dropdown-item ${isSelected ? "custom-dropdown-item-selected" : ""}`}
                                                    onClick={() => {
                                                        setSelectedSkillKey(`${s.name}|${s.level}`);
                                                        setSkillId("");
                                                        setIsDropdownOpen(false);
                                                    }}
                                                >
                                                    <span className="custom-dropdown-item-name">{s.name}</span>
                                                    <div className="custom-dropdown-item-meta">
                                                        <span className={`custom-dropdown-item-badge ${
                                                            s.level.toUpperCase() === "ADVANCE" || s.level.toUpperCase() === "ADVANCED"
                                                                ? "custom-dropdown-item-badge-accent" 
                                                                : "custom-dropdown-item-badge-primary"
                                                        }`}>
                                                            {s.level}
                                                        </span>
                                                        <span className="custom-dropdown-item-badge">
                                                            {s.category}
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        })
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {selectedSkillKey && (
                    <div className="partner-selection-container" style={{ marginTop: "1.2rem", width: "100%" }}>
                        <label style={{ fontWeight: 700, marginBottom: "0.2rem", display: "block" }}>Select a Learning Partner</label>
                        <p className="field-hint" style={{ marginBottom: "0.8rem", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                            Choose the partner you want to learn from based on their match percentage.
                        </p>
                        {partners.length === 0 ? (
                            <div className="empty-state-card">
                                No partners currently teaching {selectedSkillKey.split("|")[0]} are eligible.
                            </div>
                        ) : (
                            <div className="partner-grid">
                                {partners.map((p) => {
                                    const isSelected = Number(skillId) === p.skill.id;
                                    const userDetail = userCache[p.userId];
                                    const partnerName = userDetail ? userDetail.name : `User #${p.userId}`;
                                    
                                    let badgeClass = "badge-gray";
                                    if (p.percentage === 100) badgeClass = "badge-success";
                                    else if (p.percentage === 70) badgeClass = "badge-info";
                                    else if (p.percentage === 30) badgeClass = "badge-warning";

                                    return (
                                        <div
                                            key={p.skill.id}
                                            className={`partner-card ${isSelected ? "partner-card-selected" : ""}`}
                                            onClick={() => setSkillId(String(p.skill.id))}
                                        >
                                            <div className="partner-card-header">
                                                <div className="partner-info">
                                                    <span className="partner-avatar">
                                                        {partnerName.trim().split(/\s+/)[0].slice(0, 2).toUpperCase()}
                                                    </span>
                                                    <div>
                                                        <h4 className="partner-name">{partnerName}</h4>
                                                        <p className="partner-skill-detail">
                                                            Offers: {p.skill.name} ({p.skill.level})
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`partner-match-badge ${badgeClass}`}>
                                                    {p.percentage}% {p.label}
                                                </span>
                                            </div>
                                            <p className="partner-description">
                                                {p.skill.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                <label htmlFor="message" style={{ marginTop: "1.1rem" }}>Message</label>
                <textarea
                    id="message"
                    placeholder="e.g. I want to learn Java"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={submitting}
                    rows={2}
                />

                <div className="inline-form-actions">
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </form>

            <h3 className="section-title">My Learning Requests</h3>

            {loading && <Loading text="Loading requests..." />}
            {loadError && <ErrorMessage message={loadError} />}

            {!loading && !loadError && requests.length === 0 && (
                <p className="empty-state">You haven't made any learning requests yet.</p>
            )}

            {!loading && !loadError && requests.length > 0 && (
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>Skill</th>
                        <th>Message</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {requests.map((req) => (
                        <tr key={req.id} className={rowStatusClass(req.status)}>
                            <td>
                                {(() => {
                                    const found = allSkills.find((s) => s.id === req.skillId);
                                    return found ? `${found.name} (${found.level})` : `Skill #${req.skillId}`;
                                })()}
                            </td>
                            <td>{req.message}</td>
                            <td>
                                <span className={statusClass(req.status)}>{req.status}</span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </AppLayout>
    );
}

export default LearningRequests;