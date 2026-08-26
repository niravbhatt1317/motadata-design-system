// Showcase manifest for <obs-logo> — a product monitor-type LOGO by name. The logo counterpart of obs-icon.
const cell = (name, label) => ({ attrs: { name, size: '28' }, text: '' , label: label || name })
const grid = (label, names) => ({ group: label, items: names.map((n) => ({ attrs: { name: n, size: '30' } })) })

export default {
  el: 'obs-logo',
  display: 'Logo',
  registry: 'logo',
  controls: [
    { prop: 'name', type: 'text', default: 'linux' },
    { prop: 'variant', type: 'select', options: ['color', 'line'] },
    { prop: 'size', type: 'text', default: '28' },
    { prop: 'label', type: 'text' },
  ],
  playground: { attrs: { name: 'linux', size: '48' }, text: '' },
  gallery: [
    grid('Operating systems — obs-logo name="windows" · "linux" · … (names are case/space-insensitive; aliases resolve)', ['windows', 'linux', 'mac-os', 'ibm-aix', 'hp-ux', 'solaris', 'android', 'ios']),
    grid('Network — router · switch · firewall · load-balancer · proxy-server · wireless · storage · netapp', ['router', 'switch', 'firewall', 'load-balancer', 'proxy-server', 'wireless', 'storage', 'netapp', 'ups']),
    grid('Cloud — AWS · Azure · GCP · Oracle', ['aws-cloud', 'amazon-ec2', 'amazon-s3', 'amazon-rds', 'aws-lambda', 'azure-cloud', 'azure-vm', 'azure-sql-database', 'google-cloud', 'gcp-compute-engine', 'oracle-cloud']),
    grid('Virtualization & containers — vmware · vcenter · hyper-v · nutanix · docker · kubernetes · openshift', ['vmware-esxi', 'vcenter', 'hyper-v', 'kvm', 'nutanix', 'citrix-xen', 'proxmox', 'dockercontainer', 'kubernetes', 'openshift-kubernetes']),
    grid('Databases — mysql · postgresql · mongodb · oracle · mssql · redis · maria-db · elasticsearch · sap-hana', ['mysql', 'postgresql', 'mongodb', 'oracle-database', 'mssql', 'redis', 'maria-db', 'elasticsearchdb', 'sybase', 'sap-hana', 'ibm-db-2']),
    grid('Web / app servers — apache · nginx · tomcat · iis · jboss · weblogic · haproxy', ['apache-http', 'nginx', 'apache-tomcat', 'microsoft-iis', 'jboss', 'oracle-weblogic', 'haproxy', 'glassfish-server', 'wildfly']),
    grid('Languages — java · python · node · .net · php · go · ruby · javascript · cpp', ['java', 'python', 'nodejs', 'dotnet', 'php', 'go', 'ruby', 'javascript', 'cpp']),
    grid('Apps & browsers — exchange · sharepoint · office 365 · onedrive · slack · chrome · firefox · safari · edge', ['exchange-mailbox', 'sharepoint-online', 'office-365', 'onedrive', 'slack', 'microsoft-dynamics-crm', 'chrome', 'firefox', 'safari', 'microsoft-edge']),
    grid('Brand & Software — the Brand & Platform + Software / Integrations categories (some are raster/PNG, rendered as an img)', ['motadata', 'servicenow', 'jira', 'microsoft-teams', 'slack', 'sebi']),
    { group: 'Line variant — variant="line" renders the MONOCHROME line icon (inherits the text colour) for dense/monochrome contexts. Same names, no brand colour', items: [
      { attrs: { name: 'linux', variant: 'line', size: '30' } }, { attrs: { name: 'windows', variant: 'line', size: '30' } },
      { attrs: { name: 'router', variant: 'line', size: '30' } }, { attrs: { name: 'mysql', variant: 'line', size: '30' } },
      { attrs: { name: 'dockercontainer', variant: 'line', size: '30' } }, { attrs: { name: 'aws-cloud', variant: 'line', size: '30' } },
      { attrs: { name: 'nginx', variant: 'line', size: '30' } }, { attrs: { name: 'firewall', variant: 'line', size: '30' } },
    ] },
    { group: 'Aliases + fallback — short/display names resolve (docker · aws · vmware · postgres · k8s); an unknown name renders `no-icon`', items: [
      { attrs: { name: 'docker', size: '30' } }, { attrs: { name: 'aws', size: '30' } }, { attrs: { name: 'vmware', size: '30' } },
      { attrs: { name: 'postgres', size: '30' } }, { attrs: { name: 'k8s', size: '30' } }, { attrs: { name: 'Windows', size: '30' } },
      { attrs: { name: 'something-unknown', size: '30' } },
    ] },
  ],
}
