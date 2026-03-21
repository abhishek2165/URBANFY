const getOptimizedImage = (url, width = 500, height = 500, crop = 'fill') => {
    if (!url) {
        return 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop';
    }

    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
        return url.replace(
            '/upload/',
            `/upload/w_${width},h_${height},c_${crop},g_auto,q_auto,f_auto/`
        );
    }

    return url;
};

export const productCardImage = (url) => getOptimizedImage(url, 400, 400, 'fill');
export const productListImage = (url) => getOptimizedImage(url, 300, 300, 'fill');
export const productDetailImage = (url) => getOptimizedImage(url, 800, 800, 'fill');
export const thumbnailImage = (url) => getOptimizedImage(url, 100, 100, 'fill');
export const saleBannerImage = (url) => getOptimizedImage(url, 1200, 500, 'fill');
export const heroBannerImage = (url) => getOptimizedImage(url, 1400, 600, 'fill');
export const categoryImage = (url) => getOptimizedImage(url, 400, 300, 'fill');
export const cartImage = (url) => getOptimizedImage(url, 150, 150, 'fill');
export const bannerImage = (url) => getOptimizedImage(url, 600, 400, 'fill');

export default getOptimizedImage;