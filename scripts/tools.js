export function Pick(...args) {
    for (let i = 0; i < args.length; i++) {
        let value = args[i];
        if (value) {
            return value;
        }
    }
}

export function Value(value) {
    if (value) {
        return value;
    } else {
        return 0;
    }
}