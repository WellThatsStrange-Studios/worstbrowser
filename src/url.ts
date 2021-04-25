export function url(href: string) {
  return /^([a-z]{2,}):/.test(href) ? href : ('http://' + href)
}