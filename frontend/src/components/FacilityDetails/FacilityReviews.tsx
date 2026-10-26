import type { Recenzija } from "../../types";

type FacilityReviewsProps = {
  rating: number | null;
  reviewCount: number;
  reviews: Recenzija[];
  isAuthenticated: boolean;
  onAddReview: () => void;
};

export default function FacilityReviews({
  rating,
  reviewCount,
  reviews,
  isAuthenticated,
  onAddReview,
}: FacilityReviewsProps) {
  const hasReviews = reviewCount > 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={index < rating ? "text-chart-amber" : "text-border-default"}
      >
        ★
      </span>
    ));
  };

  return (
    <section className="rounded-[40px] border border-primary-soft bg-surface p-4 shadow-sport-card sm:p-10 lg:col-start-2">
      {hasReviews ? (
        <div className="mb-8 flex flex-wrap items-start justify-between gap-3 border-b border-border-light pb-8">
          <div>
            <p className="text-xs font-black tracking-widest text-primary-light uppercase">
              Dojmovi igrača
            </p>

            <h2 className="mt-2 text-5xl font-black text-text-primary">
              ⭐ {rating}
            </h2>
          </div>

          {isAuthenticated && (
            <button
              type="button"
              onClick={onAddReview}
              className="btn-primary mt-2 rounded-2xl px-6 py-3 text-xs font-black uppercase shadow-sport-primary hover:scale-105 active:scale-95"
            >
              <span>Dodaj</span>
              <span className="text-xl leading-none">+</span>
            </button>
          )}
        </div>
      ) : (
        <div className="mb-10 flex flex-wrap items-center justify-between gap-3 border-b border-border-light pb-8">
          <div className="text-center lg:text-left">
            <p className="text-xs font-black tracking-widest text-text-muted uppercase">
              Dojmovi igrača
            </p>

            <h2 className="mt-2 text-2xl font-bold text-text-muted">
              Još nema ocjena
            </h2>
          </div>

          {isAuthenticated && (
            <button
              type="button"
              onClick={onAddReview}
              className="btn-primary rounded-2xl px-6 py-3 text-xs font-black uppercase shadow-sport-primary hover:scale-105 active:scale-95"
            >
              <span>Budi prvi</span>
              <span className="text-xl leading-none">+</span>
            </button>
          )}
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          <p className="-mb-3 text-[10px] font-bold tracking-widest text-text-muted uppercase italic">
            Ukupno recenzija: {reviewCount}
          </p>

          {reviews.map((review, index) => (
            <div
              key={index}
              className="rounded-3xl border border-border-light bg-background p-6 transition-colors hover:border-primary-border"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary-soft font-bold text-primary">
                    {review.ime[0]}
                    {review.prezime[0]}
                  </div>

                  <div>
                    <h4 className="font-bold text-text-primary">
                      {review.ime} {review.prezime}
                    </h4>

                    <p className="text-[10px] font-bold text-text-muted uppercase">
                      {new Date(review.datumObjave).toLocaleDateString("hr-HR")}
                    </p>
                  </div>
                </div>

                <div className="flex text-lg">{renderStars(review.ocjena)}</div>
              </div>

              <p className="text-body-sm leading-relaxed text-text-secondary italic">
                "{review.komentar}"
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border-default bg-surface-soft py-12 text-center">
          <div className="mb-4 text-4xl opacity-50">💬</div>

          <p className="font-medium text-text-muted italic">
            Postani prvi koji će ostaviti recenziju!
          </p>
        </div>
      )}
    </section>
  );
}
