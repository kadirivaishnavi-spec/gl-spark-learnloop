import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
    getFeedbackByUser,
    createFeedback,
    updateFeedback,
    deleteFeedback,
} from "../services/feedbackService";
import { getErrorMessage } from "../services/api";
import type { Feedback } from "../types/feedback";
import AppLayout from "../components/AppLayout";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

const emptyForm = { matchId: "", rating: "5", comment: "" };

function FeedbackPage() {
    const { userId } = useAuth();

    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [deletingId, setDeletingId] = useState<number | null>(null);

    async function loadFeedback() {
        if (userId === null) {
            setLoading(false);
            setLoadError("Could not determine your user ID from the session.");
            return;
        }
        setLoading(true);
        setLoadError(null);
        try {
            const data = await getFeedbackByUser(userId);
            setFeedbackList(data);
        } catch (err) {
            setLoadError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadFeedback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    function startEdit(fb: Feedback) {
        setEditingId(fb.id);
        setForm({
            matchId: String(fb.matchId),
            rating: String(fb.rating),
            comment: fb.comment,
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

        const matchIdNum = Number(form.matchId);
        const ratingNum = Number(form.rating);

        if (!form.matchId.trim() || isNaN(matchIdNum) || matchIdNum <= 0) {
            setFormError("Please enter a valid Match ID.");
            return;
        }
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            setFormError("Rating must be between 1 and 5.");
            return;
        }
        if (!form.comment.trim()) {
            setFormError("Please enter a comment.");
            return;
        }
        if (userId === null) {
            setFormError("Could not determine your user ID.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                userId,
                matchId: matchIdNum,
                rating: ratingNum,
                comment: form.comment.trim(),
            };

            if (editingId !== null) {
                await updateFeedback(editingId, payload);
            } else {
                await createFeedback(payload);
            }

            setForm(emptyForm);
            setEditingId(null);
            await loadFeedback();
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
            await deleteFeedback(id);
            await loadFeedback();
        } catch (err) {
            setLoadError(getErrorMessage(err));
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <AppLayout>
            <h1>Feedback</h1>
            <p className="dashboard-subtitle">
                Share how a learning session went. You can find Match IDs on the{" "}
                <strong>Matches</strong> page.
            </p>

            <form className="inline-form" onSubmit={handleSubmit}>
                <h3>{editingId !== null ? "Edit Feedback" : "Submit Feedback"}</h3>

                {formError && <ErrorMessage message={formError} />}

                <div className="inline-form-grid">
                    <div>
                        <label htmlFor="matchId">Match ID</label>
                        <input
                            id="matchId"
                            type="number"
                            min={1}
                            placeholder="e.g. 3"
                            value={form.matchId}
                            onChange={(e) => setForm({ ...form, matchId: e.target.value })}
                            disabled={submitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="rating">Rating (1–5)</label>
                        <select
                            id="rating"
                            value={form.rating}
                            onChange={(e) => setForm({ ...form, rating: e.target.value })}
                            disabled={submitting}
                        >
                            <option value="1">1 - Poor</option>
                            <option value="2">2 - Fair</option>
                            <option value="3">3 - Good</option>
                            <option value="4">4 - Very Good</option>
                            <option value="5">5 - Excellent</option>
                        </select>
                    </div>
                </div>

                <label htmlFor="comment">Comment</label>
                <textarea
                    id="comment"
                    placeholder="e.g. Great learning session!"
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    disabled={submitting}
                    rows={2}
                />

                <div className="inline-form-actions">
                    <button type="submit" disabled={submitting}>
                        {submitting
                            ? editingId !== null
                                ? "Saving..."
                                : "Submitting..."
                            : editingId !== null
                                ? "Save Changes"
                                : "Submit Feedback"}
                    </button>
                    {editingId !== null && (
                        <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={submitting}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <h3 className="section-title">My Feedback</h3>

            {loading && <Loading text="Loading feedback..." />}
            {loadError && <ErrorMessage message={loadError} />}

            {!loading && !loadError && feedbackList.length === 0 && (
                <p className="empty-state">You haven't submitted any feedback yet.</p>
            )}

            {!loading && !loadError && feedbackList.length > 0 && (
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>Match ID</th>
                        <th>Rating</th>
                        <th>Comment</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {feedbackList.map((fb) => (
                        <tr key={fb.id}>
                            <td>{fb.matchId}</td>
                            <td>
                                <span className="rating-stars">{"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}</span>
                            </td>
                            <td>{fb.comment}</td>
                            <td className="table-actions">
                                <button className="btn-small" onClick={() => startEdit(fb)}>
                                    Edit
                                </button>
                                <button
                                    className="btn-small btn-danger"
                                    onClick={() => handleDelete(fb.id)}
                                    disabled={deletingId === fb.id}
                                >
                                    {deletingId === fb.id ? "Deleting..." : "Delete"}
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

export default FeedbackPage;