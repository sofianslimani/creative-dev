import WindowContext from "./js/WindowContext";
import Scenario3d from "./js/scenarios/Scenario3D/SceneScenario3D";
import SceneBoucingBubbles from "./js/scenarios/BouncingBubbles/SceneBouncingBubbles";
import { askMotionAccess } from "./js/utils/device/DeviceAccess";
import { randomRange } from "./js/utils/MathUtils";

/** motion sensor autorization */
const btnAccess = document.getElementById("btn-access");
btnAccess.addEventListener(
  "click",
  function () {
    askMotionAccess();
  },
  false
);

/** reload */
const btnReload = document.getElementById("btn-reload");
btnReload.addEventListener(
  "click",
  function () {
    window.location.reload();
  },
  false
);

/**
 * SCENARIO
 */

/** scenes */
const scene1 = new SceneBoucingBubbles(10);
const scene2 = new Scenario3d(0, "canvas-scene-3d");
const scene3 = new SceneBoucingBubbles(6, "canvas-scene-2");

/** main */
const update = () => {
  /** scan bubbles */
  const outScene1_up_ = scene1.bubbles.filter((b) => {
    return b.y < -b.radius;
  });
  const outScene1_down_ = scene1.bubbles.filter((b) => {
    return b.y > scene1.height + b.radius;
  });

  const outScene2_up_ = scene2.bubbles.filter((b) => {
    return b.position.y > scene2.height / 2 + b.radius;
  });
  const outScene2_down_ = scene2.bubbles.filter((b) => {
    return b.position.y < -scene2.height / 2 - b.radius;
  });

  const outScene3_up_ = scene3.bubbles.filter((b) => {
    return b.y < -b.radius;
  });
  const outScene3_down_ = scene3.bubbles.filter((b) => {
    return b.y > scene3.height + b.radius;
  });

  /** out scene 1 */
  outScene1_up_.forEach((bubble) => {
    scene1.bubbles = scene1.bubbles.filter((b) => {
      return b !== bubble;
    }); // remove
    scene3.addBubble(
      bubble.x,
      scene3.height + bubble.radius - 1,
      bubble.vx,
      bubble.vy
    ); // move to scene 3
  });
  outScene1_down_.forEach((bubble) => {
    scene1.bubbles = scene1.bubbles.filter((b) => {
      return b !== bubble;
    }); // remove
    scene2.addBubble(
      bubble.x - scene2.width / 2,
      scene2.height / 2 + bubble.radius - 1
    ); // move to scene 2
  });

  /** out scene 2 */
  outScene2_up_.forEach((bubble) => {
    scene2.removeBubble(bubble);
    scene1.addBubble(
      bubble.position.x + scene2.width / 2,
      scene1.height + bubble.radius - 10
    ); // move to scene 1
  });
  outScene2_down_.forEach((bubble) => {
    scene2.removeBubble(bubble);
    scene3.addBubble(bubble.position.x + scene2.width / 2, -bubble.radius + 10); // move to scene 3
  });

  /** out scene 3 */
  outScene3_up_.forEach((bubble) => {
    scene3.bubbles = scene3.bubbles.filter((b) => {
      return b !== bubble;
    });
    scene2.addBubble(
      bubble.x - scene2.width / 2,
      -scene1.height / 2 - bubble.radius + 1
    ); // move to scene 2
  });
  outScene3_down_.forEach((bubble) => {
    scene3.bubbles = scene3.bubbles.filter((b) => {
      return b !== bubble;
    }); // move to scene 1
    scene1.addBubble(bubble.x, -bubble.radius + 1, bubble.vx, bubble.vy);
  });
};
const windowContext = new WindowContext();
const time = windowContext.time;
time.on("update", update);
