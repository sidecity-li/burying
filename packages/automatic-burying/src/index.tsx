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

async function getProjectConfig(projectKey: string) {
  const res = await fetch(`http://0.0.0.0:3000/api/config?key=${projectKey}`);
  return res.json().then((res) => res.data);
}

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

let parentHost;

window.addEventListener("message", (event: MessageEvent) => {
  const {
    data: { __is_automatic_burying_message_from_parent_window__, host },
  } = event;

  const hasEmbed = window.top !== window;
  if (hasEmbed && __is_automatic_burying_message_from_parent_window__) {
    parentHost = host;
  }
});

let projectConfig;

function getEvent(projectConfig, url, path) {
  const { events } = projectConfig;
  if (events?.length) {
    for (const event of events) {
      const { matchers, reportField, name } = event;
      if (matchers?.length) {
        for (const matcher of matchers) {
          const { url: matcherUrl, path: matcherPath } = matcher;
          if (matcherUrl === url && matcherPath === path) {
            return {
              [reportField]: name,
            };
          }
        }
      }
    }
  }

  return null;
}

export function setup({
  callback,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: any;
}) {
  const topWindow = window.top;
  if (topWindow) {
    requestIdleCallback(() =>
      getProjectConfig(
        "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjMsInByb2plY3ROYW1lIjoi5LqL5L6L6aG555uuMSIsImlhdCI6MTczMzkxODI0NH0.LJiB9Asl5448W_CXmFx9bqBVZyxmZ8CfHsU5U0ASsNI"
      ).then((config) => {
        projectConfig = config;
      })
    );
  }
  const handler = (event) => {
    const fiberConfig = projectConfig?.elements ?? [];
    const originFiber = getFiberFromEvent(event);
    const fiberAndOptions = getAllFibersFromOriginFiber(
      originFiber,
      fiberConfig
    );

    const path = getPathOfMatchedFibers(fiberAndOptions);
    const pathname = location.pathname;

    if (parentHost) {
      topWindow.postMessage(
        {
          __is_automatic_burying_message_from_child__: true,
          path,
          pathname,
        },
        parentHost
      );
    } else {
      if (projectConfig) {
        const event = getEvent(projectConfig, pathname, path);
        if (event) {
          callback(event);
        }
      }
    }
    debugger;
  };

  document.addEventListener("click", handler, true);

  return () => document.removeEventListener("click", handler);
}
