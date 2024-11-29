import { useState } from "react";
import "./App.css";

const ExposureComponent = generateExposureComponent({
  debounce: 500,
  exposeFn: (parmas: any) => {
    console.log(parmas, "parmas");
  },
});

function App() {
  const [count, setCount] = useState(0);

  return <div>111</div>;
}

export default App;
