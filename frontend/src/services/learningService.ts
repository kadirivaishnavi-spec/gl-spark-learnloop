import api from "./api";
import type { LearningRequest, CreateLearningRequest } from "../types/learningRequest";

// Confirmed from LearningRequestController.java
const BASE_PATH = "/api/learning-requests";

export async function createLearningRequest(
    data: CreateLearningRequest
): Promise<LearningRequest> {
    const response = await api.post<LearningRequest>(BASE_PATH, data);
    return response.data;
}

export async function getAllLearningRequests(): Promise<LearningRequest[]> {
    const response = await api.get<LearningRequest[]>(BASE_PATH);
    return response.data;
}

export async function getLearningRequestById(id: number): Promise<LearningRequest> {
    const response = await api.get<LearningRequest>(`${BASE_PATH}/${id}`);
    return response.data;
}

// Confirmed endpoint: GET /api/learning-requests/learner/{learnerId}
export async function getLearningRequestsByUser(
    learnerId: number
): Promise<LearningRequest[]> {
    const response = await api.get<LearningRequest[]>(`${BASE_PATH}/learner/${learnerId}`);
    return response.data;
}

export async function getLearningRequestsBySkill(
    skillId: number
): Promise<LearningRequest[]> {
    const response = await api.get<LearningRequest[]>(`${BASE_PATH}/skill/${skillId}`);
    return response.data;
}

export async function getLearningRequestsByStatus(
    status: string
): Promise<LearningRequest[]> {
    const response = await api.get<LearningRequest[]>(`${BASE_PATH}/status/${status}`);
    return response.data;
}

export async function updateLearningRequest(
    id: number,
    data: CreateLearningRequest
): Promise<LearningRequest> {
    const response = await api.put<LearningRequest>(`${BASE_PATH}/${id}`, data);
    return response.data;
}

// Backend expects status as a query param: PATCH /{id}/status?status=ACCEPTED
export async function updateLearningRequestStatus(
    id: number,
    status: string
): Promise<LearningRequest> {
    const response = await api.patch<LearningRequest>(
        `${BASE_PATH}/${id}/status`,
        null,
        { params: { status } }
    );
    return response.data;
}

export async function deleteLearningRequest(id: number): Promise<string> {
    const response = await api.delete<string>(`${BASE_PATH}/${id}`);
    return response.data;
}