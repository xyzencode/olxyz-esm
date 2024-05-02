/**
 *  The MIT License (MIT)
 *  Copyright (c) 2024 by @xyzendev - Adriansyah
 *  © 2024 by @xyzendev - Muhammad Adriansyah | MIT License
 */

import { baileys } from "@xyzendev/modules/core/main.modules.js";
import { fileTypeFromBuffer } from "@xyzendev/modules/core/second.modules.js";
import axios from "axios";
import FormData from "form-data";
import mimes from "mime-types";

const { toBuffer } = baileys;

export async function generateProfilePicture(buffer) {
    let Jimp = await import("jimp").then((jimp) => jimp.default);
    let jimp = await Jimp.read(buffer);
    const min = jimp.getWidth();
    const max = jimp.getHeight();
    const cropped = jimp.crop(0, 0, min, max);
    return {
        img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
        preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG)
    };
}
export function getRandom(ext) {
    return new Promise((resolve, reject) => {
        let a = Math.floor(Math.random() * 100000000000000000).toFixed(0)
        resolve(a + ext);
    })
}

export function uuid() {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}


export function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

export async function getBuffer(url, options) {
    try {
        options ? options : {};
        const res = await axios({
            method: "get",
            url,
            headers: {
                DNT: 1,
                "Upgrade-Insecure-Request": 1,
            },
            ...options,
            responseType: "arraybuffer",
        });
        return res.data;
    } catch (err) {
        return err;
    }
}

export function fetchBuffer(url, options = {}) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Upgrade-Insecure-Requests": "1",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
                ...(!!options.headers ? options.headers : {}),
            },
            responseType: "stream",
            ...options
        }).then(async ({
            data,
            headers
        }) => {
            let buffer = await toBuffer(data)
            let position = headers.get("content-disposition")?.match(/filename=(?:(?:"|')(.*?)(?:"|')|([^"'\s]+))/)
            let filename = decodeURIComponent(position?.[1] || position?.[2]) || null
            let mimetype = mimes.lookup(filename) || (await fileTypeFromBuffer(buffer)).mime || "application/octet-stream"
            let ext = mimes.extension(mimetype) || (await fileTypeFromBuffer(buffer)).ext || "bin"

            resolve({
                data: buffer,
                filename,
                mimetype,
                ext
            })
        }).catch(reject)
    })
}
export function fetchJson(url, options = {}) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
                ...(!!options.headers ? options.headers : {}),
            },
            responseType: "json",
            ...options
        }).then(({
            data
        }) => resolve(data)).catch(reject)

    })
}
export function isUrl(url) {
    let regex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,9}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, "gi")
    if (!regex.test(url)) return false
    return url.match(regex)
}

export const upload = {
    pomf(media) {
        return new Promise(async (resolve, reject) => {
            let mime = await fileTypeFromBuffer(media)
            let form = new FormData()

            form.append("files[]", media, `file-${Date.now()}.${mime.ext}`)

            axios.post("https://pomf.lain.la/upload.php", form, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
                    ...form.getHeaders()
                }
            }).then(({
                data
            }) => resolve(data.files[0].url)).catch(reject)
        })
    },
    telegra(media) {
        return new Promise(async (resolve, reject) => {
            let mime = await fileTypeFromBuffer(media)
            let form = new FormData()

            form.append("file", media, `file-${Date.now()}.${mime.ext}`)

            axios.post("https://telegra.ph/upload", form, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
                    ...form.getHeaders()
                }
            }).then(({
                data
            }) => resolve("https://telegra.ph" + data[0].src)).catch(reject)
        })
    }
}

export function formatSize(bytes, si = true, dp = 2) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return `${bytes} B`;
    }

    const units = si ?
        ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] :
        ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1
    );

    return `${bytes.toFixed(dp)} ${units[u]}`;
}

export function escapeRegExp(string) {
    return string.replace(/[.*=+:\-?^${}()|[\]\\]|\s/g, '\\$&')
}

export function toUpper(query) {
    const arr = query.split(" ")
    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1)
    }

    return arr.join(" ")
}