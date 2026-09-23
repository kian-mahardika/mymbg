import { RoleApp } from '@/components/role-app';

export default function VendorPage({ params }: { params: { slug?: string[] } }) {
  return <RoleApp role="vendor" slug={params.slug} />;
}
