import { Input, Slider, Stack } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import SceneManager from "./SceneManager";
import SceneManagerGL from "./SceneManagerGL";

const InputSlider = (props) => {
    const {value, setValue, step, min, max} = props;

    return (
        <Stack direction='row'>
            <Slider 
                value={value}
                step={step}
                min={min}
                max={max}
                
                onChange={(ev) => setValue(ev.target.value)}
            />
            <Input
                value={value}
                type='numeric'
                step={step}
                min={min}
                max={max}

                onChange={(ev) => setValue(ev.target.value)}
                sx={{
                    color: 'white'
                }}
            />
        </Stack>
    )
}

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
    const [cameraDistance, setCameraDistance] = useState(100);

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
            program.render(cameraDistance);
        }
    }, [cameraDistance])
    
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
                flexDirection: 'column',
                gap: '0.5rem',
                backgroundColor: '#444444',
                opacity: '75%',
                padding: '0.5rem',
            }}
        >
            <InputSlider
                value={slider1}
                setValue={setSlider1}
                step={0.01}
                min={0}
                max={2*Math.PI}
            />
            <InputSlider
                value={cameraDistance}
                setValue={setCameraDistance}
                step={0.01}
                min={1}
                max={500}
            />
        </div>
        <canvas
            onMouseMove={mouseMove}
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            style={{
                width: '100%',
                height: '100%'
            }}
        />
        </React.Fragment>
    );
}

export default App;
