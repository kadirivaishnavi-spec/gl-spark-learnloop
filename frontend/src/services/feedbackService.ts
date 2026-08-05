import api from "./api";
import type {
    Feedback,
    CreateFeedbackRequest,
    UpdateFeedbackRequest,
} from "../types/feedback";

const BASE_PATH = "/api/feedback";

export async function createFeedback(data: CreateFeedbackRequest): Promise<Feedback> {
    const response = await api.post<Feedback>(BASE_PATH, data);
    return response.data;
}

export async function getAllFeedback(): Promise<Feedback[]> {
    const response = await api.get<Feedback[]>(BASE_PATH);
    return response.data;
}

export async function getFeedbackById(id: number): Promise<Feedback> {
    const response = await api.get<Feedback>(`${BASE_PATH}/${id}`);
    return response.data;
}

export async function getFeedbackByUser(userId: number): Promise<Feedback[]> {
    const response = await api.get<Feedback[]>(`${BASE_PATH}/user/${userId}`);
    return response.data;
}

export async function getFeedbackByMatch(matchId: number): Promise<Feedback[]> {
    const response = await api.get<Feedback[]>(`${BASE_PATH}/match/${matchId}`);
    return response.data;
}

export async function updateFeedback(
    id: number,
    data: UpdateFeedbackRequest
): Promise<Feedback> {
    const response = await api.put<Feedback>(`${BASE_PATH}/${id}`, data);
    return response.data;
}

export async function deleteFeedback(id: number): Promise<string> {
    const response = await api.delete<string>(`${BASE_PATH}/${id}`);
    return response.data;
}