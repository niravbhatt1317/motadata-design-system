// Organisms / Drawer — FlotoDrawer (_base-drawer.vue, 99×) wraps MDrawer (Ant a-drawer): a
// slide-in side panel. FlotoDrawerForm (59×) = FlotoForm (vertical) + FlotoDrawer for forms.
// Open via the `open` prop (toggles) or a `trigger` slot. Slots: title · body (scrollable via
// FlotoScrollView) · actions (a fixed footer that gets `hide`). width default 40%; mask doesn't
// close (maskClosable false). Together 158× — the product's MOST-used overlay.

export default {
  title: 'Organisms/Drawer/Examples',
  parameters: {
    docs: {
      description: {
        component:
          '🟢 **Stable** · Organism — a **slide-in side panel** (`FlotoDrawer`, 99×; with `FlotoDrawerForm` 59× the most-used overlay). For **detail views, edit forms, and record-contextual content** that\'s too long for a modal. Open via the **`open`** prop or a **`trigger`** slot. Slots: `title` · body (scrollable) · `actions` (fixed footer). `width` default **40%**. Use a **Modal** for short confirmations instead.',
      },
    },
  },
  argTypes: {
    width: { control: 'text' },
  },
  args: { width: '480' },
}

export const Basic = () => ({
  data: () => ({ open: false }),
  template: `
    <div>
      <MButton @click="open = true">Open drawer</MButton>
      <FlotoDrawer :open="open" :width="480" @hide="open = false">
        <template v-slot:title>Monitor details</template>
        <div style="color:var(--page-text-color)">
          <p><strong>web-server-01</strong> — 10.0.0.12</p>
          <p>Status: Up · Last poll: 12s ago · Interval: 30s.</p>
          <p>Body content scrolls within the panel; the title and the actions footer stay put.</p>
        </div>
        <template v-slot:actions="{ hide }">
          <MButton variant="default" @click="hide">Close</MButton>
        </template>
      </FlotoDrawer>
    </div>`,
})
Basic.parameters = { docs: { description: { story: 'A detail **side panel** — opened via the `open` prop, sliding in from the right over a backdrop. `title` (text-primary) + scrollable body + an `actions` footer (gets `hide`). Click **Open drawer**.' } } }

export const FormDrawer = () => ({
  data: () => ({ open: false, name: '', interval: 30 }),
  // The FlotoDrawerForm pattern: a vertical form in a drawer; the actions footer submits.
  template: `
    <div>
      <MButton @click="open = true">Edit monitor…</MButton>
      <FlotoDrawer :open="open" :width="480" @hide="open = false">
        <template v-slot:title>Edit monitor</template>
        <FlotoFormItem label="Monitor name" rules="required" v-model="name" placeholder="web-server-01" />
        <FlotoFormItem label="Polling interval" type="number" help="In seconds." v-model="interval" />
        <template v-slot:actions="{ hide }">
          <MButton variant="default" class="mr-2" @click="hide">Cancel</MButton>
          <MButton @click="hide">Save</MButton>
        </template>
      </FlotoDrawer>
    </div>`,
})
FormDrawer.storyName = 'Form drawer (FlotoDrawerForm pattern)'
FormDrawer.parameters = { docs: { description: { story: 'The **form-in-drawer** pattern — most Add/Edit flows use **`FlotoDrawerForm`** (`FlotoForm` vertical + `FlotoDrawer`, 59×). Fields in the body, **Cancel / Save** in the actions footer. (Tip: `FlotoDrawerForm` suppresses `MForm`\'s default Submit so only the footer Save submits.)' } } }

export const Widths = () => ({
  data: () => ({ a: false, c: false }),
  template: `
    <div style="display:flex;gap:12px">
      <MButton variant="default" @click="a = true">Narrow (360)</MButton>
      <MButton variant="default" @click="c = true">Wide (60%)</MButton>
      <FlotoDrawer :open="a" :width="360" @hide="a = false"><template v-slot:title>Narrow</template><p style="color:var(--page-text-color)">A 360px panel.</p><template v-slot:actions="{ hide }"><MButton variant="default" @click="hide">Close</MButton></template></FlotoDrawer>
      <FlotoDrawer :open="c" width="60%" @hide="c = false"><template v-slot:title>Wide</template><p style="color:var(--page-text-color)">A 60%-wide panel for richer content.</p><template v-slot:actions="{ hide }"><MButton variant="default" @click="hide">Close</MButton></template></FlotoDrawer>
    </div>`,
})
Widths.parameters = { docs: { description: { story: 'Width via the `width` prop — px (e.g. `360`) or % (e.g. `60%`). Default is **40%**. The product spans **360px → 40% (default) → 50–70% (rich) → 85–96% (full-screen, multi-pane)** — see the **Large / full-screen** story.' } } }

// Footer/actions button layout — the `.actions` bar is justify-end with NO built-in gap; the
// product spaces buttons with `mr-2` on the non-last, and splits a destructive/tertiary action
// (or a note) to the LEFT via justify-between. These bars mimic the real footer.
const BAR = 'display:flex;align-items:center;height:60px;padding:0 24px;border-top:1px solid var(--border-color);max-width:560px'
export const FooterActions = () => ({
  template: `
    <div style="display:flex;flex-direction:column;gap:20px">
      <div>
        <div style="font-size:12px;color:var(--neutral-light);margin-bottom:4px">2 buttons — Cancel + primary, right-aligned (Cancel \`mr-2\`)</div>
        <div style="${BAR};justify-content:flex-end"><MButton variant="default" class="mr-2">Cancel</MButton><MButton>Save</MButton></div>
      </div>
      <div>
        <div style="font-size:12px;color:var(--neutral-light);margin-bottom:4px">3 buttons — secondary + Cancel + primary, all right-aligned (\`mr-2\` gaps)</div>
        <div style="${BAR};justify-content:flex-end"><MButton variant="default" class="mr-2">Reset</MButton><MButton variant="default" class="mr-2">Cancel</MButton><MButton>Save</MButton></div>
      </div>
      <div>
        <div style="font-size:12px;color:var(--neutral-light);margin-bottom:4px">3 buttons (split) — destructive on the LEFT, confirm group on the right (justify-between)</div>
        <div style="${BAR};justify-content:space-between"><MButton variant="error" outline>Delete</MButton><span><MButton variant="default" class="mr-2">Cancel</MButton><MButton>Save</MButton></span></div>
      </div>
      <div>
        <div style="font-size:12px;color:var(--neutral-light);margin-bottom:4px">4 buttons (split) — tertiary/note left, confirm group right; beyond this, move extras into a menu</div>
        <div style="${BAR};justify-content:space-between"><span style="font-size:12px;color:var(--secondary-red)">* fields are mandatory</span><span><MButton variant="default" class="mr-2">Back</MButton><MButton variant="default" class="mr-2">Cancel</MButton><MButton>Save</MButton></span></div>
      </div>
    </div>`,
})
FooterActions.storyName = 'Footer actions (2 / 3 / 4 buttons)'
FooterActions.parameters = { docs: { description: { story: 'The footer/`actions` bar is **right-aligned with no built-in gap** — space buttons with **`mr-2`** on the non-last. The **primary** sits far-right, **Cancel** just left of it. A **destructive** or **tertiary** action (or a "* mandatory" note) goes on the **LEFT** via `justify-between`. With 4+ actions, keep one confirm group on the right and move rarely-used actions into a menu.' } } }

// Large / full-screen drawer — faithfully mirrors the real APM Application Registration drawer
// (src/modules/settings/apm-settings/.../apm-application-registration-drawer.vue): a 96%-wide
// FlotoDrawer with :scrolled-content="false" and a 2 : 6 : 4 MRow body — a tinted left nav
// (--drawer-sidebar-background), a sectioned form column (dividers + section-headings + an
// "Apply Configuration" button), and a right info column (accent-bar headings + data tables
// + a bordered Verification box). Each column scrolls independently.
// Uses REAL components (FlotoDrawer, MRow/MCol, MRadioGroup, FlotoFormItem, MButton, MIcon) +
// shared DS primitive classes (.ds-section-heading / .ds-helper-text / .ds-divider /
// .ds-accent-bar / .ds-panel / .ds-spec-table / .ds-nav-item — see storybook/ds-primitives.less)
// instead of inline one-off styles.
const FRAMEWORKS = [['Spring Boot', '2.0+'], ['Hibernate', '5.0+'], ['Apache Camel', '2.20+'], ['gRPC', '1.6+'], ['Vert.x', '3.5+']]
export const LargeDrawer = () => ({
  data: () => ({
    open: false,
    deployment: 'host',
    method: 'manual',
    language: 'JAVA',
    serviceName: '',
    nav: [{ k: 'host', t: 'Host/VM', icon: 'vm' }, { k: 'docker', t: 'Docker', icon: 'docker' }, { k: 'k8s', t: 'Kubernetes', icon: 'kubernetes' }],
    methodOpts: [{ value: 'manual', label: 'Manual' }, { value: 'autodetect', label: 'Auto Detect' }],
    langOpts: [{ value: 'JAVA', label: 'Java' }, { value: 'DOTNET', label: '.NET' }, { value: 'NODEJS', label: 'Node.js' }, { value: 'PYTHON', label: 'Python' }],
    frameworks: FRAMEWORKS,
  }),
  template: `
    <div>
      <MButton @click="open = true">Open registration (96%)</MButton>
      <FlotoDrawer :open="open" width="96%" :scrolled-content="false" @hide="open = false">
        <template v-slot:title>Application Registration</template>

        <MRow class="flex-1 min-h-0" :gutter="0" style="margin-top:-5px;color:var(--page-text-color)">
          <!-- Left: deployment-type nav (.ds-nav-item) -->
          <MCol :size="2" class="h-full" style="background-color:var(--drawer-sidebar-background)">
            <div class="px-4 mt-3 flex flex-col h-full">
              <div
                v-for="d in nav" :key="d.k"
                class="ds-nav-item flex items-center px-3 py-4 mb-2 rounded-lg cursor-pointer"
                :class="{ 'ds-nav-item-selected': deployment === d.k }"
                @click="deployment = d.k">
                <MIcon :name="d.icon" class="mr-2" />
                <span class="ds-section-text">{{ d.t }}</span>
              </div>
            </div>
          </MCol>

          <!-- Middle: sectioned form (.ds-section-heading / .ds-helper-text / .ds-divider) -->
          <MCol :size="6" class="h-full overflow-y-auto"
            style="background-color:var(--dashboard-background);border-right:1px solid var(--border-color);border-left:1px solid var(--border-color)">
            <div class="p-4">
              <div class="mb-6">
                <h5 class="text-primary mb-2 ds-main-heading">Instrumenting Host/VM Based Application</h5>
                <div class="text-neutral-light mb-4 ds-caption">Follow the steps below to register your application and start collecting traces using the APM agent.</div>
              </div>

              <div>
                <h6 class="text-primary mb-2 ds-section-heading">Instrumentation Method</h6>
                <p class="mb-3 ds-helper-text">Choose how to instrument your application.</p>
                <MRadioGroup v-model="method" :options="methodOpts" as-button />
              </div>
              <div class="ds-divider"></div>

              <div>
                <h6 class="text-primary mb-2 ds-section-heading">Select Language</h6>
                <p class="mb-3 ds-helper-text">Select your application's language.</p>
                <MRadioGroup v-model="language" :options="langOpts" as-button />
              </div>
              <div class="ds-divider"></div>

              <div>
                <h6 class="text-primary mb-2 ds-section-heading">Service Name <span class="text-secondary-red">*</span></h6>
                <p class="mb-3 ds-helper-text">The service name is displayed in APM Explorer. Provide a unique and meaningful name (e.g., ERP).</p>
                <MRow><MCol :size="6"><FlotoFormItem v-model="serviceName" placeholder="Enter your service name" /></MCol></MRow>
              </div>

              <div class="flex items-center mt-6 pb-4">
                <MButton variant="primary">Apply Configuration</MButton>
              </div>
            </div>
          </MCol>

          <!-- Right: supported info + verification (.ds-accent-bar / .ds-panel-heading / .ds-spec-table / .ds-panel) -->
          <MCol :size="4" class="h-full overflow-y-auto" style="background-color:var(--dashboard-background)">
            <div class="py-4 px-2">
              <div class="mb-3">
                <div class="flex items-center mb-3">
                  <span class="ds-accent-bar"></span>
                  <h4 class="ds-panel-heading">Supported Frameworks</h4>
                </div>
                <table class="ds-spec-table">
                  <thead>
                    <tr><th>FRAMEWORK</th><th>VERSION</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="(f, i) in frameworks" :key="i">
                      <td>{{ f[0] }}</td>
                      <td>{{ f[1] }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="rounded pt-4 ds-panel">
                <h4 class="text-primary mb-2 ds-section-heading">Verification</h4>
                <div class="pl-3">
                  <p class="text-xs text-neutral-light mb-1">Once the Application is Running:</p>
                  <ul class="text-xs pl-6 ds-body-text">
                    <li>Confirm that the service has been registered successfully.</li>
                    <li>On the service registration screen, the trace collection Status should display "Running."</li>
                    <li>The traces will start appearing in the APM Explorer screen.</li>
                  </ul>
                </div>
              </div>
            </div>
          </MCol>
        </MRow>
      </FlotoDrawer>
    </div>`,
})
LargeDrawer.storyName = 'Large / full-screen (90–96%, multi-pane)'
LargeDrawer.parameters = { docs: { description: { story: 'The **large / full-screen drawer** (width **85–96%**, used ~30× — e.g. `width="96%"` for *APM Application Registration*). A faithful reproduction of the real product screen: a **96%-wide `FlotoDrawer`** with **`:scrolled-content="false"`** and a **2 : 6 : 4 `MRow`** body — (1) a tinted left **deployment nav** (`--drawer-sidebar-background`, selected item on `--code-tag-background-color`), (2) a **sectioned form column** (`--dashboard-background`, `section-heading` + `helper-text` blocks split by **dividers**, ending in an **Apply Configuration** primary button), and (3) a **right info column** with **`vertical-line`-accented headings**, supported-tech **data tables**, and a bordered **Verification** box. Each column scrolls independently. Use this (not a modal) for rich configuration/registration wizards.' } } }

export const Playground = (args) => ({
  props: Object.keys(args),
  data: () => ({ open: false }),
  template: `
    <div>
      <MButton @click="open = true">Open drawer</MButton>
      <FlotoDrawer :open="open" :width="width" @hide="open = false">
        <template v-slot:title>Drawer</template>
        <p style="color:var(--page-text-color)">Adjust width via the control, then reopen.</p>
        <template v-slot:actions="{ hide }"><MButton variant="default" @click="hide">Close</MButton></template>
      </FlotoDrawer>
    </div>`,
})

// Hide the Controls panel on static showcase stories (only Playground uses args).
Basic.parameters = { ...(Basic.parameters || {}), controls: { disable: true } }
FormDrawer.parameters = { ...(FormDrawer.parameters || {}), controls: { disable: true } }
Widths.parameters = { ...(Widths.parameters || {}), controls: { disable: true } }
FooterActions.parameters = { ...(FooterActions.parameters || {}), controls: { disable: true } }
LargeDrawer.parameters = { ...(LargeDrawer.parameters || {}), controls: { disable: true } }
