import { RoleApp } from '@/components/role-app';

export default function StudentPage({ params }: { params: { slug?: string[] } }) {
  return <RoleApp role="student" slug={params.slug} />;
}
