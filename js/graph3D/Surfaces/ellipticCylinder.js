//Вариант 23.	Эллиптический Цилиндр. Раскрасить полигоны сеткой (“решеткой”)

Surfaces.prototype.ellipticCylinder = (count = 20, color) => {

    let points = [];
    let edges = [];
    let polygons = [];
    const PI = Math.PI;
    let delta = 2 * PI / count;
    const h = 10 // высота цилиндра
    let a = 3, b = 5;

    //Верхнее основание цилиндра
    for (let i = 0; i <= PI; i += delta * 2) {
        for (let j = 0; j < 2 * PI; j += delta) {
            const x = Math.cos(i) * Math.cos(j) * a;
            const y = Math.sin(j) * b;
            const z = 0;
            points.push(new Point(x, y, z));
        }
    }

    //Боковая поверхность цилиндра
    for (let p = 0; p < h; p++) {
        for (let i = 0; i <= PI; i += delta * 2 + count) {
            for (let j = 0; j < 2 * PI; j += delta) {
                const x = Math.cos(i) * Math.cos(j) * a;
                const y = Math.sin(j) * b;
                const z = p;
                points.push(new Point(x, y, z));
            }
        }
    }

    //Нижнее основание цилиндра
    for (let i = 0; i <= PI; i += delta * 2) {
        for (let j = 0; j < 2 * PI; j += delta) {
            const x = Math.cos(i) * Math.cos(j) * a;
            const y = Math.sin(j) * b;
            const z = h - 1;
            points.push(new Point(x, y, z));
        }
    }

    //Рёбра и полигоны
    for (let i = 0; i < points.length; i++) {
        if ((i + 1) < points.length && (i + 1) % count !== 0) {
            edges.push(new Edge(i, i + 1))
        }
        if (i + count < points.length) {
            edges.push(new Edge(i, i + count))
        }
        if ((i + 1) >= count && (i + 1) % count === 0) {
            edges.push(new Edge(i, i - count + 1))
        }
        if (i + 1 + count < points.length && (i + 1) % count !== 0) {
            polygons.push(new Polygon([i, i + 1, i + 1 + count, i + count], color));
        }
        if ((i + 1) >= count && i + count < points.length && (i + 1) % count === 0) {
            polygons.push(new Polygon([i, i - count + 1, i + 1, i + count], color));
        }
    }
        let j = 0;
        for (let i = 0; i < polygons.length; i++) {
            j += 1;
            if (j % 2 == 0) {
                polygons[i].color = { r: 0, g: 0, b: 0 };
            }
            if (j == 19) {
                j = 0;
            }
        }
        j = 0;
        for (let i = 0; i < polygons.length; i++) {
            j += 1;
            if (j == 19) {
                for (let k = 1; k <= 19; k++) {
                    polygons[i + k].color = { r: 0, g: 0, b: 0 };
                    k += 1;
                }
                i += 19;
                j = 0;
            }

        }
    return new Subject(points, edges, polygons);
}