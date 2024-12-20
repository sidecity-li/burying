import { ReactNode } from "react";
export type DataType = {
    type: string;
    [K: string]: unknown;
};
export type Event = {
    date: number;
    data: DataType;
    timer?: ReturnType<typeof setTimeout>;
};
export type GenerateExposureContainerProps = {
    debounce: number;
    exposeFn: (data: DataType) => void;
    compareEvent?: (data1: DataType, data2: DataType) => boolean;
};
export type ExposureComponentProps = Partial<Omit<GenerateExposureContainerProps, "exposeFn" | "compareEvent">> & {
    data: DataType;
};
export type UseEffectExposureComponentProps = ExposureComponentProps & {
    children?: ReactNode;
};
export type IntersectionObserverExposureComponentProps = ExposureComponentProps & {
    threshold?: number;
    display?: "block" | "inline";
} & {
    children: ReactNode;
};
export type DataSetType<T extends Record<string, unknown>> = {
    [K in keyof T as `data-${K extends string ? K : never}`]: T[K];
};
export default function generateExposureComponent({ debounce: defaultdebounce, exposeFn, compareEvent, }: GenerateExposureContainerProps): ((({ debounce, data, children }: UseEffectExposureComponentProps) => ReactNode) | (({ debounce, threshold, display, data, children, }: IntersectionObserverExposureComponentProps) => import("react/jsx-runtime").JSX.Element))[];
