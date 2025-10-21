// Canvas drawing utilities for dog camera

export const drawBoundingBox = (ctx, bbox, color, lineWidth = 3) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(bbox[0], bbox[1], bbox[2], bbox[3]);
};

export const drawLabel = (ctx, text, x, y, color, fontSize = 20) => {
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillText(text, x, y > 25 ? y - 5 : y + 25);
};

export const drawZone = (ctx, zone, name, radius = 150) => {
  if (!zone) return;

  const colors = {
    food: '#EF4444',
    water: '#3B82F6',
    bed: '#8B5CF6',
  };

  const color = colors[name] || '#666666';

  // Draw dashed circle
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.arc(zone.x, zone.y, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Draw label
  ctx.fillStyle = color;
  ctx.font = 'bold 16px Arial';
  ctx.fillText(name.toUpperCase(), zone.x - 20, zone.y - 160);
};

export const drawDetectedObject = (ctx, prediction, labelClass = null) => {
  const color = labelClass === 'pet' ? '#10B981' : '#F59E0B';
  const fontSize = labelClass === 'pet' ? 20 : 16;
  
  drawBoundingBox(ctx, prediction.bbox, color, labelClass === 'pet' ? 3 : 2);
  
  const label = labelClass === 'pet' 
    ? `${prediction.class === 'person' ? 'PET' : prediction.class.toUpperCase()}`
    : prediction.class.toUpperCase();
  
  drawLabel(
    ctx,
    label,
    prediction.bbox[0],
    prediction.bbox[1],
    color,
    fontSize
  );
};

export const drawPetWithActivity = (ctx, dog, activity) => {
  drawBoundingBox(ctx, dog.bbox, '#10B981', 3);
  
  const label = dog.class === 'person' ? 'PET' : dog.class.toUpperCase();
  const text = `${label} - ${activity} (${(dog.score * 100).toFixed(0)}%)`;
  
  drawLabel(ctx, text, dog.bbox[0], dog.bbox[1], '#10B981', 20);
};

