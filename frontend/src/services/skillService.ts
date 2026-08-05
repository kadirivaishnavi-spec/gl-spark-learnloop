import api from "./api";
import type { Skill, CreateSkillRequest, UpdateSkillRequest } from "../types/skill";

export async function getAllSkills(): Promise<Skill[]> {
    const response = await api.get<Skill[]>("/api/skills");
    return response.data;
}

export async function getSkillById(id: number): Promise<Skill> {
    const response = await api.get<Skill>(`/api/skills/${id}`);
    return response.data;
}

export async function getSkillsByUser(userId: number): Promise<Skill[]> {
    const response = await api.get<Skill[]>(`/api/skills/user/${userId}`);
    return response.data;
}

export async function getSkillsByCategory(category: string): Promise<Skill[]> {
    const response = await api.get<Skill[]>(`/api/skills/category/${category}`);
    return response.data;
}

export async function getSkillsByLevel(level: string): Promise<Skill[]> {
    const response = await api.get<Skill[]>(`/api/skills/level/${level}`);
    return response.data;
}

export async function createSkill(data: CreateSkillRequest): Promise<Skill> {
    const response = await api.post<Skill>("/api/skills", data);
    return response.data;
}

export async function updateSkill(id: number, data: UpdateSkillRequest): Promise<Skill> {
    const response = await api.put<Skill>(`/api/skills/${id}`, data);
    return response.data;
}

export async function deleteSkill(id: number): Promise<string> {
    const response = await api.delete<string>(`/api/skills/${id}`);
    return response.data;
}