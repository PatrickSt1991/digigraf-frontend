import FormCard from "./FormCard";

export function LoadingState({ title, message }: { title: string; message: string }) {
  return (
    <FormCard title={title}>
      <div className="flex items-center gap-3 py-4 text-gray-600">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
        <span>{message}</span>
      </div>
    </FormCard>
  );
}

export function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <FormCard title={title}>
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        {message}
      </div>
    </FormCard>
  );
}