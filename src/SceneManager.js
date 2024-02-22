import { 
    Scene, OrthographicCamera, WebGLRenderer, BoxGeometry, MeshNormalMaterial, Mesh 
} from 'three';

class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspect = this.width/this.height;

        this.setup();
        this.addMeshes();
        this.render();
    }

    setup() {
        this.scene = new Scene();
        this.camera = new OrthographicCamera(-this.aspect, this.aspect, 1, -1, -1, 1);

        this.renderer = new WebGLRenderer({canvas: this.canvas});
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor( 0x444444, 1 );
    }

    addMeshes() {
        const geometry = new BoxGeometry( 0.2, 0.2, 0.2 );
        const material = new MeshNormalMaterial();

        const mesh = new Mesh( geometry, material );
        this.scene.add( mesh );
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

export default SceneManager;