/**
 *  The MIT License (MIT)
 *  Copyright (c) 2024 by @xyzendev - Adriansyah
 *  © 2024 by @xyzendev - Muhammad Adriansyah | MIT License
 */

import { treeKill } from "./core/index.js";
import { cfonts, fs, path } from "@xyzendev/modules/core/main.modules.js";
import { spawn } from "@xyzendev/modules/core/second.modules.js";

let activeProcess = null

console.clear();

function start(file) {
    if (activeProcess) {
        treeKill(activeProcess.pid, "SIGTERM", (err) => {
            if (err) {
                console.error("Error stopping process:", err)
            } else {
                console.log("Process stopped.")
                activeProcess = null
                start(file)
            }
        })
    } else {
        cfonts.say("Starting...", {
            font: "simple",
            align: "center",
            colors: ["system"],
            background: "transparent",
            letterSpacing: 1,
            lineHeight: 1,
            space: true
        })
        let args = [path.join(process.cwd(), file), ...process.argv.slice(2)]
        let p = spawn(process.argv[0], args, {
            stdio: ["inherit", "inherit", "inherit", "ipc"]
        })
            .on("message", (data) => {
                console.log("[RECEIVED]", data)
                switch (data) {
                    case "reset":
                        start(file)
                        break
                    case "uptime":
                        p.send(process.uptime())
                        break
                }
            })
            .on("exit", (code) => {
                console.error("Exited with code:", code)
                if (code === 0) return
                fs.watchFile(args[0], () => {
                    fs.unwatchFile(args[0])
                    start(file)
                })
            })

        activeProcess = p
    }
}

start("main.js")