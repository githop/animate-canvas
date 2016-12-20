export interface Point {
    x: number
    y: number
}

export interface Triangle {
    a: Point
    b: Point
    c: Point
}

export interface Cb {
    (a: any): any
}

export interface Path {
    origin: Point
    end: Point
}

export interface History {
    paths: Path[],
    triangles: Triangle[]
}

function drawPath(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

function drawPaths(ctx: CanvasRenderingContext2D, paths: Path[]) {
    paths.forEach((p: Path) => drawPath(ctx, p.origin.x, p.origin.y, p.end.x, p.end.y));
}

function addNextPath(originX: number, originY: number, endX: number, endY: number, paths: Path[]) {
    const path: Path = {
        origin: {
            x: originX,
            y: originY
        },
        end: {
            x: endX,
            y: endY
        }
    }
    paths.push(path);
}

function clearPaths(paths: Path[]) {
    paths = [];
}

function addNextTriangle(t: Triangle, ts: Triangle[]) {
    ts.push(t);
}

export function _drawTriangles(ctx: CanvasRenderingContext2D, triangles: Triangle[]) {
    triangles.forEach((tri) => _drawTri(ctx, tri))
}

function _lerp(a: number, b: number, f: number) {
    a = Math.max(a, 0);
    b = Math.max(b, 0);
    return Math.floor(a + f * (b - a));
}

export async function drawTriangles(ctx: CanvasRenderingContext2D, tri: Triangle, h: History) {
    await draw(ctx, tri.a.x, tri.a.y, tri.b.x, tri.b.y, 0, h);
    await draw(ctx, tri.b.x, tri.b.y, tri.c.x, tri.c.y, 0, h);
    await draw(ctx, tri.c.x, tri.c.y, tri.a.x, tri.a.y, 0, h);
    clearPaths(h.paths);
    addNextTriangle(tri, h.triangles);
}

export function getPathCords(len: number, xOrigin: number, yOrigin: number): Triangle {
    var c = len;
    var b = c / 2;
    var a = Math.sqrt(Math.pow(c, 2) - Math.pow(b, 2));
    return {
        a: { x: xOrigin, y: yOrigin },
        b: { x: c + xOrigin, y: yOrigin },
        c: { x: b + xOrigin, y: yOrigin - a }
    };
}

export function deriveInnerTriangle(len: number, xOrigin: number, yOrigin: number): Triangle {
    var s2 = len / 2;
    var c2 = s2;
    var b2 = c2 / 2;
    var a2 = Math.sqrt(Math.pow(c2, 2) - Math.pow(b2, 2));
    var xOrg2 = xOrigin + b2;
    var yOrg2 = yOrigin - a2;
    return {
        a: { x: xOrg2, y: yOrg2 },
        b: { x: c2 + xOrg2, y: yOrg2 },
        c: { x: c2 + xOrigin, y: yOrigin }
    };
}

function _drawTri(ctx: CanvasRenderingContext2D, tri: Triangle, fillStyle?: string) {
    ctx.beginPath();
    ctx.moveTo(tri.a.x, tri.a.y);
    ctx.lineTo(tri.b.x, tri.b.y);
    ctx.lineTo(tri.c.x, tri.c.y);
    ctx.closePath();
    ctx.stroke();
}

function clearRect(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, 320, 340);
    // setTimeout(() => ctx.clearRect(0, 0, 320, 340), 0);
}

export function draw(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, amount = 0, h: History) {
    const [iX, iY] = [startX, startY];

    return new Promise((resolve: Cb) => {
        _draw(startX, startY, endX, endY, amount, h);

        function _draw(startX: number, startY: number, endX: number, endY: number, amount = 0, h: History) {
            
            clearRect(ctx);

            if (h.triangles.length > 0) {
                _drawTriangles(ctx, h.triangles);
            }

            if (h.paths.length > 0) {
                drawPaths(ctx, h.paths);
            }

            if (amount >= 1) {
                drawPaths(ctx, h.paths);
                drawPath(ctx, iX, iY, endX, endY);
                addNextPath(iX, iY, endX, endY, h.paths);
                return resolve(true);
            }

            startX = _lerp(iX, endX, amount);
            startY = _lerp(iY, endY, amount);
            drawPath(ctx, iX, iY, startX, startY);

            window.requestAnimationFrame(() => _draw(startX, startY, endX, endY, amount + 0.06, h));
        }
    });
}
