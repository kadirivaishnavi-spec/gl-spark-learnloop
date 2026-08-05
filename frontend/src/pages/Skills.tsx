import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
    getSkillsByUser,
    createSkill,
    updateSkill,
    deleteSkill,
} from "../services/skillService";
import { getErrorMessage } from "../services/api";
import type { Skill } from "../types/skill";
import AppLayout from "../components/AppLayout";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

const emptyForm = { name: "", description: "", category: "", level: "" };

function Skills() {
    const { userId } = useAuth();

    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [deletingId, setDeletingId] = useState<number | null>(null);

    async function loadSkills() {
        if (userId === null) return;
        setLoading(true);
        setLoadError(null);
        try {
            const data = await getSkillsByUser(userId);
            setSkills(data);
        } catch (err) {
            setLoadError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSkills();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    function startEdit(skill: Skill) {
        setEditingId(skill.id);
        setForm({
            name: skill.name,
            description: skill.description,
            category: skill.category,
            level: skill.level,
        });
        setFormError(null);
    }

    function cancelEdit() {
        setEditingId(null);
        setForm(emptyForm);
        setFormError(null);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);

        if (!form.name.trim() || !form.description.trim() || !form.category.trim() || !form.level.trim()) {
            setFormError("Please fill in all fields.");
            return;
        }
        if (userId === null) {
            setFormError("Could not determine your user ID.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                category: form.category.trim(),
                level: form.level.trim(),
                userId,
            };

            if (editingId !== null) {
                await updateSkill(editingId, payload);
            } else {
                await createSkill(payload);
            }

            setForm(emptyForm);
            setEditingId(null);
            await loadSkills();
        } catch (err) {
            setFormError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: number) {
        setDeletingId(id);
        setLoadError(null);
        try {
            await deleteSkill(id);
            await loadSkills();
        } catch (err) {
            setLoadError(getErrorMessage(err));
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <AppLayout>
            <h1>My Skills</h1>

            <form className="inline-form" onSubmit={handleSubmit}>
                <h3>{editingId !== null ? "Edit Skill" : "Add a New Skill"}</h3>

                {formError && <ErrorMessage message={formError} />}

                <div className="inline-form-grid">
                    <div>
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            placeholder="e.g. Java"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            disabled={submitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="category">Category</label>
                        <input
                            id="category"
                            placeholder="e.g. Programming"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            disabled={submitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="level">Level</label>
                        <input
                            id="level"
                            placeholder="e.g. Beginner"
                            value={form.level}
                            onChange={(e) => setForm({ ...form, level: e.target.value })}
                            disabled={submitting}
                        />
                    </div>
                </div>

                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    placeholder="e.g. Learning Java and Spring Boot"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    disabled={submitting}
                    rows={2}
                />

                <div className="inline-form-actions">
                    <button type="submit" disabled={submitting}>
                        {submitting
                            ? editingId !== null
                                ? "Saving..."
                                : "Adding..."
                            : editingId !== null
                                ? "Save Changes"
                                : "Add Skill"}
                    </button>
                    {editingId !== null && (
                        <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={submitting}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <h3 className="section-title">Your Skills</h3>

            {loading && <Loading text="Loading skills..." />}
            {loadError && <ErrorMessage message={loadError} />}

            {!loading && !loadError && skills.length === 0 && (
                <p className="empty-state">You haven't added any skills yet.</p>
            )}

            {!loading && !loadError && skills.length > 0 && (
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Level</th>
                        <th>Description</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {skills.map((skill) => (
                        <tr key={skill.id}>
                            <td>{skill.name}</td>
                            <td>{skill.category}</td>
                            <td>{skill.level}</td>
                            <td>{skill.description}</td>
                            <td className="table-actions">
                                <button className="btn-small" onClick={() => startEdit(skill)}>
                                    Edit
                                </button>
                                <button
                                    className="btn-small btn-danger"
                                    onClick={() => handleDelete(skill.id)}
                                    disabled={deletingId === skill.id}
                                >
                                    {deletingId === skill.id ? "Deleting..." : "Delete"}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </AppLayout>
    );
}

export default Skills;