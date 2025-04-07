import { Shapes } from "./drawShape";

export const findInterSection = (
  x: number,
  y: number,
  existingShape: Shapes,
) => {
  if (existingShape.type == "PENCIL") {
    let minX = 100000;
    let minY = 10000;
    let maxX = -1;
    let maxY = -1;

    for (let i = 0; i < existingShape.points.length; i++) {
      minX = Math.min(minX, existingShape.points[i].x);
      minY = Math.min(minY, existingShape.points[i].y);
      maxX = Math.max(maxX, existingShape.points[i].x);
      maxY = Math.max(maxY, existingShape.points[i].y);
    }
    const truth =
      x >= Math.min(minX, maxX) &&
      x <= Math.max(minX, maxX) &&
      y >= Math.min(minY, maxY) &&
      y <= Math.max(minY, maxY);
    return truth;
  }

  if (existingShape.type == "CIRCLE") {
    const x1 = existingShape.x;
    const y1 = existingShape.y;
    const radius = existingShape.radiusX;
    const truth = (x - x1) ** 2 + (y - y1) ** 2 <= radius ** 2;
    return truth;
  } else if (existingShape.type == "RECTANGLE") {
    const x1 = existingShape.x;
    const y1 = existingShape.y;
    const x2 = existingShape.width + existingShape.x;
    const y2 = existingShape.height + existingShape.y;
    const truth =
      x >= Math.min(x1, x2) &&
      x <= Math.max(x1, x2) &&
      y >= Math.min(y1, y2) &&
      y <= Math.max(y1, y2);
    return truth;
  } else {
    const x1 = existingShape.x;
    const y1 = existingShape.y;
    const x2 = existingShape.x;
    const y2 = existingShape.y;
    const truth =
      x >= Math.min(x1, x2) &&
      x <= Math.max(x1, x2) &&
      y >= Math.min(y1, y2) &&
      y <= Math.max(y1, y2);
    return truth;
  }
};

export const checkCorner = (
  id: number,
  type: string,
  color: string,
  stroke: number,
  startX: number,
  startY: number,
  radius: number,
) => {
  return {
    id,
    type,
    color,
    stroke,
    startX,
    startY,
    radius,
  };
};
