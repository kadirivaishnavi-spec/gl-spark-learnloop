export interface Skill {
    id: number;
    name: string;
    description: string;
    category: string;
    level: string;
    userId: number;
}

export interface CreateSkillRequest {
    name: string;
    description: string;
    category: string;
    level: string;
    userId: number;
}

export type UpdateSkillRequest = CreateSkillRequest;