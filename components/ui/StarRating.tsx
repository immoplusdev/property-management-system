import React from "react";
import { Icon } from "./Icon";

interface StarRatingProps {
  value: number;
  size?: number;
  showValue?: boolean;
  max?: number;
}

export function StarRating({ value, size = 13, showValue = false, max = 5 }: StarRatingProps) {
  return (
    <span className="star-rating" role="img" aria-label={`${value.toFixed(1)} sur ${max} étoiles`}>
      <span aria-hidden="true">
        {Array.from({ length: max }).map((_, i) => (
          <Icon
            key={i}
            name={i < Math.round(value) ? "starFilled" : "star"}
            size={size}
            color={i < Math.round(value) ? "var(--amber)" : "var(--text-4)"}
          />
        ))}
      </span>
      {showValue && (
        <span style={{ fontSize: size - 1, fontWeight: 600, marginLeft: 5 }} aria-hidden="true">
          {value.toFixed(1)}
        </span>
      )}
    </span>
  );
}
