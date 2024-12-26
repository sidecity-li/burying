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
   data1.type === data2.type,
}: GenerateExposureContainerProps) {
  const eventQueue: Event[] = [];

  const executeExposure = (event: Event, delay: number) => {
    event.timer = setTimeout(() => {
      exposeFn(event.data);
      
      // 执行完成，先清理 当前的 timerId
      clearTimeout(event.timer);
      // 从 eventQueue 中移除 已经执行过的 item Event
      removeExecutedFromQueue(event)
    }, delay);

    return event.timer;
  };

  const removeExecutedFromQueue = (event: Event) => {
    const executedId = eventQueue.findIndex((item) => {
      return item === event;
    });

    executedId >= 0 && eventQueue.splice(executedId, 1)
  };

  const replaceEvent = (i: number, event: Event) => {
    const prevEvent = eventQueue[i];

    if (prevEvent) {
      clearTimeout(prevEvent.timer);
    }
    eventQueue[i] = event;
  };

  const scheduleExposure = (event: Event, delay: number) => {
    const { date, data } = event;

    const preciousSameEventIndex = eventQueue.findIndex((item) => {
      return compareEvent(item.data, data) && date - item.date < delay;
    });

    // 如果之前的 event 已经在 数组里面， 找到 itemEvent 不在删除，直接替换
    if (preciousSameEventIndex >= 0) {
      replaceEvent(preciousSameEventIndex, event);
    }else{
      eventQueue.push(event);
    }

    executeExposure(event, delay);
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