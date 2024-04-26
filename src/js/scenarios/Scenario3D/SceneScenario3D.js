import * as THREE from "three"
import Scene3D from "../../canvas-3d-threejs/Scene3D"
import { randomRange } from "../../utils/MathUtils"
import { Bodies, Body, Composite, Engine, Runner } from "matter-js"
import { clamp } from "three/src/math/MathUtils.js"

class Bubble extends THREE.Mesh {
    constructor(radius, color) {
        super()
        // this.geometry = new THREE.SphereGeometry(radius)
        this.geometry = new THREE.BoxGeometry(2 * radius, 2 * radius, 2 * radius)
        this.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) })

        /** body */
        // this.body = Bodies.circle(0, 0, radius)
        this.body = Bodies.rectangle(0, 0, 2 * radius, 2 * radius)
    }

    setPosition(x, y) {
        /** threejs */
        this.position.set(x, y, 0)

        /** matter js */
        Body.setPosition(this.body, { x: x, y: -y }) // !! sign
    }

    update() {
        this.position.x = this.body.position.x
        this.position.y = -this.body.position.y
        this.rotation.z = -this.body.angle
    }
}

class Wall extends THREE.Mesh {
    constructor(color) {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) })
        super(geometry, material)

        this.depth = 1

        /** body */
        this.body = Bodies.rectangle(0, 0, 1, 1, { isStatic: true })
    }

    setSize(width, height) {
        const oldScaleX_ = this.scale.x
        const oldScaleY_ = this.scale.y
        Body.scale(this.body, width / oldScaleX_, height / oldScaleY_)
        this.scale.set(width, height, this.depth)
    }

    setPosition(x, y) {
        /** threejs */
        this.position.set(x, y, 0)

        /** matter js */
        Body.setPosition(this.body, { x: x, y: -y }) // !! sign
    }
}

export default class SceneScenario3D extends Scene3D {
    constructor(id = "canvas-scene", nBubbles = 10) {
        super(id)

        /** change default camera -> orthographic camera */
        this.camera = new THREE.OrthographicCamera(
            -this.width / 2, this.width / 2,
            this.height / 2, -this.height / 2
        )
        this.camera.position.z = 100

        /** wall */
        this.wallLeft = new Wall('blue')
        // this.wallTop = new Wall('yellow')
        this.wallRight = new Wall('blue')
        // this.wallBottom = new Wall('yellow')
        this.add(this.wallLeft)
        // this.add(this.wallTop)
        this.add(this.wallRight)
        // this.add(this.wallBottom)

        this.wallLeft.depth = 100
        // this.wallTop.depth = 100
        this.wallRight.depth = 100
        // this.wallBottom.depth = 100

        /** bubbles */
        this.bubbles = []
        const radius_ = 20
        const colors = ['red', 'blue', 'yellow']
        for (let i = 0; i < nBubbles; i++) {
            const bubble_ = new Bubble(radius_, colors[i % colors.length])
            const x_ = randomRange(-this.width / 2, this.width / 2)
            const y_ = randomRange(-this.height / 2, this.height / 2)
            bubble_.setPosition(x_, y_)
            this.add(bubble_)
            this.bubbles.push(bubble_)
        }

        /** physics engine */
        this.bodies = [
            this.wallLeft.body,
            // this.wallTop.body,
            this.wallRight.body
            // this.wallBottom.body
        ]
        this.bubbles.forEach(b => this.bodies.push(b.body))
        this.engine = Engine.create({ render: { visible: false } })
        Composite.add(this.engine.world, this.bodies)
        this.runner = Runner.create()
        Runner.run(this.runner, this.engine)
        console.log(this.engine.gravity) // default
        this.engine.gravity.scale *= 3

        /** device motion */
        this.windowContext.useDeviceAcceration = true
        this.acceleration = this.windowContext.acceleration

        /** init */
        this.resize()
    }

    addBubble(x, y) {
        // to do

        // !! update Composite
    }

    removeBubble(bubble) {
        bubble.geometry.dispose()
        bubble.material.dispose()
        bubble.removeFromParent()

        // remove from physics engine = update Composite

        // remove from this.bubbles

    }

    update() {
        super.update()

        if (!!this.bubbles) {
            this.bubbles.forEach(b => b.update())
        }
    }

    // onDeviceOrientation() {
    //      /** gravity orientation */
    //     let gx_ = this.orientation.gamma / 90 // -1 : 1
    //     let gy_ = this.orientation.beta / 90 // -1 : 1
    //     gx_ = clamp(gx_, -1, 1)
    //     gy_ = clamp(gy_, -1, 1)

    //     /** debug */
    //     let coordinates_ = ""
    //     coordinates_ = coordinates_.concat(gx_.toFixed(2), ", ", gy_.toFixed(2))
    //     this.debug.domDebug = coordinates_

    //     /** update */
    //     this.engine.gravity.x = gx_
    //     this.engine.gravity.y = gy_
    // }

    onDeviceAcceleration() {
        /** debug */
        let coordinates_ = ""
        coordinates_ = coordinates_.concat(
            this.acceleration.x.toFixed(2), ", ",
            this.acceleration.y.toFixed(2), ", ",
            this.acceleration.z.toFixed(2)
        )
        this.debug.domDebug = coordinates_

        /** update */
        this.engine.gravity.x = -this.acceleration.x / 9.81
        this.engine.gravity.y = this.acceleration.y / 9.81
        // this.engine.gravity.scale
    }

    resize() {
        super.resize()

        this.camera.left = -this.width / 2
        this.camera.right = this.width / 2
        this.camera.top = this.height / 2
        this.camera.bottom = - this.height / 2

        if (!!this.wallLeft) {
            const thickness_ = 10

            /** walls sizes */
            this.wallLeft.setSize(thickness_, this.height)
            // this.wallTop.setSize(this.width - 2 * thickness_, thickness_)
            this.wallRight.setSize(thickness_, this.height)
            // this.wallBottom.setSize(this.width - 2 * thickness_, thickness_)

            /** walls position */
            this.wallLeft.setPosition(-this.width / 2 + thickness_ / 2, 0)
            // this.wallTop.setPosition(0, this.height / 2 - thickness_ / 2)
            this.wallRight.setPosition(this.width / 2 - thickness_ / 2, 0)
            // this.wallBottom.setPosition(0, -this.height / 2 + thickness_ / 2)
        }
    }
}