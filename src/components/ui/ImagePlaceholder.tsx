interface ImagePlaceholderProps {
  width?: string;
  height?: string;
  text?: string;
  variant?: 'product' | 'category' | 'hero' | 'vendor' | 'gallery';
  className?: string;
}

export default function ImagePlaceholder({ 
  width = 'w-full', 
  height = 'h-64', 
  text = 'Image',
  variant = 'product',
  className = ''
}: ImagePlaceholderProps) {
  const getGradient = () => {
    switch (variant) {
      case 'hero':
        return 'from-primary-500 via-primary-600 to-secondary-700';
      case 'category':
        return 'from-primary-100 to-secondary-100';
      case 'vendor':
        return 'from-secondary-100 to-accent-100';
      case 'gallery':
        return 'from-accent-100 to-primary-100';
      default:
        return 'from-primary-100 to-secondary-100';
    }
  };

  const getTextSize = () => {
    switch (variant) {
      case 'hero':
        return 'text-6xl';
      case 'category':
        return 'text-4xl';
      case 'vendor':
        return 'text-3xl';
      case 'gallery':
        return 'text-2xl';
      default:
        return 'text-4xl';
    }
  };

  return (
    <div 
      className={`${width} ${height} bg-gradient-to-br ${getGradient()} rounded-lg flex items-center justify-center ${className}`}
    >
      <span className={`${getTextSize()} font-bold text-white/80`}>
        {text}
      </span>
    </div>
  );
}
