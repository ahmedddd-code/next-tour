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

export const realTravelHeroImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=88';
const fallbackTravelImage = 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=84';
const fallbackTourImage = '/images/tour-placeholder.svg';

function replaceImage(event: { currentTarget: HTMLImageElement }, fallback: string) {
  const image = event.currentTarget;
  const attempts = Number(image.dataset.fallbackAttempts ?? 0);
  image.srcset = '';
  image.dataset.fallbackAttempts = String(attempts + 1);
  image.src = attempts === 0 ? fallback : fallbackTourImage;
}

export const showTourImageFallback = (event: { currentTarget: HTMLImageElement }) => replaceImage(event, fallbackTourImage);
export const showTravelImageFallback = (event: { currentTarget: HTMLImageElement }) => replaceImage(event, fallbackTravelImage);

export function optimizedImageUrl(source: string | undefined, width: number, quality = 74) {
  const safeSource = source || fallbackTourImage;
  if (!safeSource.includes('images.unsplash.com')) return safeSource;
  const url = new URL(safeSource);
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality));
  return url.toString();
}

export function optimizedImageSrcSet(source: string | undefined, widths: number[]) {
  if (!source?.includes('images.unsplash.com')) return undefined;
  return widths.map(width => `${optimizedImageUrl(source, width)} ${width}w`).join(', ');
}
