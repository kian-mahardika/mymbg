import { RoleApp } from '@/components/role-app';

export default function GovernmentPage({ params }: { params: { slug?: string[] } }) {
  return <RoleApp role="government" slug={params.slug} />;
}
