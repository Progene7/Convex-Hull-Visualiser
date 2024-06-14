/**
 * Perform step 1 of the algorithm, which involves obtaining extreme points and drawing the upper hull.
 * @param {Array} points - The array of points.
 * @returns {Object} An object containing the extreme points: UL, UR, LL, LR.
 */
function step1(points){
    drawHull(upper_hull);
    let [UL, UR, LL, LR] = getExtremes(points);
    stroke(255, 0, 0); // Set stroke color to red
    strokeWeight(12); // Set stroke weight to 8 pixels
    ellipse(LL.x, LL.y, 4, 4); // Draw UL point
    ellipse(LR.x, LR.y, 4, 4);

    strokeWeight(2);
    drawingContext.setLineDash([5, 15]);
    line(LL.x, LL.y, LR.x, LR.y); 
    drawingContext.setLineDash([]);
    return  {UL: LL, UR: LR, LL: UL, LR: UR};
}

/**
 * Perform step 2 of the algorithm, which involves partitioning points based on extreme points UL and UR.
 * @param {Array} points - The array of points.
 * @param {Object} UL - The upper-left extreme point.
 * @param {Object} UR - The upper-right extreme point.
 * @returns {Array} An array containing two arrays: aboveLine and belowLine.
 */
function step2(points, UL, UR) {
    const slope1 = (UR.y - UL.y) / (UR.x - UL.x);
    const slope2 = (LR.y - LL.y) / (LR.x - LL.x);
    const aboveLine = [];
    const belowLine = [];
    for (const point of points) {
        let yOnLine = UL.y + slope1 * (point.x - UL.x);
        if (point.y < yOnLine) {
            aboveLine.push(point);
        }
        else{
            yOnLine = LL.y + slope2*(point.x - point.y);
            if(point.y > yOnLine){
                belowLine.push(point);
            }
        }
    }

    background(0);
    //line(UL.x, UL.y, UR.x, UR.y );
    drawHull(upper_hull);
    aboveLine.push(UL);
    aboveLine.push(UR);
    belowLine.push(LL);
    belowLine.push(LR);
    stroke(255);
    strokeWeight(4);
    fill(255);
    for(let i =0; i<aboveLine.length; i++){
        ellipse(aboveLine[i].x, aboveLine[i].y, 4, 4);
    }

    stroke(255, 0, 0); // Set stroke color to red
    strokeWeight(12); // Set stroke weight to 8 pixels
    ellipse(UL.x, UL.y, 4, 4); // Draw UL point
    ellipse(UR.x, UR.y, 4, 4);
    return [aboveLine, belowLine];
}

/**
 * Perform step 3 of the algorithm, which involves finding the median value of x-coordinates.
 * @param {Array} P - The array of points.
 * @returns {number} The median value of x-coordinates.
 */
function step3(P){
    drawHull(upper_hull);
    let X = P.map(point => point.x);
    let a = median(X);
    stroke(255, 0, 0); 
    strokeWeight(2); 
    line(a, 0, a, height); 

    for (let i = 0; i < P.length; i++) {
        let pointColor = (P[i].x < a) ? color(128, 0, 128) : color(0, 128, 0);
        stroke(pointColor);
        //noStroke(); 
        ellipse(P[i].x, P[i].y, 4, 4); 
    }
    return a;
}

/**
 * Perform step 4 of the algorithm, which involves identifying candidates for the upper bridge.
 * @param {Array} S - The array of points.
 * @returns {Object} An object containing lines, candidates, and slopes.
 */
function step4(S){
    let candidates = [];
    let lines = [];
    let slopes = [];

    background(0);   
    drawHull(upper_hull);
    stroke(255, 0, 0); 
    strokeWeight(2); 
    line(a, 0, a, height);

    stroke(255);
    strokeWeight(8);

    for(let i = 0; i<S.length; i++){
        ellipse(S[i].x, S[i].y, 4, 4);
    }
    
    for (let i = 0; i < S.length - 1; i += 2) {
        if (S[i].x > S[i + 1].x) {
            [S[i], S[i + 1]] = [S[i + 1], S[i]]; 
        }
        if (S[i].x === S[i + 1].x) {
            let x = (S[i].y < S[i + 1].y) ? S[i] : S[i + 1];
            candidates.push(x);
            continue;
        }
        lines.push(new Line(S[i], S[i + 1]));  
    }
    if(S.length%2 == 1)
        candidates.push(S[S.length - 1]);
        
    stroke(0, 255, 0, 50); 
    strokeWeight(2); 
    for(let i = 0; i<lines.length; i++)
    {
        slopes.push(lines[i].M);
        let p1 = lines[i].p1;
        let p2 = lines[i].p2;
        line(p1.x, p1.y, p2.x, p2.y);
    }    
    console.log("candodates: ", candidates);
    return {lines: lines, candidates: candidates, slopes: slopes}; 
}

/**
 * Perform step 5 of the algorithm, which involves finding the median slope.
 * @param {Array} slopes - The array of slopes.
 * @param {Array} S - The array of points.
 * @returns {Object} An object containing median_k, pk, and pm.
 */
function step5(slopes, S){
        drawHull(upper_hull);
        let median_k = median(slopes);
        let pk, pm;
        if(S.length == 1) {
            pk = pm = S[0];
        }
        else [pk, pm] = lowerSupportingLine(S, median_k);
        console.log(pk, pm);
    
        if (pk.x === pm.x && pk.y === pm.y){
            stroke(255, 0, 255); 
            strokeWeight(6);
            ellipse(pk.x, pk.y, 4, 4); 
            
            let x1 = pk.x - 800 
            let y1 = pk.y - median_k * 800 
            let x2 = pk.x + 800 
            let y2 = pk.y + median_k * 800
            stroke(0, 200, 200);
            strokeWeight(2); 
            line(x1, y1, x2, y2); 
        }else{
            stroke(255, 165, 0); 
            strokeWeight(6); 
            ellipse(pk.x, pk.y, 4, 4);
            ellipse(pm.x, pm.y, 4, 4);
            stroke(0, 200, 200); 
            strokeWeight(2); 
            line(pk.x, pk.y, pm.x, pm.y); 
        }
    
        return {median_k : median_k, pk: pk, pm: pm};
    }

/**
 * Perform step 6 of the algorithm, which involves categorizing lines into SMALL, EQUAL, and LARGE sets.
 * @param {Array} lines - The array of lines.
 * @param {number} median_k - The median slope.
 * @returns {Array} An array containing SMALL, EQUAL, and LARGE sets.
 */
function step6(lines, median_k){
    drawHull(upper_hull);
    let SMALL = [], EQUAL = [], LARGE = [];
    //console.log(lines, median_k);
    for(let i = 0;i<lines.length;i++){
        if(lines[i].M < median_k)
            SMALL.push(lines[i]);
        else if(lines[i].M === median_k)
            EQUAL.push(lines[i]);
        else
            LARGE.push(lines[i]);
    }

    stroke(255, 255, 0);
    strokeWeight(2); 
    for(let i = 0; i < SMALL.length; i++){
        let temp = SMALL[i];
        line(temp.p1.x, temp.p1.y, temp.p2.x, temp.p2.y);
    }

    stroke(255, 0, 255);
    for(let i = 0; i < EQUAL.length; i++){
        let temp = EQUAL[i];
        line(temp.p1.x, temp.p1.y, temp.p2.x, temp.p2.y);
    }

    stroke(0, 155, 0); 
    for(let i = 0; i < LARGE.length; i++){
        let temp = LARGE[i];
        line(temp.p1.x, temp.p1.y, temp.p2.x, temp.p2.y);
    }

    return [SMALL, EQUAL, LARGE];
}

/**
 * Perform step 7 of the algorithm, which involves filtering bridge candidates based on supporting lines.
 * @param {Array} SMALL - The array of lines with slopes smaller than the median.
 * @param {Array} EQUAL - The array of lines with slopes equal to the median.
 * @param {Array} LARGE - The array of lines with slopes larger than the median.
 * @param {Object} pk - The left supporting point.
 * @param {Object} pm - The right supporting point.
 * @param {Array} bridgeCandidates - The array of bridge candidates.
 * @param {number} a - The median x-coordinate.
 * @returns {Array} The updated array of bridge candidates.
 */
function step7(SMALL, EQUAL, LARGE, pk, pm, bridgeCandidates, a){
    // bridgeCandidates.push(pk);
    // if(pk != pm) bridgeCandidates.push(pm);
    if(pm.x <= a){
        for(let i =0;i<SMALL.length;i++){
            bridgeCandidates.push(SMALL[i].p2);
        }
         for(let i =0;i<EQUAL.length;i++){
            bridgeCandidates.push(EQUAL[i].p2);
        }

        for(let i =0;i<LARGE.length;i++){
            bridgeCandidates.push(LARGE[i].p1);
            bridgeCandidates.push(LARGE[i].p2);
        }

    }
    if(pk.x > a){
        for(let i =0;i<SMALL.length;i++){
            bridgeCandidates.push(SMALL[i].p1);
            bridgeCandidates.push(SMALL[i].p2);
        }
         for(let i =0;i<EQUAL.length;i++){
            bridgeCandidates.push(EQUAL[i].p1);
        }
        for(let i =0;i<LARGE.length;i++){
            bridgeCandidates.push(LARGE[i].p1);
        }
    }

    background(0);
    drawHull(upper_hull);
    stroke(255);
    strokeWeight(8);
    
    for(let i = 0; i<upper_points.length; i++){
        ellipse(upper_points[i].x, upper_points[i].y, 4, 4);
    }

    stroke(255, 0, 0); 
    strokeWeight(2); 
    line(a, 0, a, height); 

    stroke(100, 100, 10);
    strokeWeight(8);
    noFill();
    for(let i = 0; i<bridgeCandidates.length; i++){ 
        ellipse(bridgeCandidates[i].x, bridgeCandidates[i].y, 4, 4);
    }
    return bridgeCandidates;
}

/**
 * Perform step 8 of the algorithm, which involves finding the lower bridge.
 * @param {Array} P - The array of points.
 * @param {number} a - The median x-coordinate.
 * @returns {Array} An array containing the left and right points of the lower bridge.
 */
function step8(P, a){
    drawHull(upper_hull);
    let [pl, pr] = lowerBridge(P, a);
    stroke(0, 0, 255);
    strokeWeight(4);
    line(pl.x, pl.y, pr.x, pr.y);
    return [pl, pr];
}

/**
 * Perform step 9 of the algorithm, which involves dividing points into left and right subsets.
 * @param {Object} pmin - The lower-left extreme point.
 * @param {Object} pl - The left point of the lower bridge.
 * @param {Object} pr - The right point of the lower bridge.
 * @param {Object} pmax - The lower-right extreme point.
 * @param {Array} P - The array of points.
 * @returns {Array} An array containing the left and right subsets of points.
 */
function step9(pmin, pl, pr, pmax, P) {
    background(0);
    stroke(255);
    strokeWeight(8);
    
    for(let i = 0; i<P.length; i++){
        ellipse(P[i].x, P[i].y, 4, 4);
    }
    drawHull(upper_hull);
    let Pleft = [];
    let Pright = [];
    let v1 = makeVector(pmin, pl);
    let v2 = makeVector(pr, pmax);

    for (let i = 0; i < P.length; i++) {
        if (P[i] !== pl && P[i] !== pr && P[i] !== pmin && P[i] !== pmax) {
            let vl = makeVector(pl, P[i]);
            let vr = makeVector(pmax, P[i]);
            if (crossProduct(v1, vl) < 0) {
                Pleft.push(P[i]);
            }

            if (crossProduct(v2, vr) < 0) {
                Pright.push(P[i]);
            }
        }
    }
    Pleft.push(pl);
    if(pl != pmin)
        Pleft.push(pmin);
    Pright.push(pr);

    stroke('yellow');
    noFill();
    beginShape();
    vertex(pmin.x, pmin.y);
    vertex(pl.x, pl.y);
    vertex(pr.x, pr.y);
    vertex(pmax.x, pmax.y);
    endShape(CLOSE);

    return [Pleft, Pright];
}

/**
 * Perform step 10 of the algorithm, which involves visualizing the left and right subsets of points.
 * @param {Array} Pleft - The array of points on the left subset.
 * @param {Array} Pright - The array of points on the right subset.
 */
function step10(Pleft, Pright){
    background(0);
    
    drawHull(upper_hull);
    
    stroke(255);
    strokeWeight(4);
    fill(255);
    for(let i = 0; i<Pleft.length; i++){
        let p = Pleft[i];
        ellipse(p.x, p.y, 4, 4); 
    }

    for(let i = 0; i<Pright.length; i++){
        let p = Pright[i];
        ellipse(p.x, p.y, 4, 4); 
    }          
}

/**
 * Perform step 12 of the algorithm, which involves visualizing the lower points and the line connecting LL and LR.
 * @param {Array} lower_points - The array of lower points.
 * @param {Object} LL - The lower-left extreme point.
 * @param {Object} LR - The lower-right extreme point.
 */
function step12(lower_points, LL, LR){
    //drawHull(upper_hull);

    background(0);
    stroke(255);
    strokeWeight(8);
    for(let i = 0; i<lower_points.length; i++){
        let p = lower_points[i];
        ellipse(p.x, p.y, 4, 4);
    }

    stroke(255, 0, 0);
    strokeWeight(2);
    drawingContext.setLineDash([5, 15]);
    line(LL.x, LL.y, LR.x, LR.y); 
    drawingContext.setLineDash([]);
}

/**
 * Perform step 13 of the algorithm, which involves obtaining the lower hull.
 * @param {Array} points - The array of points.
 * @param {Object} LL - The lower-left extreme point.
 * @param {Object} LR - The lower-right extreme point.
 * @returns {Array} The array of points forming the lower hull.
 */
function step13(points, LL , LR){
    let lower_hull = upperHull(LL, LR, points);
    drawHull(lower_hull);
    // stroke(0, 0, 255);
    // strokeWeight(4);
    // noFill();
    // beginShape();
    // for (let i = 0; i < lower_hull.length; i++) {
    //     vertex(hull[i].x, hull[i].y);
    // }
    // endShape();

    return lower_hull;
}

/**
 * Perform step 13 of the algorithm, which involves obtaining the lower hull.
 * @param {Array} points - The array of points.
 * @param {Object} LL - The lower-left extreme point.
 * @param {Object} LR - The lower-right extreme point.
 * @returns {Array} The array of points forming the lower hull.
 */
function removeDuplicates(arr){
    let ans = [];
    for(let i = 0; i<arr.length-1; i++){
        if(arr[i] === arr[i+1]) continue;
        ans.push(arr[i]);
    }
    ans.push(arr[arr.length - 1]); 
    return ans;
}

/**
 * Draw the convex hull based on an array of points.
 * @param {Array} _hull - The array of points forming the convex hull.
 */
function drawHull(_hull){
    if(_hull.length == 0) return ;

    _hull = removeDuplicates(_hull);
    _hull.sort((a, b) => a.x - b.x);
    pointsInHull();
    stroke(0, 0, 255);
    strokeWeight(4);
    fill(0, 0, 250, 50);
    for(let i =0; i<_hull.length-1; i++){
        ellipse(_hull[i].x, _hull[i].y, 4, 4); 
        //ellipse(_hull[i+1].x, _hull[i+1].y, 12, 12); 

        line(_hull[i].x, _hull[i].y, _hull[i+1].x, _hull[i+1].y);
    }

    if(_hull.length % 2 == 1 && hull.length >= 2) {
        ellipse(_hull[_hull.length-1].x, _hull[_hull.length-1].y, 4, 4); 
        line(_hull[_hull.length - 2].x, _hull[_hull.length - 2].y, _hull[_hull.length - 1].x, _hull[_hull.length - 1].y);
    }
    // noFill();
    // beginShape();
    // for(let i = 0; i< _hull.length; i++){
    //     vertex(_hull[i].x, _hull[i].y);
    // }
    // endShape();
    //return _hull;
}