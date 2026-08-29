const LoanVehicleSection = ({ loan }) => {
  const vehicle = loan?.vehicle || {};

  return (
    <Section title="Vehicle">
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">

        <Info
          label="Registration"
          value={vehicle.registrationNumber}
        />

        <Info
          label="Make / Model"
          value={`${vehicle.brand || ""} ${vehicle.model || ""}`}
        />

        <Info
          label="Variant"
          value={vehicle.variant}
        />

        <Info
          label="Manufacturing Year"
          value={vehicle.manufacturingYear}
        />

        <Info
          label="Chassis Number"
          value={vehicle.chassisNumber}
        />

        <Info
          label="Engine Number"
          value={vehicle.engineNumber}
        />

        <Info
          label="Vehicle Value"
          value={vehicle.vehicleValue}
        />

        <Info
          label="Previous Finance"
          value={vehicle.previousFinanceStatus}
        />

      </div>
    </Section>
  );
};

const Section = ({ title, children }) => (
  <section className="mb-5">
    <h3 className="mb-2.5 text-[12px] font-semibold">
      {title}
    </h3>
    {children}
  </section>
);

const Info = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 px-3 py-2.5">
    <p className="text-[9px] uppercase text-slate-400">
      {label}
    </p>
    <p className="mt-0.5 text-[10px] font-medium">
      {value || "—"}
    </p>
  </div>
);

export default LoanVehicleSection;