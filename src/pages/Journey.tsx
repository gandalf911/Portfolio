import "./Journey.css";

/** "My Journey": the career timeline. Copy and line breaks as published. */
export function Journey() {
  return (
    <div className="journey">
      <div className="journey__wrap">
        <div className="journey__inner">
          <h2 className="t-h2 journey__title">My Journey</h2>
          <div className="journey__list">
            <div className="journey__line" />

            <div className="journey__first">
              <div className="journey__first-row">
                <p className="t-small journey__first-date">MAR 2024 — PRESENT</p>
                <div className="journey__first-body">
                  <h5 className="t-h5 journey__text">Business Analyst · Data &amp; Automation (FDE)</h5>
                  <p className="t-body journey__company">Real-estate proptech · Casablanca</p>
                  <div className="t-body rt journey__text journey__text--88">
                    <p>
                      Part of the operations team (800+ real-estate advisors). I joined as a business analyst and the role
                      grew into an internal Forward Deployed Engineer: learn the business alongside the teams, then design,
                      build, deploy and run the tools it runs on.
                    </p>
                    <p>
                      <strong>Averröes:</strong> internal platform built from scratch and carried alone end to end (scoping,
                      architecture, development, deployment, operations). 45 users, 8 data sources consolidated, 30+
                      management screens, business actions written back to the advisor platform, role-based access, audit
                      log and SSO.
                      <br />
                      <em>Stack: Next.js, TypeScript, PostgreSQL, Redis, Kubernetes, S3</em>
                    </p>
                    <p>
                      <strong>Onboarding redesign:</strong> process rethought, express track, automated account and contract
                      creation, e-learning and Zoom training tracked end to end.
                      <br />
                      <em>Stack: HubSpot, n8n, Thinkific, PandaDoc, Zoom, Wati</em>
                    </p>
                    <p>
                      <strong>Retention over the first 45 days:</strong> D+1 and D+2 follow-ups, starter kit, satisfaction
                      surveys, a "First Deal" program, back-office SLAs tracked in Averröes.
                    </p>
                    <p>
                      <strong>Data:</strong> dbt models for reporting and advisor scoring, replication workflows feeding
                      Averröes' mirror database from the warehouse.
                      <br />
                      <em>Stack: dbt, PostgreSQL, SQL, n8n, DBeaver, Compass, Metabase</em>
                    </p>
                    <p>
                      <strong>Automation:</strong> 30+ workflows designed, 160+ hours of work saved every week, migration
                      from Zapier and Apps Script to n8n.
                    </p>
                    <p>
                      <strong>A suite of 3 apps:</strong> Averröes, Galaxy (advisor portal: tools, training, transaction
                      declarations) and Portal (advisor sign-up, secure document upload, OCR document reading).
                      <br />
                      <em>Stack: React, Node.js, PostgreSQL, Docker, GitHub &amp; GitLab, Claude, S3</em>
                    </p>
                    <p>
                      <strong>Business analysis:</strong> process design (onboarding, offboarding, claims), KPI-driven
                      management, the bridge between product, DevOps, operations, back-office, sales and engineering.
                    </p>
                    <p>
                      <strong>Outcome:</strong> the whole operation run from a single tool, 160 hours of manual work saved
                      every week, and processes that enforce themselves.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="journey__line" />

            <div className="journey__row journey__row--2">
              <div className="journey__date">
                <p className="t-small journey__date-text">AUG 2023 — JAN 2024</p>
              </div>
              <div className="journey__body">
                <h5 className="t-h5 journey__text">Project Manager &amp; Public Relations</h5>
                <p className="t-body journey__text journey__company--2">Business Consulting Center | NGO · Marrakech</p>
                <p className="t-body journey__text journey__text--88">
                  Designed the NGO's digital and visual identity, built the 2024–2025 action plan, ran a multi-channel
                  communication strategy, coordinated strategic partnerships and on-the-ground events, and reported on KPIs
                  and capital raised through public campaigns.
                </p>
              </div>
            </div>

            <div className="journey__line" />

            <div className="journey__row journey__row--3">
              <div className="journey__date">
                <p className="t-small journey__date-text">JAN 2023 — MAY 2023</p>
              </div>
              <div className="journey__body">
                <h5 className="t-h5 journey__text">Internal Audit Intern</h5>
                <p className="t-body journey__company journey__org"><img className="journey__logo" src="/logos/cdg-capital.png" alt="CDG Capital" /><span>· Rabat</span></p>
                <div className="t-body rt journey__text journey__text--phone-88">
                  <p>Quantitative and qualitative analysis of operational and financial data.</p>
                  <p>Built a new financial model to evaluate service performance and surface margin opportunities.</p>
                </div>
              </div>
            </div>

            <div className="journey__line" />

            <div className="journey__row journey__row--4">
              <div className="journey__date">
                <p className="t-small journey__date-text">NOV 2020 — DEC 2021</p>
              </div>
              <div className="journey__body">
                <h5 className="t-h5 journey__text">Wealth Management Consultant</h5>
                <p className="t-body journey__text">Business Consulting Center · Marrakech</p>
                <p className="t-body journey__text journey__text--phone-88">
                  Tax-exemption simulations for expatriates, tax-optimization strategies, and financial-situation analysis for
                  heritage management | translating complex fiscal logic into clear client recommendations.
                </p>
              </div>
            </div>

            <div className="journey__line" />

            <div className="journey__row journey__row--5">
              <div className="journey__date">
                <p className="t-small journey__date-text">NOV 2019 — FEB 2020</p>
              </div>
              <div className="journey__body">
                <h5 className="t-h5 journey__text">Financial Consultant</h5>
                <p className="t-body journey__company journey__org"><img className="journey__logo" src="/logos/oney.svg" alt="Oney Bank" /><span>· Rabat</span></p>
                <p className="t-body journey__text journey__text--phone-88">
                  In-depth analysis of clients' financial needs and commercialization of renewable-credit offers; collaborated
                  with the analytical-review team on credit-margin analysis and process optimization.
                </p>
              </div>
            </div>

            <div className="journey__line" />
          </div>
        </div>
      </div>
    </div>
  );
}
