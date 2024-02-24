import * as THREE from 'three';
import { Vector3 } from 'three';

const generateTrajectories = (r, phi, d_phi=0.05, n_rays=40) => {
    const x_traj = [];
    const y_traj = [];

    for (let i = 0; i < 2*n_rays; i++){
        const fac = (i < n_rays) ? 1 : -1;
        //const r = 4;
        let u = 1/r;
    
        let phi_ = phi;
        let u_dot = u * Math.tan(Math.PI*(0.3 + 0.2*i/(n_rays-1))); //d_u/d_phi
    
        const x = [Math.cos(phi_)/u];
        const y = [Math.sin(phi_)/u];
    
        for (let i = 0; i < 1000; i++){
            u_dot += (3*u**2 - u)*d_phi*fac;
            u += u_dot*d_phi*fac;
            phi_ += d_phi*fac;
    
            if (u < 0.001 || u > 1){
                break;
            }
    
            x.push(Math.cos(phi_)/u)
            y.push(Math.sin(phi_)/u)
        }
    
        x_traj.push(x)
        y_traj.push(y)
    }

    return {x_traj, y_traj};
}

class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspect = this.width/this.height;
        this.scl = 20.0;

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
        const blackMaterial = new THREE.MeshBasicMaterial({color: 0x000000});

        const mesh = new THREE.Mesh(geometry, blackMaterial);
        mesh.name = "event horizon";

        this.scene.add(mesh);

        this.lineMeshes = [];

        for (let i = 0; i < 80; i++) {
            const points = [new Vector3()];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({color: 0xcf8bed})
    
            let l = new THREE.Line(lineGeometry, lineMaterial);
            l.name = `trajectory_${i}`;

            this.lineMeshes.push(l);
            this.scene.add(l);
        }
    }

    calculateTrajectoryGeometry(r, phi) {
        const {x_traj, y_traj} = generateTrajectories(r, phi);

        const trajectories = [];
        x_traj.forEach((_, i) => {
            trajectories.push([]);

            x_traj[i].forEach((_, j) => {
                trajectories[i].push( new THREE.Vector3( x_traj[i][j], y_traj[i][j], 0 ) );
            });
            
            this.lineMeshes[i].geometry.setFromPoints(trajectories[i]);

            const [lastPoint] = trajectories[i].slice(-1);
            
            if (lastPoint.length() < 1.5) {
                this.lineMeshes[i].material.color.set(0x000000);
            } else {
                this.lineMeshes[i].material.color.set(0xcf8bed);
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