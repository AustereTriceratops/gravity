import * as THREE from 'three';
import { Vector3 } from 'three';

const BLACK = 0x000000;
const PURPLE = 0xcf8bed;

const generateTrajectories2 = (r, phi, d_phi=0.05, n_rays=80) => {
    const x_traj = [];
    const y_traj = [];
    const half_ray = Math.trunc(n_rays / 2);

    for (let i = - half_ray; i < half_ray; i++){
        let u = 1/r;
        let phi_ = phi;
        let fac = 1;
        const direction = 'everywhere'
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
            epsilon = Math.PI*(0.25 + 0.25*(i + half_ray)/half_ray);
            (i < 0) ? fac = -1 : fac = 1;
            epsilon = Math.PI - fac*epsilon;
        }
        else if (direction==='everywhere') {
            epsilon = 1*Math.PI*i/(half_ray-1);
            if (epsilon > 0)  {
                epsilon = Math.PI - epsilon;
                fac = -1;
            }
            //epsilon = Math.PI - fac*epsilon;
        }
        
        let u_dot = u * Math.tan(epsilon); //d_u/d_phi

        // let rayPhi = phi + Math.PI*( 1.0 + i/(half_ray*4.0));
        // let u_dot = u * Math.tan(fac*rayPhi); //d_u/d_phi
    
        const x = [Math.cos(phi_)/u];
        const y = [Math.sin(phi_)/u];
    
        for (let j = 0; j < 1000; j++){
            const d_phi_scaled = d_phi/Math.max(u, 0.2);

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

    console.log(x_traj)

    return {x_traj, y_traj};
}

class SceneManager {
    constructor(canvas, scale, numRays) {
        this.canvas = canvas;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspect = this.width/this.height;
        this.stepSize = 0.02;
        this.scl = scale;
        this.n_rays = numRays;

        this.setup();
        this.addMeshes();
    }

    setup() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(
            -this.aspect*this.scl, this.aspect*this.scl, this.scl, -this.scl, -1, 1
        );

        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor( 0x444444, 1 );
    }

    addMeshes() {
        const geometry = new THREE.CircleGeometry(1);
        const blackMaterial = new THREE.MeshBasicMaterial({color: BLACK});

        const mesh = new THREE.Mesh(geometry, blackMaterial);
        mesh.name = "event horizon";

        this.scene.add(mesh);

        this.lineMeshes = [];

        for (let i = 0; i < this.n_rays; i++) {
            const points = [new Vector3()];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({color: PURPLE})
    
            let l = new THREE.Line(lineGeometry, lineMaterial);
            l.name = `trajectory_${i}`;

            this.lineMeshes.push(l);
            this.scene.add(l);
        }
    }

    calculateTrajectoryGeometry(r, phi) {
        const {x_traj, y_traj} = generateTrajectories2(r, phi, this.stepSize, this.n_rays);

        const trajectories = [];
        x_traj.forEach((_, i) => {
            trajectories.push([]);

            x_traj[i].forEach((_, j) => {
                trajectories[i].push( new THREE.Vector3( x_traj[i][j], y_traj[i][j], 0 ) );
            });
            
            this.lineMeshes[i].geometry.setFromPoints(trajectories[i]);

            const [lastPoint] = trajectories[i].slice(-1);
            
            if (lastPoint.length() < 1.5) {
                this.lineMeshes[i].material.color.set(BLACK);
            } else {
                this.lineMeshes[i].material.color.set(PURPLE);
            }
        })
    }

    render(mouseX, mouseY) {
        const [x, y] = this.mouseCoordsToEuclidean(mouseX, mouseY);
        const [r, phi] = this.euclideanCoordsToPolar(x, y);

        this.calculateTrajectoryGeometry(r, phi);
        
        this.renderer.render(this.scene, this.camera);
    }

    mouseCoordsToEuclidean(mouseX, mouseY) {
        const x = this.aspect*this.scl*(2*mouseX/this.width - 1);
        const y = -this.scl*(2*mouseY/this.height - 1);

        return [x, y];
    }

    euclideanCoordsToPolar(x, y) {
        const r = Math.pow(x*x + y*y, 0.5);
        const phi = Math.atan2(y, x);

        return [r, phi];
    }
}

export default SceneManager;