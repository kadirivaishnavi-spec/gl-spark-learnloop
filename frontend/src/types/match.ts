export type MatchStatus =
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "COMPLETED"
    | string;

export interface Match {
    id: number;

    userId: number;

    matchedUserId: number;

    skillId: number;

    learningRequestId: number;

    matchedLearningRequestId: number | null;

    status: MatchStatus;

    matchedUserEmail?: string | null;
}

export interface CreateMatchRequest {
    userId: number;

    matchedUserId: number;

    skillId: number;

    learningRequestId: number;
}