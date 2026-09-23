import { RoleApp } from '@/components/role-app';

export default function AdminPage({ params }: { params: { slug?: string[] } }) {
  return <RoleApp role="admin" slug={params.slug} />;
}
