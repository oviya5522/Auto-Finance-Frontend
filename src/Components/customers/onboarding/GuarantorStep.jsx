// src/Components/customers/onboarding/GuarantorStep.jsx

import {
  UserCheck,
  User,
  Phone,
  MapPin,
  BriefcaseBusiness,
  FileText,
} from "lucide-react";

const GuarantorStep = ({ data = {}, onChange }) => {
  const guarantor = data.guarantor || {};
  const personal = guarantor.personal || {};
  const kyc = guarantor.kyc || {};

  const hasGuarantor = guarantor.hasGuarantor === true;

  const handleGuarantorChoice = (value) => {
    onChange({
      ...data,
      guarantor: {
        ...guarantor,
        hasGuarantor: value,
      },
    });
  };

  const updatePersonal = (field, value) => {
    onChange({
      ...data,
      guarantor: {
        ...guarantor,
        personal: {
          ...personal,
          [field]: value,
        },
      },
    });
  };

  const updateKyc = (field, value) => {
    onChange({
      ...data,
      guarantor: {
        ...guarantor,
        kyc: {
          ...kyc,
          [field]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-3">

      {/* =========================================
          GUARANTOR QUESTION
      ========================================== */}

      <section className="rounded-xl border border-slate-200 bg-white">

        <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-2.5">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF5EF]">
            <UserCheck
              size={16}
              className="text-[#0B5D3B]"
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#17221D]">
              Guarantor
            </h2>

            <p className="text-[11px] text-slate-400">
              Guarantor information is optional
            </p>
          </div>

        </div>


        <div className="px-4 py-4">

          <div className="rounded-lg bg-[#F8FAF9] p-4">

            <p className="text-sm font-medium text-[#17221D]">
              Does this customer have a guarantor?
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Select No to continue directly to loan details.
            </p>


            <div className="mt-3 flex max-w-xs gap-2">

              <ChoiceButton
                label="Yes"
                active={hasGuarantor}
                onClick={() =>
                  handleGuarantorChoice(true)
                }
              />

              <ChoiceButton
                label="No"
                active={guarantor.hasGuarantor === false}
                onClick={() =>
                  handleGuarantorChoice(false)
                }
              />

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          GUARANTOR FORM
      ========================================== */}

      {hasGuarantor && (
        <>

          {/* Personal Information */}

          <CompactSection
            icon={User}
            title="Guarantor Information"
            subtitle="Basic personal and contact details"
          >

            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">

              <FormField label="Name" required>
                <input
                  type="text"
                  placeholder="Full name"
                  value={personal.name || ""}
                  onChange={(e) =>
                    updatePersonal(
                      "name",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </FormField>


              <FormField label="Print Name">
                <input
                  type="text"
                  placeholder="Name for documents"
                  value={personal.printName || ""}
                  onChange={(e) =>
                    updatePersonal(
                      "printName",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </FormField>


              <FormField label="Mobile Number" required>
                <div className="relative">

                  <Phone
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={personal.mobileNumber || ""}
                    onChange={(e) =>
                      updatePersonal(
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


              <FormField label="Profession">
                <div className="relative">

                  <BriefcaseBusiness
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Profession"
                    value={personal.profession || ""}
                    onChange={(e) =>
                      updatePersonal(
                        "profession",
                        e.target.value
                      )
                    }
                    className={`${inputClass} pl-9`}
                  />

                </div>
              </FormField>


              <FormField label="Own House">
                <div className="flex h-[38px] gap-2">

                  <ChoiceButton
                    label="Yes"
                    active={personal.ownHouse === true}
                    onClick={() =>
                      updatePersonal(
                        "ownHouse",
                        true
                      )
                    }
                  />

                  <ChoiceButton
                    label="No"
                    active={personal.ownHouse === false}
                    onClick={() =>
                      updatePersonal(
                        "ownHouse",
                        false
                      )
                    }
                  />

                </div>
              </FormField>

            </div>

          </CompactSection>


          {/* Address */}

          <CompactSection
            icon={MapPin}
            title="Address"
            subtitle="Guarantor residential address"
          >

            <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-4">

              <div className="lg:col-span-4">

                <FormField label="Address" required>

                  <div className="relative">

                    <MapPin
                      size={15}
                      className="absolute left-3 top-3 text-slate-400"
                    />

                    <textarea
                      rows={2}
                      placeholder="Complete address"
                      value={personal.address || ""}
                      onChange={(e) =>
                        updatePersonal(
                          "address",
                          e.target.value
                        )
                      }
                      className={`${inputClass} min-h-[58px] resize-none py-2 pl-9`}
                    />

                  </div>

                </FormField>

              </div>


              <FormField label="Area">

                <input
                  type="text"
                  placeholder="Area"
                  value={personal.area || ""}
                  onChange={(e) =>
                    updatePersonal(
                      "area",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />

              </FormField>


              <FormField label="Landmark">

                <input
                  type="text"
                  placeholder="Landmark"
                  value={personal.landmark || ""}
                  onChange={(e) =>
                    updatePersonal(
                      "landmark",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />

              </FormField>


              <FormField label="Pincode">

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit pincode"
                  value={personal.pincode || ""}
                  onChange={(e) =>
                    updatePersonal(
                      "pincode",
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  className={inputClass}
                />

              </FormField>

            </div>

          </CompactSection>


          {/* KYC */}

          <CompactSection
            icon={FileText}
            title="Guarantor KYC"
            subtitle="Identity information"
          >

            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">

              <FormField label="Aadhaar Number">

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  placeholder="12-digit Aadhaar"
                  value={kyc.aadhaarNumber || ""}
                  onChange={(e) =>
                    updateKyc(
                      "aadhaarNumber",
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 12)
                    )
                  }
                  className={inputClass}
                />

              </FormField>


              <FormField label="Driving Licence No.">

                <input
                  type="text"
                  placeholder="Licence number"
                  value={kyc.drivingLicenceNumber || ""}
                  onChange={(e) =>
                    updateKyc(
                      "drivingLicenceNumber",
                      e.target.value.toUpperCase()
                    )
                  }
                  className={inputClass}
                />

              </FormField>


              <FormField label="PAN Number">

                <input
                  type="text"
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  value={kyc.panNumber || ""}
                  onChange={(e) =>
                    updateKyc(
                      "panNumber",
                      e.target.value.toUpperCase()
                    )
                  }
                  className={inputClass}
                />

              </FormField>


              <FormField label="Voter ID">

                <input
                  type="text"
                  placeholder="Voter ID"
                  value={kyc.voterIdNumber || ""}
                  onChange={(e) =>
                    updateKyc(
                      "voterIdNumber",
                      e.target.value.toUpperCase()
                    )
                  }
                  className={inputClass}
                />

              </FormField>

            </div>

          </CompactSection>

        </>
      )}

    </div>
  );
};


/* =============================================
   SECTION
============================================= */

const CompactSection = ({
  icon: Icon,
  title,
  subtitle,
  children,
}) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">

      <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-2.5">

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF5EF]">
          <Icon
            size={16}
            className="text-[#0B5D3B]"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#17221D]">
            {title}
          </h3>

          <p className="text-[11px] text-slate-400">
            {subtitle}
          </p>
        </div>

      </div>

      <div className="p-4">
        {children}
      </div>

    </section>
  );
};


/* =============================================
   FORM FIELD
============================================= */

const FormField = ({
  label,
  required = false,
  children,
}) => {
  return (
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
};


/* =============================================
   YES / NO
============================================= */

const ChoiceButton = ({
  label,
  active,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        h-[38px]
        flex-1
        items-center
        justify-center
        rounded-md
        border
        px-5
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
};


/* =============================================
   INPUT
============================================= */

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

export default GuarantorStep;