import { useState, useEffect, useRef } from "react";
import SceneManager from "./SceneManager";

export const App = () => {
  const canvasRef = useRef();
  const programRef = useRef();

  const [scale, setScale] = useState(20);
  const [numRays, setNumRays] = useState(96);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      programRef.current = new SceneManager(canvas, scale, numRays);
    }
  }, [])

  // MOUSE MOVEMENT

  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  const mouseMove = (ev) => {
    setMouseX(ev.pageX);
    setMouseY(ev.pageY);
  }

  // render THREE.js scene
  useEffect(() => {
    const program = programRef.current;

    if (program) {
      program.render(mouseX, mouseY);
    }
  }, [mouseX, mouseY])

  return (
    <canvas
      onMouseMove={mouseMove}
      ref={canvasRef}
    />
  );
}

export default App;
