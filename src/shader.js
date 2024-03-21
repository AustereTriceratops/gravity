export const TestShader = `
    vec3 cameraPos = vec3(500.0, 0.0, 0.0);
    vec3 cameraRight = vec3(0.0, 1.0, 0.0);
    vec3 cameraForward = vec3(-1.0, 0.0, 0.0);
    vec3 cameraUp = vec3(0.0, 0.0, 1.0);
    float fov = 65.0;
    float pi = 3.14159;

    vec3 planeNormal = vec3(1.0, 0.0, 0.0);
    float planeDistance = -100.0;

    float sdPlane( vec3 rayPos, vec3 normal, float h )
    {
    return dot(rayPos, normal) + h;
    }

    // COORDINATES

    float atan2(in float y, in float x)
    {
        bool s = (abs(x) > abs(y));
        return mix(pi/2.0 - atan(x,y), atan(y,x), s);
    }

    vec2 euclideanToPolar(vec2 coords) {
        float r = pow(dot(coords, coords), 0.5);
        float phi = atan2(coords.x, coords.y);
        
        return vec2(r, phi);
    }


    // RAYMARCHING

    vec3 raymarch(vec3 rayPos, vec3 rayDir) {
        vec2 polarPos = euclideanToPolar(rayPos.xy);
        float rayAngle = atan2(-rayDir.x, rayDir.y);
        
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

            if (u <= 0.001){
                return vec3(1.0, 1.0, 1.0);
            }
            if (u >= 1.1){
                return vec3(0.0, 0.0, 0.0);
            }
            
            // convert back to euclidean 
            
            float x = sin(phi)/u;
            float y = cos(phi)/u;
            
            if (x < -50.0) {
                if (mod(abs(y), 60.0) < 30.0) {
                    return vec3(0.3, 0.3, 0.3);
                } else {
                    return vec3(0.8, 0.8, 0.8);
                }
            }
            
            //if (pos.x < planeDistance + 0.01) {
            //    if (mod(pos.y, 10.0) < 5.0) {
            //        return vec3(0.3, 0.3, 0.3);
            //    } else {
            //        return vec3(0.8, 0.8, 0.8);
            //    }
            //}
        }
        
        return vec3(0.4, 0.0, 0.0);
    }

    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        // Normalized pixel coordinates to [-1, 1]
        vec2 uv = 2.0*fragCoord/iResolution.xy - vec2(1.0, 1.0);
        
        vec3 rayDir = normalize(0.5*uv.x * cameraRight + cameraForward);
        
        vec3 color = raymarch(cameraPos, rayDir);

        // Output to screen
        fragColor = vec4(color, 1.0);
    }
`;