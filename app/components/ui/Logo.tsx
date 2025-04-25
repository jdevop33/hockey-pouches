import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ className = '', size = 'medium' }: LogoProps) {
  // Define sizes based on the size prop
  const sizes = {
    small: { width: 120, height: 60, className: 'h-10' },
    medium: { width: 240, height: 120, className: 'h-16' },
    large: { width: 320, height: 160, className: 'h-24' },
  };

  const { width, height, className: sizeClass } = sizes[size];

  return (
    <Link href="/" className={`block ${className}`}>
      <div className={`relative min-w-[${width / 2}px] min-h-[${height / 2}px]`}>
        <Image
          src="/images/logo/logo3.svg"
          alt="Hockey Puxx Logo"
          width={width}
          height={height}
          className={`${sizeClass} w-auto max-w-none object-contain ${size === 'large' ? 'scale-120' : ''}`}
          priority
        />
      </div>
    </Link>
  );
}
