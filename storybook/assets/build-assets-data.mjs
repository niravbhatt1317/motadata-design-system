// Extracts the product's icon + logo libraries into JSON the Assets/* Storybook stories import.
// Mirrors design-system/components-lib/site/generate.mjs (loadProductIcons + loadProductLogos) EXACTLY so the
// Storybook Icons/Logos pages show the same set as the Elements site. Re-run after icon/logo source changes:
//   node design-system/storybook/assets/build-assets-data.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.resolve(HERE, '..', '..', '..', 'src', 'assets') // UI/src/assets
const read = (p) => fs.readFileSync(p, 'utf8')
const exists = (p) => fs.existsSync(p)

// icon names (kebab) whose single combined path relies on the even-odd fill rule (holes/half-fills), e.g. the
// custom-report glyph (folded corner + person badge ring). Kept in sync with build-icons.mjs EVENODD.
const EVENODD = new Set(['custom-report'])

function loadProductIcons() {
  const p = path.join(SRC, 'icons', 'icons.js')
  if (!exists(p)) return []
  const cjs = read(p).replace(/export\s+const\s+/g, 'exports.')
  const mod = {}
  // eslint-disable-next-line no-new-func
  new Function('exports', cjs)(mod)
  const out = []
  for (const v of Object.values(mod)) {
    if (!v || !Array.isArray(v.icon)) continue
    const [w, h, , , pathData] = v.icon
    const d = Array.isArray(pathData) ? pathData[pathData.length - 1] : pathData
    if (!d || !v.iconName) continue
    const rec = { n: v.iconName, w, h, p: d }
    if (EVENODD.has(v.iconName)) rec.fr = 'evenodd'
    out.push(rec)
  }
  out.sort((a, b) => a.n.localeCompare(b.n))
  return out
}

const LOGO_CAT_ORDER = ['AWS', 'Microsoft Azure', 'Google Cloud', 'Other Cloud', 'Virtualization', 'Containers',
  'Databases', 'Operating Systems', 'Web & App Servers', 'Languages & Frameworks', 'Storage & Hardware',
  'Network', 'Messaging & Queues', 'Directory & Auth', 'Protocols & Services', 'Browsers', 'Business Apps',
  'Brand & Platform', 'Software / Integrations', 'Other']
function logoCategory(n) {
  const s = n.toLowerCase()
  if (/^amazon|^aws/.test(s)) return 'AWS'
  if (/^azure/.test(s)) return 'Microsoft Azure'
  if (/^gcp|^google/.test(s)) return 'Google Cloud'
  if (/oracle-cloud|ibm-cloud|alibaba|digitalocean|^oci\b|openstack|^cloud$/.test(s)) return 'Other Cloud'
  if (/vmware|esxi|vsphere|hyper-?v|nutanix|citrix-xen|\bxen\b|proxmox|kvm|ovirt|vcenter|nsxt|prism|^vm$/.test(s)) return 'Virtualization'
  if (/docker|kubernetes|openshift|tanzu|k8s|container|rancher|podman/.test(s)) return 'Containers'
  if (/mysql|postgres|mongo|redis|mariadb|cassandra|oracle-(db|database|rac)|sql|mssql|sybase|db-?2|db2|ibm-db|elasticsearch|cosmos|dynamo|document-db|sap-(hana|max-db)|influx|couch|memcache|snowflake|-db$|database|jdbc/.test(s)) return 'Databases'
  if (/windows|linux|ubuntu|centos|redhat|debian|hp-ux|aix|solaris|mac-?os|freebsd|android|^ios$|ibm-as-400/.test(s)) return 'Operating Systems'
  if (/apache-http|apache-tomcat|^apache$|nginx|tomcat|glassfish|weblogic|websphere|jboss|wildfly|\biis\b|node|litespeed|caddy|jetty|haproxy|light-?httpd|harmonic/.test(s)) return 'Web & App Servers'
  if (/cpp|dotnet|\.net|^go$|^java$|javascript|^php$|python|ruby|web-framework|golang|scala|kotlin|perl/.test(s)) return 'Languages & Frameworks'
  if (/dell-emc|hitachi|hpe|ibm-flashsystem|ibm-tape|netapp|oceanstor|qnap|qsan|synology|fibrenetix|^storage$|hardware-sensor|ups|printer|snmp-device|fibre|flashsystem|storagegrid/.test(s)) return 'Storage & Hardware'
  if (/cisco|juniper|aruba|fortinet|palo|\bf5\b|netscaler|array-networks|huawei|arista|meraki|ubiquiti|mikrotik|checkpoint|sophos|sonicwall|extreme|brocade|ruckus|-adc$|wireless|switch|router|firewall|\bvpn\b|load-balancer|sdn|zscaler/.test(s)) return 'Network'
  if (/rabbit-mq|apache-mq|activemq|msmq|kafka|-mq$|\bmq\b|sqs|sns|servicebus|pubsub|queue|jms/.test(s)) return 'Messaging & Queues'
  if (/active-directory|ldap|authentication|radius|kerberos|okta|identity-access|privileged-access|iam/.test(s)) return 'Directory & Auth'
  if (/dns|ntp|^ping$|^port$|ssh|sftp|^ftp$|tftp|telnet|^http$|^url$|jmx|powershell|rest-api|bind9|ssl-certificate|proxy-server|log-collector|^snmp$|^local$|email(-gateway|-security)?$|symantec-messaging|search-engine|ocr-engine|file-integrity|api-gateway|^web$|domain|net-?flow/.test(s)) return 'Protocols & Services'
  if (/chrome|firefox|opera|edge|safari|seamonkey|avast|avg|brave|browser|\btor\b|falkon|palemoon|sleipnir|whale|yandex|^iron$/.test(s)) return 'Browsers'
  if (/exchange|office|sharepoint|outlook|teams|team$|^sap|servicenow|jira|slack|salesforce|dynamics|zimbra|onedrive|\berp\b|plm-system|ecm-system|it-asset|government-audit|email$/.test(s)) return 'Business Apps'
  return 'Other'
}
const sizeSvg = (svg) => svg.replace(/<svg([^>]*)>/i, (m, a) => {
  if (/\swidth=/i.test(a) && /\sheight=/i.test(a)) return m
  const vb = a.match(/viewBox="\s*[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)\s*"/i)
  if (!vb) return m
  return `<svg${a} width="${vb[1]}" height="${vb[2]}">`
})
function uniquifyIds(svg, uid) {
  const ids = [...new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]
  for (const id of ids) {
    const e = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const nid = `${uid}-${id}`
    svg = svg.replace(new RegExp(`(\\sid=")${e}(")`, 'g'), `$1${nid}$2`)
      .replace(new RegExp(`url\\(#${e}\\)`, 'g'), `url(#${nid})`)
      .replace(new RegExp(`((?:xlink:)?href=")#${e}(")`, 'g'), `$1#${nid}$2`)
  }
  return svg
}
const lineSvg = (pathMarkup) => `<svg viewBox="0 0 512 512" width="512" height="512" fill="currentColor" data-fit="1">${pathMarkup}</svg>`

function loadProductLogos() {
  const out = []
  let uid = 0
  const colorDir = path.join(SRC, 'icons', 'monitor-type-icons', 'icons')
  if (exists(colorDir)) {
    for (const f of fs.readdirSync(colorDir).filter((x) => x.endsWith('.svg'))) {
      const n = f.replace(/\.svg$/, '')
      const raw = read(path.join(colorDir, f)).trim()
      if (n === 'no-icon' || !/<svg[\s>]/i.test(raw)) continue
      out.push({ set: 'color', n, cat: logoCategory(n), kind: 'svg', svg: uniquifyIds(sizeSvg(raw), 'l' + (uid++)) })
    }
  }
  const lineJs = path.join(SRC, 'icons', 'monitor-type-line-icons', 'monitor-type-line-icons.js')
  if (exists(lineJs)) {
    const txt = read(lineJs)
    const re = /\[Constants\.([A-Z0-9_]+)\]\s*:\s*'([^']*)'/g
    let m
    while ((m = re.exec(txt))) {
      const n = m[1].toLowerCase().replace(/_/g, '-')
      out.push({ set: 'line', n, cat: logoCategory(n), kind: 'svg', svg: lineSvg(m[2]) })
    }
  }
  const asDataUri = (fp) => `data:image/${fp.endsWith('.svg') ? 'svg+xml' : 'png'};base64,${fs.readFileSync(fp).toString('base64')}`
  const addImages = (dir, cat, filter = () => true) => {
    if (!exists(dir)) return
    for (const f of fs.readdirSync(dir).filter((x) => /\.(svg|png)$/i.test(x) && filter(x))) {
      const n = f.replace(/\.(svg|png)$/i, '')
      const fp = path.join(dir, f)
      if (f.endsWith('.svg')) out.push({ set: 'color', n, cat, kind: 'svg', svg: uniquifyIds(sizeSvg(read(fp).trim()), 'l' + (uid++)) })
      else out.push({ set: 'color', n, cat, kind: 'img', src: asDataUri(fp) })
    }
  }
  addImages(path.join(SRC, 'images', 'logo'), 'Brand & Platform', (f) => !/_dark/i.test(f))
  addImages(path.join(SRC, 'images', 'software-logos'), 'Software / Integrations')
  return out
}

const icons = loadProductIcons()
const logos = loadProductLogos()
fs.writeFileSync(path.join(HERE, 'icons.data.json'), JSON.stringify({ prefix: 'Font Awesome Light (fal)', icons }))
fs.writeFileSync(path.join(HERE, 'logos.data.json'), JSON.stringify({ catOrder: LOGO_CAT_ORDER, logos }))
console.log(`icons: ${icons.length}  |  logos: ${logos.length} (color ${logos.filter((l) => l.set === 'color').length} + line ${logos.filter((l) => l.set === 'line').length})`)
