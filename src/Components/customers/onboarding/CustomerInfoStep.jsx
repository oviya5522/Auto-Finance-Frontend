// src/components/customers/onboarding/CustomerInfoStep.jsx

import {
  User,
  Phone,
  MapPin,
  BriefcaseBusiness,
} from "lucide-react";

const CustomerInfoStep = ({
  data = {},
  onChange,
}) => {
  const handleChange = (
    field,
    value
  ) => {
    onChange({
      [field]: value,
    });
  };

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF5EF]">
            <User
              size={16}
              className="text-[#0B5D3B]"
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#17221D]">
              Customer Information
            </h2>

            <p className="text-[11px] text-slate-400">
              Basic customer and contact details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* DATE */}
          <FormField label="Date">
            <input
              type="date"
              value={data.date || ""}
              readOnly
              className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-500`}
            />
          </FormField>

          {/* CUSTOMER NAME */}
          <FormField
            label="Customer Name"
            required
          >
            <input
              type="text"
              placeholder="Enter full name"
              value={data.name || ""}
              onChange={(e) =>
                handleChange(
                  "name",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>

          {/* MOBILE */}
          <FormField
            label="Mobile Number"
            required
          >
            <div className="relative">
              <Phone
                size={15}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile"
                value={
                  data.mobileNumber || ""
                }
                maxLength={10}
                onChange={(e) =>
                  handleChange(
                    "mobileNumber",
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                className={`${inputClass} pl-9`}
              />
            </div>
          </FormField>

          {/* PROFESSION */}
          <FormField
            label="Profession"
            required
          >
            <div className="relative">
              <BriefcaseBusiness
                size={15}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                placeholder="Profession"
                value={
                  data.profession || ""
                }
                onChange={(e) =>
                  handleChange(
                    "profession",
                    e.target.value
                  )
                }
                className={`${inputClass} pl-9`}
              />
            </div>
          </FormField>

          {/* OWN HOUSE */}
          <FormField
            label="Own House"
            required
          >
            <div className="flex h-[38px] gap-2">
              <ChoiceButton
                label="Yes"
                active={
                  data.ownHouse ===
                  true
                }
                onClick={() =>
                  handleChange(
                    "ownHouse",
                    true
                  )
                }
              />

              <ChoiceButton
                label="No"
                active={
                  data.ownHouse ===
                  false
                }
                onClick={() =>
                  handleChange(
                    "ownHouse",
                    false
                  )
                }
              />
            </div>
          </FormField>

          {/* ADDRESS */}
          <div className="lg:col-span-4">
            <FormField
              label="Address"
              required
            >
              <div className="relative">
                <MapPin
                  size={15}
                  className="
                    absolute
                    left-3
                    top-3
                    text-slate-400
                  "
                />

                <textarea
                  rows={2}
                  placeholder="Enter complete residential address"
                  value={
                    data.address || ""
                  }
                  onChange={(e) =>
                    handleChange(
                      "address",
                      e.target.value
                    )
                  }
                  className={`${inputClass} min-h-[58px] resize-none pl-9`}
                />
              </div>
            </FormField>
          </div>

          {/* AREA */}
          <FormField label="Area">
            <input
              type="text"
              placeholder="Area"
              value={data.area || ""}
              onChange={(e) =>
                handleChange(
                  "area",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>

          {/* LANDMARK */}
          <FormField label="Landmark">
            <input
              type="text"
              placeholder="Landmark"
              value={
                data.landmark || ""
              }
              onChange={(e) =>
                handleChange(
                  "landmark",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>

          {/* PINCODE */}
          <FormField
            label="Pincode"
            required
          >
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit pincode"
              value={
                data.pincode || ""
              }
              onChange={(e) =>
                handleChange(
                  "pincode",
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              className={inputClass}
            />
          </FormField>

          {/* REFERRED BY */}
          <FormField label="Referred By">
            <input
              type="text"
              placeholder="Referral name"
              value={
                data.referredBy || ""
              }
              onChange={(e) =>
                handleChange(
                  "referredBy",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>
        </div>
      </section>
    </div>
  );
};

const FormField = ({
  label,
  required = false,
  children,
}) => (
  <div className="min-w-0">
    <label className="mb-1 block text-[11px] font-medium text-slate-600">
      {label}

      {required && (
        <span className="ml-0.5 text-red-500">
          *
        </span>
      )}
    </label>

    {children}
  </div>
);

const ChoiceButton = ({
  label,
  active,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex
      h-full
      flex-1
      items-center
      justify-center
      rounded-md
      border
      text-xs
      font-medium
      transition

      ${
        active
          ? "border-[#0B5D3B] bg-[#EAF5EF] text-[#0B5D3B]"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
      }
    `}
  >
    {label}
  </button>
);

const inputClass = `
  h-[38px]
  w-full
  rounded-md
  border
  border-slate-200
  bg-white
  px-3
  text-xs
  text-slate-700
  placeholder:text-slate-400
  outline-none
  transition
  focus:border-[#0B5D3B]
  focus:ring-1
  focus:ring-[#0B5D3B]
`;

export default CustomerInfoStep;