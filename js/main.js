window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.onload = function () {
    const WINDOW = {
        LEFT: -10,
        BOTTOM: -10,
        WIDTH: 20,
        HEIGHT: 20,
        P1: new Point(-10, 10, -30), // левый верхний угол
        P2: new Point(-10, -10, -30), // левый нижний угол
        P3: new Point(10, -10, -30), // правый нижний угол
        CENTER: new Point(0, 0, -30), // центр окошка, через которое видим мир -30
        CAMERA: new Point(0, 0, -50) // точка, из которой смотрим на мир 
    };

    const ZOOM_OUT = 1.1;
    const ZOOM_IN = 0.9;

    const sur = new Surfaces;
    const canvas = new Canvas({
        width: 600,
        height: 600,       //в wheel и mousemove пользователь "меняет" объект
        WINDOW, callbacks: { wheel, mousemove, mouseup, mousedown, mouseleave, mousemove }
    });
    const graph3D = new Graph3D({ WINDOW, callbacks: { move, printPoints, printEdges, printPolygons } });
    const ui = new UI({
        callbacks: { move, printPoints, printEdges, printPolygons, printAllSubjects }
    });

    // сцена
    const SCENE = [
        //sur.sphera(40, 6, new Point(0, 0, 5), '#ff0000', { rotateOz: new Point(0, 0, 5) }),
        /*sur.bublik(new Point(-20, 8, -7)),
         sur.bublik(new Point(20, 8, -7)),
         sur.hyperbParaboloid(new Point(0, 14, -20))
         sur.sphera(40, 3, new Point(6, 1, -3), '#8780d9'),
         sur.sphera(40, 2, new Point(-8, 0, -3), '#60cad1'),
         
         sur.cube(-20, 8, -7, 2),
         sur.cube(20, 8, -7, 2),
         sur.cube(-20, 8, -27, 2),
         sur.cube(-12, 8, -35, 2),
         sur.cube(20, 8, -27, 2),
         sur.cube(12, 8, -35, 2),
         sur.cube(0, 8, -39, 2),
         sur.bublik(new Point(-20, 8, -7)),
         sur.bublik(new Point(20, 8, -7)),
         sur.hyperbParaboloid(new Point(0, 14, -20))
         sur.cube(12, 8, -35, 2),
         sur.sphera(
             40,
             6,
             new Point(0, 0, 0),
             '#ac7580',
             //{ rotateOz: new Point }  
         ),
         sur.sphera(
             40,
             3,
             new Point(-6, 0, -6),
             '#ff00ff',
             { rotateOz: new Point (-6,0,-6),  rotateOz: new Point (0,0,0)}  
         ),
         sur.sphera(
             40,
             3,
             new Point(6, 1, -3),
             '#8780d9',
             { rotateOz: new Point(6, 1, -3) }    
         ),
         //sur.sphera(40, 2, new Point(-8, 0, -3), '#60cad1')*/
    ];

    // свет
    const LIGHT = new Light(-20, 2, -20, 500);

    let canRotate = false;

    let canPrint = {
        points: false,
        edges: false,
        polygons: true
    };

    // callbacks
    function wheel(event) {
        const delta = (event.wheelDelta > 0) ? ZOOM_IN : ZOOM_OUT;
        graph3D.zoomMatrix(delta);
        SCENE.forEach(subject => {
            subject.points.forEach(point => graph3D.transform(point));
            if (subject.animation) {
                for (let key in subject.animation) {
                    graph3D.transform(subject.animation[key]);
                }

            }
        });
    }

    function mouseup() {
        canRotate = false;
    }

    function mouseleave() {
        mouseup();
    }

    function mousedown() {
        canRotate = true;
    }

    function mousemove(event) {

        if (canRotate) {
            if (event.movementX) {// крутить вокруг OY
                const alpha = canvas.sx(event.movementX) / 10;
                graph3D.rotateOxMatrix(alpha);
                graph3D.transform(WINDOW.CAMERA);
                graph3D.transform(WINDOW.CENTER);
                graph3D.transform(WINDOW.P1);
                graph3D.transform(WINDOW.P2);
                graph3D.transform(WINDOW.P3);

            }
            if (event.movementY) {// крутить вокруг OX
                const alpha = canvas.sy(event.movementY) / 10;
                graph3D.rotateOyMatrix(alpha);
                graph3D.transform(WINDOW.CAMERA);
                graph3D.transform(WINDOW.CENTER);
                graph3D.transform(WINDOW.P1);
                graph3D.transform(WINDOW.P2);
                graph3D.transform(WINDOW.P3);
            }

        };
    };

    function move(direction) {
        switch (direction) {
            case 'up': graph3D.rotateOxMatrix(Math.PI / 180); break;
            case 'down': graph3D.rotateOxMatrix(-Math.PI / 180); break;
            case 'left': graph3D.rotateOyMatrix(Math.PI / 180); break;
            case 'right': graph3D.rotateOyMatrix(-Math.PI / 180); break;
        }
        graph3D.transform(WINDOW.CAMERA);
        graph3D.transform(WINDOW.CENTER);
        graph3D.transform(WINDOW.P1);     //поворот точек
        graph3D.transform(WINDOW.P2);
        graph3D.transform(WINDOW.P3);
    }

    function printPoints(value) {
        canPrint.points = value;
    }

    function printEdges(value) {
        canPrint.edges = value;
    }

    function printPolygons(value) {
        canPrint.polygons = value;
    }

    //render
    function printAllPolygons() {
        if (canPrint.polygons) {

            const polygons = [];
            // предварительные расчеты
            SCENE.forEach(subject => {
                graph3D.calcDistance(subject, WINDOW.CAMERA, 'distance');  // "я-художник": записать дистанцию от полигонов к камере
                //graph3D.calcGorner(subject, WINDOW.CAMERA); // отсечь невидимые грани (определяется видимость полигонов)
                graph3D.calcCenters(subject); // расчет центров
                graph3D.calcDistance(subject, LIGHT, 'lumen'); // рассчитать дистанцию от полигонов до источника света
            });

            // для каждого полигона считаем координаты (его проекцию на экран) и насыщенность его цвета (освещенность)
            SCENE.forEach(subject => {
                for (let i = 0; i < subject.polygons.length; i++) {
                    if (subject.polygons[i].visible) {
                        const polygon = subject.polygons[i];

                        const point1 = graph3D.getProection(subject.points[polygon.points[0]]);
                        const point2 = graph3D.getProection(subject.points[polygon.points[1]]);
                        const point3 = graph3D.getProection(subject.points[polygon.points[2]]);
                        const point4 = graph3D.getProection(subject.points[polygon.points[3]]);

                        let { r, g, b } = polygon.color;
                        const { isShadow, dark } = graph3D.calcShadow(polygon, subject, SCENE, LIGHT);
                        let lumen = (isShadow) ? dark : graph3D.calcIllumination(polygon.lumen, LIGHT.lumen);
                        r = Math.round(r * lumen);
                        g = Math.round(g * lumen);
                        b = Math.round(b * lumen);

                        //записываем нужное в новый объект в массиве polygons
                        polygons.push({
                            points: [point1, point2, point3, point4],
                            color: polygon.rgbToHex(r, g, b),
                            distance: polygon.distance
                        });
                    }
                }
            });
            // отрисовка всех отсортированных ( по distance от дальнего к ближнему ) полигонов
            polygons.sort((a, b) => b.distance - a.distance);
            polygons.forEach(polygon => canvas.polygon(polygon.points, polygon.color));
        }
    }

    function printAllSubjects(value) {
        while (SCENE.length !== 0) {
            SCENE.pop();
        }
        switch (value) {
            case "cube":
                SCENE.push(sur.cube());
                break;
            case "cilinder":
                SCENE.push(sur.cilinder());
                break;
            case "bublik":
                SCENE.push(sur.bublik());
                break;
            case "conus":
                SCENE.push(sur.conus());
                break;
            case "sphera":
                SCENE.push(sur.sphera());
                break;
            case "ellipsoid":
                SCENE.push(sur.ellipsoid());
                break;
            case "hyperCylinder":
                SCENE.push(sur.hyperbCylinder());
                break;
            case "parabCylinder":
                SCENE.push(sur.parabCylinder());
                break;
            case "ellipCylinder":
                SCENE.push(sur.ellipticCylinder());
                break;
            case "oneHyperbolid":
                SCENE.push(sur.oneHyperboloid());
                break;
            case "doubleHyperbolid":
                SCENE.push(sur.doubleHyperboloid());
                break;
            case "ellipsParaboloid":
                SCENE.push(sur.ellipticalParaboloid());
                break;
            case "hyperbolicParaboloid":
                SCENE.push(sur.hyperbParaboloid());
                break;
            case "sunSystem":
                SCENE.push(
                    sur.sphera(40, 10, new Point(0, 0, 0), "#f8fc03", {}), //солнце 
                    sur.sphera(20, 3, new Point(10, Math.sqrt(400 - 100), 0), "#2e0f05", { rotateOz: new Point }), // меркурий 
                    sur.sphera(20, 4, new Point(-23, Math.sqrt(1600 - 23 * 23), 0), "#6a738b", { rotateOz: new Point }), // венера 
                    sur.sphera(20, 4.4, new Point(0, 60, 0), "#2e3dfe", { rotateOz: new Point }), // земля 
                    sur.sphera(20, 3.6, new Point(-Math.sqrt(6400 - 32 * 32), -32, 0), "#fa0100", { rotateOz: new Point }), // марс 
                    sur.sphera(20, 8, new Point(Math.sqrt(120 * 120 - 110 * 110), -110, 0), "#fc5300", { rotateOz: new Point }), // юпитер 
                    sur.sphera(20, 7, new Point(150, 0, 0), "#e4cf00", { rotateOz: new Point }), // сатурн 
                    sur.bublik(20, 14, new Point(150, 0, 0), "#a48200", { rotateOz: new Point }), // кольцо сатурна
                    sur.sphera(20, 5.5, new Point(0, 180, 0), "#86aeff", { rotateOz: new Point }), // уран
                    sur.bublik(20, 12, new Point(0, 180, 0), "#86c5ff", { rotateOz: new Point }), // кольцо урана
                    sur.sphera(20, 5.3, new Point(-Math.sqrt(200 * 200 - 70 * 70), 70, 0), "#0263c5", { rotateOz: new Point }), // нептун
                );
                break;
        }
    }


    function printSubject(subject) {
        // нарисовать рёбра
        if (canPrint.edges) {
            for (let i = 0; i < subject.edges.length; i++) {
                const edge = subject.edges[i];
                const point1 = graph3D.getProection(subject.points[edge.p1]);
                const point2 = graph3D.getProection(subject.points[edge.p2]);
                canvas.line(point1.x, point1.y, point2.x, point2.y)
            }
        }

        //нарисовать точки
        if (canPrint.points) {
            for (let i = 0; i <= subject.points.length - 1; i++) {
                const points = graph3D.getProection(subject.points[i]);
                canvas.point(points.x, points.y);
            }
        }
    }


    function render() {
        canvas.clear();
        printAllPolygons();
        SCENE.forEach(subject => printSubject(subject));
        canvas.text(WINDOW.LEFT + 1, WINDOW.HEIGHT / 2 - 1, `FPS: ${FPSout}`);
        canvas.render();
        //зеленый треугольник: canvas.polygon([{x: -9, y: -9}, {x: 9, y: -9}, {x: 0, y: -1}]);
    }


    function animation() {
        // вращение фигуры !
        SCENE.forEach(subject => {
            //есть ли вообще анимация у объекта?
            if (subject.animation) {
                for (let key in subject.animation) {
                    const { x, y, z } = subject.animation[key];
                    //центр координат - конечная точка, центр объекта - начальная (вектор)
                    //вектор смещения
                    const xn = 0 - x;
                    const yn = 0 - y;
                    const zn = 0 - z;
                    const alpha = Math.PI / 180; // крутится по 1 градусу
                    // анимация с transform
                    // перемножив (multMutrixes) 3 разные матрицы (move, rotate, moveback) между собой, 
                    // мы получим общую результирующую матрицу, которая одна делает данное преобразование
                    graph3D.animateMatrix(xn, yn, zn, key, alpha, -xn, -yn, -zn);
                    subject.points.forEach(point => graph3D.transform(point));
                }
            }
        });
    }

    setInterval(animation, 30);


    //clearInterval(interval);  очистка интервала

    let FPS = 0;
    let FPSout = 0;
    let timestamp = (new Date()).getTime();

    (function animLoop() {
        //считаем FPS
        FPS++;
        const currentTimestamp = (new Date()).getTime();
        if (currentTimestamp - timestamp >= 1000) {
            timestamp = currentTimestamp;
            FPSout = FPS;
            FPS = 0;
        }
        graph3D.calcPlaneEquation(); //получить и записать плоскость экрана
        graph3D.calcWindowVectors(); //вычислить вектора экрана

        render();  //рисуем сцену
        requestAnimationFrame(animLoop);
    })();
};

/* "старая" анимация
// переместить центр объекта в центр координат
//перед тем как подвинуть точку, необходимо заполнить матрцу преобразований
                    graph3D.moveMatrix(xn, yn, zn);
                    subject.points.forEach(point => graph3D.transform(point));

                    // повращать объект
                    graph3D[`${key}Matrix`](alpha);
                    subject.points.forEach(point => graph3D.transform(point));

                    // переместить центр объекта после вращения обратно
                    graph3D.moveMatrix(-xn, -yn, -zn);
                    subject.points.forEach(point => graph3D.transform(point));   */
