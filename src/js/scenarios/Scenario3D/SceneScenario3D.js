import * as THREE from "three";
import Scene3D from "../../canvas-3d-threejs/Scene3D";
import { Bodies, Body, Composite, Engine, Runner } from "matter-js";
import { randomRange } from "../../utils/MathUtils";

class TestSquareBubbles extends THREE.Mesh {
  constructor(radius, color) {
    // const geometry_ = new THREE.SphereGeometry(radius)
    const geometry_ = new THREE.BoxGeometry(2 * radius, 2 * radius, 2 * radius); // temporary to test rotation
    const material_ = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
    });
    super(geometry_, material_);
    this.radius = radius;

    /** body */
    // this.body = Bodies.circle(0, 0, radius)
    this.body = Bodies.rectangle(0, 0, 2 * radius, 2 * radius); // temporary to test rotation
  }

  setPosition(x, y) {
    this.position.set(x, y, 0);
    Body.setPosition(this.body, { x: x, y: -y }); // !! reverse sign
  }

  update() {
    this.position.x = this.body.position.x;
    this.position.y = -this.body.position.y; // !! reverse sign
    this.rotation.z = -this.body.angle; // !! reverse sign
  }
}

class Wall extends THREE.Mesh {
  constructor(color) {
    const geometry_ = new THREE.BoxGeometry(1, 1, 1);
    const material_ = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
    });
    super(geometry_, material_);

    this.depth = 1; // store and expose wall depth

    /** body */
    this.body = Bodies.rectangle(0, 0, 1, 1, { isStatic: true });
  }

  setSize(width, height) {
    /** body */
    Body.scale(this.body, 1 / this.scale.x, 1 / this.scale.y); // unscale to (1, 1)
    Body.scale(this.body, width, height); // scale to new dimension

    /** geometry */
    this.scale.set(width, height, this.depth);
  }

  setPosition(x, y) {
    this.position.set(x, y, 0);
    Body.setPosition(this.body, { x: x, y: -y }); // !! sign y
  }
}

export default class Scenario3d extends Scene3D {
  constructor(nBubble, id = "canvas-scene") {
    super(id);

    /** orthographic camera */
    this.camera = new THREE.OrthographicCamera(
      -this.width / 2,
      this.width / 2,
      this.height / 2,
      -this.height / 2,
      0.1,
      200
    );
    this.camera.position.z = 100;

    /** bubble */
    this.radius = 20;
    this.bubbles = [];
    this.colors = ["red", "yellow", "blue"];
    for (let i = 0; i < nBubble; i++) {
      const bubble_ = new TestSquareBubbles(
        this.radius,
        this.colors[i % this.colors.length]
      );
      bubble_.setPosition(
        randomRange(
          -this.width / 2 + this.radius,
          this.width / 2 - this.radius
        ),
        randomRange(
          -this.height / 2 + this.radius,
          this.height / 2 - this.radius
        )
      );
      this.bubbles.push(bubble_);
      this.scene.add(bubble_);
    }

    /** walls */
    this.wallLeft = new Wall("blue"); // left
    this.wallRight = new Wall("blue"); // right

    const wallDepth_ = 2 * this.radius;
    this.wallLeft.depth = wallDepth_;
    this.wallRight.depth = wallDepth_;

    this.scene.add(this.wallLeft);
    this.scene.add(this.wallRight);

    /** maze */
    this.wallMaze1 = new Wall("white");
    this.wallMaze1.depth = wallDepth_;
    this.wallMaze2 = new Wall("white");
    this.wallMaze2.depth = wallDepth_;

    this.scene.add(this.wallMaze1);
    this.scene.add(this.wallMaze2);

    /** physics engine */
    this.engine = Engine.create({ render: { visible: false } });
    this.bodies = [
      this.wallLeft.body,
      this.wallRight.body,
      this.wallMaze1.body,
      this.wallMaze2.body,
    ];
    this.bubbles.forEach((b) => this.bodies.push(b.body));
    Composite.add(this.engine.world, this.bodies);
    this.runner = Runner.create();
    Runner.run(this.runner, this.engine);

    /** device motion */
    this.windowContext.useDeviceAcceleration = true;
    this.acceleration = this.windowContext.acceleration;
    this.engine.gravity.scale *= 5; // optional, to fit scenario

    /** init */
    this.resize();
  }

  update() {
    if (!super.update()) return;
    this.bubbles.forEach((b) => {
      b.update();
    });
  }

  addBubble(x, y) {
    const bubble_ = new TestSquareBubbles(
      this.radius,
      this.colors[Math.floor(this.colors.length * Math.random())]
    );
    bubble_.setPosition(x, y);
    this.bubbles.push(bubble_);
    this.scene.add(bubble_);
    Composite.add(this.engine.world, bubble_.body);
  }

  removeBubble(bubble) {
    /** remove from threejs */
    bubble.geometry.dispose();
    bubble.material.dispose();
    bubble.removeFromParent();

    /** remove from matterjs */
    Composite.remove(this.engine.world, bubble.body);

    /** remove from array */
    this.bubbles = this.bubbles.filter((b) => {
      return b !== bubble;
    }); // remove
  }

  /*
    onDeviceOrientation() {
        const orientationAngle_ = Math.atan2(this.orientation.beta, this.orientation.gamma)
        this.engine.gravity.x = Math.cos(orientationAngle_)
        this.engine.gravity.y = Math.sin(orientationAngle_)
    }
    */

  onDeviceAcceleration() {
    /** debug */
    let coordinates_ = "";
    coordinates_ = coordinates_.concat(
      this.acceleration.x.toFixed(2),
      ", ",
      this.acceleration.y.toFixed(2)
    );
    this.debug.domDebug = coordinates_;

    /** update engine gravity */
    this.engine.gravity.x = this.acceleration.x / 9.81; // !! sign
    this.engine.gravity.y = -this.acceleration.y / 9.81;
  }

  resize() {
    super.resize();
    /** camera */
    this.camera.left = -this.width / 2;
    this.camera.right = this.width / 2;
    this.camera.top = this.height / 2;
    this.camera.bottom = -this.height / 2;

    /** physics */
    if (!!this.wallLeft) {
      const wallThickness_ = 15;

      /** border */
      this.wallLeft.setSize(wallThickness_, this.height * 2);
      this.wallLeft.setPosition(-this.width / 2 - wallThickness_ / 2, 0);

      this.wallRight.setSize(wallThickness_, this.height * 2);
      this.wallRight.setPosition(this.width / 2 + wallThickness_ / 2, 0);

      /** maze */
      const width_ = (this.width * 2) / 3;
      const offsetX_ = (this.width * 1) / 3 / 2;
      const offsetY_ = this.height / 6;

      this.wallMaze1.setSize(width_, wallThickness_);
      this.wallMaze1.setPosition(-offsetX_, offsetY_);

      this.wallMaze2.setSize(width_, wallThickness_);
      this.wallMaze2.setPosition(offsetX_, -offsetY_);
    }
  }
}
