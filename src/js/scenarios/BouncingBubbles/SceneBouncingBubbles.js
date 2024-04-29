import WindowContext from "../../WindowContext";
import Scene2D from "../../canvas-2d/Scene2D";
import { circle, line } from "../../canvas-2d/Shapes2D";
import { clamp, distance2d, randomRange } from "../../utils/MathUtils";

class Bubble {
  constructor(context, x, y, radius) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.radius = radius;

    /** window context */
    this.timeWindow = new WindowContext().time;

    /** animate */
    this.vx = randomRange(-100, 100);
    this.vy = randomRange(-100, 100);

    /** gravity */
    this.gx = 0;
    this.gy = 0;
  }

  draw() {
    circle(this.context, this.x, this.y, this.radius, { isFill: true });
  }

  update(width, height, speed = 1) {
    /** gravity */
    this.gx =
      this.x < this.radius || this.x > width - this.radius ? 0 : this.gx;
    // this.gy = this.y < this.radius || this.y > height - this.radius ? 0 : this.gy

    /** update */
    this.x += ((this.vx + this.gx) * speed * this.timeWindow.delta) / 1000;
    this.y += ((this.vy + this.gy) * speed * this.timeWindow.delta) / 1000;

    /** bounce */
    this.vx = this.x < this.radius ? Math.abs(this.vx) : this.vx;
    this.vx = this.x > width - this.radius ? -Math.abs(this.vx) : this.vx;
  }
}

export default class SceneBoucingBubbles extends Scene2D {
  constructor(nBubble, id = "canvas-scene") {
    super(id);

    /** debug */
    this.params.threshold = 50;
    this.params.speed = 1;
    this.params.radius = 10;
    this.params.lineWidth = 2;
    this.params.nBubbles = nBubble;
    this.params["g-strength"] = 300;
    if (this.debug.active) {
      this.debugFolder.add(this.params, "threshold", 0, 600);
      this.debugFolder.add(this.params, "speed", -3, 3);
      this.debugFolder.add(this.params, "radius", 0, 20).onChange(() => {
        if (!!this.bubbles) {
          this.bubbles.forEach((b) => (b.radius = this.params.radius));
        }
      });
      this.debugFolder.add(this.params, "lineWidth", 1, 10);
      this.debugFolder
        .add(this.params, "nBubbles", 1, 30)
        .onFinishChange(() => {
          this.generateBubbles();
        });
      this.debugFolder.add(this.params, "g-strength", 200, 500);
    }

    /** device motion */
    this.windowContext.useDeviceOrientation = true;
    this.orientation = this.windowContext.orientation;

    /** generate bubbles */
    this.radius = 10;
    this.generateBubbles();
  }

  addBubble(x, y, vx = null, vy = null) {
    const bubble_ = new Bubble(this.context, x, y, this.radius);
    bubble_.vx = !!vx ? vx : bubble_.vx;
    bubble_.vy = !!vy ? vy : bubble_.vy;
    this.bubbles.push(bubble_);
  }

  generateBubbles() {
    this.bubbles = [];
    for (let i = 0; i < this.params.nBubbles; i++) {
      const x_ = this.width * Math.random();
      const y_ = this.height * Math.random();
      const bubble_ = new Bubble(this.context, x_, y_, this.radius);
      this.bubbles.push(bubble_);
    }

    this.draw();
  }

  draw() {
    /** style */
    this.context.strokeStyle = "white";
    this.context.fillStyle = "black";
    this.context.lineCap = "round";
    this.context.lineWidth = this.params.lineWidth;

    /** draw */
    if (!!this.bubbles) {
      for (let i = 0; i < this.bubbles.length; i++) {
        const current_ = this.bubbles[i];
        for (let j = i; j < this.bubbles.length; j++) {
          const next_ = this.bubbles[j];

          if (
            distance2d(current_.x, current_.y, next_.x, next_.y) <
            this.params.threshold
          )
            line(this.context, current_.x, current_.y, next_.x, next_.y);
        }
      }

      this.bubbles.forEach((b) => {
        b.draw();
      });
    }
  }

  update() {
    if (!super.update()) return;

    this.bubbles.forEach((b) => {
      b.update(this.width, this.height, this.params.speed);
    });

    this.clear();
    this.draw();
  }

  onDeviceOrientation() {
    /** orientation to gravity */
    let gx_ = this.orientation.gamma / 90;
    let gy_ = this.orientation.beta / 90;
    gx_ = clamp(gx_, -1, 1);
    gy_ = clamp(gy_, -1, 1);
    gx_ *= this.params["g-strength"];
    gy_ *= this.params["g-strength"];

    /** update bubbles */
    if (!!this.bubbles) {
      this.bubbles.forEach((b) => {
        b.gx = gx_;
        b.gy = gy_;
      });
    }
  }

  resize() {
    super.resize();

    if (!!this.bubbles) {
      this.bubbles.forEach((b) => {
        b.x = b.x > this.width ? this.width : b.x;
        b.y = b.y > this.height ? this.height : b.y;
      });
    }

    this.draw();
  }
}
