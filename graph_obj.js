function Graph(nodeCount, nodeConnections, nodeSize, nodePadding){
    this.nodes = [];
    this.nodeSize = nodeSize;
    this.arrowSize = nodeSize/2;
    this.nodePadding = nodePadding;
    this.nodeConnections = nodeConnections;
    //distance matrix
    this.distances = new Array(nodeCount);
    this.connection_matrix = new Array(nodeCount);

    //create (int) nodeCount nodes in graph
    for(var i=0; i<nodeCount; i++){
        //add new node to graph
        this.addNode(new Node(i));
        //make distance matrix 2d
        this.distances[i] = new Array(nodeCount);
        this.connection_matrix[i] = new Array(nodeCount);
        this.connection_matrix[i].fill(0);
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
        //nodes[i].positionNode();
        this.positionNode(nodes[i]);
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
                //nodes[i].positionNode();
                this.positionNode(nodes[i]);
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

Graph.prototype.positionNode = function (node) {
    //random position, don't allow node to overlap edge of canvas
    node.x = random(this.nodeSize/2, width-this.nodeSize/2);
    node.y = random(this.nodeSize/2, height-this.nodeSize/2);
}

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
        while( this.nodes[i].connections.length < this.nodeConnections ){
            var ind = distances[i].indexOf(Math.min(...distances[i]));
            this.nodes[i].connections.push(this.nodes[ind]);
            //connection matrix
            this.connection_matrix[i][ind] = 1;
            distances[i][ind] = 999999;
        }
    }
};


Graph.prototype.render = function () {
    var that = this;

    this.nodes.forEach(function(node){
        //render node connections
        for(var i=0; i<node.connections.length; i++){
            var connection_id = node.connections[i].id;

            //check for two way direction
            //console.log(node.id);
            //console.log(that.connection_matrix[node.id][i]);
             var two_way = ( that.connection_matrix[node.id][connection_id]) && (that.connection_matrix[connection_id][node.id]);


             //console.log(two_way+" - "+node.id+","+i);

            if( two_way ){

                var controlPoints = that.bezierControlPoints(node,node.connections[i]);
                noFill();
                bezier(node.x, node.y,
                        controlPoints[0].x,controlPoints[0].y,
                        controlPoints[1].x,controlPoints[1].y,
                        node.connections[i].x,node.connections[i].y);
                fill(0);
                that.renderArrow(controlPoints[1],node.connections[i]);

            }else{

                line(node.x, node.y, node.connections[i].x,node.connections[i].y);
                that.renderArrow(node,node.connections[i]);

            }

        }
    });

    //render node last to hide line origins
    this.nodes.forEach(function(node) {
        fill(node.fill);
        ellipse(node.x, node.y, that.nodeSize, that.nodeSize);
        fill(0);
        textSize(that.nodeSize/2);
        text(node.id, node.x, node.y+that.nodeSize/4);
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


/*
https://stackoverflow.com/questions/133897/how-do-you-find-a-point-at-a-given-perpendicular-distance-from-a-line
*/
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
    var d = dist(node1.x,node1.y, node2.x,node2.y);

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
