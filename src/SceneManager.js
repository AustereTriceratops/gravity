import * as THREE from 'three';

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

        const points = this.calculateTrajectory()
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

        this.lineMesh = new THREE.Line(lineGeometry, this.lineMaterial);
        this.lineMesh.name = 'trajectory';

        this.scene.add(this.lineMesh);
    }

    calculateTrajectory() {
        const points = [];
        points.push( new THREE.Vector3( -1, 0, 0 ) );
        points.push( new THREE.Vector3( 0, 1, 0 ) );
        points.push( new THREE.Vector3( 1, 0, 0 ) );

        return points;
    }

    render(mouseX, mouseY) {
        this.lineMesh.position.set(
            this.aspect*this.scl*(2*mouseX/this.width - 1), -this.scl*(2*mouseY/this.height - 1), 0
        );
        this.renderer.render(this.scene, this.camera);
    }
}

export default SceneManager;