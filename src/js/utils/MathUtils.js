export function randomRange(min, max) {
  const min_ = max < min ? max : min;
  const max_ = min > max ? min : max;
  return min_ + Math.random() * (max_ - min_);
}

export const distance2d = (x1, y1, x2, y2) => {
  const dx_ = x2 - x1;
  const dy_ = y2 - y1;
  return Math.sqrt(dx_ * dx_ + dy_ * dy_);
};

export const clamp = (value, min, max) => {
  const min_ = max < min ? max : min;
  const max_ = min > max ? min : max;
  value = value > max_ ? max_ : value;
  value = value < min_ ? min_ : value;
  return value;
};
