Surfaces.prototype.cilinder = (point = new Point(0, 0, 0), color = '#7B68EE', size = 3, h = 5, count = 20) => {
    function circlexy(point, size, angley = 0, count = 20) {
        for (let i = 0; i < count; i++) {
            points.push(new Point(
                point.x + size * Math.sin(Math.PI * 2 * (i / count)) * Math.sin(angley / 180 * Math.PI),
                point.y + size * Math.sin(Math.PI * 2 * (i / count)) * Math.cos(angley / 180 * Math.PI),
                point.z + size * Math.cos(Math.PI * 2 * (i / count)), 
                2
            ))
        }
    }

    const points = [], e = [], poly = [];

    //точки

    for(let i = 0; i < size; i++) {
        circlexy(new Point(point.x, point.y - h, point.z), i, 90, count);
    }

    for (let i = -h; i <= h; i++) {
        circlexy(new Point(point.x, point.y + i, point.z), size, 90);
    }

    for(let i = 0; i < size; i++) {
        circlexy(new Point(point.x, point.y + h, point.z), i, 90, count);
    }

    //рёбра


    for(let i = 0; i < h * 2 + size * 2; i++){
        for(let j = 0; j < count; j++){
            e.push(new Edge(count * i + j, count * (i + 1) + j));
        }
    }

    for(let i = 0; i < points.length - 1; i++){
        if((i + 1) % count !== 0){
            e.push(new Edge(i, i + 1));
        } else {
            e.push(new Edge(i, i - count + 1));
        }
        if(i === points.length - 2){
            e.push(new Edge(points.length - 1, points.length - count));
        }
    }

    //полигоны
    for(i = 0; i < h * 2 + size * 2; i++){
        for(j = 0; j < count; j++) {
            if ((j + 1) % count !== 0) {
                poly.push(new Polygon([count * i + j, count * i + j + 1, count * (i + 1) + j + 1, count * (i + 1) + j], color));
            } else {
                poly.push(new Polygon([count * i, count * (i + 1) - 1, count * (i + 2) - 1, count * (i + 1)], color));
            }

    
//         if (i + 1 + count < points.length && (i + 1 % count !== 0)){
//if(i % 2 == 0){
//poly.push(new Polygon([i, i + 1, i + 1 + count, i + count],'#000000'));
//}
//else{
//poly.push(new Polygon([i, i + 1, i + 1 + count, i + count],'#FFFFFF'));
//}
//}
/////////////////////////////////////////////////////////////////////////////////////
//  Пытался сделать зебру, но элипс пропадал, закоментированная выше моя попытка.  //
/////////////////////////////////////////////////////////////////////////////////////
        }
    }

    j = 0;
        for (let i = 0; i < poly.length; i++) {
            j += 1;
            if (j % 2 == 0) {
                poly[i].color = { r: 0, g: 0, b: 0 };
            }
           // if (j == 20) {
           //     j = 0;
           // }
        }
    //j = 0;
    //    for (let i = 0; i < poly.length; i++) {
    //        j += 1;
    //        if (j == 19) {
    //            for (let k = 1; k <= 19; k++) {
    //                poly[i + k].color = { r: 0, g: 0, b: 0 };
    //                k += 1;
    //            }
    //            i += 19;
    //            j = 0;
    //        }
    //    }
    
    return new Subject(points, e, poly);
}