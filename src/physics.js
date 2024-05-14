export function floatMod(x, y) {
    if (y === 0) return null;

    const d = Math.floor(x/y);
    const r = x - d*y;

    return r;
}

// for now take s_1 in [0, 1]
export const generateSingleTrajectory = (r, phi, d_phi=0.05, s_1=0) => {
    let u = 1/r;
    let phi_ = phi;
    let fac = 1;

    let epsilon = 2.0*s_1*Math.PI;

    if (s_1 > 0.25 && s_1 < 0.75) {
        fac = -1;
        epsilon = Math.PI - epsilon;
    }
    
    let u_dot = u * Math.tan(epsilon); //d_u/d_phi

    const x = [Math.cos(phi_)/u];
    const y = [Math.sin(phi_)/u];

    for (let j = 0; j < 1000; j++){
        const d_phi_scaled = d_phi/Math.max(u, 0.1);

        u_dot += (3.0*u**2 - u)*d_phi_scaled;
        u += u_dot*d_phi_scaled;
        phi_ += fac*d_phi_scaled;

        if (u < 0.0001 || u > 1){
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