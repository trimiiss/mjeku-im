import { site } from "@/lib/site";
import { ArrowRightIcon, CheckIcon, LockIcon, ServerIcon, ShieldIcon, UsersIcon } from "./Icons";

export function Security() {
  return (
    <section className="section section--mist" id="privacy" aria-labelledby="privacy-title">
      <div className="container split">
        <div className="stack">
          <p className="eyebrow">Data protection</p>
          <h2 id="privacy-title" className="h2">
            Your health data is safe with {site.fullName}
          </h2>
          <p className="lede">
            Your data is encrypted and stored on servers in {site.country}, in line with the Swiss Federal Act on
            Data Protection (nFADP). Only you and the practitioners you book with can see your appointments.
          </p>
          <ul className="checklist">
            <li>
              <span className="tick">
                <LockIcon width={16} height={16} />
              </span>
              Encrypted in transit and at rest
            </li>
            <li>
              <span className="tick">
                <ServerIcon width={16} height={16} />
              </span>
              Hosted in Swiss data centres
            </li>
            <li>
              <span className="tick">
                <UsersIcon width={16} height={16} />
              </span>
              You decide who sees your information
            </li>
          </ul>
          <a className="link" href="#faq">
            Read our privacy commitments
            <ArrowRightIcon width={18} height={18} />
          </a>
        </div>

        <div className="vault" aria-hidden="true">
          <div className="vault-card">
            <div className="vault-top">
              <span className="vault-lock">
                <ShieldIcon />
              </span>
              <div>
                <b>Your patient file</b>
                <span>Encrypted · visible only to you</span>
              </div>
            </div>
            <div className="vault-rows">
              <div className="vault-row">
                <span>Appointments</span>
                <i style={{ width: "86%" }} />
              </div>
              <div className="vault-row">
                <span>Reason for visit</span>
                <i style={{ width: "62%" }} />
              </div>
              <div className="vault-row">
                <span>Contact details</span>
                <i style={{ width: "74%" }} />
              </div>
              <div className="vault-row">
                <span>Insurance</span>
                <i style={{ width: "48%" }} />
              </div>
            </div>
            <div className="vault-foot">
              <span className="ch">CH</span>
              Stored in Switzerland
              <span className="vault-ok">
                <CheckIcon width={14} height={14} />
                nFADP
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
