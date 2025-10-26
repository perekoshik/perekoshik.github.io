import { TWA } from '@/lib/twa'

export default function Profile() {
  const user = TWA?.initDataUnsafe?.user
  return (
    <div className="container pb-24">
      <div className="mt-6 glass rounded-2xl p-5 grid gap-4">
        <div className="text-lg font-semibold">Profile</div>
        {user ? (
          <div className="text-sm text-txt/80">
            <div><b>ID:</b> {user.id}</div>
            <div><b>Username:</b> @{user.username}</div>
            <div><b>Name:</b> {user.first_name} {user.last_name}</div>
          </div>
        ) : (
          <div className="text-sm text-txt/70">No Telegram user detected (open inside Telegram).</div>
        )}
      </div>
    </div>
  )
}