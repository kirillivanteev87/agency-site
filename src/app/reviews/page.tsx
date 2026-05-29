import type { Metadata } from "next";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";

export const metadata: Metadata = {
  title: "Отзывы",
  description: "Отзывы клиентов о сотрудничестве и качестве продукции.",
};

export default function ReviewsPage() {
  return (
    <main className="overflow-x-clip">
      <ReviewsSection />
    </main>
  );
}
