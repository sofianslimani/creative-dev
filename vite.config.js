import pluginTerminal from "vite-plugin-terminal"
import mkcert from "vite-plugin-mkcert"

export default {
    root: 'src',
    build: {
        outDir: '../dist'
    },
    server: {
        https: false
    },
    plugin: [
        mkcert(), // npm i -D vite-plugin-mkcert
        pluginTerminal({ console: 'terminal' })
    ] 
}