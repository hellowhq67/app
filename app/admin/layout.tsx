import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminLayoutClient } from '@/components/admin/layout/admin-layout-client'

export const metadata = {
  title: 'Admin Panel — PedagogistsPTE',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      redirect('/sign-in')
    }

    if (session.user.banned) {
      redirect('/sign-in')
    }

    if (session.user.role !== 'admin') {
      redirect('/dashboard')
    }

    return <AdminLayoutClient>{children}</AdminLayoutClient>
  } catch (error: unknown) {
    // Next.js redirect() throws an error internally - must re-throw it
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error
    }
    redirect('/sign-in')
  }
}
