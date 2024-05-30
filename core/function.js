/**
 *  The MIT License (MIT)
 *  Copyright (c) 2024 by @xyzendev - Adriansyah
 *  © 2024 by @xyzendev - Muhammad Adriansyah | MIT License
 */
export function escapeRegExp(string) {
    return string.replace(/[.*=+:\-?^${}()|[\]\\]|\s/g, '\\$&')
}