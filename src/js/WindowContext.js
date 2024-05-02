import Debug from "./utils/Debug";
import Time from "./utils/Time";
import DeviceAcceleration from "./utils/device/DeviceAcceleration";
import DeviceOrientation from "./utils/device/DeviceOrientation";

let instanceWindowContext = null;

export default class WindowContext {
  constructor() {
    if (!!instanceWindowContext) return instanceWindowContext;
    instanceWindowContext = this;

    /** scenes */
    this.sceneCollection = [];

    /** events */
    window.addEventListener("resize", () => {
      this.resize();
    });
    window.addEventListener("scroll", () => {
      this.scroll();
    });

    /** time */
    this.time = new Time();
    this.time.on("update", () => {
      this.update();
    });

    /** debug */
    this.debug = new Debug();
  }

  addScene(scene) {
    this.sceneCollection.push(scene);
  }

  update() {
    this.sceneCollection.forEach((s) => {
      if (s.isVisible) s.update();
    });
  }
  resize() {
    this.sceneCollection.forEach((s) => {
      s.resize();
    });
  }
  scroll() {
    this.sceneCollection.forEach((s) => {
      s.scroll();
    });
  }

  get size() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2), // no need to use > 2 (+ issues with low perf devices but high resolution screen)
    };
  }

  get scrollPositon() {
    return {
      x: window.scrollX,
      y: window.scrollY,
    };
  }

  /**
   * DEVICE MOTION
   */
  set useDeviceOrientation(isTrigger) {
    if (isTrigger && !!!this.orientation) {
      this.orientation = new DeviceOrientation();
      this.orientation.on("reading", () => {
        this.onDeviceOrientation();
      });
    }
    if (!isTrigger && !!this.orientation) this.orientation.off("reading");
  }

  onDeviceOrientation() {
    this.sceneCollection.forEach((s) => {
      s.onDeviceOrientation();
    });
  }

  set useDeviceAcceleration(isTrigger) {
    if (isTrigger && !!!this.acceleration) {
      this.acceleration = new DeviceAcceleration();
      this.acceleration.on("reading", () => {
        this.onDeviceAcceleration();
      });
    }
    if (!isTrigger && !!this.acceleration) this.acceleration.off("reading");
  }

  onDeviceAcceleration() {
    this.sceneCollection.forEach((s) => {
      s.onDeviceAcceleration();
    });
  }

  /**
   * DESTROY
   */
  destroy() {
    this.sceneCollection.forEach((s) => {
      s.destroy();
    });
    window.removeEventListener("resize", () => {
      this.resize();
    });
    window.removeEventListener("scroll", () => {
      this.scroll();
    });
    this.time.off("update");
    this.useDeviceOrientation = false;
    this.useDeviceAcceleration = false;
    if (this.debug.active) this.debug.ui.destroy();
  }
}
