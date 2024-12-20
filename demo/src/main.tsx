import { createRoot } from "react-dom/client";
import App from "./App";
import { setupListen } from "@burying/automatic-burying";

createRoot(document.getElementById("root")!).render(<App />);

setupListen(document.body, {
  projectKey:
    "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInByb2plY3ROYW1lIjoi5LqL5L6L6aG555uuMSIsImlhdCI6MTczMzQ3MDYxMH0.VLZBzOWciGD3Miuz41v0-2Pz6HFdh3hsdNUTPcAZCpk",
  callback: (event) => {
    alert(`
      上报的事件:
      ${JSON.stringify(event, null, 4)}`);
  },
});
