import { ReactElement, ReactNode } from "react";
export type Fiber = {
    type: any;
    stateNode: any;
    return: Fiber | null;
    memoizedProps: any;
};
export interface FiberOption {
    name: string;
    titleField: string;
    condition: string;
    hierarchical: boolean;
}
type FiberConditionFn = (fiber: Fiber) => boolean;
export interface FormatedFiberOption extends Omit<FiberOption, "condition"> {
    condition: FiberConditionFn;
}
export declare function getFiberFromEvent(event: Event): Fiber;
export declare function getFormatedFiberOptions(fiberOptions: FiberOption[]): FormatedFiberOption[];
export declare function getAllFibersFromOriginFiber(originFiber: Fiber, fiberConfig: FiberOption[]): [Fiber, FormatedFiberOption][];
export declare function getContentFromReactElement(element: ReactElement): string;
export declare function getContentFromReactNode(node: ReactNode): string;
export declare function getPathOfMatchedFibers(matchedFibers: [Fiber, FormatedFiberOption][]): string;
export declare function setup({ fiberConfig, callback, }: {
    fiberConfig: FiberOption[];
    callback: any;
}): () => void;
export {};
