function Graph(nodeCount){
    this.nodes = [];
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

    //for each node in graph
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
                    if(dist_between < nodePadding+nodeSize ){
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

            if(placements>1000){
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
            line(node.x, node.y, node.connections[i].x,node.connections[i].y);
        }
    });

    //render node last to hide line origins
    this.nodes.forEach(function(node) {
        fill(node.fill);
        ellipse(node.x, node.y, nodeSize, nodeSize);
        fill(0);
        text(node.id, node.x, node.y+nodeSize/4);
    });
};
