let subjectId = 0;

class Subject {   //объект, в котором все рисуем
    constructor(points = [], edges = [], polygons = [], animation = null) {
        this.id = ++subjectId;
        this.points = points;
        this.edges = edges;
        this.polygons = polygons;

        //свойство animation - хочу, чтоб крутилось!
        //объект, внутри которого планируем анимацию для каждого объекта
        this.animation = animation;
    }
}