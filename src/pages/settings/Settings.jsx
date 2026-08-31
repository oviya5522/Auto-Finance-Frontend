// src/pages/settings/Settings.jsx

import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-full bg-[#F7F9F8] p-5 sm:p-6">
      <section className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF5EF]">
            <SettingsIcon
              size={26}
              strokeWidth={2}
              className="text-[#0B5D3B]"
            />
          </div>

          <h1 className="mt-4 text-[18px] font-semibold text-[#17221D]">
            Settings
          </h1>

          <p className="mt-1 text-[11px] font-medium text-slate-500">
            Not implemented yet
          </p>

          <p className="mx-auto mt-2 max-w-[280px] text-[10px] leading-5 text-slate-400">
            Application settings and configuration options
            will be available in a future update.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Settings;