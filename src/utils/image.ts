export function resizeImage(file: File, maxWidth = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать изображение'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Неверный формат изображения'));
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function optimizedImageUrl(source: string, width: number, quality = 74) {
  if (!source.includes('images.unsplash.com')) return source;
  const url = new URL(source);
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality));
  return url.toString();
}

export function optimizedImageSrcSet(source: string, widths: number[]) {
  if (!source.includes('images.unsplash.com')) return undefined;
  return widths.map(width => `${optimizedImageUrl(source, width)} ${width}w`).join(', ');
}
