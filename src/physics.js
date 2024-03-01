export function floatMod(x, y) {
    if (y === 0) return null;

    const d = Math.floor(x/y);
    const r = x - d*y;

    return r;
}

// const integrateMotion(u, phi, u_dot, d_phi) {
//     for (let j = 0; j < 1000; j++){
//         const d_phi_scaled = d_phi/Math.max(u, 0.1);

//         u_dot += (3*u**2 - u)*d_phi_scaled;
//         u += u_dot*d_phi_scaled;
//         phi += fac*d_phi_scaled;

//         if (u < 0.001 || u > 1){
//             break;
//         }

//         x.push(Math.cos(phi)/u);
//         y.push(Math.sin(phi)/u);
//     }
// }

export const generateTrajectories2 = (r, phi, d_phi=0.05, n_rays=80) => {
    const x_traj = [];
    const y_traj = [];
    const half_ray = Math.trunc(n_rays / 2);

    for (let i = -half_ray; i < half_ray; i++){
        let u = 1/r;
        let phi_ = phi;
        let fac = 1;
        const direction = 'left'
        let epsilon = 0;

        // let epsilon = 0.2*Math.PI*i/half_ray;

        // if (epsilon < 1) {
        //     fac = -1;
        // }

        // let u_dot = u * Math.tan(epsilon); //d_u/d_phi

        if (direction==='forward') {
            epsilon = 0.3*Math.PI*i/half_ray;
            //(epsilon < 0) ? fac = 1 : fac = -1;
        }
        else if (direction==='left') {
            epsilon = Math.PI*(0.4 + 0.1*(i + half_ray)/half_ray);
            (i < 0) ? fac = -1 : fac = 1;
            epsilon = Math.PI - fac*epsilon;
        }
        else if (direction==='everywhere') {
            epsilon = Math.PI*i/half_ray;

            if (i > 0)  {
                epsilon *= -1;
                fac = -1;
            }
        }
        else if (direction==='any') {
            const a = 10; // rotation factor
            epsilon = 0.25*Math.PI*(i + half_ray + a)/half_ray;
            // const quarter_epsilon = 0.25*Math.PI*(i + half_ray)/half_ray;
            
            // const half_epsilon = 0.5*Math.PI*i/half_ray;
            // epsilon = floatMod(epsilon + half_epsilon, Math.PI*i/half_ray);
            //epsilon = floatMod(epsilon, Math.PI*(i + half_ray + a)/half_ray);
            //console.log(epsilon)

            if (i > half_ray + a)  {
                epsilon *= -1;
                fac = -1;
            }
        }
        
        let u_dot = u * Math.tan(epsilon); //d_u/d_phi
    
        const x = [Math.cos(phi_)/u];
        const y = [Math.sin(phi_)/u];
    
        for (let j = 0; j < 1000; j++){
            const d_phi_scaled = d_phi/Math.max(u, 0.1);

            u_dot += (3*u**2 - u)*d_phi_scaled;
            u += u_dot*d_phi_scaled;
            phi_ += fac*d_phi_scaled;
    
            if (u < 0.001 || u > 1){
                break;
            }
    
            x.push(Math.cos(phi_)/u);
            y.push(Math.sin(phi_)/u);
        }
    
        x_traj.push(x);
        y_traj.push(y);
    }

    return {x_traj, y_traj};
}

// for now take s_1 in [0, 1]
export const generateSingleTrajectory = (r, phi, d_phi=0.050, s_1=0) => {
    let u = 1/r;
    let phi_ = phi;
    let fac = 1;

    let epsilon = 2.0*s_1*Math.PI;

    if (s_1 > 0.25 && s_1 < 0.75) {
        fac = -1;
        epsilon = Math.PI - epsilon
    }
    
    let u_dot = u * Math.tan(epsilon); //d_u/d_phi

    const x = [Math.cos(phi_)/u];
    const y = [Math.sin(phi_)/u];

    for (let j = 0; j < 1000; j++){
        const d_phi_scaled = d_phi/Math.max(u, 0.1);

        u_dot += (3*u**2 - u)*d_phi_scaled;
        u += u_dot*d_phi_scaled;
        phi_ += fac*d_phi_scaled;

        if (u < 0.001 || u > 1){
            break;
        }

        x.push(Math.cos(phi_)/u);
        y.push(Math.sin(phi_)/u);
    }

    return [x, y];
}

export const generateManyTrajectories = (r, phi, d_phi=0.05, num_rays=80, centerAngle, fov) => {
    const step = fov / (num_rays - 1);
    let s = centerAngle - fov/2;

    const x_traj = [];
    const y_traj = [];

    for (let i = 0; i < num_rays; i++) {
        const [x, y] = generateSingleTrajectory(r, phi, d_phi, s);
        x_traj.push(x);
        y_traj.push(y);

        s += step;
    }

    return {x_traj, y_traj};
}