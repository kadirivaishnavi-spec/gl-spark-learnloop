import api from "./api";
import type {
    Match,
    CreateMatchRequest,
} from "../types/match";

const BASE_PATH = "/api/matches";

export async function createMatch(
    data: CreateMatchRequest
): Promise<Match> {

    const response =
        await api.post<Match>(
            BASE_PATH,
            data
        );

    return response.data;
}

export async function getAllMatches(): Promise<Match[]> {

    const response =
        await api.get<Match[]>(
            BASE_PATH
        );

    return response.data;
}

export async function getMatchById(
    id: number
): Promise<Match> {

    const response =
        await api.get<Match>(
            `${BASE_PATH}/${id}`
        );

    return response.data;
}

export async function getMatchesByUserId(
    userId: number
): Promise<Match[]> {

    const response =
        await api.get<Match[]>(
            `${BASE_PATH}/user/${userId}`
        );

    return response.data;
}

export async function getMatchesByMatchedUserId(
    matchedUserId: number
): Promise<Match[]> {

    const response =
        await api.get<Match[]>(
            `${BASE_PATH}/matched-user/${matchedUserId}`
        );

    return response.data;
}

export async function getMatchesBySkillId(
    skillId: number
): Promise<Match[]> {

    const response =
        await api.get<Match[]>(
            `${BASE_PATH}/skill/${skillId}`
        );

    return response.data;
}

export async function getMatchesByStatus(
    status: string
): Promise<Match[]> {

    const response =
        await api.get<Match[]>(
            `${BASE_PATH}/status/${status}`
        );

    return response.data;
}

export async function updateMatchStatus(
    id: number,
    status: string
): Promise<Match> {

    const response =
        await api.patch<Match>(
            `${BASE_PATH}/${id}/status`,
            null,
            {
                params: { status },
            }
        );

    return response.data;
}

export async function deleteMatch(
    id: number
): Promise<string> {

    const response =
        await api.delete<string>(
            `${BASE_PATH}/${id}`
        );

    return response.data;
}