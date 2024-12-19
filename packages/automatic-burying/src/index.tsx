import {
  ElementOption,
  getAllFibersFromOriginFiber,
  getFiberFromEvent,
  getPathOfMatchedFibers,
} from "./fiber";

const configSite = "https://automatic-burying.vercel.app";

type ProjectConfig = {
  elements: ElementOption[];
};

async function getProjectConfig(projectKey: string) {
  const res = await fetch(`${configSite}/api/config?key=${projectKey}`);
  return res.json().then((res) => res.data);
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

export function listen({
  projectKey,
  callback,
}: {
  projectKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: any;
}) {
  let projectConfig: ProjectConfig | undefined;

  async function requestProjectConfig(projectKey: string) {
    if (projectConfig) {
      return projectConfig;
    }
    return getProjectConfig(projectKey).then((config) => {
      projectConfig = config;
      return projectConfig;
    });
  }

  function requestProjectConfigLazy(projectKey: string) {
    requestIdleCallback((deadline) => {
      if (deadline.timeRemaining() > 0) {
        requestProjectConfig(projectKey);
      }
    });
  }
  // 预请求项目配置
  requestProjectConfigLazy(projectKey);

  const topWindow = window.top;

  const handler = async (event) => {
    await requestProjectConfig(projectKey);
    const elementConfig = projectConfig?.elements ?? [];
    const originFiber = getFiberFromEvent(event);
    const fiberAndOptions = getAllFibersFromOriginFiber(
      originFiber,
      elementConfig
    );

    const path = getPathOfMatchedFibers(fiberAndOptions);
    const pathname = location.pathname;

    // 代表被嵌入到了configSite中
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
  };

  document.addEventListener("click", handler, true);

  return () => document.removeEventListener("click", handler);
}
