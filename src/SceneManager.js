import * as THREE from 'three';
import { Vector3 } from 'three';

const generateTrajectories = (r, phi, d_phi=0.05, n_rays=50) => {
    const x_traj = [];
    const y_traj = [];

    for (let i = 0; i < 2*n_rays; i++){
        const fac = (i < n_rays) ? 1 : -1;
        //const r = 4;
        let u = 1/r;
    
        let phi_ = phi;
        let u_dot = - Math.tan(0.0001 + Math.PI*(i/(n_rays-1) - 1/2))*u; //d_u/d_phi
    
        const x = [Math.cos(phi_)/u];
        const y = [Math.sin(phi_)/u];
    
        for (let i = 0; i < 1000; i++){
            u_dot += (3*u**2 - u)*d_phi*fac;
            u += u_dot*d_phi*fac;
            phi_ += d_phi*fac;
    
            if (u < 0 || u > 1){
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
        this.scl = 8.0;

        this.setup();
        this.addMaterials();
        this.addMeshes();
        this.render();
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

    addMaterials() {
        this.blackMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
        this.lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff});
    }

    addMeshes() {
        const geometry = new THREE.CircleGeometry(1);

        const mesh = new THREE.Mesh(geometry, this.blackMaterial);
        mesh.name = "event horizon";

        this.scene.add(mesh);


        this.lineMeshes = [];

        for (let i = 0; i < 100; i++) {
            const points = [new Vector3()];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    
            let l = new THREE.Line(lineGeometry, this.lineMaterial);
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
        const fac = (x < 0) ? -1 : 1;
        const r = Math.pow(x*x + y*y, 0.5);
        const phi = Math.atan2(y, x);

        return [r, phi];
    }
}

export default SceneManager;