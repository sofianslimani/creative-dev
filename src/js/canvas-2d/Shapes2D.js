export function circle(context, x, y, radius, ...args) {
  /** style */
  let isStroke_ = true;
  let isFill_ = false;
  if (args.length > 0) {
    const style_ = args[0];
    isStroke_ = !!style_.isStroke ? style_.isStroke : isStroke_;
    isFill_ = !!style_.isFill ? style_.isFill : isFill_;
  }

  /** draw */
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  if (isFill_) context.fill();
  if (isStroke_) context.stroke();
  context.closePath();
}

export function line(context, x1, y1, x2, y2, ...args) {
  /** style */
  let isStroke_ = true;
  let isFill_ = false;
  if (args.length > 0) {
    const style_ = args[0];
    isStroke_ = !!style_.isStroke ? style_.isStroke : isStroke_;
    isFill_ = !!style_.isFill ? style_.isFill : isFill_;
  }

  /** draw */
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  if (isFill_) context.fill();
  if (isStroke_) context.stroke();
  context.closePath();
}
