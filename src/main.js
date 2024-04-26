import * as THREE from "three"
import WindowContext from "./js/WindowContext"
import SceneBouncingBubbles from "./js/scenarios/BouncingBubbles/SceneBouncingBubbles"
import { askMotionAccess } from "./js/utils/device/DeviceAccess"
import SceneScenario3D from "./js/scenarios/Scenario3D/SceneScenario3D"

/** device access */
const btn = document.getElementById("btn-access")
btn.addEventListener("click", askMotionAccess(), false)

/** reload */
const btnReload = document.getElementById("btn-reload")
btnReload.addEventListener("click", function () {
    window.location.reload()
}, false)

/** scenarios */
const scene1 = new SceneBouncingBubbles(20)
const scene2 = new SceneScenario3D("canvas-scene-3d")
const scene3 = new SceneBouncingBubbles(10, "canvas-scene-2")

const windowContext = new WindowContext()
console.log(windowContext.scenes)
const time = windowContext.time

const update = () => {
    /** example */
    scene1.bubbles.forEach(b => {
        if (b.x < scene1.width / 2) {
            b.radius = 20
        } else {
            b.radius = 5
        }
    })

    /** 1 -> check des bulles dans les différents scénarios */
    const outFromScene1 = scene1.bubbles.filter(b => { return b.x > scene1.width / 2 }) // remove bubbles
    const outFromScene2 = scene2.bubbles.filter(b => { return b.x > scene1.width / 2 }) // remove bubbles

    /** 2 -> mise à jour des scénarios */
    outFromScene1.forEach(b => {
        // 1 - remove from scene 1 = update scene1.bubbles

        // 2 - add to other scene => sceneX.addBubble
        // b.vx
    })
    outFromScene2.forEach(b => {
        // 1 - remove from scene 2 = removeBubble(b)

        // 2 - add to other scene => sceneX.addBubble
        // b.vx
    })

    console.log(outFromScene1)
}

time.on('update', update)

