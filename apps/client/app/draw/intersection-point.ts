/* eslint-disable @typescript-eslint/no-explicit-any */

export const findInterSection = (
  x: any,
  y: any,
  existingShape: any,
) => {
  if (existingShape.type == "pencil") {
    let minX = 100000;
    let minY = 10000;
    let maxX = -1;
    let maxY = -1;

    for (let i = 0; i < existingShape.path.length; i++) {
      minX = Math.min(minX, existingShape.path[i].x);
      minY = Math.min(minY, existingShape.path[i].y);
      maxX = Math.max(maxX, existingShape.path[i].x);
      maxY = Math.max(maxY, existingShape.path[i].y);
    }
    const truth =
      x >= Math.min(minX, maxX) &&
      x <= Math.max(minX, maxX) &&
      y >= Math.min(minY, maxY) &&
      y <= Math.max(minY, maxY);
    return truth;
  }

  if (existingShape.type == "ellipse") {
    const x1 = existingShape.startX;
    const y1 = existingShape.startY;
    const radius = existingShape.radius;
    const truth = (x - x1) ** 2 + (y - y1) ** 2 <= radius ** 2;
    return truth;
  } else if (existingShape.type == "rectangle") {
    const x1 = existingShape.startX;
    const y1 = existingShape.startY;
    const x2 = existingShape.width + existingShape.startX;
    const y2 = existingShape.height + existingShape.startY;
    const truth =
      x >= Math.min(x1, x2) &&
      x <= Math.max(x1, x2) &&
      y >= Math.min(y1, y2) &&
      y <= Math.max(y1, y2);
    return truth;
  } else {
    const x1 = existingShape.startX;
    const y1 = existingShape.startY;
    const x2 = existingShape.moveX;
    const y2 = existingShape.moveY;
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
