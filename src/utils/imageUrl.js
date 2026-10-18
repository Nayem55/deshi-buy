const CLOUDINARY_UPLOAD_PATH = '/image/upload/';

const isCloudinaryImage = (source) => typeof source === 'string' && source.includes('res.cloudinary.com') && source.includes(CLOUDINARY_UPLOAD_PATH);
const wikimediaParts = (source) => {
  if (typeof source !== 'string') return null;
  const cleanSource = source.split('?')[0];
  const match = cleanSource.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/([^/]+)\/([^/]+)\/(.+)$/);
  if (!match || match[4].startsWith('thumb/')) return null;
  return { base: match[1], hashA: match[2], hashB: match[3], filename: match[4] };
};

const optimizedWikimediaUrl = (source, width) => {
  const parts = wikimediaParts(source);
  if (!parts || !width) return source;
  // Commons currently serves only selected thumbnail widths. Its redirect endpoint
  // chooses a valid cached size, unlike hand-building a /thumb/ URL which can 400.
  return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${parts.filename}?width=${Math.round(width)}`;
};

export const optimizedImageUrl = (source, { width, quality = 'auto:eco' } = {}) => {
  if (!isCloudinaryImage(source)) return optimizedWikimediaUrl(source, width);

  const [prefix, assetPath] = source.split(CLOUDINARY_UPLOAD_PATH);
  const transforms = ['f_auto', `q_${quality}`, width ? `w_${Math.round(width)}` : '', width ? 'c_limit' : '']
    .filter(Boolean)
    .join(',');

  return `${prefix}${CLOUDINARY_UPLOAD_PATH}${transforms}/${assetPath}`;
};

export const optimizedImageSrcSet = (source, widths = [], options = {}) => {
  // A Wikimedia redirect selects the nearest available size itself; multiple
  // arbitrary srcset widths can resolve to the same image and duplicate requests.
  if (!isCloudinaryImage(source)) return undefined;
  return widths.map((width) => `${optimizedImageUrl(source, { ...options, width })} ${width}w`).join(', ');
};
