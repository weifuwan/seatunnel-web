interface SectionCardProps {
  title: string;
  desc?: string;
  children: React.ReactNode;
  className?: string;
  extra?: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  desc,
  children,
  className = "",
  extra,
}) => {
  return (
    <section
      className={`mb-5 rounded-[8px] border border-slate-200/70 bg-white px-6 py-6 shadow-[0_6px_24px_rgba(15,23,42,0.035)] ${className}`}
      style={{margin: "16px"}}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">
            {title}
          </h2>
          {desc ? (
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
          ) : null}
        </div>
        {extra ? <div>{extra}</div> : null}
      </div>

      <div>{children}</div>
    </section>
  );
};

export default SectionCard;