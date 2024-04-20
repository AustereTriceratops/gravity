export const testShader = `
precision mediump float;

uniform vec2 resolution;
uniform float cameraDistance;

vec3 cameraPos = vec3(cameraDistance, 0.0, 0.0);
vec3 cameraRight = vec3(0.0, 1.0, 0.0);
vec3 cameraForward = vec3(-1.0, 0.0, 0.0);
vec3 cameraUp = vec3(0.0, 0.0, 1.0);
float fov = 65.0;
float pi = 3.14159;

vec3 planeNormal = vec3(1.0, 0.0, 0.0);
float planeDistance = -100.0;

float sdPlane( vec3 rayPos, vec3 normal, float h ) {
    return dot(rayPos, normal) + h;
}

// COORDINATES

float atan2(in float y, in float x) {
    float s = abs(x) - abs(y);
    return mix(pi/2.0 - atan(x, y), atan(y, x), s);
}

vec2 euclideanToPolar(vec3 coords) {
    float r = pow(dot(coords, coords), 0.5);
    float phi = atan2(coords.x, coords.y);
    
    return vec2(r, phi);
}


// RAYMARCHING

// rayDir is normalized
vec3 raymarch(vec3 rayPos, vec3 rayDir) {
    float rayAngleRadial = atan2(rayDir.z, rayDir.y);
    //float ySign = sign(rayDir.y);
    float rayY = pow(rayDir.y * rayDir.y + rayDir.z * rayDir.z, 0.5);
    float rayAngle = atan2(-rayDir.x, rayY);
    vec2 polarPos = euclideanToPolar(rayPos);
    
    float u = 1.0/polarPos.x;
    float phi = polarPos.y;
    float d_phi = 0.05;
    float fac = 1.0;
    
    if (rayAngle > 0.5*pi && rayAngle < 1.5*pi) {
        fac *= -1.0;
        rayAngle = pi - rayAngle;
    }
    
    float u_dot = u * tan(rayAngle);
    
    for (int i = 0; i < 1000; i++) {
        float d_phi_scaled = d_phi/max(u, 0.1);

        u_dot += (3.0*pow(u, 2.0) - u)*d_phi_scaled;
        u += u_dot*d_phi_scaled;
        phi += fac*d_phi_scaled;

        if (u <= 0.0001){
            return vec3(1.0, 1.0, 1.0);
        }
        if (u >= 1.1){
            return vec3(0.0, 0.0, 0.0);
        }
        
        // convert back to euclidean 
        float x = sin(phi)/u;
        float y = cos(rayAngleRadial)*cos(phi)/u;
        float z = sin(rayAngleRadial)/u;
        
        if (x < -200.0) {
            float ymod = mod(abs(y), 100.0);
            float zmod = mod(abs(z), 100.0);
            if (ymod < 50.0 ^^ zmod < 50.0) {
                return vec3(0.3, 0.3, 0.3);
            } else {
                return vec3(0.8, 0.8, 0.8);
            }
        }
    }
    
    return vec3(0.4, 0.0, 0.0);
}

void main() {
    // normalized pixel coordinates to [-1, 1]
    vec2 uv = 2.0*gl_FragCoord.xy/resolution - vec2(1.0, 1.0);
    
    vec3 rayDir = normalize(0.5*uv.x * cameraRight + 0.25*uv.y * cameraUp + cameraForward);
    
    vec3 color = raymarch(cameraPos, rayDir);

    // Output to screen
    gl_FragColor = vec4(color, 1.0);
}
`;