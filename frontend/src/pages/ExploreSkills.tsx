import { useEffect, useState } from "react";
import {
    getAllSkills,
    getSkillsByCategory,
    getSkillsByLevel,
} from "../services/skillService";
import { getErrorMessage } from "../services/api";
import type { Skill } from "../types/skill";
import AppLayout from "../components/AppLayout";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

type FilterType = "all" | "category" | "level";

function ExploreSkills() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filterType, setFilterType] = useState<FilterType>("all");
    const [categoryInput, setCategoryInput] = useState("");
    const [levelInput, setLevelInput] = useState("");

    const [expandedId, setExpandedId] = useState<number | null>(null);

    async function loadSkills() {
        setLoading(true);
        setError(null);
        try {
            let data: Skill[];
            if (filterType === "category" && categoryInput.trim()) {
                data = await getSkillsByCategory(categoryInput.trim());
            } else if (filterType === "level" && levelInput.trim()) {
                data = await getSkillsByLevel(levelInput.trim());
            } else {
                data = await getAllSkills();
            }
            setSkills(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSkills();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleFilterSubmit(e: React.FormEvent) {
        e.preventDefault();
        loadSkills();
    }

    function clearFilters() {
        setFilterType("all");
        setCategoryInput("");
        setLevelInput("");
        setTimeout(loadSkills, 0);
    }

    return (
        <AppLayout>
            <h1>Explore Skills</h1>
            <p className="dashboard-subtitle">
                Browse skills shared by everyone on LearnLoop.
            </p>

            <form className="inline-form" onSubmit={handleFilterSubmit}>
                <h3>Filter Skills</h3>
                <div className="inline-form-grid">
                    <div>
                        <label htmlFor="filterType">Filter By</label>
                        <select
                            id="filterType"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as FilterType)}
                        >
                            <option value="all">All Skills</option>
                            <option value="category">Category</option>
                            <option value="level">Level</option>
                        </select>
                    </div>

                    {filterType === "category" && (
                        <div>
                            <label htmlFor="category">Category</label>
                            <input
                                id="category"
                                placeholder="e.g. Programming"
                                value={categoryInput}
                                onChange={(e) => setCategoryInput(e.target.value)}
                            />
                        </div>
                    )}

                    {filterType === "level" && (
                        <div>
                            <label htmlFor="level">Level</label>
                            <input
                                id="level"
                                placeholder="e.g. Beginner"
                                value={levelInput}
                                onChange={(e) => setLevelInput(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="inline-form-actions">
                    <button type="submit">Apply Filter</button>
                    <button type="button" className="btn-secondary" onClick={clearFilters}>
                        Clear
                    </button>
                </div>
            </form>

            {loading && <Loading text="Loading skills..." />}
            {error && <ErrorMessage message={error} />}

            {!loading && !error && skills.length === 0 && (
                <p className="empty-state">No skills found for this filter.</p>
            )}

            {!loading && !error && skills.length > 0 && (
                <div className="skill-grid">
                    {skills.map((skill) => (
                        <div key={skill.id} className="skill-card">
                            <div className="skill-card-header">
                                <h3>{skill.name}</h3>
                                <span className="skill-badge">{skill.level}</span>
                            </div>
                            <p className="skill-category">{skill.category}</p>

                            {expandedId === skill.id ? (
                                <>
                                    <p className="skill-description">{skill.description}</p>
                                    <p className="skill-meta">Shared by user #{skill.userId}</p>
                                    <button
                                        className="btn-small"
                                        onClick={() => setExpandedId(null)}
                                    >
                                        Hide Details
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="btn-small"
                                    onClick={() => setExpandedId(skill.id)}
                                >
                                    View Details
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}

export default ExploreSkills;