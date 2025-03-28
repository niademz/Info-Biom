'use client'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { FaRightFromBracket } from 'react-icons/fa6'

export default function SignOutButton() {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/sign-in') // or wherever you want to redirect after sign out
  }

  return (
    <button onClick={handleSignOut}>
      <FaRightFromBracket style={{width: '50px', height: '50px', paddingInline: '10px'}}></FaRightFromBracket>
    </button>
  )
}