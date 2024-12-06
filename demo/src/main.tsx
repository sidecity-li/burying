import { createRoot } from "react-dom/client";
import App from "./App";
import { getFiberFromEvent } from "@burying/automatic-burying";

createRoot(document.getElementById("root")!).render(<App />);

document.addEventListener(
  "click",
  (e: Event) => {
    debugger;
    const target = getFiberFromEvent(e);
    console.log(target, "target");
  },
  true
);
