import { getSession } from "@/actions/session";
import { getAdmin } from "@/actions/admin";
import { AdminProfileUpdate } from "./_components/setting";

interface Props {
  searchParams: Promise<{
    message?: string;
    success?: string;
    error?: string;
  }>;
}

export default async function SettingPage({ searchParams }: Props) {
  const { error, message, success } = await searchParams;
  const session = await getSession();
  const admin = await getAdmin(session!.id);
  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 px-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Data Admin Tidak Ditemukan
        </h1>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 px-6">
      <AdminProfileUpdate
        admin={admin}
        alertType={error ? "error" : success ? "success" : undefined}
        message={message}
      />
    </div>
  );
}
