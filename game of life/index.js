//set up the canvas to draw to
const canvas=document.querySelector('canvas');
const c=canvas.getContext('2d');

// Color constants
const COLORS = {
    LIVE: "BLUE",    // Yellow for live cells
    BIRTH: "#32CD32",   // Lime green for new births
    DEATH: "#FF0000",   // Red for deaths
    DEAD: "#000000"     // Black for dead cells
};

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

c.fillStyle=("#000000");
c.fillRect(20,20,20,20);


class Cell{
    constructor(x,y,alive){
        this.x=x;
        this.y=y;
        this.alive=alive;
        this.neighbours=0;
        this.deathAge = 0; // Track how many cycles since death
    }
    birth=()=>{
        this.alive=true;
        this.deathAge = 0;
        console.log("birth @: ("+this.x+","+this.y+")");
    }
    death=()=>{
        this.alive=false;
        this.deathAge = 1; // Start counting cycles since death
        console.log("death @: ("+this.x+","+this.y+")");
    }
    isAlive(){
        return this.alive;
    }
    setNeighbours(num){
        this.neighbours=num;
    }
    getNeighbours(){
        return this.neighbours;
    }
    incrementDeathAge() {
        if (!this.alive) {
            this.deathAge++;
        }
    }
    getDeathAge() {
        return this.deathAge;
    }
}

class World{

    constructor(rows,columns){
        this.rows=rows;
        this.columns=columns;
        this.blockWidth=Math.ceil(canvas.width/rows);
        this.blockHeight=Math.ceil(canvas.height/columns);
        this.gridArray=[];
        this.cellBuffer=[]; // Single buffer for all cell updates
        this.previousState = null;
    }

    activateCell(x,y){
        for(let i=0;i<canvas.width;i+=this.blockWidth){
            for(let j=0;j<canvas.height;j+=this.blockHeight){
                if(i>=x && j>=y){
                c.fillStyle=("black");
                c.fillRect(i,j,this.blockWidth,this.blockHeight);
                c.fillStyle=("green");
                c.fillRect(i,j,this.blockWidth,this.blockHeight);
                this.gridArray[i][j].birth();
                return;}
            }
        }
    }
    
    populate(){
        for(let i =0;i<this.rows;i++){
            this.gridArray.push([]);
            for(let j=0;j<this.columns;j++){
                this.gridArray[i].push(new Cell(i,j,false));
            }
        }
    }
    printGrid(){
        for(let i=0;i<this.rows;i++){
            console.log("\n");
            for(let j=0;j<this.columns;j++){
                console.log("| ("+this.gridArray[i][j].x+","+this.gridArray[i][j].y+") |");
            }
        }
    }

    paintCell(x,y,color){
        // Clear the cell area
        c.fillStyle="black";
        c.fillRect(x*this.blockWidth,y*this.blockHeight,this.blockWidth,this.blockHeight);
        
        // Draw the circle
        c.fillStyle=color;
        const centerX = x*this.blockWidth + this.blockWidth/2;
        const centerY = y*this.blockHeight + this.blockHeight/2;
        const radius = Math.min(this.blockWidth, this.blockHeight) * 0.4; // 80% of the smaller dimension
        c.beginPath();
        c.arc(centerX, centerY, radius, 0, Math.PI * 2);
        c.fill();
    }

    checkLiveNeighbours(x,y){
        let count=0;
        
        // Helper function to handle wrapping
        const wrap = (val, max) => {
            if (val < 0) return max - 1;
            if (val >= max) return 0;
            return val;
        };

        // Check all 8 neighbors with wrapping
        const neighbors = [
            [x+1, y+1], [x+1, y], [x+1, y-1],  // right side
            [x, y+1], [x, y-1],                 // top and bottom
            [x-1, y+1], [x-1, y], [x-1, y-1]   // left side
        ];

        for (let [nx, ny] of neighbors) {
            // Wrap coordinates
            const wrappedX = wrap(nx, this.rows);
            const wrappedY = wrap(ny, this.columns);
            
            if (this.gridArray[wrappedX][wrappedY].isAlive()) {
                count++;
            }
        }

        this.gridArray[x][y].setNeighbours(count);
    }

    scanGrid(){
        // Only scan cells that are alive or adjacent to alive cells
        const cellsToScan = new Set();
        
        // First pass: find all cells that need to be scanned
        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < this.columns; j++){
                if(this.gridArray[i][j].isAlive()) {
                    // Add the cell and its neighbors to the scan set
                    for(let di = -1; di <= 1; di++) {
                        for(let dj = -1; dj <= 1; dj++) {
                            const ni = (i + di + this.rows) % this.rows;
                            const nj = (j + dj + this.columns) % this.columns;
                            cellsToScan.add(`${ni},${nj}`);
                        }
                    }
                }
            }
        }
        
        // Second pass: only scan the cells we identified
        for(const cellKey of cellsToScan) {
            const [i, j] = cellKey.split(',').map(Number);
            this.checkLiveNeighbours(i, j);
        }
    }

    // Helper method to create a deep copy of the grid state
    getGridState() {
        return this.gridArray.map(row => 
            row.map(cell => cell.isAlive())
        );
    }

    tick(){
        const currentState = this.getGridState();
        
        // First scan the grid to get neighbor counts
        this.scanGrid();
        
        // Update cell states based on Conway's rules
        for(let i =0;i<this.rows;i++){
            for(let j=0;j<this.columns;j++){
                let currentCell=this.gridArray[i][j];
                const neighbors = currentCell.getNeighbours();
                const isAlive = currentCell.isAlive();
                
                if(isAlive) {
                    // Rule 1 & 3: Die if fewer than 2 or more than 3 neighbors
                    if(neighbors < 2 || neighbors > 3) {
                        currentCell.death();
                        this.cellBuffer.push([i,j,COLORS.DEATH]); // Red for deaths
                    } else {
                        // Rule 2: Survive if 2 or 3 neighbors
                        this.cellBuffer.push([i,j,COLORS.LIVE]); // Yellow for surviving cells
                    }
                } else {
                    // Rule 4: Birth if exactly 3 neighbors
                    if(neighbors === 3) {
                        currentCell.birth();
                        this.cellBuffer.push([i,j,COLORS.BIRTH]); // Lime green for births
                    }
                }
            }
        }

        this.previousState = currentState;
    }

    initRender(){
        // Clear to black
        c.fillStyle = COLORS.DEAD;
        c.fillRect(0, 0, canvas.width, canvas.height);
        
        for(let i =0;i<this.rows;i++){
            for(let j=0;j<this.columns;j++){
                let currentCell=this.gridArray[i][j];
                if(!currentCell.alive) {
                    this.paintCell(i,j,COLORS.DEAD);
                }else{
                    this.paintCell(i,j,COLORS.LIVE); // Yellow for initial cells
                }
            }
        }
    }

    render(){
        for(let i =0;i<this.rows;i++){
            for(let j=0;j<this.columns;j++){
                let currentCell=this.gridArray[i][j];
                if(!currentCell.isAlive()) {
                    this.paintCell(i,j,COLORS.DEAD);
                }
            }
        }
        for(let cell of this.cellBuffer){
            this.paintCell(cell[0],cell[1],cell[2]);
        }
        this.cellBuffer=[];
    }

    simulate(){
        this.scanGrid();
        this.tick();
        this.render();
    }

}

//let world=new World(80,45);
let world=new World(320,160);
console.log()
world.populate();
world.initRender();

let isRunning = false;

// Create and display the instruction prompt
const promptDiv = document.createElement('div');
promptDiv.style.position = 'fixed';
promptDiv.style.top = '20px';
promptDiv.style.left = '50%';
promptDiv.style.transform = 'translateX(-50%)';
promptDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
promptDiv.style.color = '#32CD32';
promptDiv.style.padding = '15px';
promptDiv.style.borderRadius = '5px';
promptDiv.style.fontFamily = 'Arial, sans-serif';
promptDiv.style.fontSize = '18px';
promptDiv.style.textAlign = 'center';
promptDiv.style.zIndex = '1000';
promptDiv.innerHTML = 'Click on cells to activate them<br>Press SPACE to start/stop the simulation';
document.body.appendChild(promptDiv);

// Function to remove the prompt with fade out
function removePrompt() {
    promptDiv.style.transition = 'opacity 1s';
    promptDiv.style.opacity = '0';
    setTimeout(() => {
        document.body.removeChild(promptDiv);
    }, 1000);
}

// Add keydown handler to remove prompt when space is pressed
addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        if (!isRunning) { // Only remove on first space press
            removePrompt();
        }
        isRunning = !isRunning;
        if (isRunning) {
            animate();
        }
    }
});

function animate(){
    if (isRunning) {
        setTimeout(function(){
            requestAnimationFrame(animate);
            world.simulate();
        }, 100);
    }
}

const mouse = {
    x: undefined,
    y: undefined,
    isDown: false
}

// Event Listeners
addEventListener('mousemove', event => {
    mouse.x = Math.floor(event.clientX/world.blockWidth);
    mouse.y = Math.floor(event.clientY/world.blockHeight);
    if (mouse.isDown && world.gridArray[mouse.x] && world.gridArray[mouse.x][mouse.y]) {
        world.gridArray[mouse.x][mouse.y].birth();
        world.paintCell(mouse.x, mouse.y, COLORS.BIRTH); // Lime green for clicked cells
    }
})

addEventListener('mousedown', event => {
    mouse.isDown = true;
    mouse.x = Math.floor(event.clientX/world.blockWidth);
    mouse.y = Math.floor(event.clientY/world.blockHeight);
    if (world.gridArray[mouse.x] && world.gridArray[mouse.x][mouse.y]) {
        world.gridArray[mouse.x][mouse.y].birth();
        world.paintCell(mouse.x, mouse.y, COLORS.BIRTH); // Lime green for clicked cells
    }
})

addEventListener('mouseup', () => {
    mouse.isDown = false;
})

addEventListener('mouseleave', () => {
    mouse.isDown = false;
})

addEventListener('click', event => {
    mouse.x = Math.floor(event.clientX/world.blockWidth);
    mouse.y = Math.floor(event.clientY/world.blockHeight);
    if (world.gridArray[mouse.x] && world.gridArray[mouse.x][mouse.y]) {
        world.gridArray[mouse.x][mouse.y].birth();
        world.paintCell(mouse.x, mouse.y, COLORS.BIRTH); // Lime green for clicked cells
    }
})
