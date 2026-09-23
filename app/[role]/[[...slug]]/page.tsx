import { RoleApp } from '@/components/role-app';

export default function RolePage({ params }: { params: { role: string; slug?: string[] } }) {
  return <RoleApp role={params.role} slug={params.slug} />;
}
