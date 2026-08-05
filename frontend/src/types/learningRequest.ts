export interface LearningRequest {
    id: number;
    learnerId: number;
    skillId: number;
    message: string;
    status: string;
}

export interface CreateLearningRequest {
    learnerId: number;
    skillId: number;
    message: string;
}