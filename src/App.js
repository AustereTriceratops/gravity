import { useEffect, useRef } from "react";
import SceneManager from "./SceneManager";

export const App = () => {
  const canvasRef = useRef();
  const programRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      programRef.current = new SceneManager(canvas);
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
    />
  );
}

export default App;
