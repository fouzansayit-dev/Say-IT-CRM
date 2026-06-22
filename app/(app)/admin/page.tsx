import { redirect } from 'next/navigation'

export default function AdminIndexPage() {
  // Redirect /admin to the first admin sub-page
  redirect('/admin/users')
}
