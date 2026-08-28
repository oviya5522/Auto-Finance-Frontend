const SummaryCard = ({
  label,
  value,
  highlight = false,
}) => {
  return (
    <div className="rounded-lg border border-[#DDEBE2] bg-white px-3 py-2.5">

      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`
          mt-1
          truncate
          text-sm
          font-semibold

          ${
            highlight
              ? "text-[#0B5D3B]"
              : "text-[#17221D]"
          }
        `}
      >
        {value}
      </p>

    </div>
  );
};

export default SummaryCard;