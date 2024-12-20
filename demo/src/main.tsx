import { createRoot } from "react-dom/client";
import App from "./App";
import { setupListen } from "@burying/automatic-burying";

createRoot(document.getElementById("root")!).render(<App />);

setupListen(document.body, {
  projectKey:
    "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjMsInByb2plY3ROYW1lIjoi5LqL5L6L6aG555uuMSIsImlhdCI6MTczMzkxODI0NH0.LJiB9Asl5448W_CXmFx9bqBVZyxmZ8CfHsU5U0ASsNI",
  callback: (event) => {
    alert(`
      上报的事件:
      ${JSON.stringify(event, null, 4)}`);
  },
});
