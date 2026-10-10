from __future__ import annotations

import os
import secrets
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def get_secret_store_path() -> Path:
    explicit = os.getenv("SENTRA_SECRET_KEY_PATH")
    if explicit and explicit.strip():
        return Path(explicit.strip())
    return Path(__file__).resolve().parents[2] / "data" / ".sentra_secret_key"


def resolve_jwt_secret() -> tuple[str, str, bool]:
    """
    Resolve the JWT authentication secret and its provenance.

    Returns:
        (secret_value, source_name, is_ephemeral)

    Provenance sources:
        - 'environment': Explicitly injected via JWT_SECRET, SECRET_KEY, or SENTRA_JWT_SECRET.
        - 'file_persisted': Persisted secure cryptographic token on disk (e.g. Render hosted single-instance runtime).
        - 'ephemeral_memory': In-memory ephemeral CSPRNG secret (blocks production readiness).
    """
    # 1. Environment variables take absolute precedence
    for env_var in ("JWT_SECRET", "SECRET_KEY", "SENTRA_JWT_SECRET"):
        val = os.getenv(env_var)
        if val and val.strip():
            return val.strip(), "environment", False

    raw_env = (os.getenv("APP_ENV") or os.getenv("SENTRA_APP_ENV") or "development").strip().lower()
    is_production_mode = raw_env in {"production", "prod", "enterprise"}

    # 2. Check if persistent secret storage is enabled
    persist_enabled = bool(
        os.getenv("RENDER")
        or os.getenv("RENDER_SERVICE_ID")
        or os.getenv("SENTRA_PERSIST_SECRET", "").lower() in ("true", "1")
        or os.getenv("SENTRA_SECRET_KEY_PATH")
    )

    if persist_enabled:
        secret_file = get_secret_store_path()
        try:
            if secret_file.is_file():
                content = secret_file.read_text(encoding="utf-8").strip()
                if len(content) >= 32:
                    return content, "file_persisted", False

            # Generate and persist a 48-byte URL-safe CSPRNG secret (64 characters, 384 bits entropy)
            new_secret = secrets.token_urlsafe(48)
            secret_file.parent.mkdir(parents=True, exist_ok=True)
            flags = os.O_WRONLY | os.O_CREAT | os.O_TRUNC
            mode = 0o600
            fd = os.open(str(secret_file), flags, mode)
            with open(fd, "w", encoding="utf-8") as f:
                f.write(new_secret)
            return new_secret, "file_persisted", False
        except OSError:
            pass

    # 3. Ephemeral memory fallback
    ephemeral_secret = secrets.token_urlsafe(48)
    return ephemeral_secret, "ephemeral_memory", is_production_mode


@dataclass(frozen=True)
class Settings:
    app_env: str = os.getenv("APP_ENV", os.getenv("SENTRA_APP_ENV", "development"))
    app_name: str = os.getenv("SENTRA_APP_NAME", "Sentra Backend")
    app_version: str = os.getenv("SENTRA_APP_VERSION", "0.1.0")
    api_prefix: str = os.getenv("SENTRA_API_PREFIX", "")
    host: str = os.getenv("SENTRA_HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", os.getenv("SENTRA_PORT", "8000")))
    database_url: str = os.getenv("DATABASE_URL", "")
    redis_url: str = os.getenv("REDIS_URL", "")
    allowed_origins: str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost,http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:3005,http://127.0.0.1:3005,https://sentra-01.vercel.app",
    )
    auth_jwt_secret: str = field(default_factory=lambda: resolve_jwt_secret()[0])
    auth_jwt_algorithm: str = os.getenv("SENTRA_JWT_ALGORITHM", "HS256")
    auth_access_token_minutes: int = int(os.getenv("SENTRA_ACCESS_TOKEN_MINUTES", "15"))
    auth_refresh_token_days: int = int(os.getenv("SENTRA_REFRESH_TOKEN_DAYS", "7"))
    auth_access_cookie_name: str = os.getenv("SENTRA_ACCESS_COOKIE_NAME", "sentra_access_token")
    auth_refresh_cookie_name: str = os.getenv("SENTRA_REFRESH_COOKIE_NAME", "sentra_refresh_token")
    auth_cookie_secure: bool = os.getenv("SENTRA_COOKIE_SECURE", "false").lower() == "true"
    auth_cookie_domain: str | None = os.getenv("SENTRA_COOKIE_DOMAIN") or None
    auth_store_path: str = field(
        default_factory=lambda: os.getenv(
            "SENTRA_AUTH_STORE_PATH",
            str(Path(__file__).resolve().parents[2] / ".sentra_auth_store.json"),
        )
    )
    audit_store_path: str = field(
        default_factory=lambda: os.getenv(
            "SENTRA_AUDIT_STORE_PATH",
            str(Path(__file__).resolve().parents[2] / ".sentra_audit_store.json"),
        )
    )
    iot_store_path: str = field(
        default_factory=lambda: os.getenv(
            "SENTRA_IOT_STORE_PATH",
            str(Path(__file__).resolve().parents[2] / "data" / "iot_store.json"),
        )
    )
    iot_node_token: str = os.getenv("SENTRA_IOT_NODE_TOKEN", "")
    iot_camera_snapshot_url: str = os.getenv("SENTRA_IOT_CAMERA_SNAPSHOT_URL", "")
    iot_camera_stream_url: str = os.getenv("SENTRA_IOT_CAMERA_STREAM_URL", "")
    weather_provider: str = os.getenv("WEATHER_PROVIDER", "demo")
    openweather_api_key: str = os.getenv("OPENWEATHER_API_KEY", "")
    default_lat: float = float(os.getenv("DEFAULT_LAT", "11.0168"))
    default_lng: float = float(os.getenv("DEFAULT_LNG", "76.9558"))
    environment_timeout_seconds: int = int(os.getenv("SENTRA_ENV_TIMEOUT_SECONDS", "5"))
    traffic_provider: str = os.getenv("TRAFFIC_PROVIDER", "demo")
    transit_provider: str = os.getenv("TRANSIT_PROVIDER", "demo")
    utility_provider: str = os.getenv("UTILITY_PROVIDER", "demo")
    city_mode: str = os.getenv("CITY_MODE", "campus")
    tomtom_api_key: str = os.getenv("TOMTOM_API_KEY", "")
    mapbox_access_token: str = os.getenv("MAPBOX_ACCESS_TOKEN", "")
    osint_provider: str = os.getenv("OSINT_PROVIDER", "demo")
    news_api_key: str = os.getenv("NEWS_API_KEY", "")
    gnews_api_key: str = os.getenv("GNEWS_API_KEY", "")
    rss_feeds: str = os.getenv("RSS_FEEDS", "")
    social_provider: str = os.getenv("SOCIAL_PROVIDER", "demo")
    city_keywords: str = os.getenv("CITY_KEYWORDS", "coimbatore,campus,zone,incident")
    log_level: str = os.getenv("SENTRA_LOG_LEVEL", "INFO")
    log_file_path: str = os.getenv("SENTRA_LOG_FILE_PATH", "logs/sentra-backend.jsonl")
    log_rotation_bytes: int = int(os.getenv("SENTRA_LOG_ROTATION_BYTES", "5242880"))
    log_rotation_backups: int = int(os.getenv("SENTRA_LOG_ROTATION_BACKUPS", "5"))
    release_channel: str = os.getenv("SENTRA_RELEASE_CHANNEL", app_env)
    release_commit_sha: str = os.getenv("SENTRA_RELEASE_COMMIT_SHA", "local")
    backup_retention_days: int = int(os.getenv("SENTRA_BACKUP_RETENTION_DAYS", "14"))
    last_backup_at: str = os.getenv("SENTRA_LAST_BACKUP_AT", "")
    database_size_estimate_mb: int = int(os.getenv("SENTRA_DATABASE_SIZE_ESTIMATE_MB", "128"))
    alert_error_rate_threshold: int = int(os.getenv("SENTRA_ALERT_ERROR_RATE_THRESHOLD", "5"))
    alert_p95_latency_ms: int = int(os.getenv("SENTRA_ALERT_P95_LATENCY_MS", "2500"))
    alert_auth_failure_threshold: int = int(os.getenv("SENTRA_ALERT_AUTH_FAILURE_THRESHOLD", "5"))
    alert_cache_hit_ratio_min: int = int(os.getenv("SENTRA_ALERT_CACHE_HIT_RATIO_MIN", "35"))
    secure_headers_enabled: bool = os.getenv("SENTRA_SECURE_HEADERS", "true").lower() == "true"
    ip_rate_limit_window_seconds: int = int(os.getenv("SENTRA_IP_RATE_LIMIT_WINDOW_SECONDS", "60"))
    ip_rate_limit_max_requests: int = int(os.getenv("SENTRA_IP_RATE_LIMIT_MAX_REQUESTS", "600"))
    enable_demo_seed: bool = os.getenv("SENTRA_ENABLE_DEMO_SEED", "true").lower() == "true"
    emergency_read_only_mode: bool = os.getenv("SENTRA_EMERGENCY_READ_ONLY", "false").lower() == "true"
    backup_dir: str = os.getenv(
        "SENTRA_BACKUP_DIR",
        str(Path(__file__).resolve().parents[2] / "backups"),
    )
    release_version_file: str = os.getenv(
        "SENTRA_RELEASE_VERSION_FILE",
        str(Path(__file__).resolve().parents[2] / "release_version.json"),
    )
    slack_webhook_url: str = os.getenv("SLACK_WEBHOOK_URL", "")
    teams_webhook_url: str = os.getenv("TEAMS_WEBHOOK_URL", "")
    alert_email_to: str = os.getenv("SENTRA_ALERT_EMAIL_TO", "")
    auth_rate_limit_window_seconds: int = int(os.getenv("SENTRA_AUTH_RATE_LIMIT_WINDOW_SECONDS", "600"))
    auth_rate_limit_max_attempts: int = int(os.getenv("SENTRA_AUTH_RATE_LIMIT_MAX_ATTEMPTS", "5"))
    auth_lockout_seconds: int = int(os.getenv("SENTRA_AUTH_LOCKOUT_SECONDS", "900"))
    internal_api_key: str = os.getenv("INTERNAL_API_KEY", os.getenv("SENTRA_INTERNAL_API_KEY", "")).strip()
    incident_cache_ttl_seconds: float = float(os.getenv("INCIDENT_CACHE_TTL", "60"))
    prediction_cache_ttl_seconds: float = float(os.getenv("PREDICTION_CACHE_TTL", "45"))
    enable_firestore_fallback_cache: bool = os.getenv("ENABLE_FIRESTORE_FALLBACK_CACHE", "true").lower() == "true"
    stripe_secret_key: str = os.getenv("STRIPE_SECRET_KEY", "")
    stripe_webhook_secret: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    stripe_publishable_key: str = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
    firebase_project_id: str = os.getenv(
        "FIREBASE_PROJECT_ID", os.getenv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "sentra-01")
    )
    firebase_service_account_path: str = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_PATH",
        str(Path(__file__).resolve().parents[1] / "firebase-service-account.json"),
    )
    firebase_storage_bucket: str = os.getenv(
        "FIREBASE_STORAGE_BUCKET",
        os.getenv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", "sentra-01.firebasestorage.app"),
    )
    sentra_billing_store_path: str = os.getenv(
        "SENTRA_BILLING_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "billing_store.json"),
    )
    sentra_crm_store_path: str = os.getenv(
        "SENTRA_CRM_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "crm_store.json"),
    )
    sentra_customer_success_store_path: str = os.getenv(
        "SENTRA_CUSTOMER_SUCCESS_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "customer_success_store.json"),
    )
    sentra_marketplace_store_path: str = os.getenv(
        "SENTRA_MARKETPLACE_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "marketplace_store.json"),
    )
    sentra_partners_store_path: str = os.getenv(
        "SENTRA_PARTNERS_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "partners_store.json"),
    )
    sentra_developer_store_path: str = os.getenv(
        "SENTRA_DEVELOPER_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "developer_store.json"),
    )
    sentra_growth_store_path: str = os.getenv(
        "SENTRA_GROWTH_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "growth_store.json"),
    )
    sentra_investor_store_path: str = os.getenv(
        "SENTRA_INVESTOR_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "investor_store.json"),
    )
    sentra_behavior_store_path: str = os.getenv(
        "SENTRA_BEHAVIOR_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "behavior_store.json"),
    )
    sentra_behavior_crowd_store_path: str = os.getenv(
        "SENTRA_BEHAVIOR_CROWD_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "behavior_crowd_store.json"),
    )
    sentra_behavior_decision_store_path: str = os.getenv(
        "SENTRA_BEHAVIOR_DECISION_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "behavior_decision_store.json"),
    )
    sentra_behavior_learning_store_path: str = os.getenv(
        "SENTRA_BEHAVIOR_LEARNING_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "behavior_learning_store.json"),
    )
    sentra_ml_store_path: str = os.getenv(
        "SENTRA_ML_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "ml_store.json"),
    )
    sentra_mlops_store_path: str = os.getenv(
        "SENTRA_MLOPS_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "mlops_store.json"),
    )
    sentra_ai_council_store_path: str = os.getenv(
        "SENTRA_AI_COUNCIL_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "ai_council_store.json"),
    )
    sentra_master_store_path: str = os.getenv(
        "SENTRA_MASTER_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "master_store.json"),
    )
    sentra_execution_store_path: str = os.getenv(
        "SENTRA_EXECUTION_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "execution_store.json"),
    )
    sentra_government_store_path: str = os.getenv(
        "SENTRA_GOVERNMENT_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "government_store.json"),
    )
    sentra_autonomy_store_path: str = os.getenv(
        "SENTRA_AUTONOMY_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "autonomy_store.json"),
    )
    sentra_world_store_path: str = os.getenv(
        "SENTRA_WORLD_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "world_store.json"),
    )
    sentra_revenue_growth_store_path: str = os.getenv(
        "SENTRA_REVENUE_GROWTH_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "revenue_growth_store.json"),
    )
    sentra_revenue_store_path: str = os.getenv(
        "SENTRA_REVENUE_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "revenue_store.json"),
    )
    sentra_ecosystem_store_path: str = os.getenv(
        "SENTRA_ECOSYSTEM_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "ecosystem_store.json"),
    )
    sentra_data_empire_store_path: str = os.getenv(
        "SENTRA_DATA_EMPIRE_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "data_empire_store.json"),
    )
    sentra_integration_hub_store_path: str = os.getenv(
        "SENTRA_INTEGRATION_HUB_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "integration_hub_store.json"),
    )
    sentra_datahub_store_path: str = os.getenv(
        "SENTRA_DATAHUB_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "datahub_store.json"),
    )
    sentra_analyticshub_store_path: str = os.getenv(
        "SENTRA_ANALYTICSHUB_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "analyticshub_store.json"),
    )
    sentra_category_domination_store_path: str = os.getenv(
        "SENTRA_CATEGORY_DOMINATION_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "category_domination_store.json"),
    )
    sentra_monopoly_expansion_store_path: str = os.getenv(
        "SENTRA_MONOPOLY_EXPANSION_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "monopoly_expansion_store.json"),
    )
    sentra_civilization_infra_store_path: str = os.getenv(
        "SENTRA_CIVILIZATION_INFRA_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "civilization_infra_store.json"),
    )
    sentra_omega_store_path: str = os.getenv(
        "SENTRA_OMEGA_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "omega_store.json"),
    )
    sentra_twin_store_path: str = os.getenv(
        "SENTRA_TWIN_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "twin_store.json"),
    )
    sentra_twin_ai_store_path: str = os.getenv(
        "SENTRA_TWIN_AI_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "twin_ai_store.json"),
    )
    sentra_security_store_path: str = os.getenv(
        "SENTRA_SECURITY_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "security_store.json"),
    )
    sentra_security_defense_store_path: str = os.getenv(
        "SENTRA_SECURITY_DEFENSE_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "security_defense_store.json"),
    )
    sentra_security_trust_store_path: str = os.getenv(
        "SENTRA_SECURITY_TRUST_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "security_trust_store.json"),
    )
    sentra_platform_store_path: str = os.getenv(
        "SENTRA_PLATFORM_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "platform_store.json"),
    )
    sentra_channel_store_path: str = os.getenv(
        "SENTRA_CHANNEL_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "channel_store.json"),
    )
    sentra_demo_store_path: str = os.getenv(
        "SENTRA_DEMO_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "demo_store.json"),
    )
    sentra_launch_store_path: str = os.getenv(
        "SENTRA_LAUNCH_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "launch_store.json"),
    )
    sentra_submission_store_path: str = os.getenv(
        "SENTRA_SUBMISSION_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "submission_store.json"),
    )
    sentra_site_store_path: str = os.getenv(
        "SENTRA_SITE_STORE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "site_store.json"),
    )

    @property
    def cors_origins(self) -> list[str]:
        origins = [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]
        return origins or ["http://localhost"]


settings = Settings()
