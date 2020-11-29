function main({x, xs, y, ys}) {
    x = x();
    y = y();
    xs = xs();
    ys = ys();

    let z = x + y;
    let zs = [];

    for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
        zs.push(xs[i] + ys[i]);
    }

    return [z, zs];
}

export default { main };
