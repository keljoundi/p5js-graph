function Graph(nodeCount, nodeSize, nodePadding){
    this.nodes = [];
    this.nodeSize = nodeSize;
    this.arrowSize = nodeSize/2;
    this.nodePadding = nodePadding;
    //distance matrix
    this.distances = new Array(nodeCount);

    //create (int) nodeCount nodes in graph
    for(var i=0; i<nodeCount; i++){
        //add new node to graph
        this.addNode(new Node(i));
        //make distance matrix 2d
        this.distances[i] = new Array(nodeCount);
    }
}

Graph.prototype.addNode = function (node) {
    this.nodes.push(node);
};

Graph.prototype.positionNodes = function () {
    var placements = 0;
    var nodes = this.nodes;

    for(var i=0; i<nodes.length; i++){
        //place node on map
        nodes[i].positionNode();
        //assume collision to start loop
        var collision = true;

        while( collision ){
            //count attempts at placement
            placements++;
            //assume no collision
            collision = false;

            //check for collisions with every other node
            for(var j=0; j<nodes.length; j++) {
                //do NOT check for distance from self
                if( i !== j ){
                    var dist_between = dist(nodes[i].x,nodes[i].y, nodes[j].x,nodes[j].y);
                    //check for collision
                    if(dist_between < this.nodePadding+this.nodeSize ){
                        collision = true;
                        break;
                    }
                    //save distance in distance matrix
                    //  value will be overwritten in event of collision
                    this.distances[i][j] = dist_between;
                    this.distances[j][i] = dist_between;
                }
            }

            //reposition node if necessary
            if( collision ) {
                nodes[i].positionNode();
            }
            //return if we have hit our position attempt limit
            if(placements>10000){
                return false;
            }
        }
    }

    //if algorithm has run its course, return "success"
    return true;
};


Graph.prototype.makeConnections = function () {
    //copy distances to make non-destructive
    var distances = new Array(this.distances.length);
    for(var i=0; i<this.distances.length; i++){
        distances[i] = new Array(this.distances[i].length);
        for(var j=0;j<this.distances[i].length; j++){
            distances[i][j] = this.distances[i][j];
        }
    }

    for(var i=0; i<distances.length; i++){

        //set self as unreasonably long distance
        distances[i][i] = 999999;

        //get next three min distances
        while( this.nodes[i].connections.length < 3 ){
            var ind = distances[i].indexOf(Math.min(...distances[i]));
            this.nodes[i].connections.push(this.nodes[ind]);
            distances[i][ind] = 999999;
        }
    }
};


Graph.prototype.render = function () {
    var that = this;

    this.nodes.forEach(function(node){
        //render node connections
        for(var i=0; i<node.connections.length; i++){
            //line(node.x, node.y, node.connections[i].x,node.connections[i].y);
            var controlPoints = that.bezierControlPoints(node,node.connections[i]);
            noFill();
            bezier(node.x, node.y,
                    controlPoints[0].x,controlPoints[0].y,
                    controlPoints[1].x,controlPoints[1].y,
                    node.connections[i].x,node.connections[i].y);

            //draw arrow along connection line
            fill(0);
            that.renderArrow(controlPoints[1],node.connections[i]);
        }
    });

    //render node last to hide line origins
    this.nodes.forEach(function(node) {
        fill(node.fill);
        ellipse(node.x, node.y, this.nodeSize, this.nodeSize);
        fill(0);
        text(node.id, node.x, node.y+this.nodeSize/4);
    });
};


Graph.prototype.renderArrow = function(node1, node2) {
    push(); //new drawing state
    var angle = atan2(node1.y - node2.y, node1.x - node2.x);
    translate(node2.x, node2.y);
    rotate(angle-HALF_PI);
    triangle(-this.nodeSize*0.25, this.nodeSize, this.nodeSize*0.25, this.nodeSize, 0, this.nodeSize/2);
    pop(); //end drawing state
}


// Graph.prototype.bezierControlPoints = function(node1, node2) {
//     //slope
//     var slope = node2.y - node1.y / node2.x - node1.x;
//     var p_slope = -1 / slope;
//     //find midpoint
//     var mid = createVector((node1.x + node2.x)/2, (node1.y + node2.y)/2);
//     //find 1st quarter point
//     var q1 = createVector((node1.x + mid.x)/2, (node1.y + mid.y)/2);
//     //find 3rd quarter point
//     var q3 = createVector((mid.x + node2.x)/2, (mid.y + node2.y)/2);
//
//     /*
//         add special cases for vertical or near-vertical lines!
//     */
//     // if( abs(slope) > 1 ){
//     //     if(slope<0){
//     //         q1.x -= 15;
//     //         q3.x -= 15;
//     //     }else{
//     //         q1.x += 15;
//     //         q3.x += 15;
//     //     }
//     // }else{
//     //     if(slope<0){
//     //         q1.y += 15;
//     //         q3.y += 15;
//     //     }else{
//     //         q1.y -= 15;
//     //         q3.y -= 15;
//     //     }
//     // }
//
//     var q1_ = q1
//
//
//     return [q1,q3];
// }


Graph.prototype.bezierControlPoints = function(node1, node2) {
    var control_length = 20;

    //slope
    var slope = node2.y - node1.y / node2.x - node1.x;
    //find midpoint
    var mid = createVector((node1.x + node2.x)/2, (node1.y + node2.y)/2);
    //find 1st quarter point
    var q1 = createVector((node1.x + mid.x)/2, (node1.y + mid.y)/2);
    //find 3rd quarter point
    var q3 = createVector((mid.x + node2.x)/2, (mid.y + node2.y)/2);

    //delta X, Y
    var dx = node1.x - node2.x;
    var dy = node1.y - node2.y;

    //distance
    var d = dist(node1, node2);

    //normalize?
    dx /= d;
    dy /= d;

    if( slope ){
        var control_1 = createVector(q1.x+(control_length*dy), q1.y-(control_length*dx));
        var control_2 = createVector(q3.x+(control_length*dy), q3.y-(control_length*dx));
    }else{
        var control_1 = createVector(q1.x-(control_length*dy), q1.y+(control_length*dx));
        var control_2 = createVector(q3.x-(control_length*dy), q3.y+(control_length*dx));
    }


    return [control_1,control_2];
}
