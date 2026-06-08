import Link from "next/link";
import { REVIEW_CARDS, REVIEWS_PAGE } from "@/lib/reviews-data";
import { ReviewCard } from "./ReviewCard";

export function ReviewsSection() {
  return (
    <section className="reviews-section" aria-labelledby="reviews-title">
      <div className="reviews-page__inner">
        <header className="reviews-page__header">
          <h1 id="reviews-title" className="reviews-page__title">
            {REVIEWS_PAGE.title}
          </h1>
          <Link href="#all" className="reviews-page__link reviews-page__link--top">
            {REVIEWS_PAGE.viewAllTop}
          </Link>
        </header>

        <div className="reviews-page__grid">
          {REVIEW_CARDS.map((card) => (
            <ReviewCard key={card.id} data={card} />
          ))}
        </div>

        <Link href="#all" id="all" className="reviews-page__link reviews-page__link--bottom">
          {REVIEWS_PAGE.viewAllBottom}
        </Link>
      </div>
    </section>
  );
}
