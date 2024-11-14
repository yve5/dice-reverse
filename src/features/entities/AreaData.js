export const AreaData = function () {
  this.size = 0; // 0. Not in 1~
  this.cpos = 0; // Central cell
  this.arm = 0; // Subordinate
  this.dice = 0; // Number of dice

  // Variables for determining the central location
  this.left = 0;
  this.right = 0;
  this.top = 0;
  this.bottom = 0;
  this.cx = 0; // left,right
  this.cy = 0; // top,bottom
  this.len_min = 0;

  // For surrounding lines
  this.line_cel = new Array(100); // Cell
  this.line_dir = new Array(100); // Directions (0～5)
  this.join = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
  ]; // 32 adjacent flags
};
