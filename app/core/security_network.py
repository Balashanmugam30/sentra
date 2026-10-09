# app/core/security_network.py
"""
Network Security & SSRF Protection Engine (Phase 7).
Validates external URLs against private IP spaces, cloud metadata endpoints,
link-local addresses, and non-HTTP protocols to prevent Server-Side Request Forgery.
"""

from __future__ import annotations

import ipaddress
import logging
import socket
from typing import Optional, Tuple
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# Forbidden IP ranges for outbound SSRF protection
BLOCKED_IP_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),          # "This" network
    ipaddress.ip_network("10.0.0.0/8"),         # Private class A
    ipaddress.ip_network("100.64.0.0/10"),      # Shared Address Space (CGNAT)
    ipaddress.ip_network("127.0.0.0/8"),        # Loopback
    ipaddress.ip_network("169.254.0.0/16"),     # Link-local / Cloud Metadata (169.254.169.254)
    ipaddress.ip_network("172.16.0.0/12"),      # Private class B
    ipaddress.ip_network("192.0.0.0/24"),       # IETF Protocol Assignments
    ipaddress.ip_network("192.0.2.0/24"),       # TEST-NET-1
    ipaddress.ip_network("192.168.0.0/16"),     # Private class C
    ipaddress.ip_network("198.18.0.0/15"),      # Network benchmark tests
    ipaddress.ip_network("198.51.100.0/24"),    # TEST-NET-2
    ipaddress.ip_network("203.0.113.0/24"),     # TEST-NET-3
    ipaddress.ip_network("224.0.0.0/4"),        # Multicast
    ipaddress.ip_network("240.0.0.0/4"),        # Reserved
    ipaddress.ip_network("255.255.255.255/32"), # Broadcast
    # IPv6 ranges
    ipaddress.ip_network("::1/128"),            # IPv6 loopback
    ipaddress.ip_network("::/128"),             # IPv6 unspecified
    ipaddress.ip_network("fc00::/7"),           # IPv6 Unique Local Address (ULA)
    ipaddress.ip_network("fe80::/10"),          # IPv6 Link-Local
]


def is_ip_blocked(ip_addr: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """Checks if an IP address falls within any forbidden or internal network."""
    for network in BLOCKED_IP_NETWORKS:
        if ip_addr in network:
            return True
    return False


def is_safe_external_url(url: str, allow_private: bool = False) -> Tuple[bool, Optional[str]]:
    """
    Validates that a URL is safe for outbound fetching.
    Returns: (is_safe, failure_reason)
    """
    if not url or not isinstance(url, str):
        return False, "URL cannot be empty"

    parsed = urlparse(url.strip())

    # 1. Enforce HTTP/HTTPS scheme only (blocks file://, gopher://, dict://, ftp://)
    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Unsupported URL scheme '{parsed.scheme}'. Only http and https are permitted."

    hostname = parsed.hostname
    if not hostname:
        return False, "URL does not contain a valid hostname"

    # 2. Block localhost name directly
    if hostname.lower() in ("localhost", "localhost.localdomain", "ip6-localhost", "ip6-loopback"):
        if not allow_private:
            return False, "Direct connection to localhost is blocked by SSRF policy"

    # 3. Resolve DNS and validate destination IP address
    try:
        # Check if hostname is already a direct IP address literal
        try:
            ip_obj = ipaddress.ip_address(hostname)
            resolved_ips = [ip_obj]
        except ValueError:
            # Resolve DNS query
            addr_info = socket.getaddrinfo(hostname, parsed.port or 80, proto=socket.IPPROTO_TCP)
            resolved_ips = []
            for item in addr_info:
                sockaddr = item[4]
                ip_str = sockaddr[0]
                resolved_ips.append(ipaddress.ip_address(ip_str))

        if not resolved_ips:
            return False, f"Could not resolve destination hostname '{hostname}'"

        if not allow_private:
            for ip in resolved_ips:
                if is_ip_blocked(ip):
                    return (
                        False,
                        f"SSRF Protection: Hostname '{hostname}' resolved to prohibited IP address {ip}",
                    )

        return True, None

    except socket.gaierror as err:
        return False, f"DNS resolution failed for hostname '{hostname}': {err}"
    except Exception as err:
        logger.warning("SSRF validation error for %s: %s", url, err)
        return False, f"SSRF validation failed: {err}"


def validate_and_sanitize_url(url: str, allow_private: bool = False) -> str:
    """
    Validates URL safety and returns stripped clean URL.
    Raises ValueError if URL fails SSRF security check.
    """
    is_safe, reason = is_safe_external_url(url, allow_private=allow_private)
    if not is_safe:
        raise ValueError(reason or "Invalid URL")
    return url.strip()


def is_safe_destination_url(url: str, allow_private: bool = False) -> bool:
    """Predicate returning True if destination URL is safe."""
    is_safe, _ = is_safe_external_url(url, allow_private=allow_private)
    return is_safe


validate_safe_url = validate_and_sanitize_url
