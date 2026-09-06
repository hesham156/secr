export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Security Settings</h1>
      <section className="max-w-xl rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
        <label className="block text-sm font-medium">
          Auto-lock
          <select className="focus-ring mt-2 w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2" defaultValue="5">
            <option value="1">1 minute</option>
            <option value="5">5 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="never">Never</option>
          </select>
        </label>
        <label className="mt-4 inline-flex items-center gap-2 text-sm">
          <input defaultChecked type="checkbox" />
          Require master password after lock
        </label>
      </section>
    </div>
  );
}
