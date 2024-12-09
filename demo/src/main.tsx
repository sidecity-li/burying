import { createRoot } from "react-dom/client";
import App from "./App";
import { FiberOption, setup } from "@burying/automatic-burying";

createRoot(document.getElementById("root")!).render(<App />);

const fiberConfig: FiberOption[] = [
  {
    name: "Button",
    titleField: "children",
    condition: "fiber.type?.displayName === 'Button'",
    hierarchical: false,
  },
  {
    name: "Modal",
    titleField: "title",
    condition: "fiber.type?.displayName === 'Modal'",
    hierarchical: false,
  },
];

setup({
  fiberConfig,
  callback: (path: any) => {
    console.log(path, "进行上报: path");
  },
});
