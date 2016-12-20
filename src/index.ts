function init(cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  cvs.width = 320;
  cvs.height = 340;
  window.requestAnimationFrame((event) => {

    async function start(sideLen: number, xOffset: number, yOffset: number, depth: number, paths: Path[]) {

      if (depth > 0) {
        let tri = getPathCords(sideLen, xOffset, yOffset);
        let innerTri = deriveInnerTriangle(sideLen, xOffset, yOffset);

        await drawTriangles(ctx, tri, paths);

        let top = innerTri.a;
        let bLeft = tri.a;
        let bRight = innerTri.c;

        for (let inner of [top, bLeft, bRight]) {
          let iTri = deriveInnerTriangle(sideLen / 2, inner.x, inner.y);
          await drawTriangles(ctx, iTri, paths);
        }

        let d = --depth;
        start(sideLen / 2, xOffset + sideLen / 2, yOffset, d, paths);
        start(sideLen / 2, xOffset, yOffset, d, paths);
        start(sideLen / 2, top.x, top.y, d, paths);
      }
    }
    
    start(300, 10, 330, 2, []).then(x => { console.log('done', x); });
  });
}

async function drawTriangles(ctx: CanvasRenderingContext2D, tri: Triangle, nextPaths: Path[]) {
  await draw(ctx, tri.a.x, tri.a.y, tri.b.x, tri.b.y, 0, nextPaths);
  await draw(ctx, tri.b.x, tri.b.y, tri.c.x, tri.c.y, 0, nextPaths);
  await draw(ctx, tri.c.x, tri.c.y, tri.a.x, tri.a.y, 0, nextPaths);
  // ctx.clearRect(0, 0, 340, 420)
  // _drawTri(ctx, tri);  
}

interface Point {
  x: number
  y: number
}

interface Triangle {
  a: Point
  b: Point
  c: Point
}

function getPathCords(len: number, xOrigin: number, yOrigin: number): Triangle {
  var c = len;
  var b = c / 2;
  var a = Math.sqrt(Math.pow(c, 2) - Math.pow(b, 2));
  return {
    a: { x: xOrigin, y: yOrigin },
    b: { x: c + xOrigin, y: yOrigin },
    c: { x: b + xOrigin, y: yOrigin - a }
  };
}

function deriveInnerTriangle(len: number, xOrigin: number, yOrigin: number): Triangle {
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
  // ctx.fillStyle = fillStyle;
  // ctx.fill();
}

function _drawTriangles(ctx: CanvasRenderingContext2D, triangles: Triangle[]) {
  triangles.forEach((tri) => _drawTri(ctx, tri))
}

function lerp(a: number, b: number, f: number) {
  a = Math.max(a, 0);
  b = Math.max(b, 0);
  return Math.floor(a + f * (b - a));
}

interface Cb {
  (a: any): any
}

interface Path {
  origin: Point
  end: Point
}

function draw(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, amount = 0, paths: Path[]) {
  const [iX, iY] = [startX, startY];
  return new Promise((resolve: Cb) => {
    _draw(startX, startY, endX, endY, amount, paths);

    function _draw(startX: number, startY: number, endX: number, endY: number, amount = 0, prevPaths: Path[]) {
      ctx.clearRect(0, 0, 320, 340);

      if (prevPaths.length > 0) {
        drawPaths(ctx, prevPaths);
      }

      if (amount >= 1) {
        drawPaths(ctx, prevPaths);
        drawPath(ctx, iX, iY, endX, endY);
        addNextPath(iX, iY, endX, endY, prevPaths);
        return resolve(true);
      }

      startX = lerp(iX, endX, amount);
      startY = lerp(iY, endY, amount);
      // console.log({startX, startY})
      // console.log({ startX, startY, iX, iY });
      drawPath(ctx, iX, iY, startX, startY);
      // ctx.beginPath();
      // ctx.moveTo(iX, iY);
      // ctx.lineTo(startX, startY);
      // ctx.stroke();
      window.requestAnimationFrame(() => _draw(startX, startY, endX, endY, amount + 0.05, prevPaths));
    }
  });
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

function addNextPath(originX: number, originY: number, endX:number, endY:number, paths: Path[]) {
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

document.addEventListener('DOMContentLoaded', (event) => {
  const cvs = <HTMLCanvasElement>document.getElementById('cvs');
  const ctx = <CanvasRenderingContext2D>cvs.getContext('2d');
  init(cvs, ctx);
});