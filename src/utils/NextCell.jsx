// Method Return the neighboring cell number

export const nextCell = function (opos, dir, xmax, ymax) {
  const ox = opos % xmax;
  const oy = Math.floor(opos / xmax);
  const f = oy % 2;

  let ax = 0;
  let ay = 0;

  switch (dir) {
    case 0:
      ax = f;
      ay = -1;
      break; // right-upper

    case 1:
      ax = 1;
      break; // rightl

    case 2:
      ax = f;
      ay = 1;
      break; // Lower right

    case 3:
      ax = f - 1;
      ay = 1;
      break; // Lower left

    case 4:
      ax = -1;
      break; // left

    case 5:
      ax = f - 1;
      ay = -1;
      break; // Top left
  }

  const x = ox + ax;
  const y = oy + ay;

  if (x < 0 || y < 0 || x >= xmax || y >= ymax) {
    return -1;
  }

  return y * xmax + x;
};
