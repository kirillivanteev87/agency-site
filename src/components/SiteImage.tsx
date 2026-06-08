type SiteImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  /** Above-the-fold / LCP candidates */
  priority?: boolean;
  width?: number;
  height?: number;
};

/** Надёжная загрузка: локальные и внешние URL без оптимизатора Next.js */
export function SiteImage({
  src,
  alt,
  className = "",
  fill,
  style,
  priority = false,
  width,
  height,
}: SiteImageProps) {
  if (!src) return null;

  const fillBase = fill ? "absolute inset-0 h-full w-full" : "";
  const objectFit = className.includes("object-") ? "" : fill ? "object-cover" : "";
  const classes = [fillBase, objectFit, className].filter(Boolean).join(" ");

  return (
    <img
      src={src}
      alt={alt}
      className={classes}
      style={style}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
