import { ReactElement, ReactNode } from "react";
import { Root } from "react-dom/client";
export type Fiber = {
    type: any;
    stateNode: any;
    return: Fiber | null;
    memoizedProps: any;
};
export type ElementProperty = {
    id: number;
    name: string;
    value: string;
};
export interface ElementOption {
    name: string;
    titleField: string;
    condition: string;
    hierarchical: boolean;
    properties: ElementProperty[];
}
export interface FormatedElementOption extends Omit<ElementOption, "condition"> {
    condition: ElementConditionFn;
}
export type ElementConditionFn = (fiber: Fiber) => boolean;
export declare function requestReactRoot(): [Root, HTMLDivElement];
export declare function requestReactRootLazy(): void;
export declare function getFiberFromEvent(event: Event): Fiber;
export declare function getContentFromReactElement(element: ReactElement): string;
export declare function getContentFromReactNode(node: ReactNode): string;
export declare function getPathOfMatchedFibers(matchedFibers: [Fiber, FormatedElementOption][]): string;
export declare function getAllFibersFromOriginFiber(originFiber: Fiber, formatedFiberConfig: FormatedElementOption[]): [Fiber, FormatedElementOption][];
