import { RoleApp } from '@/components/role-app';

export default function TeacherPage({ params }: { params: { slug?: string[] } }) {
  return <RoleApp role="teacher" slug={params.slug} />;
}
