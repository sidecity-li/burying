import { createRoot } from "react-dom/client";
import App from "./App";
import { FiberOption, setup } from "@burying/automatic-burying";

createRoot(document.getElementById("root")!).render(<App />);

setup({
  callback: (event: any) => {
    alert(JSON.stringify(event));
    collectEvent({
      ...App
      usernMaeL 
    })
  },
});
