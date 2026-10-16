export function profileName(profile) {
  return [profile?.firstName, profile?.lastName]
    .filter(value => typeof value === 'string')
    .map(value => value.replace(/\+?\p{N}[\p{N}\s().-]*/gu, ' ').replace(/\s+/g, ' ').trim())
    .filter(value => /\p{L}/u.test(value))
    .join(' ') || 'Your account';
}
