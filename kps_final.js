/**
 * Represents a line segment defined by two points.
 */
class Line{
    /**
     * Creates a new line segment from two points and calculates its slope-intercept form parameters.
     * @param {Object} p1 - The first point.
     * @param {Object} p2 - The second point.
     */
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.M = 0;
        this.C = 0;
        this.calculateParams();
    }

    /**
     * Calculates the slope and y-intercept of the line segment.
     */
    calculateParams() {
        this.M = (this.p1.y - this.p2.y) / (this.p1.x - this.p2.x);
        this.C = this.p1.y - this.M * this.p1.x;
    }
}

/**
 * Calculates the vector from point p1 to point p2.
 * @param {Object} p1 - The starting point.
 * @param {Object} p2 - The ending point.
 * @returns {Object} The vector from p1 to p2.
 */
function makeVector(p1, p2) {
    return { x: p2.x - p1.x, y: p2.y - p1.y };
}

/**
 * Calculates the cross product of two vectors.
 * @param {Object} v1 - The first vector.
 * @param {Object} v2 - The second vector.
 * @returns {number} The cross product of v1 and v2.
 */
function crossProduct(v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
}

/**
 * Calculates the median value of an array.
 * @param {Array} arr - The array of numbers.
 * @returns {number} The median value of the array.
 */
function median(arr){
    // const n = points.length;
    // if (n <= 5) {
    //     return points.sort((a, b) => a - b)[Math.floor(n / 2)];
    // }

    // const sublists = [];
    // for (let i = 0; i < n; i += 5) {
    //     sublists.push(points.slice(i, i + 5));
    // }
    // console.log("Sublists: ", sublists)

    // const medians = sublists.map(sublist => {
    //     const sortedSublist = sublist.sort((a, b) => a - b);
    //     return sortedSublist[Math.floor(sortedSublist.length / 2)];
    // });
    // console.log("Medians : ", medians)
    // const pivot = median(medians);
    // console.log(pivot);
    // const lower = points.filter(x => x < pivot);
    // const upper = points.filter(x => x > pivot);

    // const k = lower.length;
    // if(k < Math.floor(n / 2))
    //     return median(upper);
    // else if(k > Math.floor(n / 2))
    //     return median(lower);
    // else
    //     return pivot;
    const sortedArr = arr.slice().sort((a, b) => a - b);
    const n = sortedArr.length;
    if (n % 2 === 0) {
        return (sortedArr[n / 2] + sortedArr[(n/2)-1])/2;
    } else {
        return sortedArr[Math.floor(n / 2)];
    }
}

/**
 * Finds the supporting line for the upper bridge.
 * @param {Array} S - The array of points.
 * @param {number} median_k - The median slope.
 * @returns {Array} An array containing the left and right supporting points.
 */
function supportingLine(S, median_k){
    let max_intercept = S[0].y - median_k*S[0].x;
    
    let maxCL = S[0];
    let maxCR = S[0];
    for (let i = 1; i < S.length; i++) {
        let curC = S[i].y - median_k * S[i].x;
        if (curC > max_intercept) {
            max_intercept = curC;
            maxCL = S[i];
            maxCR = S[i];
        }
    }

    for (let i = 0; i < S.length; i++) {
        let curC = S[i].y - median_k * S[i].x;
        if (Math.abs(curC - max_intercept) < 0.00005)  {
            if (maxCL.x > S[i].x)
                maxCL = S[i];
            if (maxCR.x < S[i].x)
                maxCR = S[i];
        }
    }
    return [maxCL, maxCR];
}

/**
 * Finds the upper bridge of a set of points.
 * @param {Array} S - The array of points.
 * @param {number} a - The median x-coordinate.
 * @returns {Array} An array containing the left and right points of the upper bridge.
 */
function upperBridge(S, a) {
    if(S.length == 2){
        return S[0].x < S[1].x ? [S[0], S[1]] : [S[1], S[0]];
    }
    let candidates = [];
    let lines = [];
    
    for (let i = 0; i < S.length - 1; i += 2) {
        if (S[i].x > S[i + 1].x) {
            [S[i], S[i + 1]] = [S[i + 1], S[i]]; 
        }
        if (S[i].x === S[i + 1].x) {
            let x = (S[i].y > S[i + 1].y) ? S[i] : S[i + 1];
            candidates.push(x);
            continue;
        }
        lines.push(new Line(S[i], S[i + 1]));
    }
    if(S.length%2 == 1)
        candidates.push(S[S.length - 1]);

    let slopes = [];
    for(let i = 0;  i < lines.length; i++)
        slopes.push(lines[i].M);

    let median_k = median(slopes);
    let SMALL = [], EQUAL = [], LARGE = [];

    for(let i = 0;i<lines.length;i++){
        if(lines[i].M < median_k)
            SMALL.push(lines[i]);
        else if(lines[i].M == median_k)
            EQUAL.push(lines[i]);
        else
            LARGE.push(lines[i]);
    }

    let [pk, pm] = supportingLine(S, median_k);
    if(pk.x <= a && pm.x > a)
        return [pk, pm];

    if(pm.x <= a){
        for(let i =0;i<SMALL.length;i++){
            candidates.push(SMALL[i].p1);
            candidates.push(SMALL[i].p2);
        }
         for(let i =0;i<EQUAL.length;i++){
            candidates.push(EQUAL[i].p2);
        }

        for(let i =0;i<LARGE.length;i++){
            candidates.push(LARGE[i].p2);
        }

    }
    if(pk.x > a){
        for(let i =0;i<SMALL.length;i++){
            candidates.push(SMALL[i].p1);
        }
         for(let i =0;i<EQUAL.length;i++){
             candidates.push(EQUAL[i].p1);
        }

        for(let i =0;i<LARGE.length;i++){
            candidates.push(LARGE[i].p2);
            candidates.push(LARGE[i].p1);
        }

    }
    return upperBridge(candidates,a);
}

/**
 * Finds the upper hull of a set of points.
 * @param {Object} pmin - The lower-left extreme point.
 * @param {Object} pmax - The lower-right extreme point.
 * @param {Array} P - The array of points.
 * @returns {Array} The array of points forming the upper hull.
 */
function upperHull(pmin, pmax, P){
    if(pmin === pmax) {
        return [pmin];
    }

    if(P.length === 2) {
        return P[0].x < P[1].x ? [P[0], P[1]] : [P[1], P[0]];
    }

    let result = [];
    let X = P.map(point => point.x);
    let a = median(X);

    let [pl, pr] = upperBridge(P, a);
    let Pleft = [];
    let Pright = [];

    let v1 = makeVector(pmin, pl);
    let v2 = makeVector(pr, pmax);

    for (let i = 0; i < P.length; i++) {
        if (P[i] !== pl && P[i] !== pr && P[i] !== pmin && P[i] !== pmax) {
            let vl = makeVector(pl, P[i]);
            let vr = makeVector(pmax, P[i]);

            if (crossProduct(v1, vl) > 0) {
                Pleft.push(P[i]);
            }

            if (crossProduct(v2, vr) > 0) {
                Pright.push(P[i]);
            }
        }
    }

    Pleft.push(pl);
    if(pl != pmin)
        Pleft.push(pmin);
    Pright.push(pr);
    if(pr != pmax)
        Pright.push(pmax);
    let LUH = [];
    let RUH = [];
    LUH = upperHull(pmin,pl,Pleft);
    RUH = upperHull(pr,pmax,Pright);
    for(let i = 0;i<RUH.length;i++){
        LUH.push(RUH[i]);
    }
    return LUH;
}

/**
 * Finds the supporting line for the lower bridge.
 * @param {Array} S - The array of points.
 * @param {number} median_k - The median slope.
 * @returns {Array} An array containing the left and right supporting points.
 */
function lowerSupportingLine(S, median_k){
    let min_intercept = S[0].y - median_k*S[0].x;
    
    let minCL = S[0];
    let minCR = S[0];
    for (let i = 1; i < S.length; i++) {
        let curC = S[i].y - median_k * S[i].x;
        if (curC < min_intercept) {
            min_intercept = curC;
            minCL = S[i];
            minCR = S[i];
        }
    }

    for (let i = 0; i < S.length; i++) {
        let curC = S[i].y - median_k * S[i].x;
        if (Math.abs(curC - min_intercept) < 0.00005) {
        // if(curC === min_intercept){
            if (minCL.x > S[i].x)
                minCL = S[i];
            if (minCR.x < S[i].x)
                minCR = S[i];
        }
    }
    return [minCL, minCR];
}

/**
 * Finds the lower bridge of a set of points.
 * @param {Array} S - The array of points.
 * @param {number} a - The median x-coordinate.
 * @returns {Array} An array containing the left and right points of the lower bridge.
 */
function lowerBridge(S, a){
    if(S.length == 2){
        return S[0].x < S[1].x ? [S[0], S[1]] : [S[1], S[0]];
    }
    let candidates = [];
    let lines = [];
    
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

    let slopes = [];
    for(let i = 0;  i < lines.length; i++)
        slopes.push(lines[i].M);

    let median_k = median(slopes);
    let SMALL = [], EQUAL = [], LARGE = [];

    for(let i = 0;i<lines.length;i++){
        if(lines[i].M < median_k)
            SMALL.push(lines[i]);
        else if(lines[i].M == median_k)
            EQUAL.push(lines[i]);
        else
            LARGE.push(lines[i]);
    }
    let [pk, pm] = lowerSupportingLine(S, median_k);
    if(pk.x <= a && pm.x > a)
        return [pk, pm];

    if(pm.x <= a){
        for(let i =0;i<SMALL.length;i++){
            candidates.push(SMALL[i].p2);
        }
         for(let i =0;i<EQUAL.length;i++){
            candidates.push(EQUAL[i].p2);
        }

        for(let i =0;i<LARGE.length;i++){
            candidates.push(LARGE[i].p1);
            candidates.push(LARGE[i].p2);
        }

    }
    if(pk.x > a){
        for(let i =0;i<SMALL.length;i++){
            candidates.push(SMALL[i].p1);
            candidates.push(SMALL[i].p2);
        }
        for(let i =0;i<EQUAL.length;i++){
            candidates.push(EQUAL[i].p1);
        }

        for(let i =0;i<LARGE.length;i++){
            candidates.push(LARGE[i].p1);
        }

    }
    return lowerBridge(candidates,a);
}

/**
 * Finds the lower hull of a set of points.
 * @param {Object} pmin - The lower-left extreme point.
 * @param {Object} pmax - The lower-right extreme point.
 * @param {Array} P - The array of points.
 * @returns {Array} The array of points forming the lower hull.
 */
function lowerHull(pmin, pmax, P) {
    if(pmin === pmax) {
        return [pmin];
    }

    if(P.length === 2) {
        return P[0].x < P[1].x ? [P[0], P[1]] : [P[1], P[0]];
    }

    let result = [];
    let X = P.map(point => point.x);
    let a = median(X);
    let [pl, pr] = lowerBridge(P, a);
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
    if(pr != pmax)
        Pright.push(pmax);
    let LUH = [];
    let RUH = [];
    LUH = lowerHull(pmin,pl,Pleft);
    RUH = lowerHull(pr,pmax,Pright);
    for(let i = 0;i<RUH.length;i++){
        LUH.push(RUH[i]);
    }
    return LUH;
}

/**
 * Finds the extreme points (UL, UR, LL, LR) from a set of points.
 * @param {Array} points - The array of points.
 * @returns {Array} An array containing the extreme points: UL, UR, LL, LR.
 */
function getExtremes(points){
    let UL = points[0];
    let UR = points[0];
    let LL = points[0];
    let LR = points[0];

    for (let i = 0; i < points.length; i++) {
        if (UL.x > points[i].x)
            UL = points[i];
        else if (UL.x === points[i].x)
            if (UL.y < points[i].y)
                UL = points[i];

        if (LL.x > points[i].x)
            LL = points[i];
        else if (LL.x === points[i].x)
            if (LL.y > points[i].y)
                LL = points[i];

        if (UR.x < points[i].x)
            UR = points[i];
        else if (UR.x === points[i].x)
            if (UR.y < points[i].y)
                UR = points[i];

        if (LR.x < points[i].x)
            LR = points[i];
        else if (LR.x === points[i].x)
            if (LR.y > points[i].y)
                LR = points[i];
    }

    return [UL, UR, LL, LR];
}

/**
 * Calculates the squared magnitude of a point.
 * @param {Object} point - The point.
 * @returns {number} The squared magnitude of the point.
 */
function magnitudeSquared(point) {
    return point.x * point.x + point.y * point.y;
}

/**
 * Removes degenerate points from an array of points.
 * @param {Array} points - The array of points.
 * @returns {Array} The array with degenerate points removed.
 */
function removeDegeneracies(points) {
    points.sort((a, b) => a.x - b.x); 

    for (let i = 1; i < points.length - 1; i++) {
        if (crossProduct(points[i], points[i + 1]) === 0) {
            if (magnitudeSquared(points[i]) < magnitudeSquared(points[i + 1])) {
                points.splice(i, 1);
            } else {
                points.splice(i + 1, 1);
            }
            i--;
        }
    }
    return points;
}

/**
 * Implements the Kirkpatrick–Seidel convex hull algorithm.
 * @param {Array} points - The array of points.
 * @returns {Array} The array of points forming the convex hull.
 */
function kirkpatrickSeidel(points) {
    points = removeDegeneracies(points);
    let convexHull = [];
    
    let [UL, UR, LL, LR] = getExtremes(points);
    let candidates = [];

    for (let i = 0; i < points.length; i++) {
        if (UL.x !== points[i].x && UR.x !== points[i].x) {
            candidates.push(points[i]);
        }
    }
    candidates.push(UL);
    candidates.push(UR);

    let upper = upperHull(UL, UR, candidates);
    console.log("Upper Hull: ", upper);
    candidates = [];
    for (let i = 0; i < points.length; i++) {
        if (LL.x !== points[i].x && LR.x !== points[i].x) {
            candidates.push(points[i]);
        }
    }
    candidates.push(LL);
    candidates.push(LR);

    let lower = lowerHull(LL, LR, candidates);
    console.log("Lower Hull: ", lower);
    let i = lower.length - 1;
    let end = 0;

    if (upper && upper.length && upper[upper.length - 1] === lower[i]) i--;
    if (upper[0] === lower[0]) end++;

    for (; i >= end; i--) {
        upper.push(lower[i]);
    }

    convexHull = upper;
    console.log("COnvex Hull: ",convexHull);
    return convexHull;
}