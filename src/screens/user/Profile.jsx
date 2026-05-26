import Profile from '../Profile'

export default function UserProfile() {
  return <Profile user={JSON.parse(localStorage.getItem('parkingAuth') || '{}').user} />
}
