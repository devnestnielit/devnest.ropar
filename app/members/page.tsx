import { redirect } from 'next/navigation';

// BUG-21: /members is legacy, redirected to standardized /member/apply
export default function MembersRedirectPage() {
  redirect('/member/apply');
}