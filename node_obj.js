function Node(id){
    this.id = id;
    this.data = null;
    this.connections = [];
    this.fill = 255;

    this.x=0;
    this.y=0;
}
Node.prototype.positionNode = function () {
    //random position, don't allow node to overlap edge of canvas
    this.x = random(nodeSize/2, width-nodeSize/2);
    this.y = random(nodeSize/2, height-nodeSize/2);
};
Node.prototype.click = function () {
    //change fill color
    this.fill = "rgb(255, 153, 0)";
    //change connections fill
    for(var i=0; i<this.connections.length; i++){
        this.connections[i].fill = "rgb(153, 204, 0)";
    }
};
Node.prototype.unclick = function () {
    //change fill color
    this.fill = 255;
};
