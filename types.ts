
export interface WordDetail {
    incomplete: string;
    complete: string;
}

export interface PassageData {
    passage: string;
    words: WordDetail[];
}
