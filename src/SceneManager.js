import * as THREE from 'three';
import { Vector3 } from 'three';
import { generateManyTrajectories } from './physics';

const BLACK = 0x000000;
const PURPLE = 0xcf8bed;

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

    calculateTrajectoryGeometry(r, phi, s_1) {
        const {x_traj, y_traj} = generateManyTrajectories(
            r, phi, this.stepSize, this.n_rays, s_1, 0.2
        );

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

    render(mouseX, mouseY, s_1) {
        const [x, y] = this.mouseCoordsToEuclidean(mouseX, mouseY);
        const [r, phi] = this.euclideanCoordsToPolar(x, y);

        this.calculateTrajectoryGeometry(r, phi, s_1);
        
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