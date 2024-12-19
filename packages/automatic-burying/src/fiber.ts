import { ReactElement, ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot, Root } from "react-dom/client";

export type Fiber = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateNode: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return: Fiber | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export interface FormatedElementOption
  extends Omit<ElementOption, "condition"> {
  condition: ElementConditionFn;
}

export type ElementConditionFn = (fiber: Fiber) => boolean;

let root: [Root, HTMLDivElement] | null;

export function requestReactRoot() {
  if (root) {
    return root;
  }

  const div = document.createElement("div");
  const reactRoot = createRoot(div);
  root = [reactRoot, div];
  return root;
}

export function requestReactRootLazy() {
  requestIdleCallback((deadline) => {
    // TODO 这里的时间怎么确定
    if (deadline.timeRemaining() >= 1) {
      requestReactRoot();
    }
  });
}

let fiberKey;

export function getFiberFromEvent(event: Event) {
  const target = event.target;

  if (fiberKey) {
    return target[fiberKey] as Fiber;
  }

  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      // 这里不同的React 版本会不一样
      if (key.startsWith("__reactFiber")) {
        fiberKey = key;
        return target[key] as Fiber;
      }
    }
  }

  return null;
}

export function getContentFromReactElement(element: ReactElement) {
  const [reactRoot, container] = requestReactRoot()!;
  flushSync(() => reactRoot.render(element));
  return container.textContent;
}

export function getContentFromReactNode(node: ReactNode) {
  if (
    typeof node === "boolean" ||
    typeof node === "undefined" ||
    (typeof node === "object" && node === null)
  ) {
    return "";
  } else if (typeof node === "string") {
    return node;
  } else if (typeof node === "number") {
    return String(node);
  } else if (Array.isArray(node)) {
    let content = "";
    for (const item of node) {
      content += getContentFromReactNode(item);
    }
    return content;
  } else {
    return getContentFromReactElement(node as ReactElement);
  }
}

export function getPathOfMatchedFibers(
  matchedFibers: [Fiber, FormatedElementOption][]
) {
  let path = "";
  for (const fiberAndConfig of matchedFibers) {
    const [fiber, option] = fiberAndConfig;
    const { titleField, name } = option;
    const { memoizedProps } = fiber;
    const title = memoizedProps?.[titleField];
    const titleStr = getContentFromReactNode(title);
    path = `${path}{{${name}&&${titleStr}}}`;
  }

  return path;
}

export function getAllFibersFromOriginFiber(
  originFiber: Fiber,
  formatedFiberConfig: FormatedElementOption[]
) {
  const allFibers: [Fiber, FormatedElementOption][] = [];

  let currentFiber = originFiber;

  while (currentFiber !== null && currentFiber !== undefined) {
    for (const fiberOption of formatedFiberConfig) {
      const { condition, hierarchical } = fiberOption;

      if (condition(currentFiber)) {
        if (hierarchical && allFibers.length === 0) {
          return null;
        }
        allFibers.unshift([currentFiber, fiberOption]);
        break;
      }
    }
    currentFiber = currentFiber.return;
  }

  return allFibers;
}
