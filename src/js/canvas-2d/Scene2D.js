import DomElement from "../utils/window/DomElement";
import WindowContext from "../WindowContext";

export default class Scene2D {
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

    /** canvas + context 2d */
    this.domElement = new DomElement(id);
    this.canvas = this.domElement.element;
    this.context = this.canvas.getContext("2d");
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

  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  update() {
    return this.params["is-update"];
  }

  resize() {
    this.domElement.setSize();
    const pixelRatio_ = this.windowContext.size.pixelRatio;
    this.canvas.width = this.domElement.width * pixelRatio_;
    this.canvas.height = this.domElement.height * pixelRatio_;
    this.context.scale(pixelRatio_, pixelRatio_);
  }

  scroll() {
    this.domElement.setSize();
  }

  onDeviceOrientation() {}
  onDeviceAcceleration() {}

  destroy() {}
}
