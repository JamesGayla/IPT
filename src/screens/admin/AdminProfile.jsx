import Profile from '../Profile'

export default function AdminProfile() {
  return <Profile user={JSON.parse(localStorage.getItem('parkingAuth') || '{}').user} />
}
