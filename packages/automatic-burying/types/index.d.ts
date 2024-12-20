import { ElementOption, FormatedElementOption } from "./fiber";
type Matcher = {
    id: number;
    url: string;
    path: string;
    pathShouldPerfectMatch: boolean;
};
type FormatedMatcher = Omit<Matcher, "url"> & {
    url: RegExp;
};
type EventOption = {
    id: number;
    name: string;
    matchers: Matcher[];
};
type FormatedEventOption = Omit<EventOption, "matchers"> & {
    matchers: FormatedMatcher[];
};
export declare function getFormatedElementOptions(elementOptions: ElementOption[]): FormatedElementOption[];
export declare function getFormatedEventOptions(eventOptions: EventOption[]): FormatedEventOption[];
export declare function setupListen(element: HTMLElement, { projectKey, callback, }: {
    projectKey: string;
    callback: (event: {
        type: string;
    }) => void;
}): () => void;
export {};
