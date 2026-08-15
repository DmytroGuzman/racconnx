type Props = {
  badge: string;
  title: string;
  subtitle: string;
};

export default function SectionTitle({
  badge,
  title,
  subtitle,
}: Props) {
  return (
    <div className="mx-auto max-w-4xl text-center">

      <div className="section-label justify-center">
        {badge}
      </div>

      <h2 className="section-title">
        <span className="gradient-text">
          {title}
        </span>
      </h2>

      <p className="section-description">
        {subtitle}
      </p>

    </div>
  );
}