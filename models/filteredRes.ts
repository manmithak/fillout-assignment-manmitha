export interface Question {
    id: string;
    name: string;
    type: string;
    value: string;
}

export interface Calculation {
    id: string;
    name: string;
    type: string;
    value: string;
}

export interface UrlParameter {
    id: string;
    name: string;
    value: string;
}

export interface Quiz {
    score: number;
    maxScore: number;
}

export interface Responses {
    questions: Question[];
    calculations: Calculation[];
    urlParameters: UrlParameter[];
    quiz?: Quiz;
    submissionId: string;
    submissionTime: string;
}

export interface FilteredResponse {
    responses: Responses[];
    totalResponses: number;
    pageCount: number;
}