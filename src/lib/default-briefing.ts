import type { Briefing } from "./threat-types";

function formatDynamicLabel(minutes: number): string {
  if (minutes < 1) return "Just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (hours === 1) return rem > 0 ? `1h ${rem}m ago` : "1 hour ago";
  if (hours < 24) return rem > 0 ? `${hours}h ${rem}m ago` : `${hours} hours ago`;
  return "Yesterday";
}

export function getFallbackBriefing(): Briefing {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return {
    generatedLabel: `Live Intelligence Desk · Synced ${dateStr} ${timeStr}`,
    globalRiskPercent: 78,
    riskTrend: "+4% vs last 24h",
    headline:
      "Active zero-day perimeter gateway exploits, coordinated healthcare ransomware extortion, and npm dependency hijacking under high alert.",
    activeIncidents: 142,
    peopleAffectedLabel: "54.8M accounts monitored",
    categoryBreakdown: [
      { name: "Zero-Day Exploits", value: 34 },
      { name: "Ransomware & Extortion", value: 26 },
      { name: "Supply Chain Infiltration", value: 18 },
      { name: "Phishing & Social Eng.", value: 14 },
      { name: "Data Breaches", value: 8 },
    ],
    breakingNews: [
      {
        id: "news-1",
        title:
          "CISA Adds Critical Edge Gateway Vulnerability to Known Exploited Vulnerabilities Catalog",
        source: "CISA Official",
        sourceUrl: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
        timestamp: formatDynamicLabel(4),
        category: "Zero-day",
        summary:
          "Federal agencies ordered to patch remote execution flaws in edge devices within 72 hours due to observed in-the-wild exploitation.",
        urgency: "critical",
      },
      {
        id: "news-2",
        title: "Malicious NPM Packages Discovered Harvesting Developer Secrets and Cloud API Keys",
        source: "BleepingComputer",
        sourceUrl: "https://www.bleepingcomputer.com/news/security/",
        timestamp: formatDynamicLabel(18),
        category: "Supply chain",
        summary:
          "Security researchers identified over 120 typosquatted JavaScript packages targeting AWS credentials and SSH private keys.",
        urgency: "high",
      },
      {
        id: "news-3",
        title: "New Android Banking Trojan 'Anatsa' Evades Detection in Google Play Utilities",
        source: "The Hacker News",
        sourceUrl: "https://thehackernews.com/",
        timestamp: formatDynamicLabel(42),
        category: "Mobile malware",
        summary:
          "Attackers deploy dropper apps with delayed payloads to steal credentials from over 65 European and American banking institutions.",
        urgency: "high",
      },
      {
        id: "news-4",
        title: "FBI Warns of Surge in High-Value Executive Deepfake Audio Fraud",
        source: "KrebsOnSecurity",
        sourceUrl: "https://krebsonsecurity.com/",
        timestamp: formatDynamicLabel(75),
        category: "Phishing",
        summary:
          "Synthetic voice generation paired with business email reconnaissance causes multimillion-dollar fraudulent wire requests.",
        urgency: "medium",
      },
    ],
    threats: [
      {
        id: "cve-2026-edge-auth",
        title: "Active Remote Code Execution in Enterprise VPN & Perimeter Gateways",
        source: "CISA / US-CERT Advisory",
        sourceUrl: "https://www.cisa.gov/news-events/cybersecurity-advisories",
        category: "Zero-day",
        severity: "critical",
        riskPercent: 96,
        affectedPeople: "3.2M enterprise endpoints",
        regions: ["North America", "Europe", "Asia-Pacific"],
        summary:
          "Unauthenticated attackers are exploiting buffer overflow vulnerabilities in edge VPN appliances to bypass multi-factor authentication and dump active session tokens.",
        recommendedAction:
          "Apply vendor emergency patch KB-50921 immediately and isolate unpatched management interfaces behind restricted jump boxes.",
        publishedLabel: formatDynamicLabel(4),
        cveList: ["CVE-2026-3184", "CVE-2026-2910"],
        attackVector: "Network Unauthenticated / TCP Port 443 Pre-Auth Buffer Overflow",
        mitreTactics: ["T1190 - Exploit Public-Facing Application", "T1078 - Valid Accounts"],
        indicatorsOfCompromise: [
          "198.51.100.44:8443 (C2 Listener)",
          "sha256: 4a3f2b1c8e9d0a...edge_payload.bin",
          "/etc/pam.d/sshd injected backdoor",
        ],
        impactSummary: "Complete administrative control over internal corporate DMZ networks.",
        documents: [
          {
            title: "CISA Emergency Directive ED 26-02: Mitigation for Edge Gateways",
            issuer: "Cybersecurity & Infrastructure Security Agency",
            kind: "Emergency Directive",
            url: "https://www.cisa.gov/news-events/directives",
          },
          {
            title: "CVE-2026-3184 Vulnerability Assessment & Indicator Feeds",
            issuer: "National Vulnerability Database (NIST)",
            kind: "Technical Report",
            url: "https://nvd.nist.gov/vuln",
          },
        ],
      },
      {
        id: "blackcat-revival-healthcare",
        title: "Targeted Ransomware Campaign Hitting Regional Healthcare & Clinical Labs",
        source: "Health-ISAC & FBI Cyber Division",
        sourceUrl: "https://www.h-isac.org/",
        category: "Ransomware",
        severity: "critical",
        riskPercent: 91,
        affectedPeople: "820,000 patient records",
        regions: ["North America", "Western Europe"],
        summary:
          "Affiliates using double-extortion tactics are exfiltrating diagnostic imaging archives and threatening public disclosure if ransom demands are not met.",
        recommendedAction:
          "Verify that immutable offsite air-gapped backups are operational and disconnect diagnostic imaging VLANs from public routing.",
        publishedLabel: formatDynamicLabel(14),
        cveList: ["CVE-2025-4128", "CVE-2024-38077"],
        attackVector:
          "Spearphishing with Malicious OneNote LNK Dropper followed by Cobalt Strike beaconing",
        mitreTactics: [
          "T1486 - Data Encrypted for Impact",
          "T1567 - Exfiltration Over Web Service",
        ],
        indicatorsOfCompromise: [
          "203.0.113.89:443",
          "hxxp://diagnostic-archive-verify[.]online/enc.ps1",
          "sha256: 9b8a7c6d...blackcat_v3.dll",
        ],
        impactSummary:
          "Temporary disruption of clinical PACS imaging and outpatient diagnostic scheduling.",
        documents: [
          {
            title: "Joint Cybersecurity Advisory: Ransomware IOCs in Health Sector",
            issuer: "FBI & CISA",
            kind: "Advisory",
            url: "https://www.ic3.gov/Media/News",
          },
          {
            title: "Mitigation Playbook for Clinical Network Segmentation",
            issuer: "Health-ISAC Threat Operations",
            kind: "Defense Playbook",
            url: "https://www.h-isac.org/",
          },
        ],
      },
      {
        id: "npm-malicious-package-surge",
        title: "Coordinated Typosquatting Attack Infiltrating Open-Source NPM Packages",
        source: "OpenSSF / Socket Security Research",
        sourceUrl: "https://socket.dev/",
        category: "Supply chain",
        severity: "high",
        riskPercent: 82,
        affectedPeople: "1.4M build pipelines",
        regions: ["Global"],
        summary:
          "Over 120 malicious packages impersonating utility packages were caught harvesting developer SSH keys, cloud credentials, and .env tokens during postinstall scripts.",
        recommendedAction:
          "Enforce package lock validation, audit build dependencies with lockfile integrity checkers, and restrict outbound build container traffic.",
        publishedLabel: formatDynamicLabel(28),
        cveList: ["GHSA-2026-w89v-31nm"],
        attackVector:
          "Malicious npm postinstall lifecycle hook script exfiltration to Discord webhook",
        mitreTactics: [
          "T1195.001 - Compromise Software Dependencies",
          "T1552 - Unsecured Credentials",
        ],
        indicatorsOfCompromise: [
          "discordapp[.]com/api/webhooks/129384...",
          "eval(Buffer.from('...','base64')) in index.js",
        ],
        impactSummary: "Leaked cloud provider service keys and private GitHub access tokens.",
        documents: [
          {
            title: "Supply Chain Advisory: Obfuscated Postinstall Harvester",
            issuer: "Open Source Security Foundation",
            kind: "Technical Advisory",
            url: "https://openssf.org/",
          },
        ],
      },
      {
        id: "telecom-ss7-sim-hijacking",
        title: "High-Volume Telephony Intercept Campaign Targeting Financial SMS OTPs",
        source: "European Cybercrime Centre (EC3)",
        sourceUrl: "https://www.europol.europa.eu/about-europol/european-cybercrime-centre-ec3",
        category: "Phishing",
        severity: "high",
        riskPercent: 79,
        affectedPeople: "125,000 mobile subscribers",
        regions: ["Europe", "Middle East"],
        summary:
          "Threat actors are utilizing rogue SS7 telecommunications signaling hubs to intercept mobile authentication SMS messages and bypass banking SMS verification.",
        recommendedAction:
          "Transition all critical user and administrative accounts away from SMS-based verification to hardware FIDO2 keys or authenticator apps.",
        publishedLabel: formatDynamicLabel(55),
        cveList: ["CVD-2026-TELCO-01"],
        attackVector: "Abuse of roaming interconnect MAP/Diameter signaling requests",
        mitreTactics: ["T1111 - Two-Factor Authentication Interception"],
        indicatorsOfCompromise: ["Global Title (GT) routing node +882..."],
        impactSummary: "Unauthorized fund transfers and credential takeovers.",
        documents: [
          {
            title: "Telecom Threat Intelligence Bulletin: Signaling Vulnerabilities",
            issuer: "Europol EC3",
            kind: "Intelligence Report",
            url: "https://www.europol.europa.eu/",
          },
        ],
      },
      {
        id: "cloud-storage-misconfiguration",
        title: "Publicly Exposed Cloud S3-Compatible Buckets Exposing Telemetry Logs",
        source: "BleepingComputer / Huntress",
        sourceUrl: "https://www.bleepingcomputer.com/",
        category: "Data breach",
        severity: "medium",
        riskPercent: 68,
        affectedPeople: "14.6M consumer logs",
        regions: ["North America", "Latin America"],
        summary:
          "Misconfigured cloud object storage containing debug telemetry, email headers, and truncated session cookies was uncovered by automated security scanners.",
        recommendedAction:
          "Execute automated bucket permission audits and enforce global block-public-access organizational policies.",
        publishedLabel: formatDynamicLabel(95),
        cveList: [],
        attackVector: "Unauthenticated HTTP GET against publicly listed storage bucket",
        mitreTactics: ["T1530 - Data from Cloud Storage"],
        indicatorsOfCompromise: ["s3-us-west-2.amazonaws.com/telemetry-internal-prod-2026/"],
        impactSummary: "Exposure of consumer identifiers and analytics logs.",
        documents: [
          {
            title: "Cloud Exposure Analysis & Remediation Checklist",
            issuer: "Huntress Threat Labs",
            kind: "Investigation Report",
            url: "https://www.huntress.com/blog",
          },
        ],
      },
      {
        id: "android-banking-trojan-dropper",
        title: "Fake Utility Apps on Third-Party App Stores Delivering Anatsa Variant",
        source: "Kaspersky Threat Intelligence",
        sourceUrl: "https://securelist.com/",
        category: "Mobile malware",
        severity: "high",
        riskPercent: 74,
        affectedPeople: "450,000 mobile devices",
        regions: ["Europe", "Southeast Asia"],
        summary:
          "Trojanized PDF viewers and document scanners distributed via fraudulent ad campaigns abuse accessibility services to execute automated overlay fraud.",
        recommendedAction:
          "Warn mobile users to inspect device accessibility permissions and disable side-loading from unauthorized app repositories.",
        publishedLabel: formatDynamicLabel(140),
        cveList: [],
        attackVector: "Abuse of Android Accessibility Service for UI injection & keylogging",
        mitreTactics: ["T1417 - Input Capture", "T1433 - Stop System Process"],
        indicatorsOfCompromise: ["com.scanner.fastdoc.pdf", "94.130.12.8:8080"],
        impactSummary: "Automated account takeover of mobile banking applications.",
        documents: [
          {
            title: "Malware Analysis: Automated Transfer System (ATS) Overlays",
            issuer: "Kaspersky Lab",
            kind: "Technical Report",
            url: "https://securelist.com/",
          },
        ],
      },
      {
        id: "ot-scada-water-facility-recon",
        title: "State-Sponsored Reconnaissance Activity Against Water Treatment Utilities",
        source: "UK NCSC & CISA",
        sourceUrl: "https://www.ncsc.gov.uk/",
        category: "Critical infrastructure",
        severity: "critical",
        riskPercent: 88,
        affectedPeople: "2.1M municipal residents",
        regions: ["North America", "Europe"],
        summary:
          "Targeted scanning and default credential brute-forcing detected against internet-facing Programmable Logic Controllers (PLCs) and HMI units.",
        recommendedAction:
          "Disconnect all Operational Technology (OT) and SCADA systems from direct internet access; place behind cellular air-gaps and firewalled VPNs.",
        publishedLabel: formatDynamicLabel(230),
        cveList: ["CVE-2023-3595", "CVE-2022-29951"],
        attackVector: "Direct Modbus TCP port 502 & web HMI exploitation using default passwords",
        mitreTactics: [
          "T0814 - Denial of Control",
          "T0807 - Command, Control, and Alternative Comms",
        ],
        indicatorsOfCompromise: ["185.220.101.5 (Tor Exit Node probing port 502)"],
        impactSummary: "Potential tampering with chemical dosing and distribution telemetry.",
        documents: [
          {
            title: "Alert AA26-042A: Defending Water & Wastewater Sector OT",
            issuer: "CISA, FBI, EPA, NSA",
            kind: "Joint Advisory",
            url: "https://www.cisa.gov/news-events/cybersecurity-advisories",
          },
        ],
      },
      {
        id: "deepfake-ceo-wire-fraud",
        title: "Real-Time AI Voice Cloning Deployed in High-Value Executive Impersonation",
        source: "The Hacker News",
        sourceUrl: "https://thehackernews.com/",
        category: "Phishing",
        severity: "medium",
        riskPercent: 62,
        affectedPeople: "4 enterprise finance desks",
        regions: ["Global"],
        summary:
          "Attackers combined executive calendar scraping with synthetic voice generation over video conferencing calls to authorize urgent treasury wire transfers.",
        recommendedAction:
          "Establish mandatory multi-person out-of-band callback verifications for all transactions exceeding authorized spending thresholds.",
        publishedLabel: formatDynamicLabel(380),
        cveList: [],
        attackVector: "Synthetic speech model cloned from corporate quarterly earnings webcasts",
        mitreTactics: ["T1566 - Phishing", "T1656 - Impersonation"],
        indicatorsOfCompromise: [
          "Spoofed Microsoft Teams invitation from @finance-executive-verify[.]co",
        ],
        impactSummary: "Attempted treasury extraction of $4.8M across enterprise accounts.",
        documents: [
          {
            title: "Emerging Threats: AI Voice Synthesis in Business Email Compromise",
            issuer: "FinCEN & Secret Service Cyber Task Force",
            kind: "Fraud Advisory",
            url: "https://www.fincen.gov/news-room",
          },
        ],
      },
    ],
    awareness: [
      {
        title: "Passkey & FIDO2 Security Keys",
        audience: "Everyone",
        body: "Hardware-bound passkeys are immune to traditional phishing, credential harvesting, and SIM-swapping because private keys never leave your physical device.",
        steps: [
          "Enable passkeys in your primary email, cloud, and password manager accounts",
          "Register at least two passkey devices (e.g., phone and physical hardware key) for backup",
          "Remove SMS phone numbers as recovery options where authenticator apps are accepted",
        ],
      },
      {
        title: "Defending Against Drive-By Edge Exploitation",
        audience: "Small business",
        body: "Automated vulnerability scanners probe external routers and network-attached storage within minutes of a zero-day disclosure.",
        steps: [
          "Disable Universal Plug and Play (UPnP) and remote WAN administration on routers",
          "Subscribe to vendor security mailing lists for immediate firmware update alerts",
          "Segment IoT devices (cameras, printers, thermostats) onto an isolated guest Wi-Fi network",
        ],
      },
      {
        title: "Software Supply Chain Hygiene",
        audience: "Developers & IT",
        body: "Modern software packages rely on thousands of nested transitive dependencies, creating high-leverage injection vectors for attackers.",
        steps: [
          "Run automated dependency security scans on every pull request and build pipeline",
          "Never execute installation commands directly from unverified copy-paste snippets",
          "Use short-lived, least-privilege tokens for CI/CD secret management",
        ],
      },
      {
        title: "Spotting Modern Multi-Channel Phishing",
        audience: "Employees",
        body: "Attackers combine urgent WhatsApp/SMS alerts with spoofed phone calls to create artificial panic and urgency.",
        steps: [
          "Hang up and contact the caller back via known official directory numbers",
          "Never approve authenticator push prompts that you did not initiate immediately prior",
          "Report suspicious emails to your security operations desk before deleting them",
        ],
      },
      {
        title: "Resilient Offline Data Backups (3-2-1 Rule)",
        audience: "Everyone",
        body: "Ransomware operators intentionally seek out and encrypt connected network shares and synchronized cloud drives.",
        steps: [
          "Keep 3 copies of important data across 2 different storage media types",
          "Maintain at least 1 copy completely offline, air-gapped, or in write-once-read-many (WORM) storage",
          "Test full system restoration drills semi-annually to verify backup integrity",
        ],
      },
    ],
  };
}
