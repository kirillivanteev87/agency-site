import type { ReviewCardData } from "@/lib/reviews-data";

type Props = {
  data: ReviewCardData;
};

function GalleryPlaceholder({ alt }: { alt: string }) {
  return (
    <div
      className="reviews-gallery-thumb"
      role="img"
      aria-label={alt}
    />
  );
}

export function ReviewCard({ data }: Props) {
  const subtitle = data.company?.trim() || data.role.trim();

  return (
    <article className="reviews-card">
      <header className="reviews-card__header">
        <div
          className="reviews-avatar"
          style={{
            backgroundColor: data.avatar.bg,
            color: data.avatar.color,
          }}
        >
          <span className={data.avatar.type === "text" ? "reviews-avatar__tim" : "reviews-avatar__letter"}>
            {data.avatar.label}
          </span>
        </div>
        <div className="reviews-card__meta">
          <p className="reviews-card__name">{data.name}</p>
          {subtitle ? <p className="reviews-card__role">{subtitle}</p> : null}
        </div>
      </header>

      <p className="reviews-card__quote">{data.quote}</p>

      {data.gallery.length > 0 ? (
        <div className="reviews-card__gallery" aria-label="Фотографии">
          {data.gallery.map((img) => (
            <GalleryPlaceholder key={img.id} alt={img.alt} />
          ))}
        </div>
      ) : null}

      <footer className="reviews-card__source">
        <span className="reviews-card__source-label">{data.sourceLabel}</span>
        <span className="reviews-card__source-logo" aria-label={data.sourceName}>
          {data.sourceName}
        </span>
      </footer>
    </article>
  );
}
