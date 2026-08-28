// src/Components/customers/onboarding/KycDocumentsStep.jsx

import {
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  FileText,
  ShieldCheck,
  Upload,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

const DOCUMENT_OPTIONS = [
  {
    id: "aadhaar",
    label: "Aadhaar",
  },
  {
    id: "drivingLicence",
    label: "Driving Licence",
  },
  {
    id: "pan",
    label: "PAN Card",
  },
  {
    id: "voterId",
    label: "Voter ID",
  },
  {
    id: "other",
    label: "Other Document",
  },
];

/*
 * Keep this false unless your business workflow
 * requires RC Book upload in Step 2.
 *
 * Step 3 must NOT contain an RC document upload.
 */
const ENABLE_RC_BOOK_DOCUMENT = false;

const KycDocumentsStep = ({
  data = {},
  onChange,
  onValidationChange,
}) => {
  const fileInputs = useRef({});

  const kyc = data.kyc || {};

  const documents = data.documents || {
    requiredMinimum: 2,
    selectedTypes: [],
    uploads: [],
  };

  const selectedTypes =
    documents.selectedTypes || [];

  const uploads =
    documents.uploads || [];

  const documentOptions = useMemo(() => {
    if (!ENABLE_RC_BOOK_DOCUMENT) {
      return DOCUMENT_OPTIONS;
    }

    return [
      ...DOCUMENT_OPTIONS,
      {
        id: "rcBook",
        label: "RC Book",
      },
    ];
  }, []);

  const selectedCount =
    selectedTypes.length;

  /*
   * Every selected document must have an uploaded file.
   */
  const uploadedSelectedCount =
    selectedTypes.filter((type) =>
      uploads.some(
        (upload) =>
          upload.type === type &&
          upload.fileName
      )
    ).length;

  const isValid =
    selectedCount >= 2 &&
    uploadedSelectedCount === selectedCount;

useEffect(() => {
  if (typeof onValidationChange === "function") {
    onValidationChange(isValid);
  }
}, [isValid, onValidationChange]);

  /* =====================================================
     KYC INPUT
  ====================================================== */

  const updateKyc = (field, value) => {
    onChange({
      ...data,

      kyc: {
        ...kyc,
        [field]: value,
      },
    });
  };

  /* =====================================================
     SELECT / UNSELECT DOCUMENT
  ====================================================== */

  const toggleDocument = (documentId) => {
    const alreadySelected =
      selectedTypes.includes(documentId);

    const updatedTypes = alreadySelected
      ? selectedTypes.filter(
          (type) => type !== documentId
        )
      : [
          ...selectedTypes,
          documentId,
        ];

    /*
     * When deselecting a document,
     * remove its uploaded file as well.
     */
    const updatedUploads =
      alreadySelected
        ? uploads.filter(
            (upload) =>
              upload.type !== documentId
          )
        : uploads;

    onChange({
      ...data,

      documents: {
        requiredMinimum: 2,
        selectedTypes: updatedTypes,
        uploads: updatedUploads,
      },
    });

    /*
     * Allow selecting maximum number of
     * document types without restriction.
     */
  };

  /* =====================================================
     FILE UPLOAD
  ====================================================== */

  const handleFileUpload = async (
    documentId,
    event
  ) => {
    const file =
      event.target.files?.[0];

    /*
     * Allow re-selecting the same file.
     */
    event.target.value = "";

    if (!file) {
      return;
    }

    /*
     * Convert to Base64 so it can later be
     * persisted in localStorage.
     */
    const fileData =
      await fileToDataUrl(file);

    const newUpload = {
      type: documentId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileData,
      uploadedAt:
        new Date().toISOString(),
    };

    const existingIndex =
      uploads.findIndex(
        (upload) =>
          upload.type === documentId
      );

    let updatedUploads;

    if (existingIndex >= 0) {
      updatedUploads =
        [...uploads];

      updatedUploads[existingIndex] =
        newUpload;
    } else {
      updatedUploads = [
        ...uploads,
        newUpload,
      ];
    }

    /*
     * Make sure the document is selected
     * when a file is uploaded.
     */
    const updatedTypes =
      selectedTypes.includes(
        documentId
      )
        ? selectedTypes
        : [
            ...selectedTypes,
            documentId,
          ];

    onChange({
      ...data,

      documents: {
        requiredMinimum: 2,
        selectedTypes: updatedTypes,
        uploads: updatedUploads,
      },
    });
  };

  /* =====================================================
     REMOVE UPLOAD
  ====================================================== */

  const removeUpload = (documentId) => {
    const updatedUploads =
      uploads.filter(
        (upload) =>
          upload.type !== documentId
      );

    onChange({
      ...data,

      documents: {
        ...documents,
        uploads: updatedUploads,
      },
    });
  };

  /* =====================================================
     OPEN FILE PICKER
  ====================================================== */

  const openFilePicker = (
    documentId
  ) => {
    fileInputs.current[
      documentId
    ]?.click();
  };

  /* =====================================================
     STATUS
  ====================================================== */

  const statusText = (() => {
    if (selectedCount === 0) {
      return "Select at least 2 documents.";
    }

    if (selectedCount < 2) {
      return `Select ${
        2 - selectedCount
      } more document${
        2 - selectedCount === 1
          ? ""
          : "s"
      }.`;
    }

    if (
      uploadedSelectedCount <
      selectedCount
    ) {
      return `${
        selectedCount -
        uploadedSelectedCount
      } selected document${
        selectedCount -
          uploadedSelectedCount ===
        1
          ? ""
          : "s"
      } still need to be uploaded.`;
    }

    return `${uploadedSelectedCount} documents uploaded`;
  })();

  return (
    <div className="space-y-3">

      {/* =================================================
          KYC INFORMATION
      ================================================== */}

      <section className="rounded-xl border border-slate-200 bg-white">

        <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-2.5">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF5EF]">
            <ShieldCheck
              size={16}
              className="text-[#0B5D3B]"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#17221D]">
              KYC Information
            </h3>

            <p className="text-[11px] text-slate-400">
              Customer identity information
            </p>
          </div>

        </div>


        <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Aadhaar */}

          <FormField label="Aadhaar Number">

            <input
              type="text"
              inputMode="numeric"
              maxLength={12}
              placeholder="12-digit Aadhaar"
              value={
                kyc.aadhaarNumber || ""
              }
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


          {/* Driving Licence */}

          <FormField label="Driving Licence No.">

            <input
              type="text"
              placeholder="Licence number"
              value={
                kyc.drivingLicenceNumber ||
                ""
              }
              onChange={(e) =>
                updateKyc(
                  "drivingLicenceNumber",
                  e.target.value.toUpperCase()
                )
              }
              className={inputClass}
            />

          </FormField>


          {/* PAN */}

          <FormField label="PAN Number">

            <input
              type="text"
              maxLength={10}
              placeholder="ABCDE1234F"
              value={
                kyc.panNumber || ""
              }
              onChange={(e) =>
                updateKyc(
                  "panNumber",
                  e.target.value.toUpperCase()
                )
              }
              className={inputClass}
            />

          </FormField>


          {/* Voter ID */}

          <FormField label="Voter ID Number">

            <input
              type="text"
              placeholder="Voter ID number"
              value={
                kyc.voterIdNumber || ""
              }
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

      </section>


      {/* =================================================
          CUSTOMER DOCUMENTS
      ================================================== */}

      <section className="rounded-xl border border-slate-200 bg-white">

        {/* Header */}

        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">

          <div className="flex min-w-0 items-center gap-2.5">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FBF4DD]">
              <FileText
                size={16}
                className="text-[#D4A72C]"
              />
            </div>

            <div className="min-w-0">

              <h3 className="text-sm font-semibold text-[#17221D]">
                Customer Documents
              </h3>

              <p className="text-[11px] text-slate-400">
                Select and upload minimum 2 documents
              </p>

            </div>

          </div>


          {/* Status */}

          <div
            className={`
              shrink-0
              rounded-full
              px-2.5
              py-1
              text-[10px]
              font-semibold

              ${
                isValid
                  ? "bg-[#EAF5EF] text-[#0B5D3B]"
                  : "bg-[#FFF8E7] text-[#956F13]"
              }
            `}
          >
            {statusText}
          </div>

        </div>


        {/* Document Options */}

        <div className="p-4">

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">

            {documentOptions.map(
              (document) => {

                const selected =
                  selectedTypes.includes(
                    document.id
                  );

                const upload =
                  uploads.find(
                    (item) =>
                      item.type ===
                      document.id
                  );

                return (
                  <button
                    key={document.id}
                    type="button"
                    onClick={() =>
                      toggleDocument(
                        document.id
                      )
                    }
                    className={`
                      flex
                      min-w-0
                      items-center
                      gap-2
                      rounded-lg
                      border
                      px-3
                      py-2.5
                      text-left
                      transition

                      ${
                        selected
                          ? "border-[#0B5D3B] bg-[#F2F9F5]"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }
                    `}
                  >

                    <span
                      className={`
                        flex
                        h-4
                        w-4
                        shrink-0
                        items-center
                        justify-center
                        rounded
                        border

                        ${
                          selected
                            ? "border-[#0B5D3B] bg-[#0B5D3B]"
                            : "border-slate-300 bg-white"
                        }
                      `}
                    >

                      {selected && (
                        <Check
                          size={11}
                          strokeWidth={3}
                          className="text-white"
                        />
                      )}

                    </span>


                    <span
                      className={`
                        truncate
                        text-[11px]
                        font-medium

                        ${
                          selected
                            ? "text-[#0B5D3B]"
                            : "text-slate-600"
                        }
                      `}
                    >
                      {document.label}
                    </span>


                    {upload && (
                      <Check
                        size={13}
                        className="ml-auto shrink-0 text-[#0B5D3B]"
                      />
                    )}

                  </button>
                );
              }
            )}

          </div>


          {/* Upload Cards */}

          {selectedTypes.length >
            0 && (

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">

              {selectedTypes.map(
                (documentId) => {

                  const document =
                    documentOptions.find(
                      (item) =>
                        item.id ===
                        documentId
                    );

                  const upload =
                    uploads.find(
                      (item) =>
                        item.type ===
                        documentId
                    );

                  if (!document) {
                    return null;
                  }

                  return (
                    <DocumentUploadCard
                      key={documentId}
                      document={document}
                      upload={upload}
                      inputRef={(element) => {
                        fileInputs.current[
                          documentId
                        ] = element;
                      }}
                      onUpload={(event) =>
                        handleFileUpload(
                          documentId,
                          event
                        )
                      }
                      onRemove={() =>
                        removeUpload(
                          documentId
                        )
                      }
                      onChoose={() =>
                        openFilePicker(
                          documentId
                        )
                      }
                    />
                  );
                }
              )}

            </div>
          )}


          {/* Validation */}

          <div
            className={`
              mt-3
              flex
              items-center
              gap-2
              rounded-lg
              px-3
              py-2

              ${
                isValid
                  ? "bg-[#EAF5EF] text-[#0B5D3B]"
                  : "bg-[#FFF8E7] text-[#8A6915]"
              }
            `}
          >

            {isValid ? (
              <Check
                size={14}
                strokeWidth={2.5}
              />
            ) : (
              <AlertCircle
                size={14}
              />
            )}

            <span className="text-[11px] font-medium">
              {isValid
                ? `✓ ${uploadedSelectedCount} documents uploaded`
                : "Please select at least 2 document types and upload each selected document."}
            </span>

          </div>

        </div>

      </section>

    </div>
  );
};


/* =========================================================
   DOCUMENT UPLOAD CARD
========================================================= */

const DocumentUploadCard = ({
  document,
  upload,
  inputRef,
  onUpload,
  onRemove,
  onChoose,
}) => {
  return (
    <div
      className={`
        rounded-lg
        border
        p-3
        transition

        ${
          upload
            ? "border-[#D8E9DF] bg-[#FAFCFB]"
            : "border-slate-200 bg-white"
        }
      `}
    >

      <div className="flex items-center gap-3">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
          <FileText
            size={15}
            className="text-slate-500"
          />
        </div>


        <div className="min-w-0 flex-1">

          <p className="truncate text-[11px] font-semibold text-[#17221D]">
            {document.label} Document
          </p>

          {upload ? (
            <div className="mt-0.5 flex items-center gap-1">

              <Check
                size={11}
                className="shrink-0 text-[#0B5D3B]"
              />

              <p
                className="truncate text-[10px] text-[#0B5D3B]"
                title={upload.fileName}
              >
                {upload.fileName}
              </p>

            </div>
          ) : (
            <p className="mt-0.5 text-[10px] text-slate-400">
              Upload {document.label.toLowerCase()} document
            </p>
          )}

        </div>


        {upload ? (

          <button
            type="button"
            onClick={onRemove}
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-md
              text-slate-400
              transition
              hover:bg-red-50
              hover:text-red-500
            "
            title="Remove document"
          >
            <X size={14} />
          </button>

        ) : (

          <button
            type="button"
            onClick={onChoose}
            className="
              flex
              h-7
              shrink-0
              items-center
              gap-1.5
              rounded-md
              bg-[#0B5D3B]
              px-2.5
              text-[10px]
              font-semibold
              text-white
              transition
              hover:bg-[#084A30]
            "
          >
            <Upload size={12} />
            Upload
          </button>

        )}

      </div>


      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={onUpload}
        className="hidden"
      />

    </div>
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
   INPUT
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
            "Unable to read file"
          )
        );

      reader.readAsDataURL(file);
    }
  );
};


export default KycDocumentsStep;