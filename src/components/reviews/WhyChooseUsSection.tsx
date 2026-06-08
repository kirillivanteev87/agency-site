import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteImage } from "@/components/SiteImage";
import { WHY_CHOOSE_US, type WhyChooseUsStat } from "@/lib/reviews-data";

function BenefitLightningIcon() {
  return (
    <svg
      className="why-choose-us__benefit-icon-svg"
      viewBox="0 0 28 28"
      width={28}
      height={28}
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <path
        fill="currentColor"
        d="M14.25 8.1 10.35 14.8h3.4l-1 5.1 5.4-8.1h-3.3l-.6-3.7z"
      />
    </svg>
  );
}

function StatIcon({ stat }: { stat: WhyChooseUsStat }) {
  return (
    <span className="why-choose-us__stat-icon" aria-hidden="true">
      <SiteImage
        src={stat.image}
        alt=""
        width={180}
        height={180}
        className="why-choose-us__stat-icon-img object-contain"
      />
    </span>
  );
}

export function WhyChooseUsSection() {
  return (
    <section className="why-choose-us" aria-labelledby="why-choose-us-title">
      <div className="reviews-page__inner why-choose-us__inner">
        <h2 id="why-choose-us-title" className="why-choose-us__title">
          {WHY_CHOOSE_US.title}
        </h2>

        <div className="why-choose-us__layout">
          <article className="why-choose-us__card">
            <h3 className="why-choose-us__headline">{WHY_CHOOSE_US.headline}</h3>

            <span className="why-choose-us__badge">{WHY_CHOOSE_US.badge}</span>

            <ul className="why-choose-us__benefits">
              {WHY_CHOOSE_US.benefits.map((benefit) => (
                <li key={benefit.id} className="why-choose-us__benefit">
                  <span className="why-choose-us__benefit-icon" aria-hidden="true">
                    <BenefitLightningIcon />
                  </span>
                  <span>{benefit.text}</span>
                </li>
              ))}
            </ul>

            <Link href={WHY_CHOOSE_US.cta.href} className="why-choose-us__cta">
              {WHY_CHOOSE_US.cta.label}
              <ArrowUpRight size={18} className="why-choose-us__cta-icon" aria-hidden="true" />
            </Link>
          </article>

          <div className="why-choose-us__stats">
            {WHY_CHOOSE_US.stats.map((stat) => (
              <article key={stat.id} className="why-choose-us__stat">
                <div className="why-choose-us__stat-content">
                  <p
                    className={`why-choose-us__stat-value${stat.accent ? " why-choose-us__stat-value--accent" : ""}`}
                  >
                    {stat.value}
                  </p>
                  <p className="why-choose-us__stat-label">{stat.label}</p>
                </div>
                <StatIcon stat={stat} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
