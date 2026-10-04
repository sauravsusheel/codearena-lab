# Security Policy — Chanakya University UniSphere

## 1. Statutory Compliance & Standards
UniSphere complies with the following data protection and cybersecurity mandates:
- **Digital Personal Data Protection (DPDP) Act, 2023 (India)**: Student biometric face recordings, geolocation coordinates, and medical health certificates are quarantined and accessible only to the specific student and designated university proctors.
- **National Education Policy (NEP) 2020**: Encrypted 60:40 Continuous Internal Evaluation (CIE) and Semester End Examination (SEE) gradebook records.
- **Zero-Trust Role-Based Access Control (RBAC)**: Defense-in-depth authorization enforced at navigation, route-render, and intra-module levels across all 17 institutional personas.

## 2. Supported Versions
Security updates are actively applied to the current production branch:

| Version | Supported          | Security Maintenance Status |
| ------- | ------------------ | --------------------------- |
| 3.0.x   | :white_check_mark: | Active Continuous Patching  |
| < 3.0   | :x:                | Deprecated                  |

## 3. Reporting a Vulnerability
If you discover a potential security vulnerability within UniSphere:
1. **Do not disclose publicly** or file a public GitHub issue.
2. Email full technical details, reproduction steps, and payload proofs to the Cybersecurity & Technical Team:
   - **Email:** `itadmin@chanakya.edu` or `security@chanakyauniversity.edu.in`
   - **Lead Architect:** Deepak B (`faculty@chanakya.edu`)
3. The university cybersecurity team will acknowledge receipt within 24 hours and provide an estimated resolution timeline.

## 4. Key Security Controls in UniSphere
- **CircuitBreaker Fault Isolation**: Automatic 3-state tripping prevents cascading infrastructure outages.
- **Namespaced IsolatedStorage**: Client-side storage boundaries protect cross-module integrity.
- **WAF & Rate Limiting**: Anti-abuse filters protect authentication endpoints against brute force attacks.
- **Input Sanitization**: Terminal commands and web queries are sanitized to mitigate injection vulnerabilities.
