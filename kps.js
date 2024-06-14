/**
 * Represents a set of points and operations on them to find the convex hull.
 * @global
 */

/**
 * Array containing the input points.
 * @type {p5.Vector[]}
 */
let points = [];

/**
 * Array containing the vertices of the convex hull.
 * @type {p5.Vector[]}
 */
let hull = [];

/**
 * Represents the current step in the algorithm.
 * @type {number}
 */
let step = 0;

/**
 * Stack used to store information during the algorithm execution.
 * @type {object[]}
 */
let right_stack = [];

/**
 * Variables representing extreme points in different quadrants.
 * @type {p5.Vector}
 */
let UL, UR, LL, LR;

/**
 * Auxiliary variable used during the algorithm execution.
 * @type {number}
 */
let a;

/**
 * Arrays containing points above and below the line connecting extreme points.
 * @type {p5.Vector[]}
 */
let upper_points = [];
let lower_points = [];

/**
 * Variables representing the left and right bridge points.
 * @type {p5.Vector}
 */
let pl, pr;

/**
 * Arrays containing points to the left and right of the median.
 * @type {p5.Vector[]}
 */
let Pleft = [], Pright = [];

/**
 * Arrays containing the upper and lower hulls of the points.
 * @type {p5.Vector[]}
 */
let upper_hull = [];
let lower_hull = [];

/**
 * Arrays containing lines, slopes, and candidates for the upper bridge.
 * @type {p5.Vector[]}
 */
let upper_lines = [];
let upper_slopes = [];
let bridge_candidates = [];

/**
 * Array containing extreme points.
 * @type {p5.Vector[]}
 */
let extremes= [];

/**
 * Represents the median slope.
 * @type {number}
 */
let median_k;

/**
 * Variables representing intermediate points.
 * @type {p5.Vector}
 */
let pk, pm;

/**
 * Arrays containing points with different slope categories.
 * @type {p5.Vector[]}
 */
let SMALL = [], LARGE = [], EQUAL = [];

/**
 * Array containing the actual upper points.
 * @type {p5.Vector[]}
 */
let actual_upper_points = [];

/**
 * Sets up the canvas and initializes event listeners.
 */
function setup() {
    let canvas = createCanvas(1000, 600);
    canvas.parent('canvas-container');
    showMessage("Click on the run button to see the step by step implementation, and the Show button to see the hull directly.")
    background(0);
    
    canvas.mouseClicked(addPoint);
    canvas.mouseOver(activateCursor);
    canvas.mouseOut(deactivateCursor);

    let randomBtn = select('#randomBtn');
    randomBtn.mousePressed(addRandomPoints);

    let clearBtn = select('#clearBtn');
    clearBtn.mousePressed(clearPoints);

    let runBtn = select('#runBtn');
    runBtn.mousePressed(() => runAlgorithm(true));

    let stepBtn = select('#stepBtn');
    stepBtn.mousePressed(() => runAlgorithm(false));

    let showHullBtn = select('#showHullBtn');
    showHullBtn.mousePressed(showConvexHull); 

    noLoop();
}

/**
 * Draws elements on the canvas based on the current step of the algorithm.
 */
function draw(){
    switch(step){
        case 1:  //extreme points
            points = removeDegeneracies(points);
            extremes = step1(points);
            UL = extremes.UL;
            UR = extremes.UR;
            LL = extremes.LL;
            LR = extremes.LR;
            step = 2;
            showMessage("The extreme points, pumin and pumax are found and shown in red. These are a part of the upper hull.");
            break;
        case 2: //partition points
            [upper_points, lower_points] = step2(points, UL, UR);
            
            if(upper_points.length == 0){
                step = 8;
                break;
            }
            
            stroke(255, 0, 0);
            strokeWeight(2);
            drawingContext.setLineDash([5, 15]);
            line(UL.x, UL.y, UR.x, UR.y); 
            drawingContext.setLineDash([]);
            step = 3;
            showMessage("For finding the upper hull, we dont need to consider the points below the line joining pumin and pumax. So we find the hull for the upper points which will also be the upper hull for the entire pointset.");
            break;
        case 3: 
        console.log(step);
            if(UL == UR) {
                upper_hull.push(UL);
                drawHull(upper_hull);
                step = 11;
                console.log('1step');
                break;
            }
            if(upper_points.length == 2){
                [pl, pr] = upper_points[0].x < upper_points[1].x ? [upper_points[0], upper_points[1]] : [upper_points[1], upper_points[0]];
                step = 8;
                console.log('2step');
                showMessage("The points set contains only 2 point so both of these form the upper bridge.")
                break;
            }
            actual_upper_points = upper_points;
            a = step3(upper_points);
            stroke(255, 0, 0); 
            strokeWeight(12); 
            point(UL.x, UL.y); 
            point(UR.x, UR.y);
            strokeWeight(2);
            drawingContext.setLineDash([5, 15]);
            line(UL.x, UL.y, UR.x, UR.y);
            drawingContext.setLineDash([]); 
            step = 4;
            showMessage("In this step, the set of points representing the upper hull undergoes partitioning based on the median value of their x-coordinates. The points in purple are to the left of the median and the poinits in green are to the right. ");
            break;
        case 4:
            console.log(step);
            if(upper_points.length == 2){
                [pl, pr] = upper_points[0].x < upper_points[1].x ? [upper_points[0], upper_points[1]] : [upper_points[1], upper_points[0]];
                step = 8;
                showMessage("The points set contains only 2 point so both of these form the upper bridge.")
                break;
            }
            let ans = step4(upper_points);
            bridge_candidates = ans.candidates;
            upper_slopes = ans.slopes;
            upper_lines = ans.lines;
            step = 5;
            showMessage("In the given scenario, points are randomly paired, and those pairs with an infinite slope are immediately added to the candidates for the upper bridge. These pairs are depicted with lines in light colour color on the canvas.")
            break;
        case 5:
            console.log(step);
            let medianSlope = step5(upper_slopes, upper_points);
            median_k = medianSlope.median_k;
            pk = medianSlope.pk;
            pm = medianSlope.pm;
            step = 6;
            showMessage("Supporting line of a point set is a nonvertical straight line which contains at least one point of the point set but not one point above it. The supporting point of the points is shown by the cyan line between pk and pm. ")
            break;
        case 6:
            console.log(step);
            if(pk.x <= a && pm.x > a){
                pl = pk;
                pr = pm;
                step = 8;
                showMessage("Both the points belong to opposite sides of the median line. SO this line is the upper bridge.");
                break;
            }
            [SMALL, EQUAL, LARGE] = step6(upper_lines, median_k);
            step = 7;
            showMessage("Following the initial pairing, the lines are further categorized into SMALL, EQUAL, and LARGE sets by comparing their slopes to that of the supporting line. The lines belonging to the LARGE set are highlighted in yellow, those in the SMALL set are depicted in green, and the EQUAL set is represented by lines in purple on the canvas.")
            break;
        case 7:
            console.log(step);
            bridge_candidates = step7(SMALL, EQUAL, LARGE, pk, pm, bridge_candidates, a);
            console.log(bridge_candidates);
            upper_points = bridge_candidates;
            showMessage("Utilizing Lemma 2 and Lemma 3, points that are ineligible to be part of the upper bridge are filtered out. The remaining candidates for the upper bridge are highlighted in brown. The algorithm then proceeds to attempt to find the upper bridge among these candidate points.")
            step = 4;
            break;
        case 8:
            console.log(step);
            [pl, pr] = step8(upper_points, a);
            upper_points = actual_upper_points;
            upper_hull.push(pl);
            upper_hull.push(pr); 
            step = 9;
            showMessage("The upper bridge, represented by the line in blue connecting points pl and pr, is a critical supporting line in the convex hull algorithm. It ensures that one point lies to the left of the median, while the other lies to the right. This bridge is an integral part of the upper hull, guaranteeing its inclusion in the convex hull construction process.");
            break;
        case 9:
            console.log(step);
            [Pleft, Pright] = step9(UL, pl, pr, UR, upper_points);
            step = 10;
            showMessage("The convex hull algorithm excludes points within the quadrilateral defined by pmin, pl, pr, and pmax. The upper bridge ensures coverage over these interior points, focusing solely on the points lying outside this quadrilateral for inclusion in the convex hull.")
            break;
        case 10:
            console.log(step);
            step10(Pleft, Pright);
            showMessage("The algorithm now separates the points to the left and right of the quadrilateral and proceeds to find the upper bridge for each subset. These upper bridges are then merged into the final upper hull. First the left hull is calculated.")
            if(Pright.length!=0){
                if(Pright.length == 1)
                    upper_hull.push(Pright[0]);
                else{
                    console.log(Pright);
                    right_stack.push({pr: pr, UR: UR, P: Pright});
                }
            }
            if(Pleft.length > 1){
                upper_points = Pleft;
                step = 3;
                UR = pl;
                break;
            }
            else step = 11;
            //break;
        case 11:
            console.log(step);
            if(right_stack.length){
                showMessage("Now the right hull is evaluated.");
                let top = right_stack[right_stack.length - 1];
                right_stack.pop();
                UL = top.pr;
                UR = top.UR;
                upper_points = top.P;
                step = 3;
                break;
            }
            else {
                step = 12;
                upper_hull.push(extremes.UR);
                drawHull(upper_hull);
                showMessage("The Upper Hull is now shown in the diagram.");
                break;
            }
        case 12:
            console.log(step);
            if(lower_points.length == 0){
                step = 14;
                break;
            }
            LL = extremes.LL;
            LR = extremes.LR;
            showMessage("Likewise, we can determine the lower hull of the points located below the extreme points.");
            step12(lower_points, LL, LR);
            step = 13;
            break;
        case 13:
            console.log(step);
            showMessage("The lower hull is now shown in the diagram");
            lower_hull = step13(points, LL, LR);
            step = 14;
            break;
        case 14: //merge hulls
            console.log(step);
            showMessage("The convex hull is obtained by merging both the upper and lower hulls of all the points.");
            background(0);
            stroke(255);
            strokeWeight(4);
            fill(255);
            for(let i = 0; i<points.length; i++){
                ellipse(points[i].x, points[i].y, 4, 4);
            }
            upper_hull = removeDuplicates(upper_hull);
            upper_hull.sort((a,b) => a.x - b.x);
            hull = removeDuplicates(lower_hull);
            let i = upper_hull.length - 1;
            let end = 0;
        
            if (lower_hull && lower_hull.length && lower_hull[lower_hull.length - 1] === upper_hull[i]) i--;
            if (lower_hull[0] === upper_hull[0]) end++;
            
            for (; i >= end; i--) {
                hull.push(upper_hull[i]);
            }
            hull = removeDuplicates(hull);
            drawConvexHull(hull);
            step = 50;    
            
        default:
            return;  
    }
}

/**
 * Displays a message on the interface.
 * @param {string} message - The message to be displayed.
 */
function showMessage(message) {
    let messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = `<p>${message}</p>`;
}

/**
 * Rounds the coordinates of a given point to integers.
 * @param {p5.Vector} point - The point to be rounded.
 * @returns {p5.Vector} - The rounded point.
 */
function roundPoint(point) {
    const roundedX = Math.round(point.x);
    const roundedY = Math.round(point.y);
    return { x: roundedX, y: roundedY };
}

/**
 * Adds a random number of points to the canvas.
 */
function addRandomPoints() {
    let randomNumber = select('#randomNumber').value();
    if(!randomNumber){
        showMessage("Please give the number of points you wish to add.");
        return;
    }
    for (let i = 0; i < randomNumber; i++) {
        let x = random(20, width - 20);
        let y = random(20, height - 20);
        points.push(roundPoint(createVector(x, y)));
        stroke(255);
        strokeWeight(4);
        fill(255);
        ellipse(x, y, 4, 4);
    }
    let message = randomNumber + ' Points added to the canvas.'
    showMessage(message);
    updatePointCount();
}

/**
 * Clears all points from the canvas.
 */
function clearPoints() {
    background(0);
    points = [];
    hull = [];
    updatePointCount();
    step = 0;
    right_stack = [];
    upper_points = [];
    lower_points = [];
    Pleft = [], Pright = [];
    upper_hull = [];
    lower_hull = [];
    upper_lines = [];
    upper_slopes = [];
    bridge_candidates = [];
    extremes= [];
    SMALL = [], LARGE = [], EQUAL = [];
    actual_upper_points = [];
    showMessage("Click on the run button to see the step by step implementation, and the Show button to see the hull directly.")
    //redraw();
}

/**
 * Updates the count of points displayed on the interface.
 */
function updatePointCount() {
    select('#pointCount').html(`${points.length}`);
}

/**
 * Update the count of points in the convex hull displayed on the UI.
 * @function pointsInHull
 */
function pointsInHull(){
    select('#hullCount').html(`${hull.length}`);
}

/**
 * Runs the convex hull algorithm.
 * @param {boolean} flow - Indicates whether to run the algorithm continuously or step by step.
 */
function runAlgorithm(flow) {
    if(points.length < 3){
        console.log("Convex hull cannot be implemented for less than 3 points");
        select('#warning').html("Convex hull cannot be implemented for less than 3 points");
        return;
    }
    select('#warning').html("");
    
    let speed = select('#speedSlider').value();
    frameRate(speed);
    // // drawEnabled = true;
    // hull = kirkpatrickSeidel(points);
    if(!step) {
        step = 1;
        hull = [];
    }
    if(flow == false) {noLoop(); redraw();}
    else loop();
}

/**
 * Shows the convex hull directly.
 */
function showConvexHull() {
    hull = [];
    hull = kirkpatrickSeidel(points);
    console.log("Convex Hull:", hull);
    for(let i = 0; i<points.length; i++){
        //console.log(points[i].x,',' ,points[i].y);
        console.log("new Point(",points[i].x,"," ,points[i].y, ")," );
    }
    drawConvexHull();
    showMessage("The Convex hull is obtained by the KirkPatrick Algorithm. ");
}

/**
 * Draw the convex hull on the canvas.
 * @function drawConvexHull
 */
function drawConvexHull() {
    stroke(0, 0, 255);
    strokeWeight(4);
    fill(0, 0, 250, 50);
    beginShape();
    for (let i = 0; i < hull.length; i++) {
        vertex(hull[i].x, hull[i].y);
        ellipse(hull[i].x, hull[i].y, 6, 6);
    }
    endShape(CLOSE);
    pointsInHull();
}

document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
/**
 * Handles the file input event and processes CSV data.
 * @param {Event} event - The file input event.
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
 * Processes CSV data.
 * @param {string} csv - The CSV data to process.
 */
function processData(csv) {
    const lines = csv.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].trim().split(',');
        if (parts.length === 2) {
            const x = parseFloat(parts[0]);
            const y = parseFloat(parts[1]);
            points.push(roundPoint(createVector(x, y)));
            stroke(255);
            fill(255);
            ellipse(x, y, 4, 4);
        }
    }
    let message = lines.length + ' points added to the canvas from the csv file';
    showMessage(message);
    updatePointCount();
}

/**
 * Adds a point to the canvas.
 */
function addPoint() {
    let x = mouseX;
    let y = mouseY;
    points.push(roundPoint(createVector(x, y)));
    stroke(255);
    strokeWeight(4);
    fill(255);
    ellipse(x, y, 4, 4);
    updatePointCount();
}

/**
 * Activates the cursor.
 */
function activateCursor() {
    cursor('crosshair');
}

/**
 * Deactivates the cursor.
 */
function deactivateCursor() {
    cursor();
}