import {testShader, TerrellRotationShader} from "./shader.js";
import {initProgram, initPositionBuffer} from "./glUtils.js"

const vertexShader = `
attribute vec4 aVertexPosition;

void main() {
    gl_Position = aVertexPosition;
}
`

const fragmentShader = `
precision mediump float;
uniform vec2 resolution;

void main() {
    // BOTTOM LEFT IS (0, 0)
    // TOP RIGHT IS (1, 1)
    vec2 uv = gl_FragCoord.xy/resolution;

    float val = 0.5*(uv.x + uv.y);
    gl_FragColor = vec4(val, val, val, 1.0);
    // gl_FragColor = vec4(uv.x, uv.y, 1.0, 1.0);
    
}
`

export class TestSceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;

        const gl = canvas.getContext('webgl');
        gl.clearColor(0.2, 0.2, 0.2, 1.0);

        this.shaderProgram = initProgram(gl, vertexShader, testShader);
        gl.useProgram(this.shaderProgram);

        this.shaderAttribs = {
            vertexPosition: gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
            resolution: gl.getUniformLocation(this.shaderProgram, 'resolution'),
            cameraDistance: gl.getUniformLocation(this.shaderProgram, 'cameraDistance')
        };

        this.positionBuffer = initPositionBuffer(gl, this.shaderAttribs.vertexPosition);

        gl.uniform2fv(this.shaderAttribs.resolution, [this.width, this.height]);

        this.gl = gl;
    }

    render(cameraDistance) {
        this.gl.uniform1f(this.shaderAttribs.cameraDistance, cameraDistance);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
}

export class TerrellSceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;

        const gl = canvas.getContext('webgl');
        gl.clearColor(0.2, 0.2, 0.2, 1.0);

        this.shaderProgram = initProgram(gl, vertexShader, TerrellRotationShader);
        gl.useProgram(this.shaderProgram);

        this.shaderAttribs = {
            vertexPosition: gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
            resolution: gl.getUniformLocation(this.shaderProgram, 'resolution'),
            velocity: gl.getUniformLocation(this.shaderProgram, 'velocity')
        };

        this.positionBuffer = initPositionBuffer(gl, this.shaderAttribs.vertexPosition);

        gl.uniform2fv(this.shaderAttribs.resolution, [this.width, this.height]);
        gl.uniform1f(this.shaderAttribs.velocity, 0);

        this.gl = gl;
    }

    render(velocity) {
        this.gl.uniform1f(this.shaderAttribs.velocity, velocity);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
}
