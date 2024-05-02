/**
 *  Source from : https://github.com/pkrumins/node-tree-kill
 * 
 *  The MIT License (MIT)
 *  Copyright (c) 2024 by @xyzendev - Adriansyah
 *  © 2024 by @xyzendev - Adriansyah | MIT License
 */

"use strict";

import { spawn, exec } from "@xyzendev/modules/core/second.modules.js";

export default function (e, r, n) { if ("function" == typeof r && void 0 === n && (n = r, r = void 0), e = parseInt(e), Number.isNaN(e)) { if (n) return n(new Error("pid must be a number")); throw new Error("pid must be a number") } var i = {}, t = {}; switch (i[e] = [], t[e] = 1, process.platform) { case "win32": exec("taskkill /pid " + e + " /T /F", n); break; case "darwin": buildProcessTree(e, i, t, (function (e) { return spawn("pgrep", ["-P", e]) }), (function () { killAll(i, r, n) })); break; default: buildProcessTree(e, i, t, (function (e) { return spawn("ps", ["-o", "pid", "--no-headers", "--ppid", e]) }), (function () { killAll(i, r, n) })) } } function killAll(e, r, n) { var i = {}; try { Object.keys(e).forEach((function (n) { e[n].forEach((function (e) { i[e] || (killPid(e, r), i[e] = 1) })), i[n] || (killPid(n, r), i[n] = 1) })) } catch (e) { if (n) return n(e); throw e } if (n) return n() } function killPid(e, r) { try { process.kill(parseInt(e, 10), r) } catch (e) { if ("ESRCH" !== e.code) throw e } } function buildProcessTree(e, r, n, i, t) { var o = i(e), c = ""; o.stdout.on("data", (function (e) { e = e.toString("ascii"); c += e })); o.on("close", (function (o) { delete n[e], 0 == o ? c.match(/\d+/g).forEach((function (o) { o = parseInt(o, 10), r[e].push(o), r[o] = [], n[o] = 1, buildProcessTree(o, r, n, i, t) })) : 0 == Object.keys(n).length && t() })) }