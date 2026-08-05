export interface Feedback {
    id: number;
    userId: number;
    matchId: number;
    rating: number;
    comment: string;
}

export interface CreateFeedbackRequest {
    userId: number;
    matchId: number;
    rating: number;
    comment: string;
}

export type UpdateFeedbackRequest = CreateFeedbackRequest;