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
        
        if (x < -1000.0) {
            float ymod = mod(abs(y), 100.0);
            float zmod = mod(abs(z), 100.0);
            if (ymod < 50.0 ^^ zmod < 50.0) {
                return vec3(0.3, 0.3, 0.3);
            } else {
                return vec3(0.8, 0.8, 0.8);
            }
        }
    }
    
    return vec3(0.8, 0.0, 0.0);
}

void main() {
    // normalized pixel coordinates to [-1, 1]
    vec2 uv = 2.0*gl_FragCoord.xy/resolution - vec2(1.0, 1.0);
    
    vec3 rayDir = normalize(0.5*uv.x * cameraRight + 0.25*uv.y * cameraUp + cameraForward);
    
    vec3 color = raymarch(cameraPos, rayDir);

    // Output to screen
    gl_FragColor = vec4(color, 1.0);
}
`

/// TODO: start using quaternions

/// 4-velocity: vec4, always normalized to 1 (or c)

/// Lorentz transformations (i hope), 0 <= v < 1
/// dT = (dt + v*dx)/sqrt(1 - v^2) 
/// dX = sqrt(1 - v^2) * (dt + dx/v)
export const TerrellRotationShader = `
precision mediump float;

uniform vec2 resolution;
uniform float velocity;
uniform float phi;
uniform float theta;

vec3 lightDir = normalize(vec3(1.0, 0.4, 0.8));
float distance = 12.0;
float fov = 65.0;

// === VECTOR ALGEBRA ===
vec3 crossProduct(vec3 a, vec3 b) {
    return vec3(a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x);
}

float minkowskiProduct(vec4 a, vec4 b) {
    return a.w*b.w - dot(a.xyz, b.xyz);
}

vec4 minkowskiNormalize(vec4 a) {
    float x = pow(minkowskiProduct(a, a), 0.5);
    return a/x;
}

// === SDFs ===

float boxSDF(vec4 boxPos, vec4 rayPos, vec3 boxDims) {
    vec3 pos = abs(rayPos.xyz - boxPos.xyz) - boxDims;
    return max(max(pos.x, pos.y), pos.z);
}

vec3 boxNormal(vec4 boxPos, vec4 rayPos, vec3 boxDims) {
    float ref = boxSDF(boxPos, rayPos, boxDims);
    float dx = boxSDF(boxPos, rayPos + vec4(0.0001, 0.0, 0.0, 0.0), boxDims) - ref;
    float dy = boxSDF(boxPos, rayPos + vec4(0.0, 0.0001, 0.0, 0.0), boxDims) - ref;
    float dz = boxSDF(boxPos, rayPos + vec4(0.0, 0.0, 0.0001, 0.0), boxDims) - ref;
    return normalize(vec3(dx, dy, dz));
}

// === RAYMARCHING ===

/// TODO: directional lighting
// rayDir is normalized
vec3 raymarch(vec4 rayPos, vec4 rayDir) {
    vec4 boxVelocity = minkowskiNormalize(vec4(velocity, 0.0, 0.0, 1.0));
    vec4 boxPos =  vec4(distance * velocity, 0.0, 0.0, 0.0);
    
    float gamma = pow(1.0 - velocity*velocity, 0.5);
    // TODO: diagonal motion
    // vec4 gammaFac = normalize(boxVelocity)*gamma;
    vec3 boxDims = vec3(gamma*1.0, 1.0, 1.0);
    float len = 0.0;

    for (int i = 0; i < 1000; i++) {
        vec4 displacement = vec4(0.717 * len * velocity, 0.0, 0.0, 0.0);
        float sdf = 0.5*boxSDF(boxPos - displacement, rayPos, boxDims);
        
        len += abs(sdf);
        vec4 dPos = rayDir * sdf;
        
        if (length(dPos) < 0.001) {
            // LIGHTING
            vec3 normal = boxNormal(boxPos - displacement, rayPos, boxDims);
            float d = dot(normal, lightDir);

            float light = 0.6*(1.0 + d)*(1.0 + d) + 0.4;
            vec3 lightExponent = vec3(light*0.8, light, light);
            lightExponent += 1.0*float(i)/100.0; // fast AO

            return pow(vec3(0.5, 0.8, 0.6), lightExponent);
        }

        rayPos += dPos;
    }

    return vec3(0.8, 0.8, 0.7);
}

void main() {
    // normalized pixel coordinates to [-1, 1]
    vec2 aspect = vec2(resolution.x/resolution.y, 1.0);
    vec2 uv = aspect*2.0*gl_FragCoord.xy/resolution - aspect;

    /// TODO: QUATERNIONS
    vec3 cameraForward = vec3(cos(phi)*cos(theta), -sin(phi)*cos(theta), sin(theta));
    vec3 cameraRight = vec3(sin(phi), cos(phi), 0.0);
    vec3 cameraUp = crossProduct(cameraRight, cameraForward);

    vec3 cameraPos = -distance * cameraForward;
    
    vec3 r = 0.4*uv.x * cameraRight + 0.4*uv.y * cameraUp + cameraForward;
    vec4 rayDir = normalize(vec4(normalize(r), -1.0));
    vec3 color = raymarch(vec4(cameraPos.x, cameraPos.y, cameraPos.z, 0.0), rayDir);

    // Output to screen
    gl_FragColor = vec4(color, 1.0);
}
`
