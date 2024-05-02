import * as THREE from "three";
import DomElement from "../utils/window/DomElement";
import WindowContext from "../WindowContext";

export default class Scene3D {
  constructor(id = "canvas-scene") {
    this.id = id;

    /** window context */
    this.windowContext = new WindowContext();
    this.windowContext.addScene(this);

    /** debug */
    this.params = { "is-update": true };
    this.debug = this.windowContext.debug;
    if (this.debug.active) {
      this.debugFolder = this.windowContext.debug.ui.addFolder(id);
      this.debugFolder.add(this.params, "is-update");
    }

    /** canvas */
    this.domElement = new DomElement(id);
    this.canvas = this.domElement.element;

    /** scene + camera */
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.domElement.aspectRatio,
      0.1,
      200
    );
    this.camera.position.z = 100;
    this.camera.lookAt(new THREE.Vector3()); // default = 0,0,0
    this.scene.add(this.camera);

    /** renderer */
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });

    /*     const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(50, 50, 50);
    this.scene.add(pointLight); */
    /** init */
    this.resize();
  }

  get width() {
    return this.domElement.width;
  }
  get height() {
    return this.domElement.height;
  }
  get position() {
    return this.domElement.position;
  }
  get isVisible() {
    return this.domElement.isVisible;
  }

  update() {
    this.renderer.render(this.scene, this.camera);
    return this.params["is-update"];
  }

  resize() {
    this.domElement.setSize();

    /** camera */
    this.camera.aspect = this.domElement.aspectRatio;
    this.camera.updateProjectionMatrix();

    /** render */
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.setPixelRatio(this.windowContext.size.pixelRatio);
  }

  scroll() {
    this.domElement.setSize();
  }

  onDeviceOrientation() {}
  onDeviceAcceleration() {}

  destroy() {
    this.renderer.dispose();
  }
}
