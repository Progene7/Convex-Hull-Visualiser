// Gift Wrapping Algorithm

/**
 * Gift Wrapping Algorithm for finding the convex hull of a set of points.
 */

// Variables to store points and the resulting convex hull
let points = [];
let hull = [];

// Variables for algorithm execution
let leftMost;
let currentVertex;
let index;
let nextIndex = -1;
let nextVertex;
let drawEnabled = false;

/**
 * Sets up the canvas and initializes event listeners for user interaction.
 */
function setup() {
    // Canvas setup
    let canvas = createCanvas(1000, 600);
    canvas.parent('canvas-container');
    background(0);

    // Event listeners
    canvas.mouseClicked(addPoint);
    canvas.mouseOver(activateCursor);
    canvas.mouseOut(deactivateCursor);

    // Button setup
    let randomBtn = select('#randomBtn');
    randomBtn.mousePressed(addRandomPoints);

    let clearBtn = select('#clearBtn');
    clearBtn.mousePressed(clearPoints);

    let runBtn = select('#runBtn');
    runBtn.mousePressed(runAlgorithm);

    let showHullBtn = select('#showHullBtn');
    showHullBtn.mousePressed(showConvexHull);

    // Prevent draw loop until algorithm is executed
    noLoop();
}

/**
 * Draws the canvas and executes the gift wrapping algorithm when enabled.
 */
function draw() {
    if(drawEnabled){
        background(0);
        stroke(255);
        strokeWeight(8);
        for (let p of points) {
            point(p.x, p.y);
        }

        stroke(150, 0, 255);
        strokeWeight(4);
        fill(255, 0, 255, 25);
        // noFill(); 
        beginShape();
        for (let p of hull) {
            vertex(p.x, p.y);
        }
        endShape(CLOSE);

        stroke(0, 255, 0);
        strokeWeight(10);
        point(leftMost.x, leftMost.y);

        stroke(0, 150, 255);
        strokeWeight(10);
        point(currentVertex.x, currentVertex.y);

        stroke(255, 0, 0);
        strokeWeight(2);
        line(currentVertex.x, currentVertex.y, nextVertex.x, nextVertex.y);

        let checking = points[index];
        stroke(255);
        strokeWeight(2);
        line(currentVertex.x, currentVertex.y, checking.x, checking.y);

        const a = p5.Vector.sub(nextVertex, currentVertex);
        const b = p5.Vector.sub(checking, currentVertex);
        const cross = a.cross(b);

        if (cross.z < 0) {
            nextVertex = checking;
            nextIndex = index;
        }

        index = index + 1;
        pointsInHull();
        if (index == points.length) {
            if (nextVertex == leftMost) {
                background(0);
                stroke(255);
                strokeWeight(8);
                for (let p of points) {
                    point(p.x, p.y);
                }

                stroke(255, 0, 255);
                strokeWeight(4);
                fill(255, 0, 255, 25);
                beginShape();
                for (let p of hull) {
                    ellipse(p.x, p.y, 4, 4);
                    vertex(p.x, p.y);
                }
                endShape(CLOSE);
                console.log('done');
                drawEnabled = false;
                noLoop();
            } else {
                hull.push(nextVertex);
                pointsInHull();
                currentVertex = nextVertex;
                index = 0;
                nextVertex = leftMost;
            }
        }
    }
}

/**
 * Adds a specified number of random points to the canvas.
 */
function addRandomPoints() {
    let randomNumber = select('#randomNumber').value();
    
    for (let i = 0; i < randomNumber; i++) {
        let x = random(20, width - 20);
        let y = random(20, height - 20);
        points.push(createVector(x, y));
        stroke(255);
        fill(255);
        ellipse(x, y, 8, 8);
    }
    updatePointCount();
}

/**
 * Clears all points and the resulting convex hull from the canvas.
 */
function clearPoints() {
    points = [];
    hull = [];
    background(0);
    drawEnabled = false;
    updatePointCount();
    pointsInHull();
}

/**
 * Updates the count of points in the convex hull.
 */
function pointsInHull(){
    select('#hullCount').html(`${hull.length}`);
}

/**
 * Updates the displayed count of points.
 */
function updatePointCount() {
    select('#pointCount').html(`${points.length}`);
}

/**
 * Runs the gift wrapping algorithm to find the convex hull of the points.
 */
function runAlgorithm() {
    console.log("Running algorithm\nPoints size:", points.length);

    if(points.length < 3){
        console.log("Convex hull cannot be implemented for less than 3 points");
        select('#warning').html("Convex hull cannot be implemented for less than 3 points");
        return;
    }
    select('#warning').html("");
    points.sort((a, b) => a.x - b.x);
    leftMost = points[0];
    currentVertex = leftMost;
    hull.push(currentVertex);
    nextVertex = points[1];
    index = 2;
    let speed = select('#speedSlider').value();
    frameRate(speed);
    drawEnabled = true;
    loop();     
}

// Function to handle file upload
document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
/**
 * Handles file upload and processes the CSV data to add points.
 * @param {Event} event - The file upload event.
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        processData(contents);
    };
    reader.readAsText(file);
}

// Function to process CSV data
/**
 * Processes the CSV data to add points to the canvas.
 * @param {string} csv - The CSV data.
 */
function processData(csv) {
    const lines = csv.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].trim().split(',');
        if (parts.length === 2) {
            const x = parseFloat(parts[0]);
            const y = parseFloat(parts[1]);
            points.push(createVector(x, y));
            stroke(255);
            fill(255);
            ellipse(x, y, 8, 8);
        }
    }
    updatePointCount();
}

/**
 * Displays the convex hull calculated using Jarvis March algorithm.
 */
function showConvexHull(){
    hull = jarvisMarch(points);
    stroke(255, 0, 255);
    strokeWeight(4);
    fill(255, 0, 255, 25);
    beginShape();
    for (let p of hull) {
        ellipse(p.x, p.y, 4, 4);
        vertex(p.x, p.y);
    }
    endShape(CLOSE);
}

/**
 * Adds a point to the canvas at the mouse position.
 */
function addPoint() {
    let x = mouseX;
    let y = mouseY;
    points.push(createVector(x, y));
    stroke(255);
    strokeWeight(4);
    fill(255);
    ellipse(x, y, 8, 8);
    updatePointCount();
}

/**
 * Activates the cursor style to crosshair when mouse is over the canvas.
 */
function activateCursor() {
    cursor('crosshair');
}

/**
 * Deactivates the cursor style when mouse is out of the canvas.
 */
function deactivateCursor() {
    cursor();
}