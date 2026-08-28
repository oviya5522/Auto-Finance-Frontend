// src/Components/customers/onboarding/VehicleRcStep.jsx

import {
  Car,
  FileText,
  ShieldCheck,
  Upload,
  X,
  Check,
} from "lucide-react";


const VehicleRcStep = ({
  data = {},
  onChange,
}) => {
  const vehicle = data.vehicle || {};
  const rc = data.rc || {};
  const insurance = rc.insurance || {};
  const endorsement = rc.endorsement || {};

  const isCommercialVehicle =
    vehicle.vehicleType === "Commercial Vehicle";


  /* =====================================================
     UPDATE VEHICLE
  ====================================================== */

  const updateVehicle = (field, value) => {
    onChange({
      ...data,

      vehicle: {
        ...vehicle,
        [field]: value,
      },
    });
  };


  /* =====================================================
     UPDATE RC
  ====================================================== */

  const updateRc = (field, value) => {
    onChange({
      ...data,

      rc: {
        ...rc,
        [field]: value,
      },
    });
  };


  /* =====================================================
     UPDATE INSURANCE
  ====================================================== */

  const updateInsurance = (field, value) => {
    onChange({
      ...data,

      rc: {
        ...rc,

        insurance: {
          ...insurance,
          [field]: value,
        },
      },
    });
  };


  /* =====================================================
     UPDATE ENDORSEMENT
  ====================================================== */

  const updateEndorsement = (value) => {
    onChange({
      ...data,

      rc: {
        ...rc,

        endorsement: {
          ...endorsement,
          enabled: value,
        },
      },
    });
  };


  /* =====================================================
     INSURANCE DOCUMENT UPLOAD
  ====================================================== */

  const handleInsuranceUpload = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    fileToDataUrl(file)
      .then((fileData) => {
        onChange({
          ...data,

          rc: {
            ...rc,

            insurance: {
              ...insurance,

              document: {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                fileData,
                uploadedAt:
                  new Date().toISOString(),
              },
            },
          },
        });
      })
      .catch((error) => {
        console.error(
          "Insurance document upload failed:",
          error
        );
      });
  };


  /* =====================================================
     REMOVE INSURANCE DOCUMENT
  ====================================================== */

  const removeInsuranceDocument = () => {
    onChange({
      ...data,

      rc: {
        ...rc,

        insurance: {
          ...insurance,

          document: {
            fileName: "",
            fileType: "",
            fileSize: 0,
            fileData: "",
            uploadedAt: "",
          },
        },
      },
    });
  };


  const insuranceDocument =
    insurance.document || {};


  return (
    <div className="space-y-3">

      {/* =================================================
          SECTION 1 — VEHICLE INFORMATION
      ================================================== */}

      <CompactSection
        icon={Car}
        title="Vehicle Information"
        subtitle="Basic vehicle details"
      >
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">

          {/* Vehicle Type */}

          <FormField label="Vehicle Type">
            <select
              value={vehicle.vehicleType || ""}
              onChange={(e) =>
                updateVehicle(
                  "vehicleType",
                  e.target.value
                )
              }
              className={inputClass}
            >
              <option value="">
                Select vehicle type
              </option>

              <option value="Two Wheeler">
                Two Wheeler
              </option>

              <option value="Three Wheeler">
                Three Wheeler
              </option>

              <option value="Car">
                Car
              </option>

              <option value="Commercial Vehicle">
                Commercial Vehicle
              </option>

              <option value="Tractor">
                Tractor
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </FormField>


          {/* Brand */}

          <FormField label="Brand">
            <input
              type="text"
              placeholder="Brand"
              value={vehicle.brand || ""}
              onChange={(e) =>
                updateVehicle(
                  "brand",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>


          {/* Model */}

          <FormField label="Model">
            <input
              type="text"
              placeholder="Model"
              value={vehicle.model || ""}
              onChange={(e) =>
                updateVehicle(
                  "model",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>


          {/* Variant */}

          <FormField label="Variant">
            <input
              type="text"
              placeholder="Variant"
              value={vehicle.variant || ""}
              onChange={(e) =>
                updateVehicle(
                  "variant",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>


          {/* Colour */}

          <FormField label="Colour">
            <input
              type="text"
              placeholder="Vehicle colour"
              value={vehicle.colour || ""}
              onChange={(e) =>
                updateVehicle(
                  "colour",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>


          {/* Manufacturing Year */}

          <FormField label="Manufacturing Year">
            <input
              type="number"
              min="1900"
              max="2100"
              placeholder="YYYY"
              value={
                vehicle.manufacturingYear || ""
              }
              onChange={(e) =>
                updateVehicle(
                  "manufacturingYear",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>


          {/* Fuel Type */}

          <FormField label="Fuel Type">
            <select
              value={vehicle.fuelType || ""}
              onChange={(e) =>
                updateVehicle(
                  "fuelType",
                  e.target.value
                )
              }
              className={inputClass}
            >
              <option value="">
                Select fuel type
              </option>

              <option value="Petrol">
                Petrol
              </option>

              <option value="Diesel">
                Diesel
              </option>

              <option value="Electric">
                Electric
              </option>

              <option value="CNG">
                CNG
              </option>

              <option value="Hybrid">
                Hybrid
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </FormField>


          {/* Vehicle Value */}

          <FormField label="Vehicle Value">
            <MoneyInput
              value={vehicle.vehicleValue}
              placeholder="Vehicle value"
              onChange={(value) =>
                updateVehicle(
                  "vehicleValue",
                  value
                )
              }
            />
          </FormField>

        </div>
      </CompactSection>


      {/* =================================================
          SECTION 2 — RC & REGISTRATION
      ================================================== */}

      <CompactSection
        icon={FileText}
        title="RC & Registration"
        subtitle="Registration and vehicle identification"
      >
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">

          {/* Registration Number */}

          <FormField label="Registration Number">
            <input
              type="text"
              placeholder="TN 00 AB 0000"
              value={
                rc.registrationNumber || ""
              }
              onChange={(e) =>
                updateRc(
                  "registrationNumber",
                  e.target.value.toUpperCase()
                )
              }
              className={inputClass}
            />
          </FormField>


          {/* RC Book Number */}

          <FormField label="RC Book Number">
            <input
              type="text"
              placeholder="RC book number"
              value={rc.rcBookNumber || ""}
              onChange={(e) =>
                updateRc(
                  "rcBookNumber",
                  e.target.value.toUpperCase()
                )
              }
              className={inputClass}
            />
          </FormField>


          {/* RTO Location */}

          <FormField label="RTO / Registration Location">
            <input
              type="text"
              placeholder="RTO / location"
              value={rc.location || ""}
              onChange={(e) =>
                updateRc(
                  "location",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>


          {/* Registration Date */}

          <FormField label="Date of Registration">
            <input
              type="date"
              value={
                rc.dateOfRegistration || ""
              }
              onChange={(e) =>
                updateRc(
                  "dateOfRegistration",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>


          {/* Chassis */}

          <FormField label="Chassis Number">
            <input
              type="text"
              placeholder="Chassis number"
              value={
                rc.chassisNumber || ""
              }
              onChange={(e) =>
                updateRc(
                  "chassisNumber",
                  e.target.value.toUpperCase()
                )
              }
              className={inputClass}
            />
          </FormField>


          {/* Engine */}

          <FormField label="Engine Number">
            <input
              type="text"
              placeholder="Engine number"
              value={
                rc.engineNumber || ""
              }
              onChange={(e) =>
                updateRc(
                  "engineNumber",
                  e.target.value.toUpperCase()
                )
              }
              className={inputClass}
            />
          </FormField>


          {/* Existing Financier */}

          <FormField label="Existing Financier">
            <select
              value={
                rc.existingFinancier ||
                "None"
              }
              onChange={(e) =>
                updateRc(
                  "existingFinancier",
                  e.target.value
                )
              }
              className={inputClass}
            >
              <option value="None">
                None
              </option>

              <option value="Bank / Financier">
                Bank / Financier
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </FormField>


          {/* Hypothecation */}

          <FormField label="Hypothecation">
            <div className="flex h-[38px] gap-2">

              <ChoiceButton
                label="Yes"
                active={
                  rc.hypothecation === true
                }
                onClick={() =>
                  updateRc(
                    "hypothecation",
                    true
                  )
                }
              />

              <ChoiceButton
                label="No"
                active={
                  rc.hypothecation === false
                }
                onClick={() =>
                  updateRc(
                    "hypothecation",
                    false
                  )
                }
              />

            </div>
          </FormField>

        </div>
      </CompactSection>


      {/* =================================================
          SECTION 3 — COMPLIANCE & INSURANCE
      ================================================== */}

      <CompactSection
        icon={ShieldCheck}
        title="Compliance & Insurance"
        subtitle="Expiry and insurance information"
      >
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">

          {/* Tax */}

          <FormField label="Tax Expiry">
            <input
              type="date"
              value={rc.taxExpiry || ""}
              onChange={(e) =>
                updateRc(
                  "taxExpiry",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>


          {/* Permit — Commercial only */}

          {isCommercialVehicle && (
            <FormField label="Permit Expiry">
              <input
                type="date"
                value={rc.permitExpiry || ""}
                onChange={(e) =>
                  updateRc(
                    "permitExpiry",
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>
          )}


          {/* FC — Commercial only */}

          {isCommercialVehicle && (
            <FormField label="FC Expiry">
              <input
                type="date"
                value={rc.fcExpiry || ""}
                onChange={(e) =>
                  updateRc(
                    "fcExpiry",
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>
          )}


          {/* Insurance Company */}

          <FormField label="Insurance Company">
            <input
              type="text"
              placeholder="Insurance company"
              value={
                insurance.companyName || ""
              }
              onChange={(e) =>
                updateInsurance(
                  "companyName",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>


          {/* Policy Number */}

          <FormField label="Policy Number">
            <input
              type="text"
              placeholder="Policy number"
              value={
                insurance.policyNumber || ""
              }
              onChange={(e) =>
                updateInsurance(
                  "policyNumber",
                  e.target.value.toUpperCase()
                )
              }
              className={inputClass}
            />
          </FormField>


          {/* Insurance Expiry */}

          <FormField label="Insurance Expiry">
            <input
              type="date"
              value={
                insurance.expiryDate || ""
              }
              onChange={(e) =>
                updateInsurance(
                  "expiryDate",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>


          {/* Financier Endorsement */}

          <FormField label="Financier Endorsement">
            <div className="flex h-[38px] gap-2">

              <ChoiceButton
                label="Yes"
                active={
                  endorsement.enabled === true
                }
                onClick={() =>
                  updateEndorsement(true)
                }
              />

              <ChoiceButton
                label="No"
                active={
                  endorsement.enabled === false
                }
                onClick={() =>
                  updateEndorsement(false)
                }
              />

            </div>
          </FormField>


          {/* Insurance Document */}

          <div className="min-w-0">

            <label className="mb-1 block text-[11px] font-medium text-slate-600">
              Insurance Document
            </label>

            {insuranceDocument.fileName ? (

              <div className="flex h-[38px] items-center gap-2 rounded-md border border-[#D8E9DF] bg-[#F6FBF8] px-3">

                <Check
                  size={14}
                  className="shrink-0 text-[#0B5D3B]"
                />

                <span
                  className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#0B5D3B]"
                  title={
                    insuranceDocument.fileName
                  }
                >
                  {insuranceDocument.fileName}
                </span>

                <button
                  type="button"
                  onClick={
                    removeInsuranceDocument
                  }
                  className="
                    flex
                    h-6
                    w-6
                    shrink-0
                    items-center
                    justify-center
                    rounded-md
                    text-slate-400
                    hover:bg-red-50
                    hover:text-red-500
                  "
                  title="Remove document"
                >
                  <X size={13} />
                </button>

              </div>

            ) : (

              <label
                className="
                  flex
                  h-[38px]
                  cursor-pointer
                  items-center
                  justify-center
                  gap-1.5
                  rounded-md
                  border
                  border-dashed
                  border-slate-300
                  bg-white
                  text-[10px]
                  font-semibold
                  text-[#0B5D3B]
                  transition
                  hover:border-[#0B5D3B]
                  hover:bg-[#F6FBF8]
                "
              >
                <Upload size={13} />

                + Upload Insurance Document

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={
                    handleInsuranceUpload
                  }
                  className="hidden"
                />
              </label>

            )}

          </div>

        </div>


        {/* Remarks */}

        <div className="mt-3 border-t border-slate-100 pt-3">

          <label className="mb-1 block text-[11px] font-medium text-slate-600">
            Remarks
          </label>

          <textarea
            rows={2}
            placeholder="Add vehicle, RC or insurance remarks..."
            value={rc.remarks || ""}
            onChange={(e) =>
              updateRc(
                "remarks",
                e.target.value
              )
            }
            className="
              min-h-[58px]
              w-full
              resize-none
              rounded-md
              border
              border-slate-200
              px-3
              py-2
              text-xs
              text-slate-700
              placeholder:text-slate-400
              outline-none
              transition
              focus:border-[#0B5D3B]
              focus:ring-1
              focus:ring-[#0B5D3B]
            "
          />

        </div>

      </CompactSection>

    </div>
  );
};


/* =========================================================
   SECTION COMPONENT
========================================================= */

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


/* =========================================================
   FORM FIELD
========================================================= */

const FormField = ({
  label,
  children,
}) => {
  return (
    <div className="min-w-0">

      <label className="mb-1 block text-[11px] font-medium text-slate-600">
        {label}
      </label>

      {children}

    </div>
  );
};


/* =========================================================
   MONEY INPUT
========================================================= */

const MoneyInput = ({
  value,
  placeholder,
  onChange,
}) => {
  return (
    <div className="relative">

      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
        ₹
      </span>

      <input
        type="number"
        min="0"
        step="0.01"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={`${inputClass} pl-7`}
      />

    </div>
  );
};


/* =========================================================
   YES / NO BUTTON
========================================================= */

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


/* =========================================================
   INPUT STYLE
========================================================= */

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


/* =========================================================
   FILE -> DATA URL
========================================================= */

const fileToDataUrl = (file) => {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(reader.result);

      reader.onerror = () =>
        reject(
          new Error(
            "Unable to read file."
          )
        );

      reader.readAsDataURL(file);
    }
  );
};


export default VehicleRcStep;