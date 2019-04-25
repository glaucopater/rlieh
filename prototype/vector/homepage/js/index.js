//
// Utilities
// -----------------------------------------

var getHeight = el => el.getBoundingClientRect().height;
var getWidth = el => el.getBoundingClientRect().width;

//
// Class definition
// -----------------------------------------

class RegularTriangle {
    constructor(parent, points, hasBorder) {
        this.parent = parent;
        this.points = points;
        this.hasBorder = hasBorder;
    }

    doTrianglePolygon(
        parentElement,
        strokeWidth = 4,
        strokeColor = "#000"
    ) {
        var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

        if (!this.hasBorder) {
            var pointsString = this.points.join(" ");
            polygon.setAttribute("points", pointsString);
        } else {
            // preventing overflow by setting
            // a safe area to draw the stroke
            var strokeOffset = strokeWidth / 2;
            var newPoints = this.points.map(pointItem =>
                pointItem.map(num => {
                    if (num === 0) {
                        return num + strokeOffset
                    } else if (
                        num === getHeight(this.parent) || num === getWidth(this.parent)) {
                        return num - strokeOffset
                    } else {
                        return num
                    }
                } )
            )

            var pointsString = newPoints.join(" ");
            polygon.setAttribute("points", pointsString);
            polygon.style.stroke = strokeColor;
            polygon.style.strokeWidth = strokeWidth;
        }

        parentElement.appendChild(polygon);
    }

    draw() {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("height", getHeight(this.parent));
        svg.setAttribute("width", getWidth(this.parent));
        this.parent.appendChild(svg);

        this.doTrianglePolygon(svg);
    }
}

class ComplexTriangle extends RegularTriangle {
    constructor(parent, points, hasBorder, innerPoints) {
        super(parent, points, hasBorder);
        this.innerPoints = innerPoints;
    }

    doInnerTrianglePolygon(
        parentElement,
        nextElement = null
    ) {
        var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

        var pointsString = this.innerPoints.join(" ");
        polygon.setAttribute("points", pointsString);

        if (nextElement) {
            parentElement.insertBefore(polygon, nextElement);
        } else {
            parentElement.appendChild(polygon);
        }
    }

    doGroupOfLines(
        parent,
        nextSibling,
        linesNum,
        linesWidth,
        linesColor
    ) {
        var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("clip-path", "url(#mask)");
        parent.insertBefore(group, nextSibling);

        var distance = getHeight(this.parent) / (linesNum + 1);
        var n = 0;
        while (n < linesNum) {
            var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.style.stroke = linesColor;
            line.style.strokeWidth = linesWidth;

            line.setAttribute("x1", 0);
            line.setAttribute("x2", getWidth(this.parent));
            line.setAttribute("y1", distance.toFixed(2));
            line.setAttribute("y2", distance.toFixed(2));
            group.appendChild(line);

            n++;
            distance += distance / n;
        }
    }

    draw(
        linesNum = 16,
        linesWidth = 4,
        linesColor = "#000"
    ) {
        super.draw();

        // references to the elements created
        // in the inherited `draw()` method
        var svg = this.parent.children[0];
        var triangle = svg.children[0];

        // removing fill color from main triangle
        triangle.style.fill = "none";

        // lines
        this.doGroupOfLines(svg, triangle, linesNum, linesWidth, linesColor);

        // clipping path: same as main triangle
        var clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clipPath.id = "mask";
        svg.prepend(clipPath);
        this.doTrianglePolygon(clipPath);

        // inner triangle
        this.doInnerTrianglePolygon(svg, triangle);
    }
}


//
// Regular triangles
// -----------------------------------------

var t1 = document.querySelector(".triangle-1");
var t2 = document.querySelector(".triangle-2");
var t3 = document.querySelector(".triangle-3");

var regularTriangles = [
    {
        parent: t1,
        polygonPoints: [
            [getWidth(t1), 0],
            [getWidth(t1), getHeight(t1)],
            [0, getHeight(t1)]
        ],
        hasBorder: false
    },
    {
        parent: t2,
        polygonPoints: [
            [0, 0],
            [getWidth(t2), 0],
            [Math.round(getWidth(t2) * .7), getHeight(t2)]
        ],
        hasBorder: true
    },
    {
        parent: t3,
        polygonPoints: [
            [getWidth(t3) / 2, 0],
            [getWidth(t3), getHeight(t3)],
            [0, getHeight(t3)]
        ],
        hasBorder: true
    }
]


//
// Complex triangles
// -----------------------------------------

var t4 = document.querySelector(".triangle-4");

var complexTriangles = [
    {
        parent: t4,
        polygonPoints: [
            [getWidth(t4) * .42, 0],
            [getWidth(t4), getHeight(t4)],
            [0, getHeight(t4)]
        ],
        hasBorder: true,
        innerPolygonPoints: [
            [getWidth(t4) * .42, 0],
            [getWidth(t4) * .3, getHeight(t4)],
            [0, getHeight(t4)]
        ]
    }
]


//
// Create instances and run methods
// -----------------------------------------

var trianglesArray = []

for (triangle of regularTriangles) {
    trianglesArray.push(new RegularTriangle(
        triangle.parent,
        triangle.polygonPoints,
        triangle.hasBorder
    ));
}

for (triangle of complexTriangles) {
    trianglesArray.push(new ComplexTriangle(
        triangle.parent,
        triangle.polygonPoints,
        triangle.hasBorder,
        triangle.innerPolygonPoints
    ));
}

trianglesArray.forEach(triangle => triangle.draw());