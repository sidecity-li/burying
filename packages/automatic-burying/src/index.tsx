import { ReactElement, ReactNode } from "react";
import { createRoot, Root } from "react-dom/client";

export interface FiberNode {
  type: any;
  memorizedProps: any;
  stateNode: any;
  return: any;
}

export interface FiberOption {
  name: string;
  titleField: string;
  condition: string;
  hierarchical: boolean;
}

type FiberConditionFn = (fiber: FiberNode) => boolean;

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
        return target[key] as FiberNode;
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
      condition: new Function("fiber", condition) as FiberConditionFn,
    });
  }

  return res;
}

export function getAllFibersFromOriginFiber(
  originFiber: FiberNode,
  fiberConfig: FiberOption[]
) {
  const formatedFiberConfig = getFormatedFiberOptions(fiberConfig);
  const allFibers: [FiberNode, FormatedFiberOption][] = [];

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
  reactRoot.render(element);

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
  matchedFibers: [FiberNode, FormatedFiberOption][]
) {
  let path = "";
  for (const fiberAndConfig of matchedFibers) {
    const [fiber, option] = fiberAndConfig;

    const { titleField, name } = option;

    const { memorizedProps } = fiber;

    const title = memorizedProps?.[titleField];

    const titleStr = getContentFromReactNode(title);

    path = `{{${name}&&${titleStr}}}${path}`;
  }

  return path;
}
