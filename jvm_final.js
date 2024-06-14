/**
 * Determines the orientation of three points: clockwise, counterclockwise, or collinear.
 * @param {object} p1 - The first point object with properties x and y.
 * @param {object} p2 - The second point object with properties x and y.
 * @param {object} p3 - The third point object with properties x and y.
 * @returns {number} Returns 1 if points are in clockwise orientation, -1 if counterclockwise, or 0 if collinear.
 */
function orientation(p1, p2, p3) {
    let d = (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);
    if (d === 0) return 0; // collinear
    return (d > 0) ? 1 : -1; // clockwise or counterclockwise
}

/**
 * Calculates the Euclidean distance between two points.
 * @param {object} p1 - The first point object with properties x and y.
 * @param {object} p2 - The second point object with properties x and y.
 * @returns {number} The Euclidean distance between the two points.
 */
function distance(p1, p2) {
    return Math.sqrt((p2.y - p1.y) ** 2 + (p2.x - p1.x) ** 2);
}

/**
 * Implements the Jarvis March algorithm to find the convex hull of a set of points.
 * @param {object[]} points - An array of point objects with properties x and y.
 * @returns {object[]} An array containing the points forming the convex hull in counterclockwise order.
 */
function jarvisMarch(points) {
    // Find the point with the lowest y-coordinate (or leftmost if there's a tie)
    let onHull = points.reduce((min, p) => p.y < min.y ? p : min);

    // Initialize the convex hull array
    let hull = [];

    // Iterate to find the convex hull
    while (true) {
        hull.push(onHull);

        let nextPoint = points[0];
        for (let point of points) {
            let o = orientation(onHull, nextPoint, point);
            if (nextPoint === onHull || o === 1 || (o === 0 && distance(onHull, point) > distance(onHull, nextPoint))) {
                nextPoint = point;
            }
        }
        onHull = nextPoint;
        if (onHull === hull[0]) break;
    }
    return hull;
}