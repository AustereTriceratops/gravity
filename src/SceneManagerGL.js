import {testShader} from "./shader.js"

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
    vec2 uv = gl_FragCoord.xy/resolution;
    gl_FragColor = vec4(uv.x, uv.y, 1.0, 1.0);
}
`

class SceneManagerGL {
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

function initShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error(
        `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
    );

    return shader;
}

function initProgram(gl, vertexSource, fragmentSource) {
    const shaderProgram = gl.createProgram();

    const vShader = initShader(gl, gl.VERTEX_SHADER, vertexSource);
    gl.attachShader(shaderProgram, vShader);
    const fShader = initShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(shaderProgram, fShader);

    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) throw Error(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`
    );

    return shaderProgram;
}

function initPositionBuffer(gl, positionAttrib) {
    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        1.0, 1.0
    ]);

    return initArrayBuffer(gl, positions, positionAttrib, 2);
}

function initArrayBuffer(gl, array, attribute, dim) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, dim, gl.FLOAT, true, 0, 0);

    return buffer;
}

export default SceneManagerGL;