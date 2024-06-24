import React, { useState, useEffect, useRef } from "react";
import SceneManager from "./SceneManager";
import { TestSceneManager, TerrellSceneManager } from "./SceneManagerGL.js";
import { TerrellRotationShader } from "./shader";
import {InputSlider} from "./components";


// TODO: resizing window
export const App = () => {
    return (
        <TerrellRotationScene/>
    );
} 

const TestScene = () => {
    // TODO: take canvas + program refs out to their own components
    const canvasRef = useRef();
    const programRef = useRef();

    // const [scale, setScale] = useState(20);
    // const [numRays, setNumRays] = useState(48);

    // set canvas ref
    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas) {
            //programRef.current = new SceneManager(canvas, scale, numRays);
            programRef.current = new TestSceneManager(canvas);
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
    // TODO: add time dependence
    useEffect(() => {
        const program = programRef.current;
        
        if (program) {
            program.render();
        }
    }, [])

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

const LightGeodesicScene = () => {
    // TODO: take canvas + program refs out to their own components
    const canvasRef = useRef();
    const programRef = useRef();

    const [scale, setScale] = useState(20);
    const [numRays, setNumRays] = useState(48);

    // set canvas ref
    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas) {
            programRef.current = new SceneManager(canvas, scale, numRays);
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
    
    // render THREE.js scene
    useEffect(() => {
        const program = programRef.current;

        if (program) {
            program.render(mouseX, mouseY, slider1);
        }
    }, [mouseX, mouseY, slider1])

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
                max={1}
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

const TerrellRotationScene = () => {
    // TODO: take canvas + program refs out to their own components
    const canvasRef = useRef();
    const programRef = useRef();

    const xSens = 0.01;
    const ySens = 0.008;

    // set canvas ref
    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas) {
            //programRef.current = new SceneManager(canvas, scale, numRays);
            programRef.current = new TerrellSceneManager(canvas);
        }
    }, [])

    // UI STATE

    const [velocity, setVelocity] = useState(0.0);
    const [cameraDistance, setCameraDistance] = useState(100);

    // MOUSE MOVEMENT

    const [phi, setPhi] = useState(0.0);
    const [theta, setTheta] = useState(0.0);
    const [phiCurr, setPhiCurr] = useState(null);
    const [thetaCurr, setThetaCurr] = useState(null);

    const onMouseMove = (ev) => {
        // TODO: use .offset_?
        if (origin) {
            setPhiCurr(phi - xSens*(ev.pageX - origin.x));

            const theta_ = Math.max(Math.min(1.2, theta + ySens*(ev.pageY - origin.y)), -1.2);
            setThetaCurr(theta_);
        }
    }

    const [origin, setOrigin] = useState(null);

    const onMouseDown = (ev) => {
        setOrigin({x: ev.pageX, y: ev.pageY});
    }

    const onMouseUp = (ev) => {
        setOrigin(null);
        setPhi(phiCurr);
        setTheta(thetaCurr);
    }

    /// render webgl scene
    // TODO: add time dependence
    useEffect(() => {
        const program = programRef.current;
        
        if (program) {
            program.render(velocity, phiCurr, thetaCurr);
        }
    }, [velocity, phiCurr, thetaCurr])

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
                value={velocity}
                setValue={setVelocity}
                step={0.001}
                min={0}
                max={0.99}
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
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
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
