import {
  ElementConditionFn,
  ElementOption,
  ElementProperty,
  Fiber,
  FormatedElementOption,
  getAllFibersFromOriginFiber,
  getContentFromReactElement,
  getFiberFromEvent,
  getPathOfMatchedFibers,
} from "./fiber";

const configSite = "https://automatic-burying.vercel.app";

type Matcher = {
  id: number;
  url: string;
  path: string;
  pathShouldPerfectMatch: boolean;
};

type FormatedMatcher = Omit<Matcher, "url"> & {
  url: RegExp;
};

type EventOption = {
  id: number;
  name: string;
  matchers: Matcher[];
};

type FormatedEventOption = Omit<EventOption, "matchers"> & {
  matchers: FormatedMatcher[];
};

type ProjectConfig = {
  elements: ElementOption[];
  events: EventOption[];
};

async function getProjectConfig(projectKey: string) {
  const res = await fetch(`${configSite}/api/config?key=${projectKey}`);
  return res.json().then((res) => res.data);
}

export function getFormatedElementOptions(elementOptions: ElementOption[]) {
  const res: FormatedElementOption[] = [];
  for (const option of elementOptions) {
    const { condition, ...rest } = option;
    res.push({
      ...rest,
      condition: new Function(
        "fiber",
        `return ${condition}`
      ) as ElementConditionFn,
    });
  }

  return res;
}

export function getFormatedEventOptions(
  eventOptions: EventOption[] | undefined
) {
  const res: FormatedEventOption[] = [];
  for (const eventOption of eventOptions) {
    const { matchers = [], ...rest } = eventOption;
    const formatedMatcherOptions = matchers.map((matcher) => {
      const { url, ...restMatcherOptions } = matcher;

      return {
        ...restMatcherOptions,
        url: new RegExp(url),
      };
    });
    res.push({
      ...rest,
      matchers: formatedMatcherOptions,
    });
  }

  return res;
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

function getEventType(
  eventOptions: FormatedEventOption[],
  url: string,
  path: string
) {
  if (eventOptions?.length) {
    for (const eventOption of eventOptions) {
      const { matchers, name } = eventOption;
      if (matchers?.length) {
        for (const matcher of matchers) {
          const {
            url: matcherUrl,
            path: matcherPath,
            pathShouldPerfectMatch,
          } = matcher;
          if (
            matcherUrl.test(url) &&
            (matcherPath === path ||
              (!pathShouldPerfectMatch && path.startsWith(matcherPath)))
          ) {
            return name;
          }
        }
      }
    }
  }

  return undefined;
}

function getPropertiesFromFiber(fiber: Fiber, properties: ElementProperty[]) {
  return properties.reduce((res, property) => {
    const { name, value } = property;
    const { memoizedProps } = fiber;
    return {
      ...res,
      [name]: getContentFromReactElement(memoizedProps[value]),
    };
  }, {});
}

function getEventProperties(fiberAndOptions: [Fiber, FormatedElementOption][]) {
  let properties = {};

  const length = fiberAndOptions.length;

  for (let i = length - 1; i >= 0; i--) {
    const [fiber, elementOption] = fiberAndOptions[i];
    const { hierarchical, properties: propertyOptions = [] } = elementOption;
    properties = {
      ...getPropertiesFromFiber(fiber, propertyOptions),
      ...properties,
    };
    if (hierarchical) {
      break;
    }
  }

  return properties;
}

export function setupListen({
  projectKey,
  callback,
}: {
  projectKey: string;
  callback: (event: { type: string }) => void;
}) {
  let formatedElementOptions: FormatedElementOption[] | undefined;
  let formatedEventOptions: FormatedEventOption[] | undefined;

  const requestProjectConfig = () => {
    if (!formatedElementOptions || !formatedEventOptions) {
      getProjectConfig(projectKey).then((config: ProjectConfig) => {
        const { elements, events } = config;
        formatedElementOptions = getFormatedElementOptions(elements ?? []);
        formatedEventOptions = getFormatedEventOptions(events ?? []);
      });
    }
  };

  const requestProjectConfigLazy = () => {
    requestIdleCallback((deadline) => {
      if (deadline.timeRemaining() > 0) {
        requestProjectConfig();
      }
    });
  };
  // 预请求项目配置
  requestProjectConfigLazy();

  const topWindow = window.top;

  const handler = async (event) => {
    await requestProjectConfig();
    const originFiber = getFiberFromEvent(event);
    const fiberAndOptions = getAllFibersFromOriginFiber(
      originFiber,
      formatedElementOptions
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
      const eventName = getEventType(formatedEventOptions, pathname, path);
      const extraProperties = getEventProperties(fiberAndOptions);

      callback({
        type: eventName,
        ...extraProperties,
      });
    }
  };

  document.addEventListener("click", handler, true);

  return () => document.removeEventListener("click", handler);
}
