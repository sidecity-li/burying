import { MutableRefObject, ReactNode, useEffect, useRef } from "react";

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

export type ExposureComponentProps = Partial<
  Omit<GenerateExposureContainerProps, "exposeFn" | "compareEvent">
> & {
  data: DataType;
};

export type UseEffectExposureComponentProps = ExposureComponentProps & {
  children?: ReactNode;
};

export type IntersectionObserverExposureComponentProps =
  ExposureComponentProps & {
    threshold?: number;
    display?: "block" | "inline";
  } & {
    children: ReactNode;
  };

export type DataSetType<T extends Record<string, unknown>> = {
  [K in keyof T as `data-${K extends string ? K : never}`]: T[K];
};

const getDataSet = (data: DataType) => {
  const dataSet = {} as DataSetType<DataType>;
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      dataSet[`data-${key}`] = data[key];
    }
  }
  return dataSet;
};

export default function generateExposureComponent({
  debounce: defaultdebounce,
  exposeFn,
  compareEvent = (data1, data2) =>
    JSON.stringify(data1) === JSON.stringify(data2),
}: GenerateExposureContainerProps) {
  const eventQueue: Event[] = [];

  const executeExposure = (event: Event, delay: number) => {
    event.timer = setTimeout(() => {
      exposeFn(event.data);
    }, delay);
  };

  const removeEvent = (i: number) => {
    const event = eventQueue[i];

    if (event) {
      clearTimeout(event.timer);
      eventQueue.splice(i, 1);
    }
  };

  const scheduleExposure = (event: Event, delay: number) => {
    const { date, data } = event;

    const preciousSameEventIndex = eventQueue.findIndex((item) => {
      return compareEvent(item.data, data) && date - item.date < delay;
    });

    if (preciousSameEventIndex >= 0) {
      removeEvent(preciousSameEventIndex);
    }

    executeExposure(event, delay);
    eventQueue.push(event);
  };

  return [
    ({ debounce, data, children }: UseEffectExposureComponentProps) => {
      const debounceValue = debounce || defaultdebounce;

      useEffect(() => {
        scheduleExposure(
          {
            date: new Date().getTime(),
            data,
          },
          debounceValue
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      return children;
    },
    ({
      debounce,
      threshold,
      display = "block",
      data,
      children,
    }: IntersectionObserverExposureComponentProps) => {
      const containerRef = useRef<HTMLElement>(null);
      const debounceValue = debounce || defaultdebounce;
      const displayValue = display;

      useEffect(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                const dataSet = (entry.target as HTMLElement).dataset;
                executeExposure(
                  {
                    date: new Date().getTime(),
                    data: { ...dataSet } as DataType,
                  },
                  debounceValue
                );
              }
            }
          },
          {
            threshold,
          }
        );
        observer.observe(containerRef.current!);
        return () => observer.disconnect();
      }, []);

      const dataSet = getDataSet(data);

      if (displayValue === "block") {
        return (
          <div
            ref={containerRef as MutableRefObject<HTMLDivElement>}
            {...dataSet}
          >
            {children}
          </div>
        );
      }

      return (
        <span ref={containerRef} {...dataSet}>
          {children}
        </span>
      );
    },
  ];
}
