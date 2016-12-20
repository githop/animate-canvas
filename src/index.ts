
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
  clearRect
} from './utils';


document.addEventListener('DOMContentLoaded', (event) => {
  const cvs = <HTMLCanvasElement>document.getElementById('cvs');
  const ctx = <CanvasRenderingContext2D>cvs.getContext('2d');
  init(cvs, ctx);
});

function init(cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  cvs.width = CANVAS_WIDTH;
  cvs.height = CANVAS_HEIGHT;
  const history: History = {triangles: [], paths: []};
  window.requestAnimationFrame((event) => {

    async function start(sideLen: number, xOffset: number, yOffset: number, depth: number, h: History) {

      if (depth > 0) {
        let tri = getPathCords(sideLen, xOffset, yOffset);
        let innerTri = deriveInnerTriangle(sideLen, xOffset, yOffset);

        await drawTriangles(ctx, tri, h);

        let top = innerTri.a;
        let bLeft = tri.a;
        let bRight = innerTri.c;

        for (let inner of [top, bLeft, bRight]) {
          let iTri = deriveInnerTriangle(sideLen / 2, inner.x, inner.y);
          await drawTriangles(ctx, iTri, h);
        }

        let d = --depth;
        await start(sideLen / 2, xOffset + sideLen / 2, yOffset, d, h);
        await start(sideLen / 2, xOffset, yOffset, d, h);
        await start(sideLen / 2, top.x, top.y, d, h);
      }
    }
    
    start(SIDE_LENGTH, X_OFFSET, Y_OFFSET, 2, history).then((x:any) => {
      console.log('all done!');
    });
    
  });
}
