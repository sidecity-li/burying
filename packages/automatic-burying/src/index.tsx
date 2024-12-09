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

export interface FiberOption {
  name: string;
  titleField: string;
  condition: string;
  hierarchical: boolean;
}

type FiberConditionFn = (fiber: Fiber) => boolean;

let root: [Root, HTMLDivElement] | null;

function requestReactRoot() {
  if (root) {
    return root;
  }

  const div = document.createElement("div");
  const reactRoot = createRoot(div);
  root = [reactRoot, div];
  return root;
}

export interface FormatedFiberOption extends Omit<FiberOption, "condition"> {
  condition: FiberConditionFn;
}

export function getFiberFromEvent(event: Event) {
  const target = event.target;

  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      if (key.startsWith("__reactFiber")) {
        return target[key] as Fiber;
      }
    }
  }

  return null;
}

export function getFormatedFiberOptions(fiberOptions: FiberOption[]) {
  const res: FormatedFiberOption[] = [];
  for (const option of fiberOptions) {
    const { condition, ...rest } = option;
    res.push({
      ...rest,
      condition: new Function(
        "fiber",
        `return ${condition}`
      ) as FiberConditionFn,
    });
  }

  return res;
}

export function getAllFibersFromOriginFiber(
  originFiber: Fiber,
  fiberConfig: FiberOption[]
) {
  const formatedFiberConfig = getFormatedFiberOptions(fiberConfig);
  const allFibers: [Fiber, FormatedFiberOption][] = [];

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

export function getContentFromReactElement(element: ReactElement) {
  const [reactRoot, container] = requestReactRoot()!;

  // TODO 这里可能需要异步导致的问题。
  flushSync(() => reactRoot.render(element));

  return container.textContent;
}

export function getContentFromReactNode(node: ReactNode) {
  debugger;
  console.log(typeof node === "boolean");
  console.log(typeof node === "undefined");
  console.log(typeof node === "object" && node === null);
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
  matchedFibers: [Fiber, FormatedFiberOption][]
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

export function setup({
  fiberConfig,
  callback,
}: {
  fiberConfig: FiberOption[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: any;
}) {
  const handler = (event) => {
    const originFiber = getFiberFromEvent(event);
    const fiberAndOptions = getAllFibersFromOriginFiber(
      originFiber,
      fiberConfig
    );
    const path = getPathOfMatchedFibers(fiberAndOptions);
    callback(path);
  };

  document.addEventListener("click", handler, true);

  return () => document.removeEventListener("click", handler);
}
