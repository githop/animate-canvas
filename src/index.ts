
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  X_OFFSET,
  Y_OFFSET,
  SIDE_LENGTH,
  Triangle,
  Point,
  Path,
  History,
  getPathCords,
  deriveInnerTriangle,
  drawTriangles,
  _drawTriangles,
  clearRect,
  makePath,
} from './utils';


document.addEventListener('DOMContentLoaded', (event) => {
  const cvs = <HTMLCanvasElement>document.getElementById('cvs');
  const ctx = <CanvasRenderingContext2D>cvs.getContext('2d');
  // renderBtn.addEventListener('click', () => reDraw(ctx));
  // const path = makePath(0,0,100,100);
  init(cvs, ctx);
});

function init(cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  cvs.width = CANVAS_WIDTH;
  cvs.height = CANVAS_HEIGHT;
  const history: History = { triangles: [], paths: [] };
  window.requestAnimationFrame((event) => {
    start(ctx, SIDE_LENGTH, X_OFFSET, Y_OFFSET, 3, history, 0.2).then((x: any) => {
      console.log('all done!');
    })
  });
}



async function start(ctx: CanvasRenderingContext2D, sideLen: number, xOffset: number, yOffset: number, depth: number, h: History, speed: number) {
  if (depth > 0) {
    let tri = getPathCords(sideLen, xOffset, yOffset);
    let innerTri = deriveInnerTriangle(sideLen, xOffset, yOffset);

    //base triangle
    await drawTriangles(ctx, tri, h, speed);
    //inverted inner triangle
    await drawTriangles(ctx, innerTri, h, speed);
    //recursively draw the rest of the inner triangles.
    await innerRecur(ctx, innerTri, sideLen, depth, h, speed);

    ctx.fillStyle = 'white';
    ctx.font = '24px monospace';
    const text = 'Sierpinski Triangle';
    const centerText = ctx.measureText(text);
    ctx.fillText(text, innerTri.centoid.x - (centerText.width / 2), innerTri.centoid.y)
  }
}


async function innerRecur(ctx: CanvasRenderingContext2D, innerTri: Triangle, sideLen: number, depth: number, h: History, speed: number) {
  if (depth > 0) {
    let top = innerTri.a;
    let bLeft = getPathCords(sideLen / 2, innerTri.c.x - (sideLen / 2), innerTri.c.y).a;
    let bRight = innerTri.c;

    for (let inner of [top, bLeft, bRight]) {
      let iTri = deriveInnerTriangle(sideLen / 2, inner.x, inner.y);
      await drawTriangles(ctx, iTri, h, speed);
    }
    
    let d = --depth;
    await innerRecur(ctx, deriveInnerTriangle(sideLen / 2, innerTri.a.x, innerTri.a.y), sideLen / 2, d, h, speed);
    innerRecur(ctx, deriveInnerTriangle(sideLen / 2, bLeft.x, bLeft.y), sideLen / 2, d, h, speed);
    await innerRecur(ctx, deriveInnerTriangle(sideLen / 2, innerTri.c.x, innerTri.c.y), sideLen / 2, d, h, speed);
  }
}