
p5.prototype.bezierFromLine = function(x1,y1,x2,y2, pull) {
    var control_length = pull;

    var position = createVector(x1,y1);
    var vector = createVector(x2-x1,y2-y1);

    //find midpoint
    var mid = createVector((x1 + x2)/2, (y1 + y2)/2);
    //find 1st quarter point
    var q1 = createVector((x1 + mid.x)/2, (y1 + mid.y)/2);
    //find 3rd quarter point
    var q3 = createVector((mid.x + x2)/2, (mid.y + y2)/2);

    ///unti vector of line
    var d = vector.mag();
    //line heading (direction)
    var head = vector.heading();

    //if line has a positive "slope"
    //if( (head > 0 && head < HALF_PI) || (head < -PI && head > HALF_PI) ){
    if( pull > 0 ){
        var control_1 = createVector(q1.x+(pull*dy), q1.y-(pull*dx));
        var control_2 = createVector(q3.x+(pull*dy), q3.y-(pull*dx));
    }else{
        var control_1 = createVector(q1.x-(pull*dy), q1.y+(pull*dx));
        var control_2 = createVector(q3.x-(pull*dy), q3.y+(pull*dx));
    }

    bezier(x1,y1,control_1.x,control_1.y,control_2.x,control_2.y,x2,y2);
}

p5.prototype.lineUnitVector = function(x1,y1,x2,y2){
    var v;
    //assume vectors if first arg has x and y property
    if( typeof x1.x === "number"  && x1.y === "number" ){
        v = createVector(y1.x-x1.x, y1.y-x1.y);
    }else {
        v = createVector(x2-x1,y2-y1);
    }
    return v.normalize();
}

p5.prototype.lineMidpoint = function(x1,y1,x2,y2) {

}
