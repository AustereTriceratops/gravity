import { Input, Slider } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import SceneManager from "./SceneManager";
import SceneManagerGL from "./SceneManagerGL";

// TODO: resizing window
export const App = () => {
    // TODO: take canvas + program refs out to their own components
    const canvasRef = useRef();
    const programRef = useRef();

    const [scale, setScale] = useState(20);
    const [numRays, setNumRays] = useState(48);

    // set canvas ref
    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas) {
            //programRef.current = new SceneManager(canvas, scale, numRays);
            programRef.current = new SceneManagerGL(canvas);
        }
    }, [])

    // UI STATE

    const [slider1, setSlider1] = useState(0.0);

    // MOUSE MOVEMENT

    const [mouseX, setMouseX] = useState(100);
    const [mouseY, setMouseY] = useState(100);

    const mouseMove = (ev) => {
        setMouseX(ev.pageX);
        setMouseY(ev.pageY);
    }

    /// render webgl scene
    useEffect(() => {
        const program = programRef.current;
        
        if (program) {
            program.render();
        }
    }, [])
    
    // render THREE.js scene
    // useEffect(() => {
    //     const program = programRef.current;

    //     if (program) {
    //         program.render(mouseX, mouseY, slider1);
    //     }
    // }, [mouseX, mouseY, slider1])

    return (
        <React.Fragment>
        <div
            style={{
            position: 'absolute',
            display: 'flex',
            gap: '0.5rem',
            backgroundColor: '#000000',
            opacity: '40%',
            padding: '0.5rem'
            }}
        >
            <Slider 
                value={slider1}
                step={0.01}
                min={0}
                max={1}
                
                onChange={(ev) => setSlider1(ev.target.value)}
            />
            <Input
                value={slider1}
                type='numeric'
                step={0.01}
                min={0}
                max={2*Math.PI}

                onChange={(ev) => setSlider1(ev.target.value)}
                sx={{
                    color: 'white'
                }}
            />
        </div>
        <canvas
            onMouseMove={mouseMove}
            ref={canvasRef}
            style={{
                width: '100vw',
                height: '100vh'
            }}
        />
        </React.Fragment>
    );
}

export default App;
