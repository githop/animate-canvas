export const CANVAS_WIDTH = 620;
export const CANVAS_HEIGHT = 540;
export const X_OFFSET = 10;
export const Y_OFFSET = 530;
export const SIDE_LENGTH = 600;

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
    color?: string
}

export interface History {
    paths: Path[],
    triangles: Triangle[]
}

function randomColor() {
    const colors = ['#F96A00', '#FAAB00', '#DAF204'];
    return colors[Math.floor(Math.random() * 3)];
}

function drawPath(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, color: string = 'black') {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = 3.33;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawPaths(ctx: CanvasRenderingContext2D, paths: Path[]) {
    paths.forEach((p: Path) => drawPath(ctx, p.origin.x, p.origin.y, p.end.x, p.end.y, p.color));
}

function addNextPath(originX: number, originY: number, endX: number, endY: number, paths: Path[], color: string) {
    const path: Path = {
        origin: {
            x: originX,
            y: originY
        },
        end: {
            x: endX,
            y: endY
        },
        color
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
    triangles.forEach((tri: Triangle, i: number) => _drawTri(ctx, tri, i))
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

function _drawTri(ctx: CanvasRenderingContext2D, tri: Triangle, index: number) {
    ctx.beginPath();
    ctx.moveTo(tri.a.x, tri.a.y);
    ctx.lineTo(tri.b.x, tri.b.y);
    ctx.lineTo(tri.c.x, tri.c.y);
    ctx.closePath();
    ctx.fill()
}

export function clearRect(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function interpolatedPath(x:number, y:number, endX:number, endY:number, amount:number, color: string): Path {
    return {
        origin: {
            x,
            y
        },
        end: {
            x: _lerp(x, endX, amount),
            y: _lerp(y, endY, amount)
        },
        color
    };
}

export function draw(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, amount = 0, h: History) {
    const [iX, iY] = [startX, startY];

    return new Promise((resolve: Cb) => {
        _draw(startX, startY, endX, endY, amount, h);

        function _draw(startX: number, startY: number, endX: number, endY: number, amount = 0, h: History) {
            clearRect(ctx);

            if (h.paths.length > 0) {
                drawPaths(ctx, h.paths);
            }

            if (amount >= 1) {
                drawPaths(ctx, h.paths);
                const color = randomColor();
                drawPath(ctx, iX, iY, endX, endY, color);
                addNextPath(iX, iY, endX, endY, h.paths, color);
                return resolve(true);
            }

            const np: Path = interpolatedPath(iX, iY, endX, endY, amount, '#F90050');
            drawPath(ctx, np.origin.x, np.origin.y, np.end.x, np.end.y, np.color);
            window.requestAnimationFrame(() => _draw(np.origin.x, np.origin.y, endX, endY, amount + 0.1, h));
        }
    });
}
