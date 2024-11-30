import { useEffect, useState } from "react";

import generateExposureComponent from "@burying/exposure-burying";

const [ExposureComponent, IntersectionExposureComponent] =
  generateExposureComponent({
    debounce: 1500,
    exposeFn: (parmas: any) => {
      console.log(parmas, "parmas");
    },
  });

function App() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 1200);
  }, []);

  if (loading) {
    return "loading......";
  }
  return (
    <>
      <ExposureComponent
        data={{
          useEffect: "555",
          type: "useEffect",
        }}
      >
        <p style={{ backgroundColor: "red" }}>useEffect 上报</p>
      </ExposureComponent>

      <IntersectionExposureComponent
        data={{
          intersection: "777",
          type: "Intersection",
        }}
      >
        <p style={{ height: "1400px", backgroundColor: "green" }}>
          Intersection 上报1
        </p>
      </IntersectionExposureComponent>

      <p style={{ height: "1700px" }}>111</p>

      <IntersectionExposureComponent
        data={{
          intersection: "666",
          type: "Intersection",
        }}
      >
        <p style={{ height: "900px", backgroundColor: "green" }}>
          Intersection 上报
        </p>
      </IntersectionExposureComponent>

      <p style={{ height: "1900px", backgroundColor: "pink" }}></p>
    </>
  );
}

export default App;
